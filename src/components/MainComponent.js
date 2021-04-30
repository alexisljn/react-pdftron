import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const [webViewerIframe, setWebViewerIframe] = useState(null);
    const [pageContainers, setPageContainers] = useState([]);
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
            registerEvents(instance)
        }
        (async () => {
            await loadWebViewer()
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

    const registerPageContainers = (iframe) => {

        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframeWindow.document;
        const pageContainers = iframeDocument.querySelectorAll('.pageContainer');

        console.log(pageContainers);

        setPageContainers(Array.from(pageContainers));
    }

    const registerEvents = (instance) => {
        const { docViewer } = instance;
        console.log('docViewer', docViewer);

        // e est un objet event avec des propriétés supp par pdfTron
        docViewer.on('click', (e) => {
            console.log('CLICK', e);
            console.log('COORDONNEES VIEWPORT', e.target.getBoundingClientRect());
        })

        docViewer.on('pageComplete', (e) => {
            console.log('PAGE COMPLETE', e);
        })

        docViewer.on('documentLoaded', (e) => {
            console.log('DOCUMENT LOADED', e);

            const iframe = document.querySelector('#webviewer-1');
            console.log("L'IFRAME A ENREGISTRER", iframe)
            setWebViewerIframe(iframe);
            console.log("L'IFRAME QUI A ETE ENREGISTREE", webViewerIframe);

            registerPageContainers(iframe);
        })

        docViewer.on('displayModeUpdated', (e) => {
            console.log('DISPLAY MODE UPDATED', e);

            const iframe = document.querySelector('#webviewer-1');

            registerPageContainers(iframe);
        })
    }

    const onDragEnd = () => {

    }

    const test = () => {
        const {docViewer} = webViewer;

        console.log("docViewerr", docViewer);
    }

    const getMoveable = (target) => {
        return (
            <Moveable
                target={target}
                container={null}
                origin={false}

                /* Resize event edges */
                edge={false}

                /* draggable */
                draggable={true}
                throttleDrag={0}
                onDragStart={({ target, clientX, clientY }) => {
                    // console.clear(); // Avoid console.log lag
                    console.log("onDragStart", target);
                }}
                onDrag={({
                             target,
                             beforeDelta, beforeDist,
                             left, top, // COORDONNEES ABSOLUES RELATIVES AU DOCUMENT
                             right, bottom,
                             delta, dist,
                             transform,
                             clientX, clientY,
                         }) => {
                    // console.log("onDrag left, top", left, top);
                    target.style.left = `${left}px`;
                    target.style.top = `${top}px`;
                    // console.log("onDrag translate", dist);
                    // target.style.transform = transform;
                }}
                onDragEnd={({ target, isDrag, clientX, clientY }) => {
                    const targetViewportPosition = target.getBoundingClientRect();
                    const targetViewportX = targetViewportPosition.x;
                    const targetViewPortY = targetViewportPosition.y;

                    console.log("onDragEnd", target.id, target.getBoundingClientRect());
                    pageContainers.forEach(pageContainer => {
                        const webViewerIframeViewportPosition = webViewerIframe.getBoundingClientRect();
                        const webViewerIframeViewportX = webViewerIframeViewportPosition.x;
                        const webViewerIframeViewportY = webViewerIframeViewportPosition.y;

                        const pageContainerIframeViewportPosition = pageContainer.getBoundingClientRect();
                        const pageContainerIframeViewportX = pageContainerIframeViewportPosition.x;
                        const pageContainerIframeViewportY = pageContainerIframeViewportPosition.y;

                        const pageContainerViewportX1 = pageContainerIframeViewportX + webViewerIframeViewportX;
                        const pageContainerViewportY1 = pageContainerIframeViewportY + webViewerIframeViewportY;
                        const pageContainerViewportX2 = pageContainerViewportX1 + pageContainerIframeViewportPosition.width;
                        const pageContainerViewportY2 = pageContainerViewportY1 + pageContainerIframeViewportPosition.height;

                        const isTargetDraggedInPageContainer = () => {
                            if (targetViewportX < pageContainerViewportX1) {
                                return false;
                            }

                            if (targetViewPortY < pageContainerViewportY1) {
                                return false;
                            }

                            if (targetViewportX > pageContainerViewportX2) {
                                return false;
                            }

                            if (targetViewPortY > pageContainerViewportY2) {
                                return false;
                            }

                            return true;
                        }

                        let draggedInThisPageContainer = isTargetDraggedInPageContainer();

                        console.log(pageContainer, draggedInThisPageContainer, pageContainerViewportX1, pageContainerViewportY1, pageContainerViewportX2, pageContainerViewportY2);
                    });
                }}

                /* When resize or scale, keeps a ratio of the width, height. */
                keepRatio={true}
            />
        );
    }

    return (
        <>
            <button onClick={() => {test()}}>ZZ</button>
            <div style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%"}}>
                SIDEBAR
                <div id="bleu" className="target" style={{width: 150, height: 50, backgroundColor: 'blue', position: 'absolute'}}>DRAGGABLE</div>
                <div id="rouge" className="target" style={{width: 170, height: 40, backgroundColor: 'red', position: 'absolute'}}>DRAGGABLE</div>
                {Array.from(document.querySelectorAll('.target')).map(target => {
                    return getMoveable(target);
                })}
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
