import React from "react";
import Loader from './../../../../public/assets/loader-01.svg'

function Spinner() {
    return (
        <div className="animate-spin">
            <Loader ></Loader>
        </div>
    );
}
export default Spinner;