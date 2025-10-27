import React, { useEffect, useState } from "react";
import Slider from "react-slick";

const Blog = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);
  const [bgImg, setBgImg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-img-bg.png)`
  });

  const color= localStorage.getItem("color");
  
  useEffect(()=>{
   
    if(color === "color-1")
     setBgImg( {
      backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-img-bg.png)`
    });
    else if(color === "color-2")
    setBgImg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/team-img-bg.png)`})
    else 
    setBgImg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/team-img-bg.png)`})
  },[color]);

  //Slick slider Options
  const options = {
    arrows: false,
    accessibility: false,
    infinite: true,
    dots: true,
    dotClass: ".blog-carousel",
    margin: 30,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          infinite: true,
        },
      }
    ],
  };

  // Dynamic Blog Data Easy to Update
  let data = [
    {
      title:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.",
      link: "blog-details",
      date: "28 December 2017",
      photo: `${process.env.PUBLIC_URL}/assets/images/blog/9.jpg`,
      username: "Wala Boni",
      hits: "10",
      comments: "15",
    },
    {
      title: "Lorem Ipsum has been the industry standard dummy text.",
      link: "blog-details",
      date: "15 jun 2016",
      photo: `${process.env.PUBLIC_URL}/assets/images/blog/6.jpg`,
      username: "johanson let",
      hits: "15",
      comments: "30",
    },
    {
      title:
        "All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary",
      link: "blog-details",
      date: "10 February 2012",
      photo: `${process.env.PUBLIC_URL}/assets/images/blog/7.jpg`,
      username: "John Shipmen",
      hits: "6",
      comments: "8",
    },
    {
      title:
        "The first line of Lorem Ipsum Lorem ipsum dolor sit amet comes from a line in section 1.10.32.",
      link: "blog-details",
      date: "12 march 2015",
      photo: `${process.env.PUBLIC_URL}/assets/images/blog/8.jpg`,
      username: "Mark jkcno",
      hits: "10",
      comments: "50",
    },
  ];

  // Dynamic Blog Data Loop
  let DataList = data.map((val, i) => {
    return (
      <div className="blog-item" key={i}>
        <div className="blog-block" style={bgImg} >
          <div className="blog-box">
            <div className="overflow-hidden">
              <a href={val.link}>
                <img src={val.photo} className="img-fluid" alt="" />
              </a>
            </div>
          </div>
        </div>
        <div className="blog-text">
          <h6>{val.date}</h6>
          <a href={val.link}>
            <h3>{val.title}</h3>
          </a>
          <h5>
            posted by {val.username}, {val.hits} hits, {val.comments} comment
          </h5>
        </div>
      </div>
    );
  });

  return (
    <section id="blog" className="blog">
      <div className="about-decor">
        <div className="about-circle1">
          <img src={`${process.env.PUBLIC_URL}/assets/images/team1.png`} className="img-fluid" alt="team1" />
        </div>
        <div className="about-circle2">
          <img src={`${process.env.PUBLIC_URL}/assets/images//main-banner1.png`} className="img-fluid" alt="main-banner1" />
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="title">
              latest <span>blog</span>
            </h2>
          </div>
          <div className="col-sm-12">
            <Slider
              className="blog-carousel owl-carousel owl-theme rounded-dots slick-margin"
              {...options}
            >
              {DataList}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
