import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FiMoon, FiSun } from "react-icons/fi";
import { Outlet, useLocation } from "react-router-dom";
import UseData from "../../Hooks/UseData";
import HeaderTwo from "../../Share/HeaderTwo";
import HomeCard from "../../Share/HomeCard";
import PageTitle from "../../Share/PageTitle";
import AOS from "aos";

const HomeTwo = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleTheme, check, menuItemTwo, NavLink, apiData, layout } = UseData();
  const handle = (e) => {
    handleTheme(e);
  };
  const a = useLocation();
  const {
    showSidebarProfileCard = true,
    sidebarPosition = "left",
    enableStickySidebar = true,
    showHeaderActions = true,
  } = layout || {};
  useEffect(() => {
    AOS.refresh();
  }, [a.pathname]);

  return (
    <>
      <PageTitle title={apiData?.name ? apiData?.name : "Home"}/>
      {/* End pagetitle */}
      <section className="bg-homeBg dark:bg-homeTwoBg-dark min-h-screen  bg-no-repeat bg-center bg-cover bg-fixed  md:pb-16 w-full">
        <div
          className="container   w-full bg-[#F3F6F6] dark:bg-black lg:bg-transparent lg:dark:bg-transparent flex justify-between lg:px-0 lg:pt-[0px]"
          data-aos="fade-down"
          data-aos-delay="100"
        >
          <div className="w-full flex justify-between  px-4">

            <div className="flex items-center">

              {/* mobile menu button */}

              {!menuOpen ? (
                <span
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden   bg-[var(--color-primary)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white dark:text-white text-3xl ml-3 "
                >
                  <AiOutlineMenu />
                </span>
              ) : (
                <span
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:opacity-0 lg:invisible visible opacity-100  bg-[var(--color-primary)] w-[40px] h-[40px] rounded-full flex justify-center items-center text-white text-3xl ml-3 "
                >
                  <AiOutlineClose />
                </span>
              )}
            </div>
          </div>
        </div>

        <nav
          className={`${menuOpen ? "block lg:hidden" : "hidden"}`}
          data-aos="fade-right"
          data-aos-delay="150"
        >
          {/* mobile menu items */}
          <ul
            className={`${
              menuOpen
                ? "block  rounded-b-[20px] shadow-md absolute left-0 top-20 z-[22222222222222] w-full bg-white dark:bg-[#1d1d1d]"
                : "flex my-12 "
            }`}
          >
            {menuItemTwo.map((item) => (
              <li onClick={() => setMenuOpen(false)} key={item.id}>
                <NavLink
                  key={item.id}
                  activeClassName=" text-theme-primary hover-text-theme-primary "
                  inactiveClassName=" dark:text-white hover-text-theme-primary  "
                  className={`${
                    menuOpen ? " pl-4" : " mx-2.5 rounded-md "
                  }    cursor-pointer  transition-colors duration-300 ease-in-out  font-poppins   text-gray-lite font-medium   flex text-xtiny py-2.5 md:px-4 xl:px-5 items-center  ${
                    a.pathname === "/homeTwo" && item.id === "01"
                      ? " text-theme-primary dark:text-theme-primary   "
                      : ""
                  }`}
                  to={item?.link}
                >
                  <span className="mr-2 text-xl">{item?.icon}</span>{" "}
                  {item?.name}
                </NavLink>
              </li>
            ))}

            {/* mobile dark and light mode button */}

            {!check ? (
              <span
                onClick={() => handle("dark")}
                className="bg-white text-black hover:text-white w-[40px] hidden  h-[40px] rounded-full lg:flex justify-center items-center  hover:bg-[var(--color-primary)] transition-all duration-300 ease-in-out cursor-pointer "
              >
                <FiMoon className=" text-3xl " />
              </span>
            ) : (
              <span
                onClick={() => handle("light")}
                className="bg-black w-[40px] h-[40px] hidden  rounded-full lg:flex justify-center items-center   hover:bg-[var(--color-primary)] transition-all duration-300 ease-in-out cursor-pointer "
              >
                <FiSun className="text-white text-3xl" />
              </span>
            )}
          </ul>
        </nav>
        <div className="container grid grid-cols-12 md:gap-10 justify-between lg:mt-[220px] ">
          {sidebarPosition === "left" && showSidebarProfileCard ? (
            <div
              className={`col-span-12 lg:col-span-4 hidden lg:block ${
                enableStickySidebar ? "h-screen sticky top-44" : ""
              }`}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <HomeCard />
            </div>
          ) : null}

          <div
            className={`col-span-12 ${
              showSidebarProfileCard ? "lg:col-span-8" : "lg:col-span-12"
            }`}
            data-aos="fade-up"
            data-aos-delay={showSidebarProfileCard ? "250" : "200"}
          >
            {showHeaderActions && <HeaderTwo />}
            <Outlet />
          </div>

          {sidebarPosition === "right" && showSidebarProfileCard ? (
            <div
              className={`col-span-12 lg:col-span-4 hidden lg:block ${
                enableStickySidebar ? "h-screen sticky top-44" : ""
              }`}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <HomeCard />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};

export default HomeTwo;
