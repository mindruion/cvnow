import React, { useEffect, useState } from "react";
import { Collapse } from "reactstrap";
import Menu from "../components/Navbar";

const FAQ = () => {
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);

  const [collapse, setCollapse] = useState(1);
  const [isOpen, setIsOpen]= useState(true);
  const toggleMenu = (id) =>{
    if(collapse === id)
    {
      setIsOpen(false);
      setCollapse(null);
    }
    else
    {
      setIsOpen(true);
      setCollapse(id);
    }
  }
  return (
    <div>
      {/* Navbar Component*/}
      <Menu />

      {/*blog Section start*/}
      <div className="page-margin">
        {/*breadcrumb start*/}
        <div className="breadcrumb-bg">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-6 col-text-center d-align-center">
                <h2 className="title">
                  <span>FAQ</span>
                </h2>
              </div>
              <div className="col-md-6 col-sm-6 col-text-center">
                <nav aria-label="breadcrumb" className="blog-bradcrumb ">
                  <ol className="breadcrumb bg-transparent mb-0">
                    <li className="breadcrumb-item">
                      <a href={`${process.env.PUBLIC_URL}/`}>Home</a>
                    </li>
                    <li className="breadcrumb-item active">
                      <a href="javascript" onClick={(e)=>{e.preventDefault()}}>FAQ</a>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/*breadcrumb end*/}

        {/*sign in*/}
        <section>
          <div className="innerpage-decor">
            <div className="innerpage-circle1">
              <img src={`${process.env.PUBLIC_URL}/assets/images/Testimonial2.png`} alt="" />
            </div>
            <div className="innerpage-circle2">
              <img src={`${process.env.PUBLIC_URL}/assets/images/Testimonial1.png`} alt="" />
            </div>
          </div>
          {/*faq in*/}
          <div className="faq">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div id="accordion">
                    <div className="card border-theme mb-3 radius-0">
                      <div
                        className="card-header"
                         onClick={()=>toggleMenu(1)}
                      >
                        <a href="javascript" onClick={(e)=>{e.preventDefault()}} className="">
                          Collapsible Group Item #1{" "}
                          <i className="fa fa-angle-down"></i>
                        </a>
                      </div>

                      <Collapse isOpen={collapse === 1? isOpen: false}>
                        <div>
                          <div className="card-body">
                            Anim pariatur cliche reprehenderit, enim eiusmod
                            high life accusamus terry richardson ad squid. 3
                            wolf moon officia aute, non cupidatat skateboard
                            dolor brunch. Food truck quinoa nesciunt laborum
                            eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put
                            a bird on it squid single-origin coffee nulla
                            assumenda shoreditch et. Nihil anim keffiyeh
                            helvetica, craft beer labore wes anderson cred
                            nesciunt sapiente ea proident. Ad vegan excepteur
                            butcher vice lomo. Leggings occaecat craft beer
                            farm-to-table, raw denim aesthetic synth nesciunt
                            you probably haven't heard of them accusamus labore
                            sustainable VHS.
                          </div>
                        </div>
                      </Collapse>
                    </div>

                    <div className="card border-theme mb-3 radius-0">
                      <div
                        className="card-header"
                         onClick={() =>toggleMenu(2)}
                      >
                        <a href="javascript" onClick={(e)=>{e.preventDefault()}} className="">
                          Collapsible Group Item #2{" "}
                          <i className="fa fa-angle-down"></i>
                        </a>
                      </div>
                      <Collapse isOpen={collapse === 2? isOpen :false}>
                        <div>
                          <div className="card-body">
                            Anim pariatur cliche reprehenderit, enim eiusmod
                            high life accusamus terry richardson ad squid. 3
                            wolf moon officia aute, non cupidatat skateboard
                            dolor brunch. Food truck quinoa nesciunt laborum
                            eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put
                            a bird on it squid single-origin coffee nulla
                            assumenda shoreditch et. Nihil anim keffiyeh
                            helvetica, craft beer labore wes anderson cred
                            nesciunt sapiente ea proident. Ad vegan excepteur
                            butcher vice lomo. Leggings occaecat craft beer
                            farm-to-table, raw denim aesthetic synth nesciunt
                            you probably haven't heard of them accusamus labore
                            sustainable VHS.
                          </div>
                        </div>
                      </Collapse>
                    </div>
                    <div className="card border-theme mb-3 radius-0">
                      <div
                        className="card-header"
                         onClick={() =>toggleMenu(3)}
                      >
                        <a href="javascript" onClick={(e)=>{e.preventDefault()}} className="">
                          Collapsible Group Item #3{" "}
                          <i className="fa fa-angle-down"></i>
                        </a>
                      </div>
                      <Collapse isOpen={collapse === 3? isOpen:false}>
                        <div>
                          <div className="card-body">
                            Anim pariatur cliche reprehenderit, enim eiusmod
                            high life accusamus terry richardson ad squid. 3
                            wolf moon officia aute, non cupidatat skateboard
                            dolor brunch. Food truck quinoa nesciunt laborum
                            eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put
                            a bird on it squid single-origin coffee nulla
                            assumenda shoreditch et. Nihil anim keffiyeh
                            helvetica, craft beer labore wes anderson cred
                            nesciunt sapiente ea proident. Ad vegan excepteur
                            butcher vice lomo. Leggings occaecat craft beer
                            farm-to-table, raw denim aesthetic synth nesciunt
                            you probably haven't heard of them accusamus labore
                            sustainable VHS.
                          </div>
                        </div>
                      </Collapse>
                    </div>
                    <div className="card border-theme radius-0">
                      <div
                        className="card-header"
                         onClick={() => toggleMenu(4)}
                      >
                        <a href="javascript" onClick={(e)=>{e.preventDefault()}} className="">
                          Collapsible Group Item #4{" "}
                          <i className="fa fa-angle-down"></i>
                        </a>
                      </div>
                      <Collapse isOpen={collapse === 4? isOpen:false}>
                        <div>
                          <div className="card-body">
                            Anim pariatur cliche reprehenderit, enim eiusmod
                            high life accusamus terry richardson ad squid. 3
                            wolf moon officia aute, non cupidatat skateboard
                            dolor brunch. Food truck quinoa nesciunt laborum
                            eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put
                            a bird on it squid single-origin coffee nulla
                            assumenda shoreditch et. Nihil anim keffiyeh
                            helvetica, craft beer labore wes anderson cred
                            nesciunt sapiente ea proident. Ad vegan excepteur
                            butcher vice lomo. Leggings occaecat craft beer
                            farm-to-table, raw denim aesthetic synth nesciunt
                            you probably haven't heard of them accusamus labore
                            sustainable VHS.
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*faq up*/}
        </section>
        {/*sign up*/}

        {/*Footer Section start*/}
        <div className="bg-light">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="copyright-section">
                  <p>2018- 19 Copyright &copy; powered by Pixel Strap</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Footer Section End*/}
      </div>
      {/*blog Section start*/}
    </div>
  );
};

export default FAQ;
