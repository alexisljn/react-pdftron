import "core-js";
// import 'whatwg-fetch';

import React from "react";
import { render } from "react-dom";
import MainComponent from "./components/MainComponent";
import ClassComponent from "./components/ClassComponent";

function App() {

    // Listing des champs placés :

    return (
        <>
            {/*<h1>sqdqdqsdqdqsd</h1>*/}
        {/*<div id="global" style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>*/}
        <div id="global" style={{display: 'flex', flexDirection: "column", height: '100vh', overflow: 'hidden'}}>
            {/*<MainComponent/>*/}
            <ClassComponent/>
        </div>
        </>
    )
}

render(<App />, document.getElementById("root"));
