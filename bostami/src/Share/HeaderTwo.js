import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import UseData from "../Hooks/UseData";

const HeaderTwo = () => {
  const [menuOpen] = useState(false);

  const { menuItemTwo, NavLink, apiData } = UseData();
  const a = useLocation();

  return (
    <header style={{width: apiData?.include_blogs ? "500px" : "400px"}} className={`lg:w-[526] h-[144px] hidden lg:block  p-[30px] ml-auto mb-10  rounded-[16px] bg-white dark:bg-[#111111]`}>
      {/* menu for mobile devices*/}
      <nav className={`${menuOpen ? "block mx-auto" : "hidden lg:block"}`}>
        <ul
          className={`${
            menuOpen ? "block absolute left-0 top-20 w-full" : "flex  "
          }  `}
        >
          {menuItemTwo.map((item) => (
            <NavLink
              key={item.id}
              activeClassName=" text-white  gradient-theme linked"
              inactiveClassName=" transition-all duration-300 ease-in-out dark:hover:text-white dark:bg-[#212425] hover:text-white   gradient-theme-hover  "
              className={`${
                item.id === "03" && !apiData?.include_blogs ? "block lg:hidden" : " "
              }  w-20 h-20 rounded-[10px]  cursor-pointer  transition-all duration-300 ease-in-out    font-poppins  bg-[var(--color-surface-muted)]  font-medium mx-4  text-xtiny text-gray-lite dark:text-[#A6A6A6]    justify-center flex flex-col items-center ${
                a.pathname === "/homeTwo" && item.id === "01"
                  ? " text-white dark:text-white gradient-theme "
                  : " "
              }`}
              to={item?.link}
            >
              <span className=" text-xl mb-1">{item?.icon}</span> {item?.name}
            </NavLink>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default HeaderTwo;
