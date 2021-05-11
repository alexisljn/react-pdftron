import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Draggable from "react-draggable";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);

    useEffect(() => {
        const loadWebViewer = async () => {
            const instance = await WebViewer(
                {
                    licenseKey: 'toto',
                    path: '/pdftron/lib',
                    initialDoc: '/fixture/sample.pdf',
                    // disabledElements: [
                    //     'header',
                    //     'leftPanel',
                    //     'searchPanel'
                    // ]
                },
                viewer.current,
            )
            setWebViewer(instance)
            handleClick(instance)
        }
        // (async () => {
        //    await loadWebViewer()
        //
        //     handleClick()
        // })()
        loadWebViewer();


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

    const test = () => {
        const {docViewer} = webViewer;

        console.log("docViewerr", docViewer);
    }
    const onDrag = (e, ui) => {
        // console.log(e,ui);
        // ui.y += 500;
        ui.node.style.backgroundColor= 'red';
        // console.log(window.scrollY);
        // if (ui.y >= 750) window.scrollBy(0, 2);
    }

    return (
        <>
            <button onClick={() => {test()}}>ZZ</button>
            <div style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%"}}>
                SIDEBAR
                <Draggable bounds={"#global"} onDrag={(e, ui) => onDrag(e,ui)}>
                    <div className="target"
                         style={{width: 150, height: 50, backgroundColor: 'blue'}}>
                        DRAGGABLE
                    </div>
                </Draggable>
            </div>
        <div className="MyComponent" style={{width: '75%'}}>
            {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
            {/*<div className="header">React sample</div>*/}
            {/*<div style={{width: '100%', height: 2000}}></div>*/}
            {/*<iframe id="inlineFrameExample"*/}
            {/*        title="Inline Frame Example"*/}
            {/*        width="100%"*/}
            {/*        height="1000px"*/}
            {/*        src="https://www.google.com/webhp?igu=1">*/}
            {/*</iframe>*/}
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
        </>
    );
}

export default MainComponent;
