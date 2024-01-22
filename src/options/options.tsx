import React from "react";
import ReactDOM from "react-dom/client";
import './options.css'
import Settings from "./components/Settings";

const node = document.getElementById('root');
if (!node) {
    throw new Error('failed to insert React app!');
}
const root = ReactDOM.createRoot(node);
root.render(
    <React.StrictMode>
        <Settings></Settings>
    </React.StrictMode>
);