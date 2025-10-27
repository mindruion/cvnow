import React, { useEffect, useState } from "react";
import Menu from "./components/Navbar";
import Tilt from "react-tilt";
import About from "./components/About";
import Feature from "./components/Feature";
import ScreenShot from "./components/Screenshot";
import Team from "./components/Team";
import Blog from "./components/Blog";
import Price from "./components/Price";
import Testimonial from "./components/Testimonial";
import Contact from "./components/Contact";
import Subscribe from "./components/Subscribe";
import Footer from "./components/Footer";

const HomeOne = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);

  /*For changing background image by changing the color*/
  const [bgImg, setBgImg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/1.png)`
  });
  const color= localStorage.getItem("color");

  useEffect(()=>{
    if(color === "color-1")
     setBgImg( {
      backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/1.png)`
    });
    else if(color === "color-2")
    setBgImg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/1.png)`
	})
    else 
    setBgImg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/1.png)`
	})
  },[color]);
  
  document.body.classList.remove("landing-page");
  document.body.classList.remove("home-style");
  document.body.classList.remove("three");
  document.body.classList.remove("home-style-two");
  return (
    <div>
      {/* Navbar Component*/}
      <Menu homePage="home-one"/>
      {/* Home One Section Start */}
      <section id="home" className="home" style={bgImg}>
        <div className="home-decor">
          <div className="home-circle1">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner3.png`} alt="" />
          </div>
          <div className="home-circle2">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner12.png`} alt="" />
          </div>
          <div className="home-circle3">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner1.png`} alt="" />
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <div className="home-contain">
                <div>
                  <img src={`${process.env.PUBLIC_URL}/assets/images/logoimage.png`} alt="caption-img" className="caption-img" />
                  <h4>Landing page for</h4>
                  <h1>
                    t<span className="f-bold">o</span>v
                    <span className="f-bold">o</span>
                    <span className="f-bold f-color">app</span>
                  </h1>
                  <p>
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
              </div>
            </div>
            <div className="col-sm-6 offset-md-1">
              <div className="home-right">
                <Tilt
                  options={{
                    perspective: 110,
                    speed: 400,
                    max: 1.2,
                    scale: 1,
                  }}
                >
                  <img src={`${process.env.PUBLIC_URL}/assets/images/mobile.png`} className="img-fluid" alt="mobile" />
                </Tilt>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Home One Section End */}
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

export default HomeOne;
