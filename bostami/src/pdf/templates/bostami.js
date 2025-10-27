import React from 'react';
import {Document, Page, Image, Link, Svg, Line, Text, View, Path, StyleSheet, G} from '@react-pdf/renderer';
import img from "../../assets/images/about/avatar.jpg";


const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 1191;

const hashStringToSeed = (value = "") => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
    }
    return hash || 1729;
};

const createSeededRandom = (seedValue) => {
    let seed = seedValue % 2147483647;
    if (seed <= 0) {
        seed += 2147483646;
    }

    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
};

const generatePointPattern = (count, seedValue, colors) => {
    const random = createSeededRandom(seedValue);
    const paletteColors = colors && colors.length ? colors : ["#4A5568"];
    const points = [];

    for (let index = 0; index < count; index += 1) {
        const size = 3 + random() * 9;
        const opacity = 0.18 + random() * 0.32;
        const color = paletteColors[index % paletteColors.length];

        points.push({
            key: `${index}-${color}`,
            left: random() * PAGE_WIDTH,
            top: random() * PAGE_HEIGHT,
            size,
            opacity,
            color,
        });
    }

    return points;
};


let styles = StyleSheet.create({
    Skills: {
        fontFamily: "Times-BoldItalic",
        fontSize: "20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "row",
        flex: "auto",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
    },
    SkillSVG: {
        width: "25px",
        height: "25px",
        marginRight: "10px",
    },
    pageBackground: {
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100%',
        display: 'block',
        height: '100%',
        width: '100%',
        zIndex: 1000,
    },
    darkBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#050505',
        zIndex: 1000,
        overflow: 'hidden',
    },
    backgroundDot: {
        position: 'absolute',
        borderRadius: 9999,
        zIndex: 900,
    },
    container: {
        containerType: 'inline-size',
        width: "100%",
        height: "100%",
        position: 'relative',
        zIndex: 0,
    },
    avatar: {
        position: 'absolute',
        marginTop: "20px",
        marginLeft: "90px",
        borderRadius: "15px",
        width: "175px",
        height: "175px",
        objectFit: "cover",
        zIndex: 1,
        objectPosition: "50% 50%"
    },
    name: {
        fontWeight: "800",
        marginTop: "80px",
        textAlign: "center",
        fontFamily: "Times-BoldItalic",
        fontSize: "23px",
    },
    profession: {
        fontFamily: "Times-Italic",
        color: "rgb(123 123 123 / 1)",
        textAlign: "center",
        fontSize: "15px",
        marginTop: "5px",
    },
    infoContainer: {
        fontFamily: "Times-BoldItalic",
        display: "flex",
        marginTop: "20px",
        marginBottom: "20px",
        marginRight: "20px",
        marginLeft: "20px",
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingRight: "10px",
        paddingLeft: "10px",
        borderRadius: "15px",
        backgroundColor: "rgb(243 246 246 / 1)",
    },
    containerProperty: {
        display: "flex",
        flexDirection: "row",
        height: "40px",
        backgroundColor: "rgb(243 246 246 / 1)",
        marginBottom: "10px",
        borderColor: "rgb(227 227 227 / 1)",
        borderBottomWidth: "0.1px",
    },
    containerPropertyLine: {
        marginTop: "20px",
        fontFamily: "Times-Italic",
        fontSize: "10px",
        display: "flex",
        flexDirection: "row",
    },
    resumeSVGContainer: {
        marginRight: "5px",
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        width: "30px",
        height: "30px",
        borderRadius: "5px",
    },
    resumeSVG: {
        margin: "8"
    },
    containerPropertyTitle: {
        fontFamily: "Times-Italic",
        paddingBottom: "3px",
        fontSize: "10px",
        color: "rgb(68 86 108 / 1)",
    },
    containerPropertyDetail: {
        fontSize: "15px",
    },
    linksMedia: {
        color: "rgb(123 123 123 / 1)",
        textAlign: "center",
        fontSize: "15px",
        marginTop: "10px",
    },

    profileDetails: {
        position: 'absolute',
        borderRadius: "15px",
        marginTop: "130px",
        marginLeft: "30px",
        backgroundColor: "white",
        width: "290px",
        zIndex: 20,
        // paddingLeft: "1.5rem",
        // paddingRight: "1.5rem",
    },
    resumeDetails: {
        position: 'absolute',
        borderRadius: "15px",
        marginTop: "130px",
        marginLeft: "350px",
        backgroundColor: "white",
        width: "450px",
        zIndex: 19,
        paddingBottom: "20px",
        // paddingLeft: "1.5rem",
        // paddingRight: "1.5rem",
    },
    about: {
        fontFamily: "Times-BoldItalic",
        position: "absolute",
        fontWeight: "700",
        marginTop: "20px",
        marginLeft: "20px",
        zIndex: 2,
        fontSize: "30px",
    },
    aboutDescription: {
        fontFamily: "Times-Italic",
        marginTop: "80x",
        overflow: 'auto',
        marginLeft: "20px",
        marginRight: "10px",
    },
    aboutShortDescription: {
        fontFamily: "Times-Italic",
        marginTop: "10x",
        position: "relevant",
        overflow: 'auto',
        marginLeft: "20px",
        marginRight: "10px",
    },
    ExperienceSection: {
        fontFamily: "Times-BoldItalic",
        marginLeft: "20px",
        marginRight: "20px",
        marginTop: "20px",
        position: "relevant",
        overflow: 'auto',
    },
    EducationSectionSVGContainer: {
        position: "relevant",
        overflow: 'auto',
        display: "flex",
        flexDirection: "row",
    },
    EducationSectionSVG: {
        height: "20px",
        width: "25px",
        fontSize: "10px",
        marginRight: "10px"
    },
    ExperienceProperty: {
        marginTop: "10px",
        textAlign: "center",
        borderRadius: "15px",
        position: "relevant",
        overflow: 'auto',
        backgroundColor: "rgb(59 59 59 / 1)",
    },
    ExperiencePropertyDate: {
        paddingTop: "10px",
        paddingBottom: "5px",
        fontSize: "15px",
        color: "rgb(68 86 108 / 1)",
    },
    ExperiencePropertyTitle: {
        paddingTop: "5px",
        paddingBottom: "5px",
    },
    ExperiencePropertyPlace: {
        paddingTop: "5px",
        paddingBottom: "10px",
    },
    EducationSection: {
        marginTop: "20px",
        position: "relevant",
        overflow: 'auto',
    },
    lineSvg: {
        position: 'absolute',
        marginTop: "40px",
        zIndex: 1,
        marginLeft: "160px",
    },
    knowledgeContainer: {
        fontFamily: "Times-BoldItalic",
        marginTop: "20px",
        marginBottom: "20px",
        marginRight: "20px",
        marginLeft: "20px",
        position: "relevant",
        overflow: 'auto',
        display: "flex",
        flexDirection: "row",
    },
    knowledgeProperty: {
        marginTop: "15px",
        marginBottom: "15px",
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "5px",
        borderRadius: "5px",
        backgroundColor: "rgb(59 59 59 / 1)",
        paddingRight: "20px",
        marginRight: "10px",
    },
});

