import "core-js";
// import 'whatwg-fetch';

import React from "react";
import { render } from "react-dom";
import MainComponent from "./components/MainComponent";
import Sidebar from "./components/Sidebar";

function App() {

    // Listing des champs placés :

    return (
        <div id="global" style={{display: 'flex'}}>
            <MainComponent/>
        </div>
    )
}

render(<App />, document.getElementById("root"));
