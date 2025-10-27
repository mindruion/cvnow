import React, { useEffect, useRef } from "react";
import Tilt from "react-tilt";
import HireUs from "../components/HireUs";
import Demo from "./components/Demo";
import Contact from "../components/Contact";
import SignIn from "../components/signIn";

/* === Original Logo, unchanged shape === */
const BrandLogo = ({ className = "" }) => (
  <svg
    className={`cvnow-logo ${className}`}
    viewBox="0 0 320 320"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="CVNow logo"
  >
    <defs>
      <linearGradient id="cvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#18e7d3" />
        <stop offset="100%" stopColor="#0f8a9c" />
      </linearGradient>
      <linearGradient id="cvSoft" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="1%" stopColor="rgba(255,255,255,0.25)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="cvShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="16" stdDeviation="14" floodOpacity="0.18" />
      </filter>
    </defs>

    {/* Outer pin */}
    <path
      d="M160 22c-67 0-121 51.2-121 114.3 0 68.7 83.7 144 111.4 166.7a12 12 0 0 0 19.2 0C197.3 280.3 281 205 281 136.3 281 73.2 227 22 160 22Z"
      fill="url(#cvGrad)"
      filter="url(#cvShadow)"
    />
    {/* Inner cutout */}
    <path
      d="M160 70c-44.7 0-81 33.8-81 75.5S115.3 221 160 221s81-33.8 81-75.5S204.7 70 160 70Z"
      fill="#fff"
      opacity="0.96"
    />

    {/* Person + baseline: slightly smaller and moved up a bit */}
    {/* scale(0.84) = ~16% smaller; translate(0,-8) = nudge upward */}
    <g transform="translate(160 160) translate(0,-8) scale(0.84) translate(-160 -160)">
      {/* Head */}
      <circle cx="160" cy="128" r="32" fill="url(#cvGrad)" />
      {/* Shoulders/body */}
      <path
        d="M106 195c0-22.6 24-41 54-41s54 18.4 54 41v4H106v-4Z"
        fill="url(#cvGrad)"
      />
      {/* Baseline pill */}
      <rect x="128" y="216" width="64" height="16" rx="8" fill="url(#cvGrad)" />
    </g>

    {/* Soft top highlight */}
    <ellipse cx="160" cy="36" rx="92" ry="18" fill="url(#cvSoft)" />
  </svg>
);



const DemoApp = () => {
  const logoRef = useRef(null);

  useEffect(() => {
    // Hide loader
    const t = setTimeout(() => {
      const n = document.querySelector(".loader-wrapper");
      if (n) n.style.display = "none";
    }, 1500);

    // Random floating logo motion (wider range and faster)
    const el = logoRef.current;
    if (el) {
      // Ensure logo is visible and remove any conflicting CSS animations
      el.style.opacity = '1';
      el.style.display = 'block';
      el.style.animation = 'none';
      
      let x = 0, y = 0, vx = 0.8, vy = 0.7;
      let r = 0;
      
      const animate = () => {
        if (el) {
          x += vx;
          y += vy;
          r += 0.4;
          if (x > 20 || x < -20) vx *= -1;
          if (y > 20 || y < -20) vy *= -1;
          el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        }
        requestAnimationFrame(animate);
      };
      
      // Start animation after a small delay to ensure element is ready
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 100);
    }

    return () => clearTimeout(t);
  }, []);

  const demos = [
    { lable: "Theme Light", link: "sign-up", imgUrl: `url(${process.env.PUBLIC_URL}/assets/images/demo/index.png)` },
    { lable: "Theme Dark", link: "sign-up", imgUrl: `url(${process.env.PUBLIC_URL}/assets/images/demo/index-2.png)` },
    { lable: "Theme Light", link: "sign-up", imgUrl: `url(${process.env.PUBLIC_URL}/assets/images/demo/index.png)` },
  ];

  const handleSignUp = () => {
    window.location.href = "/sign-up";
  };

  return (
    <div>
      {/* Landing Section */}
      <section
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/lannd-bg.png)` }}
        className="back-img"
      >
        {/* Mobile Auth Icons - Top Right */}
        <div className="mobile-auth-icons d-block d-lg-none">
          <div className="auth-icon-container">
            <HireUs />
            <SignIn />
          </div>
        </div>

        <div className="landing-circle">
          <div className="landing-circle1 float-a">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner3.png`} alt="" />
          </div>
          <div className="landing-circle2 float-b">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner12.png`} alt="" />
          </div>
          <div className="landing-circle3 float-c">
            <img src={`${process.env.PUBLIC_URL}/assets/images/main-banner1.png`} alt="" />
          </div>
        </div>

          <div className="container-fluid">
              <div className="row align-items-center">
                  <div className="col-12 col-lg-7 col-xl-6 offset-xl-2">
                      <div className="brand-hstack reveal-parent hero-foreground">
                          <div ref={logoRef} className="random-logo-motion reveal-fade-up delay-3">
                              <BrandLogo/>
                          </div>
                          <div className="brand-copy">
                              <h1 className="brand-headline reveal-fade-up delay-1">
                                  Build your <span className="accent explode-shake">next opportunity</span> today.
                  </h1>
                  <p className="brand-sub reveal-fade-up delay-2">
                    Create, customize, and publish your professional CV instantly at{" "}
                    <strong>name.cvnow.me</strong> — effortless, modern, and powerful.
                  </p>
                  <div className="cta-row reveal-fade-up delay-3">
                    <button className="cta-btn explode-shake" onClick={handleSignUp}>
                      Start Free
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5 col-xl-4">
              <div className="d-none d-lg-block">
                <HireUs />
                <SignIn />
                <div className="home-contain fadeIn-mac">
                  <Tilt
                    options={{
                      perspective: 900,
                      speed: 900,
                      max: 10,
                      scale: 1.03,
                    }}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/images/mac.png`}
                      alt="mac"
                      className="img-fluid hero-mac reveal-fade-up delay-2"
                      loading="lazy"
                    />
                  </Tilt>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Demo demos={demos} />
      <Contact />
    </div>
  );
};

export default DemoApp;
