import React, {createRef} from "react";
import WebViewer from "@pdftron/webviewer";
import DraggableField from "./DraggableField";
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
           // Customisation
            annotations: [],
            showOptions: false,
            currentAnnotations: false,
        }
        this.viewer = createRef();
    }

    async componentDidMount() {
        const instance = await WebViewer(
            {
                licenseKey: 'toto',
                path: '/pdftron/lib',
                initialDoc: '/fixture/sample.pdf',
                // disabledElements: ['header', 'toolsHeader', 'annotationCommentButton', 'linkButton']
                disabledElements: [
                    'notesPanelButton', 'notesPanel', 'thumbnailsPanelButton',
                    'outlinesPanelButton', 'thumbDelete', 'leftPanelTabs', 'searchPanel',
                    'leftPanelButton', 'searchButton', 'leftPanelResizeBar', 'thumbRotateCounterClockwise',
                    'thumbRotateClockwise', 'thumbnailsSizeSlider'
                ]
            },
            this.viewer.current,
        )
        const defaultFields = this.getDefaultFields();

        this.setState({webViewer: instance, fields: defaultFields});
        // instance.enableElements(['leftPanel']);

        this.invertPanel(instance);

        // instance.openElements(['leftPanel']);
        // const iframeDoc = instance.iframeWindow.document;
        // const docContainer = iframeDoc.querySelector('.document-content-container');
        // const leftPanel = iframeDoc.querySelector('[data-element="leftPanel"]');
        // const leftPanelContainer = iframeDoc.querySelector('.left-panel-container');
        // leftPanel.classList.remove('LeftPanel');
        // leftPanel.classList.add('right-panel');
        // leftPanelContainer.style.paddingTop = "16px";
        // // leftPanelContainer.style.paddingLeft = "8px";
        // leftPanelContainer.style.paddingRight = "8px";
        // docContainer.style.marginLeft = 0;
        // // docContainer.style.marginRight = 0;
        // docContainer.style.width = `calc(100% - ${leftPanel.clientWidth}px)`;
        // console.log('LeftPanel width', leftPanel.clientWidth);
        // console.log('LeftPanel height', leftPanel.clientHeight);

        this.getRightSidebarStyle(instance);

        instance.Tools.Tool.ENABLE_TEXT_SELECTION = false;

        const {docViewer} = instance
        const annotationManager = docViewer.getAnnotationManager();

        instance.annotationPopup.add([{
            type: 'actionButton',
            img: '/user.png',
            // label: 'edit',
            onClick: () => {
                const {currentAnnotations } = this.state;
                this.setState({showOptions: true});
                //TODO Gestion du multi select
                // if (currentAnnotations.length === 1) {
                    const annotPicked = annotationManager.getAnnotationById(currentAnnotations[0].Id);
                    const position = annotPicked.getRect();
                    console.log(position);
                    console.log('type annotPicked', annotPicked.getCustomData('type'))
                    // console.log('Annotation picked', annotationManager.getAnnotationById(currentAnnotations[0].Id))
                // }
            }
        }]);


        annotationManager.on("annotationSelected", (annotations, action) => {
            console.log('TRIGGERED')
            console.log(action)
            console.log(annotations)

            if (action === 'deselected') {
                // this.setState({showOptions: true})
                this.setState({showOptions: false})
            } else {

                //TODO VRAI GESTION du STATE (Stratégie à implémenter)
                // Utilisé par le listener de la popup user pour savoir quel annotation est choisi.
                this.setState({currentAnnotations: annotations});
                this.setState({showOptions: true})
                // annotations.forEach((annotation) => {
                //     console.log('getRect',annotation.getRect())
                //     console.log('getCustom', annotation.getCustomData('type'))
                //     console.log('ID CUSTO', annotation.getCustomData('id'))
                //     console.log("REAL ID", annotation.Id);
                //     console.log('getContents()', annotation.getContents())
                // })
            }
        })

        annotationManager.on('annotationChanged', (annotations, action, info) => {
            console.log(annotations, action, info);
            switch (action) {
                case 'add':
                    console.log('ADD');
                    // Faire la gestion permettant le CC
                    break;
                case 'modify':
                    break;
                case 'delete':
                    console.log('Annotations deleted', annotations[0].Id)
                    console.log("DELETE ANNOTS")
                    this.deleteAnnotationFromState(annotations);
                    break
            }
        })

        // annotationManager.on('annotationDoubleClicked', (annot) => {
        //     console.log('DOUBLE CLICKED', annot);
        //     // e.stopImmediatePropagation();
        // })

        window.addEventListener('resize', () => {
            console.log('resize')
            const iframeDoc = instance.iframeWindow.document;
            const leftPanel = iframeDoc.querySelector('[data-element="leftPanel"]');
            const docContainer = iframeDoc.querySelector('.document-content-container');
            docContainer.style.marginLeft = 0;
            docContainer.style.width = `calc(100% - ${leftPanel.clientWidth}px)`;
        })

    }

    // Ordre indispensable : On ouvre le leftPanel PUIS on y applique nos modifications.
    invertPanel = (webViewer) => {
        webViewer.openElements(['leftPanel']);

        const iframeDoc = webViewer.iframeWindow.document;
        const docContainer = iframeDoc.querySelector('.document-content-container');
        const leftPanel = iframeDoc.querySelector('[data-element="leftPanel"]');
        const leftPanelContainer = iframeDoc.querySelector('.left-panel-container');

        leftPanel.classList.remove('LeftPanel');
        leftPanel.classList.add('right-panel');

        leftPanelContainer.style.paddingTop = "16px";
        // leftPanelContainer.style.paddingRight = "8px";

        docContainer.style.marginLeft = 0;
        docContainer.style.width = `calc(100% - ${leftPanel.clientWidth}px)`;

    }

    getRightSidebarStyle = (webViewer) => {
        const iframeDoc = webViewer.iframeWindow.document;
        const headerHeight = iframeDoc.querySelector('.Header').clientHeight;
        const headerToolsContainerHeight = iframeDoc.querySelector('.HeaderToolsContainer').clientHeight;
        const leftPanel = iframeDoc.querySelector('[data-element="leftPanel"]');

        console.log("headerHeight", headerHeight)
        console.log("headerToolsContainerHeight", headerToolsContainerHeight);
        const height = headerHeight + headerToolsContainerHeight;

        // TODO Calculer top
        const style = {
            position: 'absolute', // ? fixed
            height: `calc(100% - ${height}px)`,
            width: leftPanel.clientWidth,
            top: height,
            right: 0,
            zIndex: 1500,
            backgroundColor: '#f8f9fa'
        }

        console.log(style);
        return style;
    }

    getDefaultFields = () => {
        return [
            {
                domElt: 'target-signature-1',
                type: 'signature',
                isActive: false,
                // isPlaced: false,
                xPosition: 20,
                yPosition: 50,
                id: 1,
            },
            {
                domElt: 'target-name-1',
                type: 'name',
                isActive: false,
                // isPlaced: false,
                xPosition: 20,
                yPosition: 85,
                id: 1,
            },
            {
                domElt: 'target-email-1',
                type: 'email',
                isActive: false,
                // isPlaced: false,
                xPosition: 20,
                yPosition: 120,
                id: 1,
            }]
    }

    getStyle = (inputName) => {
        const colorMapping =  {
            signature: 'rgb(20, 172, 227)',
            name: 'rgb(235, 45, 102)',
            email: 'rgb(26, 219, 161)'
        }

        return {
            // zIndex: 5000,
            width: this.LABEL_FIELD_WIDTH,
            height: this.LABEL_FIELD_HEIGHT,
            position: 'absolute',
            top: 0,
            left: 0,
            // transform: 'translate(50px, 250px)',
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
            // isPlaced: false,
            xPosition: positionMapping[field.type].x,
            yPosition: positionMapping[field.type].y,
            id: newCounterValue
        }

        fieldsCopy.push(newField);

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
        const { webViewer, annotations } = this.state;
        const { docViewer } = webViewer;
        const annotManager = docViewer.getAnnotationManager();
        const tool = new webViewer.Tools.Tool(docViewer);
        // console.log(tool.getMouseLocation(e))
        //
        // const containerToScrollElt = docViewer.getScrollViewElement();
        // console.log('page',docViewer.getCurrentPage());
        // console.log("popsitionMouse")
        // // console.log(this.state.signatureCounter);
        // // console.log(this.state.isDragging);
        // console.log(this.state.fields);
        // console.log("les annots depuis le manager",annotManager.getAnnotationsList())
        // console.log('annot depuis state', annotations)
        // console.log(getMouseLocation(e));
        // console.log("isScrolling test", this.state.isScrolling);
        // const position = containerToScrollElt.getBoundingClientRect();
        // const position = document.querySelector('.MyComponent').getBoundingClientRect();
        // console.log('left', position.left);
        // console.log('top', position.top + window.scrollY)

        this.getRightSidebarStyle(webViewer);

    }

    onDragStart = (field) => {
        // if (!this.state.isDragging) {}
        this.setState({isDragging: true});
        this.createField(field)
    }

    onDragStop = (e, field) => {
        const { webViewer } = this.state;
        const { docViewer, iframeWindow } = webViewer;
        const zoom = docViewer.getZoom();
        const containerToScrollElt = docViewer.getScrollViewElement();

        // 300 = sidebar width
        const topLeftPoint = {x: field.xPosition + containerToScrollElt.scrollLeft - 300, y:field.yPosition + containerToScrollElt.scrollTop};
        const bottomRightPoint = {x: field.right + containerToScrollElt.scrollLeft - 300, y:field.bottom + containerToScrollElt.scrollTop};

        const displayMode = docViewer.getDisplayModeManager().getDisplayMode();
        const selectedPages = displayMode.getSelectedPages(topLeftPoint, bottomRightPoint);

        const clickedPage = this.getPage(selectedPages);

        // const clickedPage = (page.first !== null) ? page.first : docViewer.getCurrentPage();
        console.log(clickedPage)


        if (clickedPage.state !== 'outside') {
            let x, y, page;


            // Set x y et page pour "full",  page pour le "partial"
            if (clickedPage.state !== 'double') {
                x = displayMode.windowToPage(topLeftPoint, clickedPage.page).x;
                y = displayMode.windowToPage(topLeftPoint, clickedPage.page).y;
                page = clickedPage.page;
            }

            // Redéfinis x et y pour partial
            if (clickedPage.state === 'partial') {

                const pageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page}`);
                const topLeftPointCoords = displayMode.windowToPage(topLeftPoint, clickedPage.page);
                const bottomRightPointCoords = displayMode.windowToPage(bottomRightPoint, clickedPage.page);

                x = this.getAnnotationXPosition(topLeftPointCoords.x, bottomRightPointCoords.x, pageContainer, zoom);
                y = this.getAnnotationYPosition(topLeftPointCoords.y, bottomRightPointCoords.y, pageContainer, zoom);

                // Redéfinis tout pour "double"
            } else if (clickedPage.state === 'double') {
                const firstPageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page[0]}`);
                // const secondPageContainer = iframeWindow.document.querySelector(`#pageContainer${clickedPage.page[1]}`);

                const topLeftPointCoords = displayMode.windowToPage(topLeftPoint, clickedPage.page[0]);
                const bottomRightPointCoords = displayMode.windowToPage(bottomRightPoint, clickedPage.page[1]);

                const fieldPxAmountInFirstPage = firstPageContainer.offsetHeight - (topLeftPointCoords.y * zoom);
                const fieldPxAmountInSecondPage = bottomRightPointCoords.y * zoom;

                // Si les valeurs sont égales, en page 1 arbitrairement
                x = topLeftPointCoords.x
                y = 0
                page = clickedPage.page[1]

                if (fieldPxAmountInFirstPage >= fieldPxAmountInSecondPage) {
                    y = (firstPageContainer.offsetHeight - (this.LABEL_FIELD_HEIGHT * zoom)) / zoom;
                    page = clickedPage.page[0];
                }
            }

            this.addFormFieldAnnotation(field.type, 'NAME !!!', 'TOTO', true, x, y, page);
        }

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

    addFormFieldAnnotation = (type, name, value, flag, x, y, pageNumber) => {

        const colorMapping =  {
            signature: [20,172,227],
            name: [235, 45, 102],
            email: [26, 219, 161]
        }

        const {webViewer} = this.state;
        const {docViewer, Annotations} = webViewer;

        const annotationManager = docViewer.getAnnotationManager();

        const textAnnotation = new Annotations.FreeTextAnnotation();

        textAnnotation.PageNumber = pageNumber;
        textAnnotation.custom = { type, value, flag, id: textAnnotation.Id, message: '' };
        // textAnnotation.setCustomData('type', type); // Works
        // textAnnotation.setCustomData('id', Math.floor(Math.random() * 1500));
        // textAnnotation.setCustomData('message', '');
        // textAnnotation.setCustomData('realId', textAnnotation.Id);
        textAnnotation.Width = this.LABEL_FIELD_WIDTH;
        textAnnotation.Height = this.LABEL_FIELD_HEIGHT;
        textAnnotation.X = x
        textAnnotation.Y = y;
        textAnnotation.setContents(type.toUpperCase());
        textAnnotation.setPadding(new Annotations.Rect(0, 0, 0, 0));
        textAnnotation.FillColor = new Annotations.Color(...colorMapping[type]);
        //235, 45, 102
        console.log("textAnnot", textAnnotation);
        annotationManager.enableRedaction(false)
        annotationManager.addAnnotation(textAnnotation, { autoFocus: false });
        annotationManager.redrawAnnotation(textAnnotation);
        this.addAnnotationToState(textAnnotation);
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

    addAnnotationToState = (annotation) => {
        const { annotations } = this.state;

        const annotationsCopy = JSON.parse(JSON.stringify((annotations)));
        // console.log('new annotation', annotation); // Good
        annotationsCopy.push(annotation);

        this.setState({annotations: annotationsCopy});
    }

    deleteAnnotationFromState = (annotationsToDelete) => {
        const { annotations } = this.state;
        console.log("annotations state", annotations); // Id = Undefined mais Qw c'est bon
        // console.log('realId from customData', annotations[0].getCustomData('realId'))
        const annotationIdsToDelete = annotationsToDelete.map(annotation => annotation.custom.id);
        console.log("annot ids to delete", annotationIdsToDelete)
        let indexToDelete = [];

        const annotationsCopy = JSON.parse(JSON.stringify((annotations)));
        console.log("annotationsCopy",annotationsCopy)

        annotationsCopy.forEach((annotation, index) => {

            if (annotationIdsToDelete.includes(annotation.custom.id)) {
                indexToDelete.push(index);
            }
        })

        for (let i = indexToDelete.length - 1; i >= 0; i--) {
            annotationsCopy.splice(indexToDelete[i], 1);
        }

        console.log("annotations après suppression", annotationsCopy);

        this.setState({annotations: annotationsCopy});
    }

    render() {
        const {fields, isDragging, showOptions, currentAnnotations, webViewer} = this.state;
        let style = {}
        console.log('render webviewer', webViewer);
        if (webViewer) style = this.getRightSidebarStyle(webViewer);


        return (
            <>
                <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "300px", zIndex: 1}}>
                    {fields.map(field => {
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
                    {showOptions &&
                    <div style={{width: 250,
                        // height: '100%',
                        // border: "1px grey solid",
                        position: "absolute",
                        top: '50%',
                        // left: '50%',
                        // backgroundColor: 'white'
                    }}>
                        OPTIONS BOX
                        {/* Fait buguer le CC*/}
                        {/*<p>{currentAnnotations[0].custom.type}</p>*/}
                        {/*<p>{currentAnnotations[0].custom.id}</p>*/}
                        {/*<input type="text" defaultValue={currentAnnotations[0].custom.message} onChange={(e) => {*/}
                        {/*    currentAnnotations[0].custom.message = e.target.value;*/}
                        {/*    this.setState(currentAnnotations)*/}
                        {/*}}/>*/}
                    </div>
                    }
                </div>
                <div id="pdf-wrapper" className="MyComponent" style={{height: '100%', flex: 1}}>
                    {isDragging &&
                        <div id="cover" style={this.getCoverStyle()}/>
                    }
                    <div className="webviewer" ref={this.viewer} style={{height: "100%"}}/>
                </div>
                {showOptions &&
                <div style={style}>
                    OPTIONS BOX
                    <p>{currentAnnotations[0].getCustomData('type')}</p>
                    <p>{currentAnnotations[0].Id}</p>
                </div>
                }
            </>
        );
    }
}

export default ClassComponent
