import React, { useEffect, useState } from "react";
import Menu from "./components/Navbar";
import "react-modal-video/scss/modal-video.scss";
import Tilt from "react-tilt";
import About from "./components/About";
import Feature from "./components/Feature";
import ScreenShot from "./components/Screenshot";
import Team from "./components/Team";
import Blog from "./components/Blog";
import Price from "./components/Price";
import Contact from "./components/Contact";
import Subscribe from "./components/Subscribe";
import Footer from "./components/Footer";
import Testimonial from "./components/Testimonial";
import ModalVideo from "react-modal-video";

const HomeTwo = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);
  /*For changing background image by changing the color*/
  const [bgImg, setBgImg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/home2/home2-slider.png)`
  });

  const color= localStorage.getItem("color");

  useEffect(()=>{
   
    if(color === "color-1")
     setBgImg( {
      backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/home2/home2-slider.png)`
    });
    else if(color === "color-2")
    setBgImg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/Homev2.png)`
	})
    else 
    setBgImg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/Homev2.png)`
	})
  },[color]);
  
  /* For Open video modal */
  const [isOpen, setIsOpen] = useState(false);

  document.body.classList.remove("landing-page");
  document.body.classList.remove("home-style");
  document.body.classList.remove("three");
  document.body.classList.add("home-style-two");
  return (
    <div>
      {/* Navbar Component*/}
      <Menu homePage="home-two"/>

      {/* Home Two Section Start */}
      <section id="home" className="home home-two vertical-scrolling" style={bgImg}>
        <div className="container">
          <div className="row">
            <div className="col-md-5 col-sm-12">
              <div className="home-contain">
                <div className="text-white">
                  <div className="contain">
                    <img src={`${process.env.PUBLIC_URL}/assets/images/home2/logo-icon.png`} alt="logo" />
                    <h4>Landing page for</h4>
                    <h1 className="text-white">
                      t<span className="f-bold ">o</span>v
                      <span className="f-bold ">o</span>
                      <span className="f-bold f-color text-white">app</span>
                    </h1>
                    <p className="slide-cap-desc">
                      Enhance your business ideas with Powerful, Responsive,
                      Elegant TOVO Theme.
                    </p>
                    <a href="javascript" onClick={(e)=>{e.preventDefault()}}>
                      <img src={`${process.env.PUBLIC_URL}/assets/images/appstore.png`} alt="appstore" className="store" />
                    </a>
                    <a href="javascript" onClick={(e)=>{e.preventDefault()}}>
                      <img
                        className="ml-10 store"
                        src={`${process.env.PUBLIC_URL}/assets/images/play-store.png`}
                        alt="play-store"
                      />
                    </a>
                  </div>
                  <div className="play-button">
                    <ModalVideo
                      channel="vimeo"
                      isOpen={isOpen}
                      videoId="54298665"
                      height={600}
                      width={800}
                      onClose={() => setIsOpen(false)}
                    />
                    <a href="javascript" onClick={(e)=>{e.preventDefault()}} className="popup-vimeo animated-circle">
                      <img
                        src={`${process.env.PUBLIC_URL}/assets/images/home2/play-button.png`}
                        alt="play-button"
                        onClick={() => setIsOpen(true)}
                        className="img-fluid"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-7">
              <div className="home-right">
                <Tilt
                  options={{ perspective: 110, speed: 400, max: 1.2, scale: 1 }}
                >
                  <img
                    data-tilt
                    data-tilt-perspective="110"
                    data-tilt-speed="400"
                    data-tilt-max="1.2"
                    src={`${process.env.PUBLIC_URL}/assets/images/home2/slider-caption.png`}
                    className="img-fluid"
                    alt="slider-caption"
                  />
                </Tilt>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Home Two Section End */}

      {/* About Component*/}
      <About />

      {/*Feature Component*/}
      <Feature />

      {/*ScreenShot Component*/}
      <ScreenShot />

      {/*Team Component*/}
      <Team />

      {/*Blog Component*/}
      <Blog />

      {/*Price Component*/}
      <Price />

      {/*Testimonial Component*/}
      <Testimonial />

      {/*Contact Component*/}
      <Contact />

      {/*Subscription Component*/}
      <Subscribe />

      {/*Footer Component*/}
      <Footer />
    </div>
  );
};

export default HomeTwo;
