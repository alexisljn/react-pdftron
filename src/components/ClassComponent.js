import React, {createRef} from "react";
import WebViewer from "@pdftron/webviewer";
import DraggableField from "./DraggableField";
import Moveable from "react-moveable";

class ClassComponent extends React.Component {

    scrollTimer = null;

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
            targets: [],
            signatureCounter: 1,
            emailCounter: 1,
            nameCounter: 1,
            isDragging: false,
            isScrolling: false,
            frame: {translate: [0,0]}
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
        this.setState({targets: defaultFields});
    }

    getDefaultFields = () => {
        return [
            {
                domElt: 'target-signature-1',
                type: 'signature',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
                id: 1,
            },
            {
                domElt: 'target-name-1',
                type: 'name',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
                id: 1,
            },
            {
                domElt: 'target-email-1',
                type: 'email',
                isActive: false,
                isPlaced: false,
                xPosition: false,
                yPosition: false,
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
            width: 150,
            height: 30,
            backgroundColor: colorMapping[inputName],
            color: 'white',
            cursor: 'pointer'
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

    coverStyle = {
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }

    incrementCounter = (type) => {
        let newValue;
        switch (type) {
            case this.SIGNATURE_TYPE:
                const {signatureCounter} = this.state;
                console.log('temoin signature');
                newValue = signatureCounter + 1;
                this.setState({signatureCounter: newValue})
                break;
            case this.EMAIL_TYPE:
                const {emailCounter} = this.state;
                console.log('temoin email');
                newValue = emailCounter + 1
                this.setState({emailCounter: newValue})
                break;
            case this.NAME_TYPE:
                const {nameCounter} = this.state;
                console.log('temoin name');
                newValue = nameCounter + 1
                this.setState({nameCounter: newValue})
                break;
            default:
                return;
        }

        return newValue
    }


    createMoveable = (target) => {
        const { fields } = this.state;

        const targetsCopy = JSON.parse(JSON.stringify(fields));

        targetsCopy.forEach((targetFromState, index) => {
            if (targetFromState.id === target.id && targetFromState.type === target.type)
                targetFromState['isActive'] = true;
        })

        const currentTargetElt = document.querySelector(`.${target.domElt}`);
        currentTargetElt.style.position = 'absolute';

        const newCounterValue = this.incrementCounter(target.type)
        // const newDomTargetName = createDOMTarget(target.type, newCounterValue)

        const newTarget = {
            // domElt: newDomTargetName,
            domElt: `target-${target.type}-${newCounterValue}`,
            type: target.type,
            isActive: false,
            isPlaced: false,
            xPosition: false,
            yPosition: false,
            id: newCounterValue
        }

        targetsCopy.push(newTarget);
        console.log('targetCopy APRES AJOUT', targetsCopy);
        this.setState({fields: targetsCopy});
        this.setState({targets: targetsCopy});
    }

    onDragHandler = (xPosition, yPosition, field) => {
        const { webViewer, fields, isScrolling } = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        const bottomDetectionZone = window.innerHeight - this.DETECTION_ZONE_LIMIT;
        const topDetectionZone =  (window.innerHeight - containerToScrollElt.clientHeight) + this.DETECTION_ZONE_LIMIT;

        // Updating new position
        fields.forEach((fieldCopy => {
            if (fieldCopy.id === field.id && fieldCopy.type === field.type) {
                fieldCopy.yPosition = yPosition;
                fieldCopy.xPosition = xPosition;
            }
        }))

        this.setState({fields, targets: fields})

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

    scroll2 = (containerToScroll, {type,id}) => {
        const { isDragging } = this.state;
        const coeff = window.innerHeight - containerToScroll.clientHeight;

        let field = this.getField(type,id)
        console.log("isDraggin ?", isDragging);
        console.log('field', field.yPosition)
        this.setState({isScrolling: true});
        let previousPosition = 0
        this.scrollTimer = setInterval(() => {
            const yPositionDiff = field.yPosition - previousPosition
            // const scrollDirection = yPositionDiff > 0
            const scrollValue = field.yPosition + 50 >= window.innerHeight ? 20 : -20
            console.log('field', field.yPosition)
            // containerToScroll.scrollBy(0,scrollValue);
            // On descends vers le bas
            if (scrollValue > 0) {

                if (yPositionDiff >= 0) {
                    containerToScroll.scrollBy(0,scrollValue);
                }

                // containerToScroll.scrollBy(0,scrollValue);

                if (field.yPosition + 50 < window.innerHeight) {
                    clearInterval(this.scrollTimer)
                    // scrollTimer = null
                    console.log("hors zone");
                    console.log(this.scrollTimer);
                    this.setState({isScrolling: false})
                }

                if (containerToScroll.scrollHeight -
                    containerToScroll.scrollTop <=
                    containerToScroll.clientHeight) {
                    console.log("AU BOUT")
                    clearInterval(this.scrollTimer);
                    this.setState({isScrolling: false})
                }


            } else {
                console.log("DR COX");
                if (yPositionDiff <= 0) {
                    containerToScroll.scrollBy(0,scrollValue);
                }


                if (field.yPosition - 50 > coeff) {
                    clearInterval(this.scrollTimer)
                    // scrollTimer = null
                    console.log("hors zone");
                    console.log(this.scrollTimer);
                    this.setState({isScrolling: false})
                }

                if (containerToScroll.scrollTop === 0) {
                    console.log("AU TOP")
                    clearInterval(this.scrollTimer);
                    this.setState({isScrolling: false})
                }

            }
            previousPosition = field.yPosition;
        }, 100)
    }

    getField = (type, id) => {
        const { fields } = this.state
        let Dfield = {}
        fields.forEach(field => {
            if (field.type === type && field.id === id) Dfield = field
        })

        if (Dfield.hasOwnProperty('type')) return Dfield;

        throw new Error('merde');
    }

    test = () => {
        const { webViewer} = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        // console.log("toto");
        // console.log(this.state.fields);
        // console.log("isScrolling test", this.state.isScrolling);
        // const position = containerToScrollElt.getBoundingClientRect();
        const position = document.querySelector('.MyComponent').getBoundingClientRect();
        console.log('left', position.left);
        console.log('top', position.top + window.scrollY)

    }

    render() {
        const {fields, targets, isDragging } = this.state;

        return (<>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <button onClick={() => this.test()}>ZZ</button>
                <div className="sidebar-signature">
                    {fields.map(field => {
                        if (field.type === this.SIGNATURE_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={this.getStyle}/>
                    })}
                </div>
                <div className="sidebar-name">
                    {fields.map(field => {
                        if (field.type === this.NAME_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={this.getStyle}/>
                    })}
                </div>
                <div className="sidebar-email">
                    {fields.map(field => {
                        if (field.type === this.EMAIL_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={this.getStyle}/>
                    })}
                </div>
            </div>
            <div id="pdf-wrapper" className="MyComponent" style={{width: '75%', height: '100%'}}>
                {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
                {isDragging &&
                <div style={this.coverStyle}/>
                }
                <div className="webviewer" ref={this.viewer} style={{height: "100vh"}}></div>
            </div>
            {/* On créer un Moveable par target*/}
            {
                targets.map(targetObj => {
                        // console.log(`DOM.target-${targetObj.type}-${targetObj.id}`, document.querySelector(`.target-${targetObj.type}-${targetObj.id}`))
                        //     console.log(targetObj.domElt)
                        //     console.log("QuerySelectpr",document.querySelector(`.${targetObj.domElt}`));
                        const targetElt = document.querySelector(`.${targetObj.domElt}`);
                        return (
                            <>
                                <Moveable
                                    target={targetElt}
                                    container={null}
                                    origin={false}
                                    edge={false}
                                    draggable={true}
                                    throttleDrag={0}
                                    onDragStart={({ target, clientX, clientY }) => {
                                        console.log("onDragStart", target);
                                        console.log("clientX", clientX);
                                        console.log("clientY", clientY);
                                        this.setState({isDragging: true})
                                    }}
                                    onDrag={({
                                                 target,
                                                 beforeDelta, beforeDist,
                                                 left, top,
                                                 right, bottom,
                                                 delta, dist,
                                                 transform,
                                                 clientX, clientY,
                                             }) => {
                                        // console.log(clientX, clientY);
                                        // console.log("onDrag left, top", left, top);
                                        // target!.style.left = `${left}px`; COM BY TUTO
                                        // target!.style.top = `${top}px`; COM BY TUTO
                                        // console.log("onDrag translate", dist);
                                        target.style.transform = transform;
                                        // target.style.zIndex = 2;
                                        // console.log("targetOBJ", targetObj)
                                        this.onDragHandler(clientX, clientY, targetObj)
                                        if (!targetObj.isActive) this.createMoveable(targetObj)
                                    }}
                                    onDragEnd={({ target, isDrag, clientX, clientY }) => {
                                        console.log("ON DRAG END")
                                        this.setState({isDragging: false, isScrolling: false})
                                        clearInterval(this.scrollTimer);
                                        // target.style.zIndex = 'auto';
                                        // console.log("onDragEnd", target, isDrag);
                                    }}
                                />
                            </>
                        )
                    }
                )}
        </>);
    }
}

export default ClassComponent
