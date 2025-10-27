import React from "react";
import icon4 from "../../assets/images/icons/icon-5.svg";

const AboutCard = ({ item, local }) => {
  return (
    <div
      style={{ background: `${local === "dark" ? "transparent" : item?.bg}` }}
      className="about-box dark:bg-transparent"
    >
      <img className="w-10 h-10 object-contain  block" src={icon4} alt="" />

      <div className="space-y-2">
        <h3 className="dark:text-white text-2xl font-semibold">
          {item?.title}
        </h3>
        <p className=" leading-8 text-gray-lite dark:text-[#A6A6A6]">
          {item?.des}
        </p>
      </div>
    </div>
  );
};
export default AboutCard;
