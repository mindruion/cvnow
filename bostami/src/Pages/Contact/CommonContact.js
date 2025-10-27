import React, { useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchTenantJson } from "../../config/api.js";

const CommonContact = ({ condition }) => {
  const form = useRef();

  // use Email js for recive message

  const sendEmail = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.current[0].value,
      email: form.current[1].value,
      message: form.current[2].value,
    };

    try {
      await fetchTenantJson(
        (tenant) => (tenant ? `/api/contact/${tenant}` : "/api/contact"),
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        { withToken: true }
      );

      toast.success("Message Sent successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      form.current?.reset();
    } catch (error) {
      console.error("Failed to submit contact form", error);
      toast.error("Ops Message not Sent!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div
      data-aos="fade"
      className={`${
        condition
          ? "mx-4 md:mx-[60px] p-4 md:p-16 dark:border-[#212425] dark:border-2"
          : "  dark:border-[#212425] dark:border-2 mb-16  md:p-[48px]  p-4  "
      } bg-color-810 rounded-xl dark:bg-[#111111] mb-[30px] md:mb-[60px]`}
    >
      <h3 className="text-4xl  " data-aos="fade-up" data-aos-delay="160">
        <span className="text-gray-lite dark:text-[#A6A6A6] ">
          I'm always open to discussing product
        </span>
        <br />
        <span className="font-semibold dark:text-white">
          design work or partnerships.
        </span>
      </h3>

      {/* Form Start */}
      <form id="myForm" ref={form} onSubmit={sendEmail}>
        <div className="relative  z-0 w-full mt-[40px] mb-8 group" data-aos="fade-up" data-aos-delay="200">
          <input
            type="text"
            name="name"
            className="block autofill:bg-transparent py-2.5 px-0 w-full text-sm text-gray-lite bg-transparent border-0 border-b-[2px] border-[var(--color-border)] appearance-none dark:text-white dark:border-[#333333] dark:focus:border-[var(--color-primary)] focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="name"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-color-910 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[var(--color-primary)] peer-focus:dark:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8"
          >
            Name *
          </label>
        </div>
        <div className="relative z-0 w-full mb-8 group" data-aos="fade-up" data-aos-delay="240">
          <input
            type="email"
            name="user_email"
            className="block autofill:text-red-900 needed py-2.5 px-0 w-full text-sm text-gray-lite bg-transparent border-0 border-b-[2px] border-[var(--color-border)] appearance-none dark:text-white dark:border-[#333333] dark:focus:border-[var(--color-primary)] focus:outline-none focus:ring-0 focus:border-[var(--color-variant-3)] peer"
            placeholder=" "
            id="user_email"
            required
          />
          <label
            htmlFor="user_email"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-color-910 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[var(--color-variant-3)] peer-focus:dark:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8"
          >
            Email *
          </label>
        </div>
        <div className="relative z-0 w-full mb-8 group" data-aos="fade-up" data-aos-delay="280">
          <input
            type="text"
            name="message"
            className="block autofill:bg-yellow-200 py-2.5 px-0 w-full text-sm text-gray-lite bg-transparent border-0 border-b-[2px] border-[var(--color-border)] appearance-none dark:text-white dark:border-[#333333] dark:focus:border-[var(--color-primary)] focus:outline-none focus:ring-0 focus:border-[var(--color-variant-4)] peer"
            placeholder=" "
            id="message"
            required
          />
          <label
            htmlFor="message"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-color-910 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[var(--color-variant-4)] peer-focus:dark:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8"
          >
            Message *
          </label>
        </div>

        <div className="transition-all duration-300 ease-in-out inline-block gradient-theme gradient-theme-hover rounded-lg mt-3" data-aos="zoom-in" data-aos-delay="320">
          <input
            type="submit"
            className=" transition ease-in duration-200 font-semibold cursor-pointer border-color-910   hover:border-transparent px-6  py-2 rounded-lg border-[2px]  hover:text-white   dark:text-white "
            value="Submit"
          />
        </div>

        {/* ToastContainer use here */}

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {/* Same as */}
        <ToastContainer />
      </form>

      {/* Form Start */}
    </div>
  );
};

export default CommonContact;
