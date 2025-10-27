import React from "react";
import PageTitle from "./PageTitle";

const NotFound = () => {
  return (
    <>
      <PageTitle title="404"></PageTitle>
      <div className="h-screen w-full flex flex-col justify-center items-center  bg-homeBg-dark bg-no-repeat bg-center bg-cover bg-fixed">
        <h1 className="text-7xl leading-none text-white font-extrabold md:text-8xl">
          This cv is not found!
        </h1>
        <p className=" text-medium text-white text-sm capitalize mb-7 mt-6 px-4 text-center">

        </p>

      </div>
    </>
  );
};

export default NotFound;
