import React from "react";
import { Loader } from 'semantic-ui-react'


// This is a function which renders the friends in the friends list
export function Loading(props) {
    return (<>
        <div className={props.active==true ? "loadingShow": "loadingHidden"} >
            <Loader active>{"Please wait..."}</Loader>
        </div>
    </>)
}