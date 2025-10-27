import React from "react";
import UseData from "../../Hooks/UseData";

const ResumeCard = ({ items, title, Icon }) => {
  const { local } = UseData();

  return (
    <>
      <div>
        <div className="flex items-center space-x-2 mb-4 ">
          <Icon className="text-6xl text-[#F95054]" />
          <h4 className="text-5xl dark:text-white font-medium">{title}</h4>
        </div>
        {items?.map((item, i) => (
            <div
                key={item?.title}
                style={{
                  background: `${local === "dark" ? "transparent" : item?.bg}`,
                }}
                className="py-4 pl-5 pr-3 space-y-2 mb-6 rounded-lg  dark:border-[#212425] dark:border-2"
            >
          <span className="text-tiny text-gray-lite dark:text-[#b7b7b7]">
            {item?.date}
          </span>
              <h3 className="text-xl dark:text-white">{item?.title}</h3>
              <p className="dark:text-[#b7b7b7]">{item?.place}</p>
            </div>
        ))}
      </div>
    </>
  );
};

export default ResumeCard;
