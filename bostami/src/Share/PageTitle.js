import React from "react";
import {Helmet} from "react-helmet-async";
import UseData from "../Hooks/UseData";

const PageTitle = ({title}) => {
    const {apiData} = UseData();

    return (
        <Helmet>
            <title>{apiData?.name ? apiData?.name : ""} {title} - My cv</title>
            <meta name="description" content={`${apiData?.name ? apiData?.name : ""} ${title} - My cv`}/>

        </Helmet>
    );
};

export default PageTitle;
