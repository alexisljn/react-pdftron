// const http = require('http');
//
// const port = 3000;
//
// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World');
// });
//
// server.listen(port, () => {
//     console.log(`Server running/`);
// });


// import "./style.scss"
import "core-js";
// import 'whatwg-fetch';

import React from "react";
import { render } from "react-dom";
import PdfTron from "./components/PdfTron";

function App() {
    return (
        <div id="global">
        <PdfTron/>
        </div>
    )
}

render(<App />, document.getElementById("root"));