if (localStorage?.getItem("theme") === "dark") {
    styles = StyleSheet.create({
        pageBackground: {
            position: 'absolute',
            minWidth: '100%',
            minHeight: '100%',
            display: 'block',
            height: '100%',
            width: '100%',
            zIndex: 1000,
        },
        darkBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#050505',
            zIndex: 1000,
            overflow: 'hidden',
        },
        backgroundDot: {
            position: 'absolute',
            borderRadius: 9999,
            zIndex: 900,
        },
        container: {
            containerType: 'inline-size',
            width: "100%",
            height: "100%",
            color: "white",
            position: 'relative',
            zIndex: 0,
        },
        avatar: {
            position: 'absolute',
            marginTop: "20px",
            marginLeft: "90px",
            borderRadius: "15px",
            width: "175px",
            height: "175px",
            objectFit: "cover",
            zIndex: 1,
            objectPosition: "50% 50%"
        },
        name: {
            fontWeight: "800",
            marginTop: "80px",
            textAlign: "center",
            fontFamily: "Times-BoldItalic",
            fontSize: "23px",
        },
        profession: {
            fontFamily: "Times-Italic",
            color: "white",
            textAlign: "center",
            fontSize: "15px",
            marginTop: "5px",
        },
        infoContainer: {
            fontFamily: "Times-BoldItalic",
            display: "flex",
            marginTop: "20px",
            marginBottom: "20px",
            marginRight: "20px",
            marginLeft: "20px",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingRight: "10px",
            paddingLeft: "10px",
            borderRadius: "15px",
            backgroundColor: "rgb(59 59 59 / 1)",
        },
        containerProperty: {
            display: "flex",
            flexDirection: "row",
            height: "40px",
            backgroundColor: "rgb(59 59 59 / 1)",
            marginBottom: "10px",
            borderColor: "rgb(227 227 227 / 1)",
            borderBottomWidth: "0.1px",
        },
        containerPropertyLine: {
            marginTop: "20px",
            fontFamily: "Times-Italic",
            fontSize: "10px",
            display: "flex",
            flexDirection: "row",
        },
        resumeSVGContainer: {
            marginRight: "5px",
            backgroundColor: "rgb(39 39 39 / 1)",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            borderRadius: "5px",
        },
        resumeSVG: {
            margin: "8"
        },
        containerPropertyTitle: {
            fontFamily: "Times-Italic",
            paddingBottom: "3px",
            fontSize: "10px",
        },
        containerPropertyDetail: {
            fontSize: "15px",
        },
        linksMedia: {
            color: "rgb(123 123 123 / 1)",
            textAlign: "center",
            fontSize: "15px",
            marginTop: "10px",
        },

        profileDetails: {
            position: 'absolute',
            borderRadius: "15px",
            marginTop: "130px",
            marginLeft: "30px",
            width: "290px",
            zIndex: 20,
            backgroundColor: "rgb(39 39 39 / 1)",
            // paddingLeft: "1.5rem",
            // paddingRight: "1.5rem",
        },
        resumeDetails: {
            position: 'absolute',
            borderRadius: "15px",
            marginTop: "130px",
            marginLeft: "350px",
            width: "450px",
            zIndex: 19,
            paddingBottom: "20px",
            backgroundColor: "rgb(39 39 39 / 1)",
            // paddingLeft: "1.5rem",
            // paddingRight: "1.5rem",
        },
        about: {
            fontFamily: "Times-BoldItalic",
            position: "absolute",
            fontWeight: "700",
            marginTop: "20px",
            marginLeft: "20px",
            zIndex: 2,
            fontSize: "30px",
        },
        aboutDescription: {
            fontFamily: "Times-Italic",
            marginTop: "80x",
            overflow: 'auto',
            marginLeft: "20px",
            marginRight: "10px",
        },
        aboutShortDescription: {
            fontFamily: "Times-Italic",
            marginTop: "10x",
            position: "relevant",
            overflow: 'auto',
            marginLeft: "20px",
            marginRight: "10px",
        },
        Skills: {
            fontFamily: "Times-BoldItalic",
            fontSize: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "row",
            flex: "auto",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
        },
        SkillSVG: {
            width: "25px",
            height: "25px",
            marginRight: "10px",
        },
        knowledgeContainer: {
            fontFamily: "Times-BoldItalic",
            marginTop: "20px",
            marginBottom: "20px",
            marginRight: "20px",
            marginLeft: "20px",
            position: "relevant",
            overflow: 'auto',
            display: "flex",
            flexDirection: "row",
            flex: "auto",
            flexWrap: "wrap",
        },
        knowledgeProperty: {
            marginTop: "5px",
            marginBottom: "5px",
            paddingTop: "5px",
            paddingBottom: "5px",
            paddingLeft: "5px",
            borderRadius: "5px",
            backgroundColor: "rgb(59 59 59 / 1)",
            paddingRight: "5px",
            marginRight: "10px",
        },
        ExperienceSection: {
            fontFamily: "Times-BoldItalic",
            marginLeft: "20px",
            marginRight: "20px",
            marginTop: "20px",
            position: "relevant",
            overflow: 'auto',
        },
        EducationSectionSVGContainer: {
            position: "relevant",
            overflow: 'auto',
            display: "flex",
            flexDirection: "row",
        },
        EducationSectionSVG: {
            height: "20px",
            width: "25px",
            fontSize: "10px",
            marginRight: "10px"
        },
        ExperienceProperty: {
            borderColor: "rgb(33 36 37 / 1)",
            borderWidth: "2px",
            marginTop: "10px",
            textAlign: "center",
            borderRadius: "15px",
            position: "relevant",
            overflow: 'auto',
        },
        ExperiencePropertyDate: {
            paddingTop: "10px",
            paddingBottom: "5px",
            fontSize: "15px",
            color: "rgb(183 183 183 / 1)",
        },
        ExperiencePropertyTitle: {
            paddingTop: "5px",
            paddingBottom: "5px",
        },
        ExperiencePropertyPlace: {
            paddingTop: "5px",
            paddingBottom: "10px",
        },
        EducationSection: {
            marginTop: "20px",
            position: "relevant",
            overflow: 'auto',
        },
        lineSvg: {
            position: 'absolute',
            marginTop: "40px",
            zIndex: 1,
            marginLeft: "160px",
        },
        socialLinks: {
            position: "relevant",
            overflow: 'auto',
            display: "flex",
            flexDirection: "row",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
        },
        socialLinkProperty: {
            width: "25px",
            height: "25px",
            marginRight: "10px",
            padding: "5px",
            marginTop: "10px",
            backgroundColor: "rgb(59 59 59 / 1)",
            borderRadius: "5px",
        }
    });
}
// Create Document Component
const MyDocument = ({data, theme}) => {
    const palette = theme?.palette || {};
    const variants = theme?.variants || [];
    const getVariant = (index, fallback) =>
        (variants && variants.length ? variants[index % variants.length] : undefined) || fallback;
    const primaryColor = palette.primary || "#FA5252";
    const accentOne = getVariant(0, "#6AB5B9");
    const accentTwo = getVariant(1, "#C17CEB");
    const accentThree = getVariant(2, "#F95054");
    const softBorder = palette.border || "#EDF2F2";
    const themeMode = theme?.mode || localStorage?.getItem("theme");
    let isDarkTheme = themeMode === "dark";
    const pointColors = [
        palette.primary,
        palette.secondary,
        variants[0],
        variants[1],
        variants[2],
        "#4A5568",
        "#718096",
    ].filter(Boolean);
    const pointSeed = hashStringToSeed(`${data?.name || "bostami"}-${themeMode || "light"}`);
    const pointPattern = isDarkTheme ? generatePointPattern(220, pointSeed, pointColors) : [];
    return (<Document>
        <Page size="A3">
            {isDarkTheme ? (
                <View
                    fixed
                    style={[styles.darkBackground, {backgroundColor: palette.background || "#050505"}]}
                >
                    {pointPattern.map((point) => (
                        <View
                            key={point.key}
                            style={[
                                styles.backgroundDot,
                                {
                                    left: point.left,
                                    top: point.top,
                                    width: point.size,
                                    height: point.size,
                                    borderRadius: point.size / 2,
                                    backgroundColor: point.color,
                                    opacity: point.opacity,
                                },
                            ]}
                        />
                    ))}
                </View>
            ) : (
                <Image
                    fixed
                    src="static/media/bg.54122ef3ac6eced211d3.jpg"
                    style={styles.pageBackground}
                />
            )}
            <View style={styles.container}>
                <Image src={img} style={styles.avatar}/>
                <View fixed={true} style={styles.profileDetails}>
                    <Text style={styles.name}>
                        {data.name ? data.name : "First Last NAME"}
                    </Text>
                    <Text style={styles.profession}>
                        {data?.profession}
                    </Text>
                    <View style={styles.socialLinks}>
                        <View style={styles.socialLinkProperty}>
                            <Link src={data.facebook}>
                                <Svg stroke="#0072b1" fill="#0072b1" viewBox="0 0 320 512">
                                    <Path
                                        d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                                </Svg>
                            </Link>
                        </View>
                        <View style={styles.socialLinkProperty}>
                            <Link src={data.linkedin}>
                                <Svg stroke="#0072b1" fill="#0072b1" viewBox="0 0 448 512">
                                    <Path
                                        d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                                </Svg>
                            </Link>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <View style={styles.containerProperty}>
                            <View style={styles.resumeSVGContainer}>
                                <Svg viewBox={"0 0 320 512"} style={styles.resumeSVG}>
                                    <Path stroke={primaryColor} fill={primaryColor}
                                          d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z"/>
                                </Svg></View>
                            <View>
                                <Text style={styles.containerPropertyTitle}>Phone</Text>
                                <Link style={[styles.containerPropertyDetail, {textDecoration: "none", color: "white"}]} src={`tel:${data.phone}`}>
                                    <Text>{data.phone}</Text>
                                </Link>
                            </View>
                        </View>
                        <View style={styles.containerProperty}>
                            <View style={styles.resumeSVGContainer}>
                                <Svg viewBox={"0 0 512 512"} style={styles.resumeSVG}>
                                    <Path stroke={accentOne} fill={accentOne}
                                          d="M176 216h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16H176c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16zm-16 80c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16H176c-8.84 0-16 7.16-16 16v16zm96 121.13c-16.42 0-32.84-5.06-46.86-15.19L0 250.86V464c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V250.86L302.86 401.94c-14.02 10.12-30.44 15.19-46.86 15.19zm237.61-254.18c-8.85-6.94-17.24-13.47-29.61-22.81V96c0-26.51-21.49-48-48-48h-77.55c-3.04-2.2-5.87-4.26-9.04-6.56C312.6 29.17 279.2-.35 256 0c-23.2-.35-56.59 29.17-73.41 41.44-3.17 2.3-6 4.36-9.04 6.56H96c-26.51 0-48 21.49-48 48v44.14c-12.37 9.33-20.76 15.87-29.61 22.81A47.995 47.995 0 0 0 0 200.72v10.65l96 69.35V96h320v184.72l96-69.35v-10.65c0-14.74-6.78-28.67-18.39-37.77z"
                                    /></Svg></View>
                            <View>
                                <Text style={styles.containerPropertyTitle}>Email</Text>
                                <Text style={styles.containerPropertyDetail}>{data.email}</Text>
                            </View>
                        </View>

                        <View style={styles.containerProperty}>
                            <View style={styles.resumeSVGContainer}>
                                <Svg viewBox={"0 0 384 512"} style={styles.resumeSVG}>
                                    <Path stroke={primaryColor} fill={primaryColor}
                                          d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                                </Svg></View>
                            <View>
                                <Text style={styles.containerPropertyTitle}>Location</Text>
                                <Text style={styles.containerPropertyDetail}>{data.location}</Text>
                            </View>
                        </View>

                        <View style={[styles.containerProperty, {borderBottom: "none", marginBottom: "0px"}]}>
                            <View style={styles.resumeSVGContainer}>
                                <Svg viewBox={"0 0 448 512"} style={styles.resumeSVG}>
                                    <Path stroke={accentTwo} fill={accentTwo}
                                          d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"/>
                                </Svg></View>
                            <View>
                                <Text style={styles.containerPropertyTitle}>Birthday</Text>
                                <Text style={styles.containerPropertyDetail}>{data.birth_date}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.Skills}>
                        <View style={styles.SkillSVG}>
                            <Svg  viewBox="0 0 480.61 480.61" stroke={accentThree} fill={accentThree}>
                                <G>
                                    <Path stroke={accentThree} fill={accentThree} d="M469.012,20.343l-2.395-6.339l-6.339-2.394C439.878,3.906,418.436,0,396.547,0c-48.104,0-93.33,18.733-127.346,52.749
		l-48.227,48.227l-107.787,5.228l-90.214,90.213l77.783,24.777l-28.763,28.762l16.802,16.802l-37.224,57.056l105.235,105.237
		l57.057-37.224l16.802,16.802l28.763-28.763l24.775,77.783l90.216-90.214l5.227-107.786l48.227-48.227
		C477.832,161.462,493.98,86.459,469.012,20.343z M79.029,182.788l47.182-47.181l63.197-3.065l-64.773,64.773L79.029,182.788z
		 M160.805,390.623l-70.806-70.806l20.473-31.381l81.713,81.714L160.805,390.623z M345.015,354.412l-47.181,47.181l-14.527-45.606
		l64.773-64.773L345.015,354.412z M230.665,366.202L114.419,249.956L290.414,73.961C318.764,45.612,356.455,30,396.547,30
		c15.957,0,31.625,2.487,46.671,7.401c17.451,53.48,3.463,112.785-36.558,152.807L230.665,366.202z"/>
                                    <Path d="M364.951,70.67c-12.02,0-23.32,4.681-31.819,13.18c-17.546,17.545-17.546,46.094,0,63.64
		c8.499,8.499,19.8,13.18,31.819,13.18s23.32-4.681,31.819-13.18c17.546-17.545,17.546-46.094,0-63.64
		C388.272,75.351,376.971,70.67,364.951,70.67z M375.558,126.277c-2.833,2.833-6.6,4.394-10.606,4.394s-7.773-1.561-10.606-4.393
		c-5.849-5.849-5.849-15.365,0-21.214c2.833-2.833,6.6-4.393,10.606-4.393s7.773,1.56,10.606,4.393
		C381.406,110.912,381.406,120.429,375.558,126.277z"/>
                                    <Path d="M0.013,375.612l33.999-34l21.213,21.213l-33.999,33.999L0.013,375.612z M105.004,480.61l-21.213-21.213l33.999-33.999
		l21.213,21.213L105.004,480.61z M25.031,432.878l50.122-50.122l21.213,21.213l-50.122,50.122L25.031,432.878z"/>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                                <G>
                                </G>
                            </Svg>
                        </View>
                        <View><Text>Skills</Text></View>
                    </View>
                    <View style={[styles.infoContainer, {paddingTop: "0px"}]}>
                        {data?.working_skills?.map((item, i) => (
                            <View>
                                <View style={styles.containerPropertyLine}>
                                    <View>
                                        <Text>{item?.title}</Text>
                                    </View>
                                    <View style={{textAlign: "right", width: "100%"}}>
                                        <Text>{item?.percentage}%</Text>
                                    </View>
                                </View>
                                <Svg viewBox="0 0 100 1" style={{marginTop: "10px",}}>
                                    <Path d="M 0.5,0.5
         L 99.5,0.5" strokeLinecap="round" stroke={softBorder} strokeWidth="1"/>
                                    <Path d="M 0.5,0.5
         L 99.5,0.5" strokeLinecap="round" stroke={item?.color} strokeWidth="1" style={
                                        {
                                            strokeDasharray: `${item?.percentage}, 100`,
                                            strokeDashoffset: "0px",
                                        }}/>
                                </Svg>
                            </View>
                        ))}
                    </View>
                    <View style={styles.Skills}>
                        <View style={styles.SkillSVG}> <Svg viewBox="0 0 32 32">
                            <Path stroke={accentThree} fill={accentThree} d="M29.903,11.459c-0.058-0.373-0.135-0.737-0.25-1.097c-0.137-0.427-0.258-0.854-0.433-1.266
	c-0.142-0.329-0.329-0.641-0.533-0.933c-0.225-0.319-0.473-0.62-0.722-0.918c-0.187-0.223-0.391-0.441-0.612-0.629
	c-0.292-0.25-0.593-0.5-0.91-0.718c-0.292-0.2-0.594-0.364-0.916-0.51c-0.646-0.296-1.322-0.452-2.014-0.596
	C23.207,4.728,22.9,4.66,22.601,4.566c-0.227-0.071-0.448-0.162-0.668-0.25c-0.198-0.093-0.382-0.213-0.563-0.336
	C21.347,3.961,21.323,3.94,21.3,3.922c-0.298-0.229-0.631-0.416-0.962-0.595C19.639,2.956,18.885,2.7,18.123,2.5
	c-0.452-0.119-0.933-0.189-1.397-0.242c-0.386-0.047-0.779-0.084-1.169-0.084c-0.043,0-0.087,0-0.13,0.001
	c-0.475,0.01-0.943,0.062-1.412,0.137c-0.206,0.033-0.412,0.063-0.612,0.117c-0.212,0.058-0.421,0.127-0.631,0.194
	c-0.419,0.135-0.829,0.306-1.239,0.471c-0.446,0.181-0.885,0.373-1.322,0.575C9.806,3.856,9.425,4.095,9.05,4.336
	C8.673,4.576,8.307,4.828,7.944,5.09C7.184,5.64,6.47,6.271,5.793,6.921c-0.316,0.3-0.589,0.635-0.864,0.972
	c-0.3,0.367-0.604,0.741-0.868,1.135c-0.241,0.36-0.444,0.737-0.639,1.124c-0.204,0.409-0.365,0.833-0.53,1.259
	c-0.188,0.427-0.389,0.85-0.528,1.296c-0.065,0.214-0.096,0.444-0.142,0.662c-0.056,0.269-0.102,0.541-0.131,0.814
	c-0.056,0.546-0.133,1.118-0.064,1.666c0.038,0.294,0.083,0.581,0.164,0.866c0.075,0.269,0.206,0.519,0.367,0.745
	c0.082,0.114,0.174,0.222,0.264,0.332c0.214,0.287,0.413,0.586,0.61,0.885c0.148,0.229,0.294,0.454,0.464,0.67
	c0.16,0.204,0.354,0.377,0.55,0.544c0.691,0.587,1.522,1.002,2.338,1.383c0.85,0.396,1.743,0.696,2.653,0.912
	c0.879,0.206,1.768,0.302,2.669,0.356c0.65,0.04,1.297,0.017,1.945-0.05c0.14-0.015,0.278-0.038,0.417-0.055
	c0.263,0.562,0.664,1.042,1.098,1.488c-0.46,0.607-0.91,1.223-1.36,1.836c-0.244,0.331-0.471,0.67-0.687,1.018
	c-0.183,0.294-0.356,0.593-0.494,0.912c-0.2,0.462-0.473,1.068-0.189,1.555c0.139,0.239,0.348,0.346,0.594,0.444
	c0.096,0.04,0.266,0.046,0.354,0.056c0.037,0.004,0.073,0.01,0.11,0.014c0.198,0.023,0.396,0.031,0.594,0.038
	c0.362,0.013,0.723,0.027,1.085,0.029c0.214,0,0.418-0.004,0.627-0.046c0.348-0.073,0.55-0.389,0.706-0.679
	c0.318-0.589,0.687-1.15,1.087-1.689c0.354-0.433,0.731-0.845,1.114-1.251c0.04-0.042,0.063-0.093,0.091-0.142
	c0.177,0.021,0.355,0.041,0.533,0.042c0.394,0.004,0.789-0.031,1.181-0.083c0.417-0.056,0.823-0.144,1.229-0.252
	c0.439-0.117,0.854-0.331,1.249-0.552c0.739-0.416,1.428-0.895,2.095-1.416c0.296-0.233,0.593-0.473,0.833-0.766
	c0.294-0.358,0.56-0.729,0.802-1.124c0.412-0.666,0.8-1.353,1.154-2.049c0.177-0.35,0.337-0.71,0.491-1.07
	c0.171-0.394,0.342-0.791,0.466-1.204c0.227-0.768,0.412-1.549,0.539-2.338c0.073-0.45,0.108-0.904,0.146-1.358
	c0.031-0.368,0.062-0.735,0.079-1.102C30.016,12.317,29.966,11.885,29.903,11.459z M14.322,3.882c0.06-0.008,0.12-0.016,0.18-0.024
	c-0.062,0.008-0.124,0.017-0.186,0.025C14.318,3.883,14.32,3.883,14.322,3.882z M6.135,8.972C6.14,8.965,6.145,8.959,6.15,8.952
	C6.126,8.983,6.103,9.014,6.079,9.043C6.098,9.019,6.116,8.996,6.135,8.972z M16.627,26.866c-0.198,0.279-0.391,0.564-0.581,0.85
	c-0.132,0.198-0.253,0.404-0.383,0.605c-0.206,0.002-0.412-0.015-0.616-0.029c-0.178-0.012-0.357-0.024-0.535-0.038
	c0.286-0.625,0.662-1.198,1.074-1.746c0.382-0.482,0.77-0.961,1.154-1.442c0.026,0.022,0.05,0.047,0.077,0.068
	c0.256,0.203,0.54,0.367,0.838,0.502C17.292,26.028,16.938,26.428,16.627,26.866z M18.567,23.049
	c-0.348,0.085-0.698,0.156-1.05,0.227c-0.068,0.014-0.122,0.053-0.181,0.086c-0.109-0.108-0.221-0.211-0.331-0.319
	c-0.302-0.297-0.6-0.593-0.869-0.92c-0.001-0.001-0.002-0.003-0.003-0.004c0.633-0.182,1.257-0.439,1.858-0.702
	c0.623-0.273,1.227-0.593,1.785-0.983c0.036-0.025,0.061-0.057,0.093-0.084c0.001-0.001,0.003-0.002,0.004-0.003
	c0.198,0.145,0.402,0.282,0.611,0.411c0.225,0.135,0.444,0.281,0.671,0.412c0.129,0.074,0.265,0.141,0.397,0.212
	c-0.101,0.093-0.19,0.198-0.295,0.285c-0.617,0.45-1.285,0.822-1.98,1.138C19.046,22.899,18.811,22.989,18.567,23.049z
	 M24.795,22.391c-0.211,0.189-0.437,0.36-0.662,0.532c-0.617,0.456-1.264,0.884-1.964,1.2c-0.419,0.148-0.849,0.246-1.288,0.317
	c-0.491,0.05-0.979,0.069-1.471,0.028c-0.002,0-0.005-0.001-0.007-0.002c0.031-0.012,0.064-0.019,0.096-0.032
	c0.525-0.217,1.025-0.481,1.514-0.77c0.489-0.29,0.962-0.594,1.404-0.952c0.192-0.156,0.368-0.337,0.545-0.512
	c0.056-0.054,0.108-0.112,0.164-0.167c0.471,0.133,0.96,0.229,1.441,0.273c0.097,0.009,0.195,0.011,0.293,0.017
	C24.836,22.346,24.818,22.37,24.795,22.391z M28.494,13.493c-0.027,0.453-0.064,0.904-0.119,1.353
	c-0.144,0.963-0.363,1.925-0.719,2.832c-0.04,0.091-0.085,0.179-0.127,0.27c-0.378-0.115-0.75-0.253-1.12-0.39
	c-0.083-0.037-0.165-0.074-0.246-0.114c-0.139-0.07-0.279-0.111-0.426-0.111c-0.068,0-0.138,0.009-0.209,0.029
	c-0.204,0.056-0.383,0.192-0.491,0.377c-0.212,0.364-0.11,0.931,0.294,1.125c0.473,0.227,0.974,0.379,1.473,0.538
	c-0.072,0.133-0.139,0.269-0.214,0.401c-0.202,0.353-0.403,0.706-0.611,1.055c-0.003,0.001-0.006,0.002-0.009,0.003
	c-0.191,0.009-0.385-0.005-0.575-0.016c-0.188-0.009-0.375-0.031-0.562-0.055c-0.632-0.1-1.265-0.254-1.86-0.487
	c0.064,0.027,0.127,0.054,0.191,0.081c-0.076-0.031-0.151-0.063-0.226-0.095c-0.778-0.338-1.546-0.739-2.238-1.227
	c-0.192-0.155-0.375-0.316-0.537-0.504c-0.079-0.118-0.149-0.241-0.217-0.366c0.099-0.137,0.189-0.282,0.278-0.418
	c0.191-0.291,0.329-0.593,0.464-0.912c0.112-0.269,0.167-0.562,0.235-0.845c0.102-0.433-0.129-0.881-0.569-1.002
	c-0.067-0.018-0.136-0.027-0.205-0.027c-0.357,0-0.716,0.234-0.797,0.597c-0.075,0.337-0.149,0.667-0.269,0.988
	c-0.13,0.277-0.285,0.542-0.453,0.798c-0.01,0.011-0.022,0.021-0.032,0.031c-0.002,0.001-0.004,0-0.005,0.001
	c-0.391,0.229-0.487,0.708-0.287,1.095c0.109,0.213,0.226,0.42,0.353,0.621c-0.467,0.317-0.955,0.596-1.471,0.826
	c-0.262,0.106-0.53,0.201-0.797,0.297c-0.085-0.09-0.185-0.164-0.312-0.192c-0.215-0.046-0.427-0.104-0.641-0.158
	c-0.213-0.055-0.428-0.099-0.635-0.17c-0.178-0.089-0.341-0.2-0.503-0.317c-0.274-0.222-0.533-0.464-0.767-0.731
	c-0.095-0.132-0.188-0.268-0.284-0.401c-0.146-0.2-0.282-0.397-0.391-0.619c-0.082-0.227-0.143-0.461-0.187-0.699
	c-0.015-0.209-0.004-0.413,0.016-0.619c0.052-0.291,0.123-0.57,0.226-0.846c0.107-0.23,0.227-0.453,0.348-0.677
	c0.21-0.394,0.102-0.891-0.294-1.122c-0.125-0.073-0.269-0.108-0.413-0.108c-0.286,0-0.574,0.139-0.71,0.403
	c-0.264,0.508-0.504,1.022-0.631,1.583c-0.046,0.212-0.075,0.441-0.094,0.658c-0.017,0.198-0.021,0.392-0.015,0.586
	c-0.94,0.093-1.878,0.203-2.804,0.394c-0.439,0.089-0.687,0.602-0.575,1.012c0.058,0.206,0.194,0.383,0.379,0.491
	c0.202,0.119,0.41,0.127,0.633,0.085c0.177-0.035,0.356-0.069,0.533-0.092c-0.073,0.01-0.146,0.019-0.219,0.029
	c0.189-0.025,0.377-0.05,0.567-0.076c-0.03,0.004-0.06,0.009-0.09,0.012c0.669-0.063,1.34-0.117,2.01-0.172
	c0.018,0.035,0.027,0.075,0.047,0.109c0.144,0.264,0.339,0.5,0.512,0.745c0.381,0.533,0.858,1.018,1.406,1.383
	c0.021,0.014,0.044,0.024,0.065,0.037c-0.202,0.013-0.402,0.043-0.605,0.048c-0.596,0.015-1.199-0.038-1.792-0.099
	c-1.078-0.163-2.14-0.46-3.149-0.871c-0.416-0.191-0.825-0.395-1.233-0.6c-0.402-0.205-0.771-0.456-1.133-0.721
	c-0.107-0.087-0.202-0.185-0.301-0.28c0.038-0.183,0.073-0.365,0.138-0.543c0.112-0.242,0.241-0.471,0.394-0.692
	c0.154-0.181,0.322-0.345,0.505-0.497c0.315-0.224,0.648-0.406,0.997-0.568c0.335-0.13,0.668-0.252,1.022-0.327
	c0.021-0.002,0.042-0.004,0.063-0.006c0.416-0.027,0.764-0.325,0.764-0.762c0-0.426-0.361-0.764-0.767-0.764
	c-0.066,0-0.132,0.009-0.199,0.028c-0.246,0.069-0.487,0.162-0.727,0.25c-0.358,0.129-0.714,0.267-1.064,0.419
	C5.816,15.071,5.196,15.5,4.729,16.05c-0.197,0.233-0.357,0.491-0.501,0.759C4.142,16.7,4.06,16.588,3.971,16.482
	c-0.053-0.076-0.101-0.153-0.145-0.234c-0.071-0.205-0.119-0.413-0.157-0.626c-0.041-0.5,0.001-1.021,0.063-1.519
	c0.042-0.222,0.088-0.443,0.136-0.665c0.052-0.239,0.133-0.465,0.22-0.691c0.174-0.401,0.347-0.802,0.516-1.206
	c0.205-0.467,0.438-0.921,0.695-1.361c0.267-0.456,0.594-0.878,0.909-1.301c0.04-0.051,0.08-0.102,0.119-0.154
	c0.162-0.2,0.322-0.403,0.505-0.585c0.061-0.061,0.125-0.12,0.187-0.18c0.147,0.125,0.299,0.245,0.438,0.378
	C7.716,8.585,7.964,8.84,8.201,9.11c0.287,0.325,0.831,0.29,1.124,0c0.148-0.148,0.233-0.352,0.233-0.562
	c0-0.225-0.092-0.394-0.233-0.562c-0.229-0.275-0.468-0.543-0.718-0.8C8.493,7.07,8.364,6.967,8.242,6.858
	C8.406,6.72,8.563,6.572,8.73,6.438c0.431-0.32,0.869-0.636,1.328-0.914c0.496-0.299,1.009-0.548,1.539-0.782
	c0.418-0.171,0.838-0.338,1.259-0.499c0.471-0.18,0.949-0.286,1.446-0.357c0.241-0.032,0.485-0.041,0.728-0.054
	c0.04,1.177,0.155,2.351,0.026,3.526c-0.033,0.179-0.07,0.351-0.134,0.521c0.02-0.048,0.041-0.096,0.061-0.144
	c-0.002,0.006-0.005,0.013-0.007,0.019c-0.09,0.21-0.146,0.392-0.083,0.621c0.056,0.202,0.19,0.377,0.371,0.483
	c0.187,0.108,0.414,0.139,0.621,0.081c0.256-0.071,0.512-0.294,0.564-0.564c0.077-0.404,0.117-0.821,0.154-1.231
	c0.04-0.429,0.073-0.858,0.085-1.289c0.019-0.64,0.014-1.279,0.013-1.918c0.754,0.139,1.501,0.339,2.208,0.629
	c0.474,0.211,0.934,0.455,1.355,0.76c0.064,0.054,0.124,0.112,0.185,0.17c0.017,0.058,0.026,0.118,0.058,0.172
	C20.688,5.972,20.859,6.286,21,6.61c0.078,0.189,0.152,0.379,0.212,0.574c0.085,0.282,0.134,0.576,0.179,0.867
	c0.038,0.351,0.057,0.708,0.028,1.059c-0.038,0.196-0.085,0.386-0.152,0.573c-0.121,0.25-0.266,0.482-0.424,0.71
	c-0.126,0.146-0.261,0.279-0.407,0.403c-0.307,0.211-0.631,0.378-0.969,0.532c-0.171,0.066-0.347,0.117-0.521,0.173
	c0.022-0.044,0.045-0.088,0.067-0.132c0.544-1.099,0.86-2.374,0.72-3.6c-0.029-0.242-0.079-0.441-0.256-0.62
	c-0.164-0.164-0.389-0.256-0.62-0.256c-0.231,0-0.456,0.092-0.62,0.256c-0.146,0.146-0.283,0.402-0.256,0.62
	c0.058,0.464,0.052,0.924,0,1.386c-0.087,0.529-0.222,1.037-0.41,1.539c-0.126,0.287-0.258,0.568-0.438,0.824
	c-0.007,0.009-0.014,0.019-0.022,0.028c-0.077,0.096-0.138,0.192-0.181,0.294c-0.205-0.003-0.41-0.012-0.616-0.034
	c-0.254-0.042-0.499-0.093-0.742-0.178c-0.224-0.106-0.438-0.228-0.649-0.363c-0.246-0.156-0.491-0.31-0.726-0.481
	c-0.133-0.108-0.263-0.219-0.392-0.335c-0.148-0.133-0.328-0.203-0.512-0.232c-0.065-0.289-0.12-0.58-0.168-0.872
	c-0.088-0.785-0.098-1.578-0.264-2.353c-0.089-0.411-0.5-0.675-0.904-0.675c-0.078,0-0.156,0.01-0.231,0.03
	c-0.5,0.139-0.756,0.646-0.644,1.135c0.064,0.278,0.112,0.554,0.155,0.835c0.076,0.595,0.174,1.188,0.282,1.779
	c-0.821,0.034-1.64,0.151-2.42,0.415c-0.439,0.146-0.854,0.354-1.237,0.614c-0.198,0.133-0.394,0.266-0.594,0.396
	c-0.344,0.225-0.487,0.666-0.271,1.035c0.196,0.337,0.696,0.506,1.035,0.273c0.355-0.246,0.704-0.493,1.095-0.675
	c0.465-0.174,0.952-0.278,1.443-0.356c0.627-0.073,1.257-0.083,1.887-0.056c0.034,0.001,0.064-0.015,0.098-0.018
	c0.05,0.049,0.104,0.095,0.165,0.134c0.341,0.223,0.677,0.454,1.029,0.658c0.177,0.104,0.354,0.208,0.533,0.308
	c0.239,0.135,0.491,0.237,0.745,0.337c0.303,0.117,0.629,0.164,0.949,0.201c-0.009,0.186-0.009,0.372-0.03,0.559
	c-0.067,0.389-0.206,0.765-0.353,1.134c-0.089,0.194-0.195,0.374-0.321,0.548c-0.113,0.141-0.231,0.283-0.367,0.403
	c-0.323,0.283-0.287,0.827,0,1.114c0.306,0.306,0.81,0.302,1.116,0c0.167-0.164,0.304-0.371,0.446-0.556
	c0.167-0.219,0.314-0.446,0.441-0.691c0.158-0.302,0.273-0.631,0.402-0.947c0.125-0.306,0.194-0.621,0.246-0.947
	c0.033-0.21,0.053-0.421,0.066-0.633c0.1-0.016,0.203-0.026,0.3-0.047c0.835-0.179,1.653-0.406,2.436-0.752
	c0.314-0.138,0.608-0.298,0.886-0.493c0.366,0.422,0.725,0.85,1.07,1.29c0.079,0.113,0.148,0.228,0.209,0.351
	c0.118,0.308,0.202,0.63,0.27,0.954c-0.114,0.548-0.212,1.1-0.322,1.65c-0.044,0.215-0.033,0.419,0.079,0.612
	c0.104,0.177,0.277,0.31,0.475,0.366c0.391,0.108,0.897-0.129,0.977-0.554c0.066-0.352,0.108-0.708,0.157-1.062
	c0.09-0.059,0.174-0.124,0.236-0.211c0.179-0.012,0.359-0.035,0.531-0.06c0.287-0.04,0.564-0.106,0.843-0.175
	c0.348-0.087,0.691-0.198,1.039-0.292c0.417-0.115,0.67-0.562,0.554-0.979c-0.095-0.345-0.423-0.585-0.771-0.585
	c-0.069,0-0.138,0.009-0.206,0.029c-0.509,0.147-1.021,0.285-1.543,0.373c-0.196,0.023-0.391,0.016-0.586,0.014
	c-0.002-0.007-0.004-0.014-0.006-0.02c-0.146-0.441-0.321-0.875-0.595-1.252c-0.404-0.556-0.823-1.103-1.266-1.629
	c0.302-0.434,0.511-0.959,0.582-1.485c0.044-0.316,0.058-0.616,0.033-0.933c-0.023-0.308-0.062-0.616-0.117-0.92
	c-0.042-0.237-0.085-0.475-0.152-0.706c-0.067-0.227-0.173-0.443-0.267-0.662c-0.007-0.016-0.014-0.032-0.021-0.049
	c0.35,0.104,0.711,0.173,1.066,0.257c0.344,0.082,0.685,0.194,1.015,0.323c0.197,0.087,0.392,0.177,0.581,0.281
	c0.157,0.086,0.3,0.191,0.446,0.291c-0.002,0.021-0.013,0.039-0.013,0.061c-0.007,0.386-0.013,0.769-0.053,1.153
	c-0.066,0.438-0.16,0.873-0.312,1.288c-0.071,0.155-0.151,0.304-0.246,0.445c-0.026,0.03-0.052,0.059-0.078,0.087
	c-0.292,0.317-0.316,0.806,0,1.122c0.287,0.287,0.841,0.329,1.12,0c0.292-0.342,0.506-0.706,0.681-1.12
	c0.19-0.448,0.321-0.91,0.41-1.387c0.011-0.059,0.013-0.118,0.023-0.177c0.022,0.028,0.046,0.054,0.068,0.082
	c0.265,0.354,0.516,0.714,0.704,1.114c0.134,0.354,0.269,0.711,0.383,1.072c0.109,0.352,0.18,0.711,0.242,1.075
	C28.531,12.555,28.521,13.02,28.494,13.493z"/>
                        </Svg>
                        </View>
                        <View>
                            <Text>Knowledge</Text>
                        </View>
                    </View>
                    <View style={styles.knowledgeContainer}>
                        {data?.knowledge?.map((item, i) => (
                            <View style={styles.knowledgeProperty}>
                                <Text>{item.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View fixed={true} style={styles.resumeDetails}>
                    <Text style={styles.about}>
                        About Me
                    </Text>
                    <Svg style={styles.lineSvg}>
                        <Line
                            x1="0"
                            y1="0"
                            x2="130"
                            y2="0"
                            strokeWidth={3}
                            stroke="rgb(255,0,0)"
                        />
                    </Svg>
                    <Text style={styles.aboutDescription}>
                        {data?.about?.description}
                    </Text>
                    <Text style={styles.aboutShortDescription}>
                        {data?.about?.short_description}
                    </Text>

                    <View style={styles.ExperienceSection}>
                        <View style={styles.EducationSectionSVGContainer}>
                            <View style={styles.EducationSectionSVG}>
                                <Svg viewBox="0 0 24 24">
                                    <Path d="M0 0h24v24H0V0z" fill="none"/>
                                    <Path stroke={accentThree} fill={accentThree}
                                          d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                </Svg>
                            </View>
                            <View>
                                <Text>Education</Text>
                            </View>
                        </View>
                        {data?.educations?.map((item, i) => (
                            <View style={[styles.ExperienceProperty, {
                                background: `${isDarkTheme ? "rgb(59 59 59 / 1)" : item?.bg}`,
                                backgroundColor: `${isDarkTheme ? "rgb(59 59 59 / 1)" : item?.bg}`,
                            }]}>
                                <Text style={styles.ExperiencePropertyDate}>{item.date}</Text>
                                <Text style={styles.ExperiencePropertyTitle}>{item.title}</Text>
                                <Text style={styles.ExperiencePropertyPlace}>{item.place}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.ExperienceSection}>
                        <View style={styles.EducationSectionSVGContainer}>
                            <View style={styles.EducationSectionSVG}>
                                <Svg viewBox="0 0 24 24">
                                    <Path d="M0 0h24v24H0V0z" fill="none"/>
                                    <Path stroke={accentThree} fill={accentThree}
                                          d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v5c0 .75.4 1.38 1 1.73V19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-3.28c.59-.35 1-.99 1-1.72V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zM4 9h16v5h-5v-3H9v3H4V9zm9 6h-2v-2h2v2zm6 4H5v-3h4v1h6v-1h4v3z"/>
                                </Svg>
                            </View>
                            <View>
                                <Text>Experiences</Text>
                            </View>
                        </View>
                        {data?.experiences?.map((item, i) => (
                            <View style={[styles.ExperienceProperty, {
                                background: `${isDarkTheme ? "rgb(59 59 59 / 1)" : item?.bg}`,
                                backgroundColor: `${isDarkTheme ? "rgb(59 59 59 / 1)" : item?.bg}`
                            }]}>
                                <Text style={styles.ExperiencePropertyDate}>{item.date}</Text>
                                <Text style={styles.ExperiencePropertyTitle}>{item.title}</Text>
                                <Text style={styles.ExperiencePropertyPlace}>{item.place}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Page>
    </Document>)
};
export default MyDocument;
