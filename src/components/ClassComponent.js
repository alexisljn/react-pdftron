import React, {createRef} from "react";
import WebViewer from "@pdftron/webviewer";
import DraggableField from "./DraggableField";
import Moveable from "react-moveable";
import Draggable from "react-draggable";

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
            signatureCounter: 1,
            emailCounter: 1,
            nameCounter: 1,
            isDragging: false,
            isScrolling: false,
            isLoading: true,
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
        this.setState({isLoading: false});
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
            zIndex: 5000,
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


    createMoveable = (field) => {
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
            xPosition: false,
            yPosition: false,
            id: newCounterValue
        }

        fieldsCopy.push(newField);
        console.log('targetCopy APRES AJOUT', fieldsCopy);
        this.setState({fields:fieldsCopy});
        // this.setState({targets: targetsCopy});
    }

    deleteField = (type, id) => {
        const { fields } = this.state;
        const fieldsCopy = Array.from(fields);
        let indexToDelete = null;
        fieldsCopy.forEach((field, index) => {
            if (field.id === id && field.type === type);
                indexToDelete = index;
        })
        console.log("idxToDelete", indexToDelete);
        if (indexToDelete) {
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
        // console.log(field);
        // console.log(bottomDetectionZone)
        // Updating new position
        let previousYPosition = 0;

        fields.forEach((fieldCopy => {
            if (fieldCopy.id === field.id && fieldCopy.type === field.type) {
                fieldCopy.yPosition = yPosition;
                fieldCopy.xPosition = xPosition;
                // previousYPosition = Number(fieldCopy.yPosition);
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

    getCustomAble = () => {
        const ctrlInstance = this;
        return {
            name: "tooltool",
            // stateC: this.state,
            render: (moveable) => {
                const { renderPoses } = moveable.state;
                // const deleteField = this.deleteField;
                const deleteField = (type, id) => {
                    console.log("this state", this.state);
                    console.log("GO DELETE", type, id);
                    // console.log(ctrlInstance.state);
                    // ctrlInstance.setState({signatureCounter: 30});

                    const { fields } = ctrlInstance.state;
                    const fieldsCopy = Array.from(fields);
                    let indexToDelete = null;
                    console.log("fields Original", fields);
                    fieldsCopy.forEach((field, index) => {
                        console.log("eachField", field.id, id, field.type, type);
                        if (field.id === parseInt(id) && field.type === type)
                            indexToDelete = index;
                    })
                    console.log("idxToDelete", indexToDelete);
                    console.log("fieldToDelete according IDX", fields[indexToDelete]);
                    if (indexToDelete !== 'null') {
                        fieldsCopy.splice(indexToDelete,1);
                        console.log('After Dekete', fieldsCopy)
                       ctrlInstance.setState({fields: fieldsCopy});
                    }
                }
                return (
                    <button
                        onClick={(e) => {
                            console.log("e", e.nativeEvent);
                            console.log("moveable", moveable.state)
                            const domId = moveable.state.target.id;
                            const [notUsed,type,id] = domId.split('-');
                            e.nativeEvent.stopImmediatePropagation();
                            deleteField(type, id);
                        }}
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${renderPoses[1][0]}px, ${renderPoses[1][1]}px) translateZ(-50px)`,
                            zIndex: 100,
                        }}
                    >
                        X
                    </button>
                );
            }
        }
    }

    // customAble = {
    //
    //     name: "tooltool",
    //     stateC: this.state,
    //     render(moveable) {
    //         const { renderPoses } = moveable.state;
    //         // const deleteField = this.deleteField;
    //         console.log(this.SIGNATURE_TYPE);
    //         const deleteField = (type, id) => {
    //             console.log("GO DELETE");
    //             const { fields } = this.stateC;
    //             // const fieldsCopy = Array.from(fields);
    //             // let indexToDelete = null;
    //             // fieldsCopy.forEach((field, index) => {
    //             //     if (field.id === id && field.type === type);
    //             //     indexToDelete = index;
    //             // })
    //             // console.log("idxToDelete", indexToDelete);
    //             // if (indexToDelete) {
    //             //     fieldsCopy.splice(indexToDelete,1);
    //             //     this.setState({fields: fieldsCopy});
    //             // }
    //         }
    //         return (
    //             <button
    //                 onClick={(e) => {
    //                     console.log("e", e.nativeEvent);
    //                     console.log("moveable", moveable.state)
    //                     const domId = moveable.state.target.id;
    //                     const [notUsed,type,id] = domId.split('-');
    //                     e.nativeEvent.stopImmediatePropagation();
    //                     deleteField(type, id);
    //                 }}
    //                 style={{
    //                     position: "absolute",
    //                     transform: `translate(-50%, -50%) translate(${renderPoses[1][0]}px, ${renderPoses[1][1]}px) translateZ(-50px)`,
    //                     zIndex: 100,
    //                 }}
    //             >
    //                 X
    //             </button>
    //         );
    //     }
    // }

    test = () => {
        const { webViewer} = this.state;
        const { docViewer } = webViewer;
        const containerToScrollElt = docViewer.getScrollViewElement();
        console.log(this.state.signatureCounter);
        console.log(this.state.isDragging);
        // console.log("isScrolling test", this.state.isScrolling);
        // const position = containerToScrollElt.getBoundingClientRect();
        // const position = document.querySelector('.MyComponent').getBoundingClientRect();
        // console.log('left', position.left);
        // console.log('top', position.top + window.scrollY)

    }

    render() {
        const {fields, isDragging } = this.state;

        return (<>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <Draggable><div>ssss</div></Draggable>
                <button onClick={() => this.test()}>ZZ</button>
                <div className="sidebar-signature">
                    {fields.map(field => {
                        if (field.type === this.SIGNATURE_TYPE)
                            return (
                                <Draggable onStart={() => this.setState({isDragging: true})}
                                           onStop={() => {
                                               this.setState({isDragging: false, isScrolling: false})
                                               clearInterval(this.scrollTimer);
                                           }}
                                           onDrag={(e,data) => /*console.log(data.node.getBoundingClientRect())*/this.onDragHandler(data.node.getBoundingClientRect().x, data.node.getBoundingClientRect().y, field)}
                                           offsetParent={document.querySelector('.sidebar')}
                                >
                                    <div id={`target-${field.type}-${field.id}`} style={this.getStyle(field.type)}>
                                        {field.type.toUpperCase()}
                                        {/*<button onClick={() => console.log('toto')}>TT</button>*/}
                                    </div>
                                    {/*<DraggableField*/}
                                    {/*    type={field.type}*/}
                                    {/*    id={field.id}*/}
                                    {/*    getStyle={this.getStyle}*/}
                                    {/*    deleteField={this.deleteField}*/}
                                    {/*/>*/}
                                </Draggable>
                            )
                    })}
                </div>
                <div className="sidebar-name">
                    {fields.map(field => {
                        if (field.type === this.NAME_TYPE)
                            return (
                                <Draggable onStart={() => this.setState({isDragging: true})}
                                           onStop={() => {
                                               this.setState({isDragging: false, isScrolling: false})
                                               clearInterval(this.scrollTimer);
                                           }}
                                           onDrag={(e,data) => console.log(data)}
                                >
                                    <div id={`target-${field.type}-${field.id}`} style={this.getStyle(field.type)}>
                                        {field.type.toUpperCase()}
                                        {/*<button onClick={() => console.log('toto')}>TT</button>*/}
                                    </div>
                                </Draggable>
                            )
                    })}
                </div>
                <div className="sidebar-email">
                    {fields.map(field => {
                        if (field.type === this.EMAIL_TYPE)
                            return (
                                <Draggable onStart={() => this.setState({isDragging: true})}
                                           onStop={() => {
                                               this.setState({isDragging: false, isScrolling: false})
                                               clearInterval(this.scrollTimer);
                                           }}
                                            onDrag={(e,data) => console.log(data)}

                                >
                                    <div id={`target-${field.type}-${field.id}`} style={this.getStyle(field.type)}>
                                        {field.type.toUpperCase()}
                                        {/*<button onClick={() => console.log('toto')}>TT</button>*/}
                                    </div>
                                </Draggable>
                            )
                    })}
                </div>
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
