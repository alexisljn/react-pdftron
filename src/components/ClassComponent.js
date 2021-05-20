import React, {createRef} from "react";
import WebViewer from "@pdftron/webviewer";
import DraggableField from "./DraggableField";
import Moveable from "react-moveable";
import Draggable from "react-draggable";

class ClassComponent extends React.Component {

    scrollTimer = null;
    previousYPosition = 0;

    SIGNATURE_TYPE = 'signature';
    EMAIL_TYPE = 'email';
    NAME_TYPE = 'name';
    DETECTION_ZONE_LIMIT = 50;
    SET_INTERVAL_DELAY = 50;
    SCROLL_VALUE = 20;
    LABEL_FIELD_HEIGHT = 30;
    LABEL_FIELD_WIDTH = 150;

    constructor(props) {
        super(props);
        this.state = {
            webViewer: null,
            tool: null,
            fields: [],
            signatureCounter: 1,
            emailCounter: 1,
            nameCounter: 1,
            isDragging: false,
            isScrolling: false,
        }
        this.viewer = createRef();
    }

    async componentDidMount() {
        const instance = await WebViewer(
            {
                licenseKey: 'toto',
                path: '/pdftron/lib',
                initialDoc: '/fixture/sample.pdf',
            },
            this.viewer.current,
        )
        const defaultFields = this.getDefaultFields();


        this.setState({webViewer: instance, fields: defaultFields});
    }

    getDefaultFields = () => {
        return [
            {
                domElt: 'target-signature-1',
                type: 'signature',
                isActive: false,
                isPlaced: false,
                xPosition: 20,
                yPosition: 50,
                id: 1,
            },
            {
                domElt: 'target-name-1',
                type: 'name',
                isActive: false,
                isPlaced: false,
                xPosition: 20,
                yPosition: 85,
                id: 1,
            },
            {
                domElt: 'target-email-1',
                type: 'email',
                isActive: false,
                isPlaced: false,
                xPosition: 20,
                yPosition: 120,
                id: 1,
            }]
    }

    getStyle = (inputName) => {
        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }

