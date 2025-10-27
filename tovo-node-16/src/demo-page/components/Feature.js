import React, { useEffect } from "react";

const Feature = ({ features }) => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);
  let linksMarkup = features.map((link, i) => {
    return (
      <li key={i}>
        <div className="features-img" key={i}>
          <img src={link.imgUrl} key={i} className="img-fluid" alt="html5" />
          <h3 className="features-title">{link.lable}</h3>
        </div>
      </li>
    );
  });

  return (
    <section className="features-bg mb-0">
      <div className="container-fluid m-width">
        <div className="row">
          <div className="col-md-12">
            <div className="margin-top-bottom">
              <h2 className="landing-title">Theme Features</h2>
            </div>
            <div className="border-shape"></div>
            <div className="mt-50">
              <ul className="features m-0 p-0 fadeIn-features">
                {linksMarkup}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;
