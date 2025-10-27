import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ContextProvider from "./Context/ContextProvider";
import AboutTwo from "./Pages/About/AboutTwo";
import BlogTwo from "./Pages/Blog/BlogTwo";
import ContactTwo from "./Pages/Contact/ContactTwo";
import HomeTwo from "./Pages/Home/HomeTwo";
import PortfiloTwo from "./Pages/Portfilo/PortfiloTwo";
import ResumeTwo from "./Pages/Resume/ResumeTwo";
import NotFound from "./Share/NotFound";
import UseData from "./Hooks/UseData";
import RyancvApp from "./themes/ryancv/RyancvApp";
import BackgroundOverlay from "./components/BackgroundOverlay";
import AnimatedLoading from "./components/AnimatedLoading";

// Animated loading component
const LoadingSkeleton = () => {
  return <AnimatedLoading />;
};

const BostamiRouter = () => (
  <Routes>
    <Route path="/" element={<HomeTwo />}>
      <Route index element={<AboutTwo />} />
      <Route path="about" element={<AboutTwo />} />
      <Route path="resume" element={<ResumeTwo />} />
      <Route path="contact" element={<ContactTwo />} />
      <Route path="blogs" element={<BlogTwo />} />
      <Route path="works" element={<PortfiloTwo />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const ThemedApp = () => {
  const { activeThemeId, loading, error } = UseData();

  // Show skeleton loader while configuration is being loaded
  if (loading) {
    return <LoadingSkeleton />;
  }

  // If there's an error loading config, still show the app with default theme
  if (error) {
    console.warn('Failed to load theme configuration, using default theme:', error);
  }

  if (activeThemeId === "ryancv") {
    return <RyancvApp />;
  }

  return <BostamiRouter />;
};

function App() {
  useEffect(() => {
    AOS.init({ duration: 1200 });
    AOS.refresh();
  }, []);
  return (
    <BrowserRouter>
      <ContextProvider>
        <BackgroundOverlay />
        <div className="app-shell">
          <ThemedApp />
        </div>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;
