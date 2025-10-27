import React from "react";
import Footer from "../../Share/Footer";
import UseData from "../../Hooks/UseData";
import { BsXCircle } from "react-icons/bs";
import Modal from "react-modal";
import PageTitle from "../../Share/PageTitle";
import blog1 from "../../assets/images/blog_images/1.jpeg";
import blogSmall1 from "../../assets/images/blog_images/small/1.jpg";

const CommonBlog = ({ items, count }) => {
  const { local } = UseData();
  const { isOpen, setIsOpen, singleData, handleBlogsData, apiData } =
    UseData();
  const handleModle = (id) => {
    handleBlogsData(id);
  };

  const blogDescriptionSplit = singleData?.description?.split("\n");
  return (
    <>
      <PageTitle title="Blog"></PageTitle>
      {/* End pagetitle */}

      <section className="bg-white  lg:rounded-2xl dark:bg-[#111111]">
        <div data-aos="fade-up">
          <div className="container px-4 sm:px-5 md:px-10 lg:px-[60px]">
            <div className="py-12">
              {/* Blog page title */}
              <h2 className="after-effect after:left-32 mt-12 lg:mt-0" data-aos="fade-right" data-aos-delay="120">
                Blogs
              </h2>
              <div
                className={`${
                  items
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-[40px]"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  mt-[30px]"
                } grid   gap-x-10 gap-y-7  mb-6`}
              >
                {/* Blog items start */}
                {apiData.blogs?.slice(0, count)?.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: `${
                          local === "dark" ? "transparent" : item?.bg
                        }`,
                      }}
                      className="p-5 rounded-lg mb-2 h-full dark:border-[#212425] dark:border-2"
                      data-aos="fade-up"
                      data-aos-delay={`${160 + index * 120}`}
                    >
                      <div className="overflow-hidden rounded-lg">
                        <img
                          onClick={() => handleModle(item?.id)}
                          className="rounded-lg w-full cursor-pointer transition duration-200 ease-in-out transform hover:scale-110"
                          src={item?.img_small ? item?.img_small : blogSmall1 }
                          alt=""
                        />
                      </div>
                      <div className="flex mt-4 text-tiny text-gray-lite dark:text-[#A6A6A6]">
                        <span>{item?.created_at}</span>
                        <span className="pl-6 relative after:absolute after:h-1 after:w-1 after:bg-gray-lite after:rounded-full after:left-2 after:top-[50%] transform after:-translate-y-1/2">
                          {item?.category}
                        </span>
                      </div>
                      <h3
                        onClick={() => setIsOpen(true)}
                        className="text-lg font-medium dark:text-white duration-300 transition cursor-pointer mt-3 pr-4 hover-text-theme-primary"
                      >
                        {item?.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Blog items End */}

            {/* Blog modal start  */}
            <Modal
              isOpen={isOpen}
              onRequestClose={() => setIsOpen(false)}
              className="outline-none flex items-center p-4 md:p-8  rounded-2xl my-8"
            >
              <div className=" w-full  md:w-10/12 flex items-center   lg:w-[850px] bg-white dark:bg-[#323232] mx-auto rounded-xl p-4 md:p-8 absolute left-1/2 top-1/2 transform -translate-x-[50%] -translate-y-[50%] shadow-lg ">
                <div
                  className={`${
                    local === "dark" ? "scrollbarDark" : "scrollbarLight"
                  } overflow-y-scroll max-h-[80vh] `}
                >
                  <div className="pr-3 pb-2">
                    <BsXCircle
                      onClick={() => setIsOpen(false)}
                      className="text-7xl cursor-pointer  absolute right-2 -top-12 md:-right-10 md:-top-6  text-white transition transform hover:rotate-45 duration-300 ease-in-out "
                    />
                    <img
                      className=" w-full md:h-[450px]  object-cover rounded-xl mt-6"
                      src={singleData?.img_big ? singleData?.img_big : blog1}
                      alt=""
                    />
                    <div className="flex mt-4 text-tiny text-black dark:text-white">
                      <span>{singleData?.created_at}</span>
                      <span className="pl-6 relative after:absolute after:h-1 after:w-1 after:bg-gray-lite after:rounded-full after:left-2 after:top-[50%] transform after:-translate-y-1/2">
                        {singleData?.category}
                      </span>
                    </div>
                    <h2 className="dark:text-white sm:text-3xl mt-2 font-medium">
                      {singleData.title}
                    </h2>
                    {blogDescriptionSplit?.map((item, j) => (
                      <p
                        className="dark:text-white font-normal text-[15px] sm:text-sm my-4"
                        key={j}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Modal>
            {/* Blog modal End  */}
          </div>
          {/* End .blog */}

          {/* Common Footer call here */}
          <Footer condition={true} bg={"#F8FBFB"} />
        </div>
      </section>
    </>
  );
};

export default CommonBlog;
