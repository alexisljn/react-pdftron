import "core-js";
// import 'whatwg-fetch';

import React from "react";
import { render } from "react-dom";
import PdfTron from "./components/PdfTron";
import Sidebar from "./components/Sidebar";

function App() {
    return (
        <div id="global" style={{display: 'flex'}}>
            <Sidebar/>
            <PdfTron/>
        </div>
    )
}

render(<App />, document.getElementById("root"));
