import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
const About = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);

  const [bgImg, setBgImg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/about-bg.png)`
  });

  const color= localStorage.getItem("color");
  useEffect(()=>{
  
    if(color === "color-1")
     setBgImg( {
      backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/about-bg.png)`
    });
    else if(color === "color-2")
    setBgImg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/about-bg.png)`
  })
    else 
    setBgImg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/about-bg.png)`
  })
  },[color]);
 
  return (
    <section id="about" className="about" style={bgImg}>
      <div className="about-decor">
        <div className="about-circle1">
          <img src={`${process.env.PUBLIC_URL}/assets/images/team1.png`} alt="team1" />
        </div>
        <div className="about-circle2">
          <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner1.png`} alt="banner1" />
        </div>
      </div>
      <div className="container">
        <div className="row ">
          <div className="col-md-5">
            <div className="about-contain">
              <div>
                <h2 className="title">
                  about the <span>tovo app</span>
                </h2>
                <p className="caption-about">
                  TOVO is dynamic, high-performance and easy to use landing page
                  theme. The theme is developed focusing on the attractive
                  designs and easy customizable features.
                </p>
                <div className="row sm-mb">
                  <div className="col-6">
                    <ul className="about-style">
                      <li className="abt-hover">
                        <div className="about-icon">
                          <div className="icon-hover">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/icon1.png`} alt="easy-to-customized" />
                          </div>
                        </div>
                        <div className="about-text">
                          <h3>Easy customize</h3>
                        </div>
                      </li>
                      <li className="abt-hover">
                        <div className="about-icon">
                          <div className="icon-hover">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/icon3.png`} alt="easy-to-use" />
                          </div>
                        </div>
                        <div className="about-text">
                          <h3>easy to use</h3>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="col-6">
                    <ul className="about-style">
                      <li className="abt-hover">
                        <div className="about-icon">
                          <div className="icon-hover">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/icon2.png`} alt="Awasome-Design" />
                          </div>
                        </div>
                        <div className="about-text">
                          <h3>Nice Design</h3>
                        </div>
                      </li>
                      <li className="abt-hover">
                        <div className="about-icon">
                          <div className="icon-hover">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/icon4.png`} alt="SEO-Friendly" />
                          </div>
                        </div>
                        <div className="about-text">
                          <h3>SEO Friendly</h3>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="top-margin">
                  <button
                    type="button"
                    className="btn btn-custom theme-color theme-color"
                  >
                    view more
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-7 d-medium-none">
            <div className="about-right">
              <div className="about-phone">
                <img src={`${process.env.PUBLIC_URL}/assets/images/aboutus.png`} className="img-fluid" alt="aboutus" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
