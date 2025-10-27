import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-scroll";


const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);


  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const HandleScroll = () => {
    if (window.scrollY >= 60) {
      document.getElementById("Navbar")?.classList.add("darkHeader");
    } else document.getElementById("Navbar")?.classList.remove("darkHeader");
  };

  window.addEventListener("scroll", HandleScroll);
  useEffect(() => {
    let timer= setTimeout(function () {
      document.querySelector(".loader-wrapper").style = "display: none";
    }, 2000);
    return () =>{ clearTimeout(timer)}
  }, []);
  return (
    <Navbar
      id="Navbar"
      className="navbar navbar-expand-lg navbar-light theme-nav fixed-top"
    >
      <div id="navbar-main" className="container">
        <NavbarBrand
          className="navbar-brand"
          href={`${process.env.PUBLIC_URL}/`}
        >
          <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" />
        </NavbarBrand>
        <NavbarToggler className="navbar-toggler" onClick={toggle} />
        <Collapse
          id="navbarSupportedContent"
          className="default-nav"
          isOpen={isOpen}
          navbar
        >
          <Nav className="ml-auto" navbar>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="home"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
                active="true"
              >
                home
              </Link>
            </NavItem>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="about"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                about
              </Link>
            </NavItem>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="feature"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                feature
              </Link>
            </NavItem>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="screenshot"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                screenshot
              </Link>
            </NavItem>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="team"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                team
              </Link>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret> blog</DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-list`} onClick={toggle}>Blog list</NavLink>
                </DropdownItem>
                <DropdownItem>
                <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-details`} onClick={toggle}>Blog details</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-leftside`} onClick={toggle}>Blog leftside</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-rightside`} onClick={toggle}>Blog rightside</NavLink>
                </DropdownItem>
                <DropdownItem className="nav-item">
                  <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-left-sidebar`} onClick={toggle}>detail left side</NavLink>
                </DropdownItem>
                <DropdownItem className="nav-item">
                  <NavLink className="nav-link"  href={`${process.env.PUBLIC_URL}/blog-right-sidebar`} onClick={toggle}>detail right side</NavLink>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>  
            <Link
                className="nav-link"
                activeClass="active"
                to="price"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                price
              </Link>
            </NavItem>
            <NavItem>
            <Link
                className="nav-link"
                activeClass="active"
                to="contact"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={toggle}
              >
                contact us
              </Link>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                other page
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/sign-in`} onClick={toggle}>sign in</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/sign-up`} onClick={toggle}>sign up</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/forget-password`} onClick={toggle}>forget password</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/thank-you`} onClick={toggle}>thank you</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/review`} onClick={toggle}>review</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/404`} onClick={toggle}>404</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/FAQ`} onClick={toggle}>FAQ</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/download`} onClick={toggle}>download</NavLink>
                </DropdownItem>
                <DropdownItem>
                  <NavLink className="nav-link" href={`${process.env.PUBLIC_URL}/coming-soon`} onClick={toggle}>coming soon</NavLink>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </div>
    </Navbar>
  );
};

export default Menu;
