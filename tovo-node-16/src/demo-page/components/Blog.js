import React, { useEffect } from "react";

const Blog = ({ blogs }) => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}  }, []);
  //Getting Dynamic Blogs Data
  let DataList = blogs.map((val, i) => {
    return (
      <div className="col-xl-4 col-lg-6 col-12 text-center" key={i}>
        <div>
          <a href={`${val.link}`} target="_blank" rel="noreferrer">
            <span className="pc-bg" style={{ backgroundImage:`url(${process.env.PUBLIC_URL}/assets/images/screen1.png)`}}>
              <span
                style={{ backgroundImage: val.imgUrl }}
                className="img-scroll"
              ></span>
            </span>
          </a>
        </div>
        <h2 className="demo-title">{val.lable}</h2>
      </div>
    );
  });

  return (
    <section className="fadin-blog">
      <div className="container-fluid m-width">
        <div className="row">
          <div className="col-md-12">
            <h2 className="landing-title">Other Pages</h2>
            <div className="border-shape"></div>
          </div>
        </div>
        <div className="row mt-35 pages-space">{DataList}</div>
      </div>
    </section>
  );
};

export default Blog;
