import React, { useEffect } from "react";
import "./App.css";
import DemoApp from "./demo-page";
import PageNotFound from "./Pages/404";
import { Route, Switch, Redirect, useHistory, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyResumePage from "./pages/MyResumePage";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingResumePage from "./pages/OnboardingResumePage";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, initializing } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (initializing) {
          return null;
        }

        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/auth/signin",
                state: { from: props.location },
              }}
            />
          );
        }

        return <Component {...props} />;
      }}
    />
  );
};

function App() {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const loader = document.querySelector(".loader-wrapper");
    const timer = setTimeout(() => {
      if (loader) {
        loader.style.display = "none";
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("color", "color-1");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const allowedPrefixes = ["/my-resume", "/onboarding/resume"];
    const isAllowed = allowedPrefixes.some((prefix) =>
      location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
    );
    if (!isAllowed) {
      history.replace("/my-resume");
    }
  }, [isAuthenticated, location.pathname, history]);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={DemoApp} />
        <Route exact path="/auth/signin" component={LoginPage} />
        <Route exact path="/auth/signup" component={SignupPage} />
        <Route exact path="/auth/verify-email" component={VerifyEmailPage} />
        <Route
          exact
          path="/auth/forgot-password"
          component={ForgotPasswordPage}
        />
        <Route
          exact
          path="/auth/reset-password"
          component={ResetPasswordPage}
        />
        <Route exact path="/sign-in">
          <Redirect to="/auth/signin" />
        </Route>
        <Route exact path="/sign-up">
          <Redirect to="/auth/signup" />
        </Route>
        <PrivateRoute
          exact
          path="/onboarding/resume"
          component={OnboardingResumePage}
        />
        <PrivateRoute path="/my-resume" component={MyResumePage} />
        <Route component={PageNotFound} />
      </Switch>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
