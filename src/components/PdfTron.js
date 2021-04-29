import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";


const PdfTron = () => {

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

    return (
        <div className="MyComponent">
            <button onClick={() => console.log(webViewer)}>X</button>
            <div className="header">React sample</div>
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
    );

    return (
        <h1>From React</h1>
    )
}

export default PdfTron;
