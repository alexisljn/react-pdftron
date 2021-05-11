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

    return (
        <>
            <button onClick={() => {test()}}>ZZ</button>
            <div style={{height: "100vh", backgroundColor: "#E8E8E8", width: "25%"}}>
                SIDEBAR
                <Draggable>
                    <div className="target"
                         style={{width: 150, height: 50, backgroundColor: 'blue'}}>
                        DRAGGABLE
                    </div>
                </Draggable>
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
