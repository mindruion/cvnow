import React, {useEffect, useRef, useState} from "react";
import toast, {Toaster} from "react-hot-toast";

const Contact = () => {

    const [bgImg, setBgImg] = useState({
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/Contact.png)`
    });

    const color = localStorage.getItem("color");
    const form = useRef();

    useEffect(() => {
        if (color === "color-1")
            setBgImg({
                backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/Contact.png)`
            });
        else if (color === "color-2")
            setBgImg({
                backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/color/color-2/contact.png)`
            })
        else
            setBgImg({
                backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/color/color-3/contact.png)`
            })
    }, [color]);
    const contactUs = (e) => {
        e.preventDefault();
        let urlToUse = `https://admin.cvworld.info/api/contact-landing`

        fetch(urlToUse, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: form.current[0].value,
                phone: form.current[1].value,
                email: form.current[2].value,
                message: form.current[3].value,
            })
        }).then(r => r.json().then(data => ({status: r.status, body: data}))).then((result) => {
                if (result.status === 200) {
                    toast.success('Message successfully sent!')
                } else {
                    console.log(result.body.details);
                }
            },
            (error) => {
                console.log(error)
            }
        );
    };
    return (
        <section id="contact" className="contact" style={bgImg}>
            <div className="contact-decor">
                <div className="contact-circle1">
                    <img src="assets/images/main-banner12.png" alt=""/>
                </div>
                <div className="contact-circle2">
                    <img src="assets/images/main-banner1.png" alt=""/>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md-12 col-lg-8 col-sm-12">
                        <div className="contact-us">
                            <div className="w-100">
                                <h2 className="title">
                                    <span>contact </span>information
                                </h2>
                                <form ref={form} onSubmit={contactUs} className="theme-form">
                                    <div className="form-group">
                                        <div className="row">
                                            <div className="col-sm-12 col-md-6 md-fgrup-margin">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="your name"
                                                    required="required"
                                                />
                                            </div>
                                            <div className="col-sm-12 col-md-6">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="phone"
                                                    required="required"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="exampleFormControlInput1"
                                            placeholder="email address"
                                            required="required"
                                        />
                                    </div>
                                    <div className="form-group">
                    <textarea
                        className="form-control"
                        id="exampleFormControlTextarea1"
                        rows="4"
                        placeholder="message"
                        required="required"
                    ></textarea>
                                    </div>
                                    <div className="form-button">
                                        <button
                                            type="submit"
                                            className="btn btn-custom theme-color"
                                        >
                                            send
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
        </section>
    );
};

export default Contact;
