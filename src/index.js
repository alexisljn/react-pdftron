import "core-js";
// import 'whatwg-fetch';

import React from "react";
import { render } from "react-dom";
import MainComponent from "./components/MainComponent";
import ClassComponent from "./components/ClassComponent";

function App() {

    // Listing des champs placés :

    return (
        <div id="global" style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>
            {/*<MainComponent/>*/}
            <ClassComponent/>
        </div>
    )
}

render(<App />, document.getElementById("root"));
