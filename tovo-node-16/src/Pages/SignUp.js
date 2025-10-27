import React, {useRef, useState} from "react";
import PasswordChecklist from "react-password-checklist"


const SignUp = () => {
    const [showPwd, setShowPwd] = useState(false);
    const form = useRef();
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [errorMessage, setErrorMessage] = useState('');

    const signup = (e) => {
        e.preventDefault();
        let urlToUse = `https://admin.cvworld.info/api/sign-up`

        fetch(urlToUse, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: form.current[0].value,
                last_name: form.current[1].value,
                username: form.current[2].value,
                password: form.current[3].value,
            })
        }).then(r => r.json().then(data => ({status: r.status, body: data}))).then((result) => {
                if (result.status === 200) {
                    document.cookie = `sessionid=${result.body.session_key};domain=admin.cvworld.info;path=/`;
                    window.location = result.body.redirect_url
                } else {
                    setErrorMessage(result.body.details);
                }
            },
            (error) => {
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
                    <span> Sign up</span>
                </h2>
                <div className="card">
                    {errorMessage && (
                        <div className="error-message text-center "> {errorMessage} </div>
                    )}
                    <form className="theme-form" ref={form} onSubmit={signup}>
                        <div className="form-group">
                            <div className="md-fgrup-margin">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="first nane"
                                    required="required"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="md-fgrup-margin">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="last nane"
                                    required="required"
                                />
                            </div>
                        </div>
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
                                onChange={e => setPassword(e.target.value)}
                                required=""
                                type="password"
                                className="form-control"
                                placeholder="Password"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                onChange={e => setPasswordAgain(e.target.value)}
                                type={showPwd ? "text" : "password"}
                                name="login[password]"
                                className="form-control"
                                placeholder="ConfIrm password"
                                required="required"
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
                        <PasswordChecklist
                            rules={["minLength", "specialChar", "number", "capital", "match"]}
                            minLength={5}
                            value={password}
                            valueAgain={passwordAgain}
                            onChange={(isValid) => {
                            }}
                        />
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
                                href={`${process.env.PUBLIC_URL}/sign-in`}
                                className="text-right col-6 theme-link"
                            >
                                Sign In
                            </a>
                        </div>
                        <div className="form-button text-center">
                            <button type="submit" className="btn btn-custom theme-color">
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
