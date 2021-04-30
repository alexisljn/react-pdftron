import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);

    const [target, setTarget] = React.useState();
    const [frame, setFrame] = React.useState({
        translate: [0,0],
    });

    useEffect(() => {
        setTarget(document.querySelector(".target"));
        const loadWebViewer = async () => {
            const instance = await WebViewer(
                {
                    licenseKey: 'toto',
                    path: '/pdftron/lib',
                    initialDoc: '/fixture/sample.pdf',
                },
                viewer.current,
            )
            setWebViewer(instance)
            handleClick(instance)
        }
        (async () => {
           await loadWebViewer()

            handleClick()
        })()
        // loadWebViewer();


        // WebViewer(
        //     {
        //         licenseKey: 'toto',
        //         path: '/pdftron/lib',
        //         initialDoc: '/fixture/sample.pdf',
        //     },
        //     viewer.current,
        // ).then((instance) => {
        //     const { docViewer } = instance;
        //     // you can now call WebViewer APIs here...
        // });
    }, [])

    const handleClick = (instance) => {
        const { docViewer } = instance;
        console.log('docViewer', docViewer);
        // e est un objet event avec des propriétés supp par pdfTron
        docViewer.on('click', (e) => {
            console.log('CLICK', e);

        })
    }

    const onDragEnd = () => {

    }

    const getStyle = (inputName) => {
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

    const createMoveable = (inputName) => {
        console.log("CREATE MOVEABLE", inputName);
    }

    const test = () => {
        const {docViewer} = webViewer;

        console.log("docViewerr", docViewer);
    }

    return (
        <>
            <button onClick={() => {test()}}>ZZ</button>
            <div style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%"}}>
                SIDEBAR
                <div style={getStyle('signature')}
                     onClick={() => createMoveable('signature')}
                >
                    SIGNATURE
                </div>
                <div style={{marginBottom: 20}}/>
                <div style={getStyle('name')}
                     onClick={() => createMoveable('name')}
                >
                    NOM
                </div>
                <div style={{marginBottom: 20}}/>
                <div style={getStyle('email')}
                     onClick={() => createMoveable('email')}
                >
                    EMAIL
                </div>
                <div style={{marginBottom: 20}}/>
                <div className="target" style={{width: 150, height: 50, backgroundColor: 'blue', position: 'absolute'}}>DRAGGABLE</div>
                <Moveable
                    target={document.querySelector(".target")}
                    container={null}
                    origin={true}

                    /* Resize event edges */
                    edge={false}

                    /* draggable */
                    draggable={true}
                    throttleDrag={0}
                    onDragStart={({ target, clientX, clientY }) => {
                        console.log("onDragStart", target);
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
                        // console.log("onDrag left, top", left, top);
                        // target!.style.left = `${left}px`;
                        // target!.style.top = `${top}px`;
                        // console.log("onDrag translate", dist);
                        target.style.transform = transform;
                    }}
                    onDragEnd={({ target, isDrag, clientX, clientY }) => {
                        console.log("onDragEnd", target, isDrag);
                    }}

                    /* When resize or scale, keeps a ratio of the width, height. */
                    keepRatio={true}

                    /* resizable*/
                    /* Only one of resizable, scalable, warpable can be used. */
                    resizable={true}
                    throttleResize={0}
                    onResizeStart={({ target , clientX, clientY}) => {
                        console.log("onResizeStart", target);
                    }}
                    onResize={({
                                   target, width, height,
                                   dist, delta, direction,
                                   clientX, clientY,
                               }) => {
                        console.log("onResize", target);
                        delta[0] && (target.style.width = `${width}px`);
                        delta[1] && (target.style.height = `${height}px`);
                    }}
                    onResizeEnd={({ target, isDrag, clientX, clientY }) => {
                        console.log("onResizeEnd", target, isDrag);
                    }}

                    /* scalable */
                    /* Only one of resizable, scalable, warpable can be used. */
                    scalable={true}
                    throttleScale={0}
                    onScaleStart={({ target, clientX, clientY }) => {
                        console.log("onScaleStart", target);
                    }}
                    onScale={({
                                  target, scale, dist, delta, transform,
                                  clientX, clientY,
                              }) => {
                        console.log("onScale scale", scale);
                        target.style.transform = transform;
                    }}
                    onScaleEnd={({ target, isDrag, clientX, clientY }) => {
                        console.log("onScaleEnd", target, isDrag);
                    }}

                    /* rotatable */
                    rotatable={true}
                    throttleRotate={0}
                    onRotateStart={({ target, clientX, clientY }) => {
                        console.log("onRotateStart", target);
                    }}
                    onRotate={({
                                   target,
                                   delta, dist,
                                   transform,
                                   clientX, clientY,
                               }) => {
                        console.log("onRotate", dist);
                        target.style.transform = transform;
                    }}
                    onRotateEnd={({ target, isDrag, clientX, clientY }) => {
                        console.log("onRotateEnd", target, isDrag);
                    }}

                    /* warpable */
                    /* Only one of resizable, scalable, warpable can be used. */
                    /*
                    this.matrix = [
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1,
                    ]
                    */
                    warpable={true}
                    onWarpStart={({ target, clientX, clientY }) => {
                        console.log("onWarpStart", target);
                    }}
                    onWarp={({
                                 target,
                                 clientX,
                                 clientY,
                                 delta,
                                 dist,
                                 multiply,
                                 transform,
                             }) => {
                        console.log("onWarp", target);
                        // target.style.transform = transform;
                        this.matrix = multiply(this.matrix, delta);
                        target.style.transform = `matrix3d(${this.matrix.join(",")})`;
                    }}
                    onWarpEnd={({ target, isDrag, clientX, clientY }) => {
                        console.log("onWarpEnd", target, isDrag);
                    }}

                    // Enabling pinchable lets you use events that
                    // can be used in draggable, resizable, scalable, and rotateable.
                    pinchable={true}
                    onPinchStart={({ target, clientX, clientY, datas }) => {
                        // pinchStart event occur before dragStart, rotateStart, scaleStart, resizeStart
                        console.log("onPinchStart");
                    }}
                    onPinch={({ target, clientX, clientY, datas }) => {
                        // pinch event occur before drag, rotate, scale, resize
                        console.log("onPinch");
                    }}
                    onPinchEnd={({ isDrag, target, clientX, clientY, datas }) => {
                        // pinchEnd event occur before dragEnd, rotateEnd, scaleEnd, resizeEnd
                        console.log("onPinchEnd");
                    }}
                />
            </div>
        <div className="MyComponent" style={{width: '75%'}}>
            {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
            {/*<div className="header">React sample</div>*/}
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
        </>
    );
}

export default MainComponent;
