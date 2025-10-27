import React, {useRef, useState} from "react";

const SignIn = () => {
    const [showPwd, setShowPwd] = useState(false);
    const form = useRef();
    const [errorMessage, setErrorMessage] = useState('');

    const signin = (e) => {
        e.preventDefault();
        let urlToUse = `https://admin.cvworld.info/api/login`

        fetch(urlToUse, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: form.current[0].value,
                password: form.current[1].value,
            })
        }).then(r => r.json().then(data => ({status: r.status, body: data}))).then((result) => {
                if (result.status === 200) {
                    document.cookie = `sessionid=${result.body.session_key};domain=.cvworld.info;path=/`;
                    window.location = result.body.redirect_url
                } else {
                    setErrorMessage(result.body.details);
                }
            },
            (error) => {
                console.log(error)
            }
        );
    };
    return (
        <section className="authentication-form"
                 style={{backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/aut-bg.jpg)`}}>
            <div className="innerpage-decor">
                <div className="innerpage-circle1">
                    <img src={`${process.env.PUBLIC_URL}/assets/images/Testimonial2.png`} alt=""/>
                </div>
                <div className="innerpage-circle2">
                    <img src={`${process.env.PUBLIC_URL}/assets/images/Testimonial1.png`} alt=""/>
                </div>
            </div>
            <div>
                <h2 className="title text-center">
                    <span> Login</span>
                </h2>
                <p className="text-center">
                    Please Login with your personal account information.
                </p>

                <div className="card">
                    {errorMessage && (
                        <div className="error-message text-center "> {errorMessage} </div>
                    )}
                    <form className="theme-form" ref={form} onSubmit={signin}>
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="email address"
                                required="required"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                required=""
                                name="login[password]"
                                type={showPwd ? "text" : "password"}
                                className="form-control"
                                placeholder="Password"
                            />
                            <div
                                className="show-hide"
                                onClick={() => {
                                    setShowPwd(!showPwd);
                                }}
                            >
                                <span className={!showPwd ? "show" : ""}></span>
                            </div>
                        </div>
                        <div className="form-group row custom-row">
                            <div className="col-6">
                                <div className="custom-control custom-checkbox">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="customControlAutosizing"
                                    />
                                    <label
                                        className="custom-control-label"
                                        htmlFor="customControlAutosizing"
                                    >
                                        Remember me
                                    </label>
                                </div>
                            </div>
                            <a
                                href={`${process.env.PUBLIC_URL}/sign-up`}
                                className="text-right col-6 theme-link"
                            >
                                Sign up
                            </a>
                        </div>
                        <div className="form-button text-center">
                            <button
                                type="submit"
                                className="btn btn-custom btn-lg theme-color"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default SignIn;
