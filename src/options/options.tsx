import React from "react";
import ReactDOM from "react-dom/client";

const node = document.getElementById('root');
if (!node) {
    throw new Error('failed to insert React app!');
}
const root = ReactDOM.createRoot(node);
root.render(
    <React.StrictMode>
    </React.StrictMode>
);