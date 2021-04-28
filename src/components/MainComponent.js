import React, {useEffect} from "react";
import {useRef} from 'react';
import WebViewer from "@pdftron/webviewer";

const MainComponent = () => {


    const viewer = useRef(null);

    useEffect(() => {
        WebViewer(
            {
                path: '/pdftron/lib',
                initialDoc: '/fixture/sample.pdf',
            },
            viewer.current,
        ).then((instance) => {
            const { docViewer } = instance;
            // you can now call WebViewer APIs here...
        });
    }, [])

    return (
        <div className="MyComponent">
            <div className="header">React sample</div>
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
    );

    return (
        <h1>From React</h1>
    )
}

export default MainComponent;