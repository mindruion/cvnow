import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaLinkedinIn, FaFacebookF, FaEnvelopeOpenText } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineFileDownload } from "react-icons/md";
import UseData from "../../Hooks/UseData";
import { getDocumentTemplate } from "../../pdf/document";
import CommonContact from "../../Pages/Contact/CommonContact";
import "./ryancv.css";

const resolveAnimation = (preset, fallback) => {
  if (!preset) {
    return fallback;
  }
  const { initial, animate, transition } = preset;
  return {
    initial: initial ?? fallback.initial,
    animate: animate ?? fallback.animate,
    transition: transition ?? fallback.transition,
  };
};

const RyancvApp = () => {
  const {
    apiData,
    workItems,
    blogsData,
    experienceArray,
    lineArray,
    contactArray,
    features,
    theme,
  } = UseData();

  const DocumentTemplate = useMemo(
    () => getDocumentTemplate(features?.cvTemplate),
    [features?.cvTemplate]
  );

  const cardAnimation = resolveAnimation(theme.animations?.card, {
    initial: { opacity: 0, translateY: 26 },
    animate: { opacity: 1, translateY: 0 },
    transition: { duration: 0.45, ease: "easeOut" },
  });

  const sectionAnimation = resolveAnimation(theme.animations?.section, {
    initial: { opacity: 0, translateY: 48 },
    animate: { opacity: 1, translateY: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  });

  const experiences =
    (apiData?.experiences?.length ? apiData.experiences : experienceArray) || [];
  const skills =
    (apiData?.skills?.length ? apiData.skills : lineArray) || [];
  const posts = blogsData || [];
  const works = workItems || [];
  const contacts = contactArray || [];

  const socials = [
    {
      icon: <FaFacebookF />,
      href: apiData?.facebook,
      label: "Facebook",
    },
    {
      icon: <FaLinkedinIn />,
      href: apiData?.linkedin,
      label: "LinkedIn",
    },
  ].filter((item) => item.href);

  return (
    <div className="ryancv-app">
      <div className="ryancv-gradient-blur" />

      <motion.header
        className="ryancv-hero container mx-auto px-6 md:px-12 lg:px-20"
        initial={sectionAnimation.initial}
        animate={sectionAnimation.animate}
        transition={sectionAnimation.transition}
      >
        <div className="ryancv-hero-content">
          <p className="ryancv-greeting">Hello, I'm</p>
          <h1 className="ryancv-title">{apiData?.name || "Ryan Bostami"}</h1>
          <p className="ryancv-subtitle">
            {apiData?.profession || "Product Designer & Frontend Developer"}
          </p>
          <p className="ryancv-description">
            {apiData?.about?.short_description ||
              "I build immersive digital experiences with motion-first design thinking and meticulous attention to detail."}
          </p>

          <div className="ryancv-hero-actions">
            <PDFDownloadLink
              document={<DocumentTemplate data={apiData} theme={theme} />}
              fileName={`${apiData?.name || "ryancv"}-${apiData?.profession || "cv"}.pdf`}
            >
              {({ loading: docLoading }) => (
                <button className="ryancv-primary-btn">
                  <MdOutlineFileDownload className="ryancv-btn-icon" />
                  {docLoading ? "Preparing..." : "Download CV"}
                </button>
              )}
            </PDFDownloadLink>
            <div className="ryancv-social">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="ryancv-social-btn"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="ryancv-meta">
            {apiData?.email && (
              <span className="ryancv-meta-item">
                <FaEnvelopeOpenText />
                {apiData.email}
              </span>
            )}
            {apiData?.location && (
              <span className="ryancv-meta-item">
                <HiOutlineLocationMarker />
                {apiData.location}
              </span>
            )}
          </div>
        </div>

        <div className="ryancv-portrait">
          <div className="ryancv-portrait-gradient" />
          <img
            src={apiData?.avatar}
            alt={apiData?.name}
            className="ryancv-portrait-img"
          />
        </div>
      </motion.header>

      <main className="ryancv-main container mx-auto px-6 md:px-12 lg:px-20">
        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">About</h2>
          <div className="ryancv-section-content">
            <p className="ryancv-body">
              {apiData?.about?.description ||
                "Curious creator focused on blending aesthetic polish with human-centric interaction. I collaborate with cross-functional teams to deliver memorable products."}
            </p>
            <div className="ryancv-stats">
              <div className="ryancv-stat">
                <span className="ryancv-stat-value">
                  {apiData?.completed_projects || 120}
                </span>
                <span className="ryancv-stat-label">Projects</span>
              </div>
              <div className="ryancv-stat">
                <span className="ryancv-stat-value">
                  {apiData?.happy_clients || 65}
                </span>
                <span className="ryancv-stat-label">Clients</span>
              </div>
              <div className="ryancv-stat">
                <span className="ryancv-stat-value">
                  {apiData?.years_experience || 8}+
                </span>
                <span className="ryancv-stat-label">Years</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">Experience</h2>
          <div className="ryancv-timeline">
            {experiences.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id || index}
                className="ryancv-timeline-card"
                initial={cardAnimation.initial}
                whileInView={cardAnimation.animate}
                viewport={{ once: true, amount: 0.4 }}
                transition={cardAnimation.transition}
              >
                <div className="ryancv-timeline-heading">
                  <h3>{item.title}</h3>
                  <span>{item.des || item.company}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">Skills</h2>
          <div className="ryancv-skills-grid">
            {skills.map((item, index) => (
              <motion.div
                key={item.id || index}
                className="ryancv-skill"
                initial={cardAnimation.initial}
                whileInView={cardAnimation.animate}
                viewport={{ once: true, amount: 0.4 }}
                transition={cardAnimation.transition}
              >
                <span className="ryancv-skill-name">{item.name || item.title}</span>
                <div className="ryancv-progress">
                  <div
                    className="ryancv-progress-bar"
                    style={{ width: `${item.number || item.value || 75}%` }}
                  />
                  <span className="ryancv-progress-value">
                    {item.number || item.value || 75}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">Selected Works</h2>
          <div className="ryancv-grid">
            {works.slice(0, 6).map((item, index) => (
              <motion.article
                key={item.id || index}
                className="ryancv-work-card"
                initial={cardAnimation.initial}
                whileInView={cardAnimation.animate}
                viewport={{ once: true, amount: 0.4 }}
                transition={cardAnimation.transition}
              >
                <img
                  src={item.imgSmall || item.img}
                  alt={item.title}
                  className="ryancv-work-image"
                />
                <div className="ryancv-work-overlay">
                  <span className="ryancv-chip">{item.tag}</span>
                  <h3>{item.title}</h3>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.linkText || "View Project"}
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">Latest Insights</h2>
          <div className="ryancv-grid">
            {posts.slice(0, 3).map((item, index) => (
              <motion.article
                key={item.id || index}
                className="ryancv-blog-card"
                initial={cardAnimation.initial}
                whileInView={cardAnimation.animate}
                viewport={{ once: true, amount: 0.4 }}
                transition={cardAnimation.transition}
              >
                <img
                  src={item.imgSmall || item.img}
                  alt={item.title}
                  className="ryancv-blog-image"
                />
                <div className="ryancv-blog-body">
                  <span className="ryancv-chip">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description?.slice(0, 120)}...</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ryancv-section"
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.animate}
          viewport={{ once: true, amount: 0.3 }}
          transition={sectionAnimation.transition}
        >
          <h2 className="ryancv-section-title">Let’s Build Something</h2>
          <div className="ryancv-contact-grid">
            <div className="ryancv-contact-info">
              {contacts.map((item, index) => (
                <div key={item.id || index} className="ryancv-contact-card">
                  <img src={item.icon} alt={item.title} />
                  <div>
                    <p>{item.title}</p>
                    <span>{item.item1}</span>
                    {item.item2 && <span>{item.item2}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="ryancv-contact-form">
              <CommonContact />
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default RyancvApp;
