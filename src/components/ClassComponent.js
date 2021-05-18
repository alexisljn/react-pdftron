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

    constructor(props) {
        super(props);
        this.state = {
            webViewer: null,
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

    onDragHandler = (xPosition, yPosition, field) => {
        const { webViewer, fields, isScrolling } = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        const bottomDetectionZone = window.innerHeight - this.DETECTION_ZONE_LIMIT;
        const topDetectionZone =  (window.innerHeight - containerToScrollElt.clientHeight) + this.DETECTION_ZONE_LIMIT;

        fields.forEach((fieldCopy => {
            if (fieldCopy.id === field.id && fieldCopy.type === field.type) {
                fieldCopy.yPosition = yPosition;
                fieldCopy.xPosition = xPosition;
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

        this.previousYPosition = yPosition;
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

    test = () => {
        const { webViewer} = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        // console.log(this.state.signatureCounter);
        // console.log(this.state.isDragging);
        console.log(this.state.fields);
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

    onDragStop = () => {
        this.setState({isDragging: false, isScrolling: false});
        clearInterval(this.scrollTimer);
    }

    render() {
        const {fields, isDragging } = this.state;

        return (<>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <button onClick={() => this.test()}>ZZ</button>
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
            <div id="pdf-wrapper" className="MyComponent" style={{width: '75%', height: '100%'}}>
                {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
                {isDragging &&
                <div id="cover" style={this.getCoverStyle()}/>
                }
                <div className="webviewer" ref={this.viewer} style={{height: "100vh"}}></div>
            </div>

        </>);
    }
}

export default ClassComponent
