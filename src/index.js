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
import MainComponent from "./components/MainComponent";
import React from "react";
import { render } from "react-dom";

function App() {
    return (
        <MainComponent/>
    )
}

render(<App />, document.getElementById("root"));