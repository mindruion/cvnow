import React, { useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { Link, Outlet, useLocation } from "react-router-dom";
import UseData from "../Hooks/UseData";
import logo from "../assets/images/logo/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleTheme, check, menuItem, NavLink, layout } = UseData();
  const handle = (e) => {
    handleTheme(e);
  };
  const a = useLocation();
  const { showHeaderActions = true } = layout || {};

  return (
    <div className="z-50 ">
      <div className="container">
        {/* Header menu start  */}
        <header className="flex justify-between items-center fixed top-0 left-0 w-full lg:static z-[1111111111]  ">
          <div className=" flex justify-between w-full px-4 lg:px-0 bg-[#F3F6F6] lg:bg-transparent dark:bg-black ">
            <div className="flex justify-between w-full items-center space-x-4 lg:my-8 my-5 ">
              <Link className="text-5xl font-semibold" to="/">
                {/* website logo  */}

                <img className="h-[26px] lg:h-[32px]" src={logo} alt="" />
              </Link>
              <div className="flex items-center">
                {/* dark mode icon */}

                {showHeaderActions && (!check ? (
                  <span
                    onClick={() => handle("dark")}
                    className="bg-white w-[40px]  opacity-100 visible flex lg:opacity-0 lg:hidden  h-[40px]  rounded-full  justify-center items-center hover:bg-[var(--color-primary)] text-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer  ml-4"
                  >
                    <FiMoon className="  text-3xl" />
                  </span>
                ) : (
                  <span
                    onClick={() => handle("light")}
                    className="bg-[#4D4D4D] w-[40px] h-[40px] rounded-full  opacity-100 visible flex lg:opacity-0 lg:hidden justify-center items-center hover:bg-[var(--color-primary)] transition-all duration-300 ease-in-out cursor-pointer  ml-4"
                  >
                    <FiSun className="text-white text-3xl" />
                  </span>
                ))}

                {/* mobile menu icon */}

                {!menuOpen ? (
                  <span
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="lg:opacity-0 lg:invisible visible opacity-100  bg-[var(--color-primary)] w-[40px] h-[40px] rounded-full flex justify-center cursor-pointer items-center text-white dark:text-white text-3xl ml-3 "
                  >
                    <AiOutlineMenu />
                  </span>
                ) : (
                  <span
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="lg:opacity-0 cursor-pointer lg:invisible visible opacity-100  bg-[var(--color-primary)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-3xl ml-3 "
                  >
                    <AiOutlineClose />
                  </span>
                )}
              </div>
            </div>
          </div>
          <nav
            className={`${
              menuOpen ? "block  dark:bg-black   " : "hidden lg:block"
            }`}
          >
            {/* Menu items start  */}

            <ul
              className={`${
                menuOpen
                  ? "block lg:hidden  absolute left-0 rounded-b-[20px] top-20 z-[22222222222222] w-full bg-white dark:bg-[#1D1D1D] drop-shadow-lg py-4 "
                  : "flex my-12 "
              }`}
            >
              {menuItem.map((item) => (
                <li
                  onClick={() => setMenuOpen(false)}
                  key={item.id}
                  className=" "
                >
                  <NavLink
                    key={item.id}
                    activeClassName={`${
                      menuOpen
                        ? " text-theme-primary dark:text-theme-primary "
                        : " text-white  dark:text-white gradient-theme "
                    }`}
                    inactiveClassName={`${
                      menuOpen
                        ? " hover-text-theme-primary"
                        : "  dark:hover:text-white dark:bg-[#212425] hover:text-white gradient-theme-hover dark:text-[#A6A6A6] "
                    }  transition-all duration-300 ease-in-out `}
                    className={`${
                      a.pathname === "/home" && item.id === "01"
                        ? "text-white linked dark:text-white gradient-theme "
                        : " "
                    } ${
                      menuOpen
                        ? " pl-4 dark:text-white hover-text-theme-primary  "
                        : " rounded-md  cursor-pointer    font-poppins  bg-white text-gray-lite  "
                    }  font-poppins font-medium mx-2.5 flex text-xtiny py-2.5 md:px-4 xl:px-5 items-center  transition-all duration-300 ease-in-out `}
                    to={item?.link}
                  >
                    <span className="mr-2 text-xl">{item?.icon}</span>{" "}
                    {item?.name}
                  </NavLink>
                </li>
              ))}

              {/* dark mode */}

              {showHeaderActions && (!check ? (
                <span
                  onClick={() => handle("dark")}
                  className="bg-white w-[40px] hover:text-white hidden  h-[40px] rounded-full lg:flex justify-center items-center text-black hover:bg-[var(--color-primary)] transition-all duration-300 ease-in-out cursor-pointer ml-2 "
                >
                  <FiMoon className="  text-3xl" />
                </span>
              ) : (
                <span
                  onClick={() => handle("light")}
                  className="bg-[#4D4D4D] w-[40px] h-[40px] hidden  rounded-full lg:flex justify-center items-center   hover:bg-[var(--color-primary)] transition-all duration-300 ease-in-out cursor-pointer ml-2"
                >
                  <FiSun className="text-white text-3xl" />
                </span>
              ))}
            </ul>

            {/* Menu items end  */}
          </nav>
        </header>

        {/* Header menu End  */}

        {<Outlet />}
      </div>
    </div>
  );
};

export default Header;
