import React, { useEffect, useState } from "react";
import Slider from "react-slick";

const Team = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);
  const [bgImg, setBgImg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-img-bg.png)`
  });

  const [teamBg, setTeamBg]= useState({
    backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-bg.png)`
  });
  const color= localStorage.getItem("color");

  useEffect(()=>{
  
    if(color === "color-1")
    {
      setBgImg( {
        backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-img-bg.png)`
      });
     setTeamBg( {
      backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/team-bg.png)`
    });
  }
    else if(color === "color-2")
    {
      setBgImg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/team-img-bg.png)`
    })
    setTeamBg({ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-2/team-bg.png)`
	})
}
    else 
    {
    setBgImg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/team-img-bg.png)`
	})
    setTeamBg({backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/color/color-3/team-bg.png)`
	})
}
  },[color]);

  // Slick slider Option for Team Members
  const options = {
    arrows: false,
    accessibility: false,
    infinite: true,
    dots: true,
    appendDots: (dots) => (
      <span className=".blog-carousel">
        {dots}
      </span>
    ),
    marginRight: 30,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Dynamic Team Members Easy to Update
  let data = [
    {
      name: "mark jkcno",
      designation: "designer",
      photo:`${process.env.PUBLIC_URL}/assets/images/avtar/1.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
    {
      name: "john doe",
      designation: "devloper",
      photo: `${process.env.PUBLIC_URL}/assets/images/avtar/15.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
    {
      name: "johanson let",
      designation: "ux designer",
      photo: `${process.env.PUBLIC_URL}/assets/images/avtar/22.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
    {
      name: "Walo Boni",
      designation: "app devloper",
      photo: `${process.env.PUBLIC_URL}/assets/images/avtar/1.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
    {
      name: "John Shipmen",
      designation: "app designer",
      photo: `${process.env.PUBLIC_URL}/assets/images/avtar/22.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
    {
      name: "Robert Tomkins",
      designation: "ceo",
      photo: `${process.env.PUBLIC_URL}/assets/images/avtar/15.jpg`,
      facebook: "#",
      google: "#",
      twitter: "#",
      instagram: "#",
      rss: "#",
    },
  ];


  // Dynamic Team Members Data Loop
  let DataList = data.map((val, i) => {
    return (
      <div className="team-item d-flex" style={{ marginRight: "30px" }} key={i}>
        <div className="team-block" style={bgImg}>
          <div className="team-box">
            <div className="team-avtar">
              <img src={val.photo} alt="" />
            </div>
            <div className="team-text">
              <h3>{val.name}</h3>
              <h6>{val.designation}</h6>
            </div>
            <div className="overlay">
              <ul className="team-social">
                <li>
                  <a href={val.facebook}>
                    <i className="fa fa-facebook"></i>
                  </a>
                </li>
                <li>
                  <a href={val.google}>
                    <i className="fa fa-google-plus"></i>
                  </a>
                </li>
                <li>
                  <a href={val.twitter}>
                    <i className="fa fa-twitter"></i>
                  </a>
                </li>
                <li>
                  <a href={val.instagram}>
                    <i className="fa fa-instagram"></i>
                  </a>
                </li>
                <li>
                  <a href={val.rss}>
                    <i className="fa fa-rss"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section id="team"  className="team" style={teamBg}>
      <div className="team-decor">
        <div className="team-circle1">
          <img src={`${process.env.PUBLIC_URL}/assets/images/team1.png`} alt="" />
        </div>
        <div className="team-circle2">
          <img src={`${process.env.PUBLIC_URL}/assets/images/team3.png`} alt="" />
        </div>
        <div className="team-circle3">
          <img src={`${process.env.PUBLIC_URL}/assets/images/team.png`} alt="" />
        </div>
      </div>
      <div className="container">
        <div className="row ">
          <div className="col-sm-12">
            <h2 className="title">
              our <span>smart team</span>
            </h2>
          </div>
          <div className="col-sm-12">
            <div>
              <Slider
                {...options}
                className="team-carousel rounded-dots slick-margin"
              >
                {DataList}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