        return {
            zIndex: 5000,
            width: 150,
            height: 30,
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translate(50px, 250px)',
            backgroundColor: colorMapping[inputName],
            color: 'white',
            cursor: 'grabbing'
        }
    }

    getCoverStyle = () => {
        return {
            zIndex: 1000,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        }
    }

    incrementCounter = (type) => {
        let newValue;
        switch (type) {
            case this.SIGNATURE_TYPE:
                const {signatureCounter} = this.state;
                newValue = signatureCounter + 1;
                this.setState({signatureCounter: newValue})
                break;
            case this.EMAIL_TYPE:
                const {emailCounter} = this.state;
                newValue = emailCounter + 1
                this.setState({emailCounter: newValue})
                break;
            case this.NAME_TYPE:
                const {nameCounter} = this.state;
                newValue = nameCounter + 1
                this.setState({nameCounter: newValue})
                break;
            default:
                return;
        }

        return newValue
    }

    createField = (field) => {
        const positionMapping = {signature: {x: 20, y: 50}, name: {x: 20, y: 85}, email: {x: 20, y: 120}}

        const { fields } = this.state;

        const fieldsCopy = JSON.parse(JSON.stringify(fields));

        fieldsCopy.forEach((fieldFromState, index) => {
            if (fieldFromState.id === field.id && fieldFromState.type === field.type)
                fieldFromState['isActive'] = true;
        })

        const currentFieldElt = document.querySelector(`#${field.domElt}`);
        currentFieldElt.style.position = 'absolute';

        const newCounterValue = this.incrementCounter(field.type)

        const newField= {
            domElt: `target-${field.type}-${newCounterValue}`,
            type: field.type,
            isActive: false,
            isPlaced: false,
            xPosition: positionMapping[field.type].x,
            yPosition: positionMapping[field.type].y,
            id: newCounterValue
        }

        fieldsCopy.push(newField);
        // console.log('targetCopy APRES AJOUT', fieldsCopy);
        this.setState({fields:fieldsCopy});
    }

    //TODO Reflechir est-ce que l'on veut réindexer le tableau après une suppression ?
    deleteField = (type, id) => {
        const { fields } = this.state;

        const fieldsCopy = Array.from(fields);

        let indexToDelete = null;

        fieldsCopy.forEach((field, index) => {
            if (field.id === id && field.type === type)
                indexToDelete = index;
        })

        if (indexToDelete !== 'null') {
            fieldsCopy.splice(indexToDelete,1);

            this.setState({fields: fieldsCopy});
        }
    }

    onDragHandler = (fieldDomElt, field) => {
        const { webViewer, fields, isScrolling } = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        // console.log(containerToScrollElt.scrollTop); // good
        const bottomDetectionZone = window.innerHeight - this.DETECTION_ZONE_LIMIT;
        const topDetectionZone =  (window.innerHeight - containerToScrollElt.clientHeight) + this.DETECTION_ZONE_LIMIT;

        const {x, y, right, bottom} = fieldDomElt.getBoundingClientRect();

        const absoluteX = x + window.scrollX /*+ containerToScrollElt.scrollLeft;*/
        const absoluteY = y + window.scrollY /*+ containerToScrollElt.scrollTop;*/
        const absoluteRight = right + window.scrollX /*+ containerToScrollElt.scrollLeft;*/
        const absoluteBottom = bottom + window.scrollY /*+ containerToScrollElt.scrollTop;*/


        fields.forEach((fieldCopy => {
            if (fieldCopy.id === field.id && fieldCopy.type === field.type) {
                fieldCopy.yPosition = absoluteY;
                fieldCopy.xPosition = absoluteX;
                fieldCopy.right = absoluteRight;
                fieldCopy.bottom = absoluteBottom;
            }
        }))

        this.setState({fields})

        if (field.yPosition >= bottomDetectionZone && this.isItemInPdfZone(field.xPosition)) {
            // console.log("bottomDetectionZone", bottomDetectionZone)
            this.scroll(this.SCROLL_VALUE, containerToScrollElt);

        } else if (field.yPosition <= topDetectionZone && this.isItemInPdfZone(field.xPosition)) {
            // console.log('topDetect', topDetectionZone)
            this.scroll(-this.SCROLL_VALUE, containerToScrollElt);
        } else {

            if (this.scrollTimer) {
                clearInterval(this.scrollTimer);
                this.scrollTimer = null;
            }

            if (this.state.isScrolling)
                this.setState({isScrolling: false});
        }

        this.previousYPosition = absoluteY;
    }

    scroll = (scrollValue, containerToScroll) => {

        if (this.state.isScrolling || this.isPdfNotScrollable(scrollValue,containerToScroll)) return;

        this.setState({isScrolling: true});

        this.scrollTimer = setInterval(() => {
            containerToScroll.scrollBy(0,scrollValue);

            if (this.hasScrollingHitTheBottom(containerToScroll)) {
                console.log("AU BOUT")
                clearInterval(this.scrollTimer);
                this.scrollTimer = null;
            }

            if (this.hasScrollingHitTheTop(containerToScroll)) {
                console.log("AU TOP")
                clearInterval(this.scrollTimer);
                this.setState({isScrolling: false})
            }

        }, this.SET_INTERVAL_DELAY)
    }

    isPdfNotScrollable = (scrollValue, containerToScroll) => {
        if (scrollValue < 0)
            return this.hasScrollingHitTheTop(containerToScroll)

        return this.hasScrollingHitTheBottom(containerToScroll)
    }

    hasScrollingHitTheTop = (containerToScroll) => {
        return containerToScroll.scrollTop === 0;
    }

    hasScrollingHitTheBottom = (containerToScroll) => {
        return containerToScroll.scrollHeight - containerToScroll.scrollTop <= containerToScroll.clientHeight;
    }

    isItemInPdfZone = (xPosition) => {
        const position = document.querySelector('.MyComponent').getBoundingClientRect();

        return xPosition >= position.left;
    }

    test = (e) => {
        const { webViewer} = this.state;
        const { docViewer } = webViewer;
        const annotManager = docViewer.getAnnotationManager();
        const tool = new webViewer.Tools.Tool(docViewer);
        console.log(tool.getMouseLocation(e))

        const containerToScrollElt = docViewer.getScrollViewElement();
        console.log('page',docViewer.getCurrentPage());
        console.log("popsitionMouse")
        // console.log(this.state.signatureCounter);
        // console.log(this.state.isDragging);
        console.log(this.state.fields);
        console.log("les annots",annotManager.getAnnotationsList())
        // console.log(getMouseLocation(e));
        // console.log("isScrolling test", this.state.isScrolling);
        // const position = containerToScrollElt.getBoundingClientRect();
        // const position = document.querySelector('.MyComponent').getBoundingClientRect();
        // console.log('left', position.left);
        // console.log('top', position.top + window.scrollY)

    }

    onDragStart = () => {
        if (!this.state.isDragging)
            this.setState({isDragging: true});
    }

    onDragStop = (e, field) => {
        const { webViewer, fields } = this.state;
        console.log(webViewer);
        const { docViewer, iframeWindow } = webViewer;
        const zoom = docViewer.getZoom();
        const containerToScrollElt = docViewer.getScrollViewElement();
        // const tool = new webViewer.Tools.Tool(docViewer);
        // const mousePosition = tool.getMouseLocation(e)
        // console.log(mousePosition);

        // 300 = sidebar width
        const topLeftPoint = {x: field.xPosition + containerToScrollElt.scrollLeft - 300, y:field.yPosition + containerToScrollElt.scrollTop};
        const bottomRightPoint = {x: field.right + containerToScrollElt.scrollLeft - 300, y:field.bottom + containerToScrollElt.scrollTop};

        // console.log('A', topLeftPoint)
        const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
        // console.log('from Mouse',page);
        const selectedPages = displayMode.getSelectedPages(topLeftPoint, bottomRightPoint);
        // console.log('With Rect Points', selectedPages);

        const clickedPage = this.getPage(selectedPages);

        // const clickedPage = (page.first !== null) ? page.first : docViewer.getCurrentPage();
        // const clickedPage = page.first;
        console.log(clickedPage)
        //TODO Comportement à définir selon les cas
        if (clickedPage.state === 'full') {
            const pageCoords = displayMode.windowToPage(topLeftPoint, clickedPage.page);
            console.log(pageCoords);
            console.log("zoom", zoom);
            this.addFormFieldAnnotation(field.type, 'NAME !!!', 'TOTO', true, pageCoords.x, pageCoords.y, clickedPage.page, zoom);

        } else if (clickedPage.state === 'partial') {

            const pageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page}`);
            const topLeftPointCoords = displayMode.windowToPage(topLeftPoint, clickedPage.page);
            const bottomRightPointCoords = displayMode.windowToPage(bottomRightPoint, clickedPage.page);

            // console.log("X pageCoordsA coeff zoom", topLeftPointCoords.x * zoom); // Good
            // console.log("Y pageCoordsA coeff zoom", topLeftPointCoords.y * zoom); // Good
            // console.log("X pageCoordsB coeff zoom", bottomRightPointCoords.x * zoom); // Good
            // console.log("Y pageCoordsB coeff zoom", bottomRightPointCoords.y * zoom); // Good

            // let x = topLeftPointCoords.x;
            // let y = topLeftPointCoords.y;

            const x = this.getAnnotationXPosition(topLeftPointCoords.x, bottomRightPointCoords.x, pageContainer, zoom);
            const y = this.getAnnotationYPosition(topLeftPointCoords.y, bottomRightPointCoords.y, pageContainer, zoom);

            // if (topLeftPointCoords.x * zoom < 0)
            //     x = 0;
            // else if (bottomRightPointCoords.x * zoom > pageContainer.offsetWidth)
            //     x = (pageContainer.offsetWidth - (this.LABEL_FIELD_WIDTH * zoom)) / zoom;

            // if (topLeftPointCoords.y * zoom < 0)
            //     y = 0;
            // else if (bottomRightPointCoords.y * zoom > pageContainer.offsetHeight)
            //     y = (pageContainer.offsetHeight - (this.LABEL_FIELD_HEIGHT * zoom)) / zoom;

            console.log('finalX', x);
            console.log("finalY", y);

            this.addFormFieldAnnotation(field.type, 'NAME !!!', 'TOTO', true, x, y, clickedPage.page, zoom);
            console.log("pg offsetHeight", pageContainer.offsetHeight);
            console.log("pg offsetWidth", pageContainer.offsetWidth);
        } else if (clickedPage.state === 'double') {
            const firstPageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page[0]}`);
            const secondPageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page[1]}`);

            const topLeftPointCoords = displayMode.windowToPage(topLeftPoint, clickedPage.page[0]);
            const bottomRightPointCoords = displayMode.windowToPage(bottomRightPoint, clickedPage.page[1]);

            const fieldPxAmountInFirstPage = firstPageContainer.offsetHeight - (topLeftPointCoords.y * zoom);
            const fieldPxAmountInSecondPage = bottomRightPointCoords.y * zoom;

            // Si les valeurs sont égales, en page 1 arbitrairement
            let y = 0
            let page = clickedPage.page[1]

            if (fieldPxAmountInFirstPage >= fieldPxAmountInSecondPage) {
                y = (firstPageContainer.offsetHeight - (this.LABEL_FIELD_HEIGHT * zoom)) / zoom;
                page = clickedPage.page[0];
                console.log("CALCULATED Y", y);
            }

            this.addFormFieldAnnotation(field.type, 'NAME !!!', 'TOTO', true, topLeftPointCoords.x, y, page, zoom);

            console.log('TOP LEFT Y',topLeftPointCoords.y * zoom);
            console.log("firstPage offsetHeight", firstPageContainer.offsetHeight);
            console.log("TOP LEFT PX en page 1", firstPageContainer.offsetHeight - topLeftPointCoords.y * zoom) // Good
            console.log('BOTTOM RIGHT Y',bottomRightPointCoords.y * zoom); //Correspond immédiatement au nombre de px présents sur la page 2
            console.log("secondPage offsetHeight", secondPageContainer.offsetHeight);
            // console.log-
        }
        // console.log(displayMode.windowToPage(mousePosition, clickedPage))
        this.deleteField(field.type, field.id);


        this.setState({isDragging: false, isScrolling: false});
        clearInterval(this.scrollTimer);

    }

    getAnnotationXPosition = (topLeftX, bottomRightX, pageContainer, zoom) => {
        if (topLeftX * zoom < 0)
            return 0;
        else if (bottomRightX * zoom > pageContainer.offsetWidth)
            return (pageContainer.offsetWidth - (this.LABEL_FIELD_WIDTH * zoom)) / zoom;
        else
            return topLeftX;
    }

    getAnnotationYPosition = (topLeftY, bottomRightY, pageContainer, zoom) => {
        if (topLeftY * zoom < 0)
            return 0;
        else if (bottomRightY * zoom > pageContainer.offsetHeight)
            return (pageContainer.offsetHeight - (this.LABEL_FIELD_HEIGHT * zoom)) / zoom;
        else
            return topLeftY;
    }


    addFormFieldAnnotation = (type, name, value, flag, x, y, pageNumber, zoom) => {

        const {webViewer} = this.state;
        const {docViewer, Annotations} = webViewer;
        // const doc = docViewer.getDocument();
        const annotManager = docViewer.getAnnotationManager();

        const textAnnot = new Annotations.FreeTextAnnotation();
        // const page_number = docViewer.getCurrentPage();
        // console.log("pn", page_number);
        //
        // const page_info = doc.getPageInfo(page_number);
        // console.log("pi", page_info);

        textAnnot.PageNumber = pageNumber;
        textAnnot.custom = { type, value, flag };
        textAnnot.Width = this.LABEL_FIELD_WIDTH;
        textAnnot.Height = this.LABEL_FIELD_HEIGHT;
        textAnnot.X = x
        textAnnot.Y = y;
        textAnnot.setContents(name + '_' + type);
        textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));
        textAnnot.FillColor = new Annotations.Color(0, 255, 255);
        console.log("textAnnot", textAnnot);
        annotManager.addAnnotation(textAnnot, { autoFocus: false });
        annotManager.redrawAnnotation(textAnnot);
    };

    getPage = (selectedPages) => {
        const {webViewer} = this.state;
        const {docViewer } = webViewer

        //TODO Dans certains cas pdfTron entre dans ce bloc alors qu'un label est en partie sur une page
        // EUx meme connaissent ce bug et quand les deux pages sont null, ils appellent getCurrentPage()
        // Que fait-on ?
        if (selectedPages.first === null && selectedPages.last === null) {
            console.log('selon ce fou de docViewer', docViewer.getCurrentPage())
            return {state: 'outside', page: null};
        }
        if (selectedPages.first === null && typeof selectedPages.last === 'number')
            // console.log("mi dehors, mi page");
            return {state: 'partial', page: selectedPages.last};
        if ((typeof selectedPages.first === 'number' && typeof selectedPages.last === 'number') &&  selectedPages.first === selectedPages.last)
            // console.log("sur la page", selectedPages.first);
            return {state: 'full', page: selectedPages.first};
        if ((typeof selectedPages.first === 'number' && typeof selectedPages.last === 'number') &&  selectedPages.first !== selectedPages.last)
            // console.log("sur les pages", selectedPages.first, selectedPages.last);
            return {state: 'double', page: [selectedPages.first, selectedPages.last]};

    }

    render() {
        const {fields, isDragging } = this.state;

        return (<>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "300px", zIndex: 1}}>
            {/*<div className="sidebar" style={{ backgroundColor: "#E8E8E8", zIndex: 1}}>*/}

                {/*SIDEBAR*/}
                {/*<div className="sidebar-signature">*/}
                    {fields.map(field => {
                        // if (field.type === this.SIGNATURE_TYPE)
                        return (
                            <DraggableField
                                field={field}
                                getStyle={this.getStyle}
                                onDragStart={this.onDragStart}
                                onDragStop={this.onDragStop}
                                onDragHandler={this.onDragHandler}
                                createField={this.createField}
                                deleteField={this.deleteField}
                            />
                        )
                    })}
                <button onClick={(e) => this.test(e)}>ZZ</button>
                {/*</div>*/}
                {/*<div className="sidebar-name">*/}
                {/*    {fields.map(field => {*/}
                {/*        if (field.type === this.NAME_TYPE)*/}
                {/*            return (*/}
                {/*                <DraggableField*/}
                {/*                    field={field}*/}
                {/*                    getStyle={this.getStyle}*/}
                {/*                    onDragStart={this.onDragStart}*/}
                {/*                    onDragStop={this.onDragStop}*/}
                {/*                    onDragHandler={this.onDragHandler}*/}
                {/*                    createField={this.createField}*/}
                {/*                    deleteField={this.deleteField}*/}
                {/*                />*/}
                {/*            )*/}
                {/*    })}*/}
                {/*</div>*/}
                {/*<div className="sidebar-email">*/}
                {/*    {fields.map(field => {*/}
                {/*        if (field.type === this.EMAIL_TYPE)*/}
                {/*            return (*/}
                {/*                <DraggableField*/}
                {/*                    field={field}*/}
                {/*                    getStyle={this.getStyle}*/}
                {/*                    onDragStart={this.onDragStart}*/}
                {/*                    onDragStop={this.onDragStop}*/}
                {/*                    onDragHandler={this.onDragHandler}*/}
                {/*                    createField={this.createField}*/}
                {/*                    deleteField={this.deleteField}*/}
                {/*                />*/}
                {/*            )*/}
                {/*    })}*/}
                {/*</div>*/}
            </div>
            <div id="pdf-wrapper" className="MyComponent" style={{height: '100%', flex: 1}}>
            {/*<div id="pdf-wrapper" className="MyComponent" style={{height: '100%'}}>*/}
                {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
                {isDragging &&
                    <div id="cover" style={this.getCoverStyle()}/>
                }
                <div className="webviewer" ref={this.viewer} style={{height: "100%"}}></div>
            </div>

        </>);
    }
}

export default ClassComponent
