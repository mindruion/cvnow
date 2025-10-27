import {useCallback, useEffect, useMemo, useState} from "react";
// for work_images
import work1 from "../assets/images/work_images/1.jpg";
import work2 from "../assets/images/work_images/2.jpg";
import work3 from "../assets/images/work_images/3.jpg";
import work4 from "../assets/images/work_images/4.jpg";
import work5 from "../assets/images/work_images/5.jpg";
import work6 from "../assets/images/work_images/6.jpg";
import work7 from "../assets/images/work_images/7.jpg";
import work8 from "../assets/images/work_images/8.jpg";
import work9 from "../assets/images/work_images/9.jpg";
// works small images
import workSmall1 from "../assets/images/work_images/small/1.jpg";
import workSmall2 from "../assets/images/work_images/small/2.jpg";
import workSmall3 from "../assets/images/work_images/small/3.jpg";
import workSmall4 from "../assets/images/work_images/small/4.jpg";
import workSmall5 from "../assets/images/work_images/small/5.jpg";
import workSmall6 from "../assets/images/work_images/small/6.jpg";
import workSmall7 from "../assets/images/work_images/small/7.jpg";
import workSmall8 from "../assets/images/work_images/small/8.jpg";
import workSmall9 from "../assets/images/work_images/small/9.jpg";
// blog post images
import blog6 from "../assets/images/blog_images/6.jpg";
import blog4 from "../assets/images/blog_images/4.jpg";
import blog2 from "../assets/images/blog_images/2.jpg";
import blog1 from "../assets/images/blog_images/1.jpeg";
import blog3 from "../assets/images/blog_images/3.jpg";
import blog5 from "../assets/images/blog_images/5.jpg";
// blog image small
import blogSmall6 from "../assets/images/blog_images/small/6.jpg";
import blogSmall4 from "../assets/images/blog_images/small/4.jpg";
import blogSmall2 from "../assets/images/blog_images/small/2.jpg";
import blogSmall1 from "../assets/images/blog_images/small/1.jpg";
import blogSmall3 from "../assets/images/blog_images/small/3.jpg";
import blogSmall5 from "../assets/images/blog_images/small/5.jpg";

import img1 from "../assets/images/slider/brand-1.png";
import img2 from "../assets/images/slider/brand-2.png";
import img3 from "../assets/images/slider/brand-3.png";
import img4 from "../assets/images/slider/brand-4.png";
import img5 from "../assets/images/slider/brand-5.png";
//  icon use as img here
import icon from "../assets/images/icons/icon-1.svg";
import icon1 from "../assets/images/icons/icon-2.svg";
import icon2 from "../assets/images/icons/icon-3.svg";
import icon3 from "../assets/images/icons/icon-4.svg";
import icon4 from "../assets/images/icons/icon-5.svg";
import icon5 from "../assets/images/icons/icon-6.svg";
// contact image
import iconPhone from "../assets/images/contact/phone-call 1.png";
import iconEmail from "../assets/images/contact/email 1.png";
import iconMap from "../assets/images/contact/map 1.png";
import {CgNotes} from "react-icons/cg";
import {FaBlogger, FaRegUser, FaAward} from "react-icons/fa";
import {AiOutlineHome} from "react-icons/ai";
import {FiCodesandbox} from "react-icons/fi";
import {RiContactsBookLine} from "react-icons/ri";
import {Link, useLocation} from "react-router-dom";

import {MdOutlineBusinessCenter, MdOutlineSchool} from "react-icons/md";
import {defaultConfig, defaultTheme, THEME_STORAGE_KEY} from "../config/defaultConfig.js";
import {fetchTenantJson} from "../config/api.js";
import {getThemeDefinition} from "../themes";

const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const mergeDeep = (target = {}, source = {}) => {
    if (!isObject(target)) {
        return source;
    }

    const output = {...target};
    if (!isObject(source)) {
        return output;
    }

    Object.keys(source).forEach((key) => {
        const sourceValue = source[key];
        const targetValue = output[key];
        if (Array.isArray(sourceValue)) {
            output[key] = [...sourceValue];
        } else if (isObject(sourceValue)) {
            output[key] = mergeDeep(targetValue || {}, sourceValue);
        } else if (sourceValue !== undefined) {
            output[key] = sourceValue;
        }
    });

    return output;
};

const toCssVarName = (key) => key.replace(/([A-Z])/g, "-$1").toLowerCase();

const getPaletteForMode = (themeConfig, mode) => {
    if (!themeConfig) {
        return defaultTheme.modes[mode] || defaultTheme.modes.light;
    }

    if (themeConfig.modes && themeConfig.modes[mode]) {
        return themeConfig.modes[mode];
    }

    if (themeConfig.colors) {
        return themeConfig.colors;
    }

    if (themeConfig.modes && themeConfig.modes.light) {
        return themeConfig.modes.light;
    }

    return defaultTheme.modes[mode] || defaultTheme.modes.light;
};

const buildGradientString = (gradientConfig, fallbackStops, fallbackAngle = 135) => {
    if (!gradientConfig && fallbackStops?.length >= 2) {
        return `linear-gradient(${fallbackAngle}deg, ${fallbackStops[0]} 0%, ${fallbackStops[1]} 100%)`;
    }

    if (!gradientConfig) {
        return null;
    }

    const angle = gradientConfig.angle ?? fallbackAngle;
    const stopsConfig = gradientConfig.stops && gradientConfig.stops.length > 0
        ? gradientConfig.stops
        : fallbackStops;

    if (!stopsConfig || stopsConfig.length === 0) {
        return null;
    }

    const stops = stopsConfig
        .map((stop, index) => {
            if (typeof stop === "string") {
                const position = index === 0 ? "0%" : "100%";
                return `${stop} ${position}`;
            }

            if (isObject(stop)) {
                const color = stop.color || stop.value || fallbackStops?.[index] || fallbackStops?.[0];
                if (!color) {
                    return null;
                }
                const position =
                    stop.position ||
                    stop.stop ||
                    (typeof stop.percent === "number" ? `${stop.percent}%` : index === 0 ? "0%" : "100%");
                return `${color} ${position}`;
            }

            return null;
        })
        .filter(Boolean);

    if (stops.length < 2) {
        return null;
    }

    return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
};

const applyThemeToDocument = (themeConfig, mode) => {
    if (typeof document === "undefined") {
        return;
    }

    const palette = getPaletteForMode(themeConfig, mode);
    const fallbackPalette =
        defaultTheme.modes[mode] || defaultTheme.modes.light || defaultTheme.modes.dark;
    const root = document.documentElement;

    if (mode === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }

    const paletteToApply = {
        primary: palette.primary || fallbackPalette.primary,
        secondary: palette.secondary || fallbackPalette.secondary,
        background: palette.background || fallbackPalette.background,
        surface: palette.surface || fallbackPalette.surface,
        surfaceMuted: palette.surfaceMuted || palette.surface || fallbackPalette.surfaceMuted || fallbackPalette.surface,
        surfaceElevation:
            palette.surfaceElevation || palette.surface || fallbackPalette.surfaceElevation || fallbackPalette.surface,
        text: palette.text || fallbackPalette.text,
        textMuted: palette.textMuted || fallbackPalette.textMuted,
        border: palette.border || fallbackPalette.border,
        emphasis: palette.emphasis || fallbackPalette.emphasis || fallbackPalette.text,
    };

    Object.entries(paletteToApply).forEach(([key, value]) => {
        if (value) {
            root.style.setProperty(`--color-${toCssVarName(key)}`, value);
        }
    });

    const variants = themeConfig?.paletteVariants || defaultTheme.paletteVariants;
    variants.forEach((color, index) => {
        if (color) {
            root.style.setProperty(`--color-variant-${index + 1}`, color);
        }
    });

    const gradientStops = [palette.primary || fallbackPalette.primary, palette.secondary || fallbackPalette.secondary];
    const gradient = buildGradientString(themeConfig?.gradients?.primary, gradientStops);
    const hoverGradient = buildGradientString(
        themeConfig?.gradients?.primaryHover,
        gradientStops.slice().reverse()
    );

    if (gradient) {
        root.style.setProperty("--gradient-primary", gradient);
    }
    if (hoverGradient) {
        root.style.setProperty("--gradient-primary-hover", hoverGradient);
    }
};

const loadPersistedThemeMode = () => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        console.warn("Failed to read theme from storage", error);
        return null;
    }
};

const persistThemeMode = (mode) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
        console.warn("Failed to persist theme mode", error);
    }
};

const AllData = () => {
    const [config, setConfig] = useState(defaultConfig);
    const [themeMode, setThemeMode] = useState(
        () => loadPersistedThemeMode() || defaultConfig.theme.mode
    );
    const [singleData, setSingleData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [apiData, setApiData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const activeThemeId = config?.theme?.id || defaultTheme.id || "bostami";
    const themeDefinition = useMemo(
        () => getThemeDefinition(activeThemeId),
        [activeThemeId]
    );
    const effectiveTheme = useMemo(
        () => mergeDeep(themeDefinition.theme || {}, config.theme || {}),
        [themeDefinition, config.theme]
    );
    const effectiveLayout = useMemo(
        () => mergeDeep(themeDefinition.layout || {}, config.layout || {}),
        [themeDefinition, config.layout]
    );
    const effectiveFeatures = useMemo(
        () => mergeDeep(themeDefinition.features || {}, config.features || {}),
        [themeDefinition, config.features]
    );

    const paletteVariants = useMemo(
        () => effectiveTheme.paletteVariants || defaultTheme.paletteVariants,
        [effectiveTheme]
    );
    const themePalette = useMemo(
        () => getPaletteForMode(effectiveTheme, themeMode),
        [effectiveTheme, themeMode]
    );

    useEffect(() => {
        const availableModes = effectiveTheme?.modes
            ? Object.keys(effectiveTheme.modes)
            : [];
        if (availableModes.length > 0 && !availableModes.includes(themeMode)) {
            const fallbackMode = effectiveTheme.mode || availableModes[0];
            if (fallbackMode !== themeMode) {
                setThemeMode(fallbackMode);
            }
        }
    }, [effectiveTheme, themeMode]);

    useEffect(() => {
        applyThemeToDocument(effectiveTheme, themeMode);
    }, [effectiveTheme, themeMode]);

    const updateLayout = useCallback((layoutUpdates) => {
        setConfig((prev) => {
            const incoming =
                typeof layoutUpdates === "function"
                    ? layoutUpdates(prev.layout)
                    : layoutUpdates;
            return {
                ...prev,
                layout: mergeDeep(prev.layout, incoming || {}),
            };
        });
    }, []);

    const handleTheme = useCallback(
        (value) => {
            let nextMode = value;
            if (!nextMode || nextMode === "toggle") {
                nextMode = themeMode === "dark" ? "light" : "dark";
            }

            if (nextMode !== "dark" && nextMode !== "light") {
                nextMode = defaultConfig.theme.mode;
            }

            setThemeMode(nextMode);
            if (effectiveFeatures?.persistThemeMode) {
                persistThemeMode(nextMode);
            }
            setConfig((prev) => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    mode: nextMode,
                },
            }));
        },
        [themeMode, effectiveFeatures]
    );

    const toggleTheme = useCallback(() => {
        handleTheme(themeMode === "dark" ? "light" : "dark");
    }, [handleTheme, themeMode]);

    const refreshConfig = useCallback(async () => {
        if (typeof window !== "undefined" && window.location?.pathname === "/404") {
            return;
        }

        setLoading(true);
        
        // Add minimum loading time to ensure skeleton shows
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            const [configResult, dataResult] = await Promise.allSettled([
                fetchTenantJson((tenant) => (tenant ? `/api/config/${tenant}` : "/api/config"), {}, {withToken: true}),
                fetchTenantJson((tenant) => (tenant ? `/api/${tenant}` : "/api"), {}, {withToken: true}),
            ]);

            let resolvedConfig = defaultConfig;
            if (configResult.status === "fulfilled" && configResult.value) {
                resolvedConfig = mergeDeep(defaultConfig, configResult.value);
            }
            setConfig(resolvedConfig);

            if (dataResult.status === "fulfilled" && dataResult.value) {
                setApiData(dataResult.value);
            } else {
                setApiData({});
            }

            const remoteThemeMode =
                (configResult.status === "fulfilled" && configResult.value?.theme?.mode) ||
                (dataResult.status === "fulfilled" && dataResult.value?.theme) ||
                resolvedConfig.theme?.mode;

            const persisted = loadPersistedThemeMode();
            const nextMode =
                persisted ||
                remoteThemeMode ||
                themeMode ||
                defaultConfig.theme.mode;

            setThemeMode(nextMode);
            if (resolvedConfig.features?.persistThemeMode && persisted !== nextMode) {
                persistThemeMode(nextMode);
            }

            setError(null);
        } catch (err) {
            console.error("Failed to load application data", err);
            setError(err);
            setConfig(defaultConfig);
            const fallbackMode = loadPersistedThemeMode() || defaultConfig.theme.mode;
            setThemeMode(fallbackMode);
        } finally {
            // Wait for minimum loading time before setting loading to false
            await minLoadingTime;
            setLoading(false);
        }
    }, [themeMode]);

    useEffect(() => {
        refreshConfig();
    }, [refreshConfig]);

    const isDarkMode = themeMode === "dark";
    const check = isDarkMode;
    const local = themeMode;

    // Active navlinks function
    function NavLink({
                         to,
                         className,
                         activeClassName,
                         inactiveClassName,
                         ...rest
                     }) {
        let location = useLocation();
        let isActive = location.pathname === to;
        let allClassNames =
            className + (isActive ? `${activeClassName}` : `${inactiveClassName}`);
        return <Link className={allClassNames} to={to} {...rest} />;
    }

    // Elements for portfolio section
    const defaultPortfolioItems = useMemo(
        () => [
            {
                id: "1",
                tag: "UI/UX",
                title: "Chul urina",
                img: work1,
                imgSmall: workSmall1,
                bg: "#FFF0F0",
                client: "Envato",
                langages: "Photoshop, Figma",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Mollitia placeat magnam possimus iusto blanditiis pariatur labore explicabo quo repellat hic dolorum numquam asperiores, voluptatum fugiat reiciendis aspernatur, non, odio aperiam voluptas ex tempora vitae. Dolor, consequatur quidem! Quas magni distinctio dolorum dolore natus, vel numquam accusamus. Nostrum eligendi recusandae qui tempore deserunt!",
            },
            {
                id: "2",
                tag: "Web Design",
                title: "Aura Dione",
                img: work2,
                imgSmall: workSmall2,
                bg: "#FFF3FC",
                client: "Themeforest",
                langages: "HTML, CSS, Javascript",
                link: "https://www.themeforest.net",
                linkText: "themeforest.net",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "3",
                tag: "Logo",
                title: "Chul urina",
                img: work3,
                imgSmall: workSmall3,
                bg: "#FFF0F0",
                client: "Freepik",
                langages: "Illustrator",
                link: "https://www.freepik.com/free-photos-vectors/market-logo",
                linkText: "www.freepik.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "4",
                tag: "Video",
                title: "Chul urina",
                img: work4,
                imgSmall: workSmall4,
                bg: "#E9FAFF",
                client: "Envato",
                langages: "After Effect",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "5",
                tag: "UI/UX",
                title: "Chul urina",
                img: work5,
                imgSmall: workSmall5,
                bg: "#FFFAE9",
                client: "Envato",
                langages: "Photoshop",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "6",
                tag: "Video",
                title: "Chul urina",
                img: work6,
                imgSmall: workSmall6,
                bg: "#F4F4FF",
                client: "Envato",
                langages: "Vimeo",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "7",
                tag: "UI/UX",
                title: "Chul urina",
                img: work7,
                imgSmall: workSmall7,
                bg: "#FFF0F8",
                client: "Envato",
                langages: "Photoshop",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "8",
                tag: "Web Design",
                title: "Chul urina",
                img: work8,
                imgSmall: workSmall8,
                bg: "#FFF0F8",
                client: "Envato",
                langages: "HTML, CSS, Javascript",
                link: "https://www.envato.com",
                linkText: "www.envato.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
            {
                id: "9",
                tag: "Logo",
                title: "Chul urina",
                img: work9,
                imgSmall: workSmall9,
                bg: "#FCF4FF",
                client: "Feepik",
                langages: "Figma",
                link: "https://www.freepik.com/free-photos-vectors/market-logo",
                linkText: "www.freepik.com",
                description:
                    "  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate non suscipit voluptatibus minima ullam maiores sequi nihil placeat error, vero eaque doloremque reiciendis amet pariatur consequuntur. Nostrum, dolore, amet eligendi ipsam enim quisquam, corrupti asperiores nihil excepturi aspernatur placeat iure.",
            },
        ],
        []
    );

    const remotePortfolioItems = useMemo(
        () => apiData?.works || apiData?.portfolio || apiData?.portfolios || [],
        [apiData]
    );

    const workItems = useMemo(() => {
        if (Array.isArray(remotePortfolioItems) && remotePortfolioItems.length > 0) {
            return remotePortfolioItems;
        }
        return defaultPortfolioItems.map((item, index) => ({
            ...item,
            bg: paletteVariants[index % paletteVariants.length] || item.bg,
        }));
    }, [remotePortfolioItems, defaultPortfolioItems, paletteVariants]);
    const [data, setData] = useState(workItems);

    useEffect(() => {
        setData(workItems);
    }, [workItems]);

    // Elements for Blogs section
    const defaultBlogs = useMemo(
        () => [
            {
                id: "1",
                img: blog1,
                imgSmall: blogSmall1,
                date: "177 April",
                category: "Inspiration",
                title: "How to Own Your Audience by Creating an Email List.",
                bg: "#FCF4FF",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
            {
                id: "4",
                img: blog4,
                imgSmall: blogSmall4,
                date: "000 April",
                category: "Inspiration",
                title: "Everything You Need to Know About Web Accessibility.",
                bg: "#EEFBFF",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
            {
                id: "2",
                img: blog2,
                imgSmall: blogSmall2,
                date: "21 April",
                category: "Web Design",
                title: "The window know to say beside you",
                bg: "#FFF0F0",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
            {
                id: "5",
                img: blog5,
                imgSmall: blogSmall5,
                date: "27 April",
                category: "Inspiration",
                title: "Top 10 Toolkits for Deep Learning in 2021.",
                bg: "#FCF4FF",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
            {
                id: "3",
                img: blog3,
                imgSmall: blogSmall3,
                date: "27 April",
                category: "Inspiration",
                title: "How to Own Your Audience by Creating an Email List.",
                bg: "#FCF4FF",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
            {
                id: "6",
                img: blog6,
                imgSmall: blogSmall6,
                date: "27 April",
                category: "Inspiration",
                title: "Everything You Need to Know About Web Accessibility.",
                bg: "#EEFBFF",
                description:
                    "Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum conseqr quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consetur quo obcaecati rerum sit non. Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur. \n Lorem ipsum dolor, sit amet consectetur adipisicing  elit. Fuga consequatur delectus porro sapiente molestias, magni quasi sed, enim corporis omnis doloremque soluta inventore dolorum consequuntur quo obcaecati rerum sit non. ",
            },
        ],
        []
    );

    const remoteBlogs = useMemo(() => apiData?.blogs || [], [apiData]);

    const blogsData = useMemo(() => {
        if (Array.isArray(remoteBlogs) && remoteBlogs.length > 0) {
            return remoteBlogs;
        }
        return defaultBlogs.map((item, index) => ({
            ...item,
            bg: paletteVariants[index % paletteVariants.length] || item.bg,
        }));
    }, [remoteBlogs, defaultBlogs, paletteVariants]);

    // Menu items for Homepage One
    const menuItem = [
        {
            id: "01",
            name: "Home",
            link: "/home/homePage",
            icon: <AiOutlineHome/>,
        },
        {
            id: "02",
            name: "About",
            link: "/home/about",
            icon: <FaRegUser/>,
        },
        {
            id: "06",
            name: "Resume",
            link: "/home/resume",
            icon: <CgNotes/>,
        },
        {
            id: "03",
            name: "Works",
            link: "/home/works",
            icon: <FiCodesandbox/>,
        },
        {
            id: "04",
            name: "Blogs",
            link: "/home/blogs",
            icon: <FaBlogger/>,
        },
        {
            id: "05",
            name: "Contact",
            link: "/home/contact",
            icon: <RiContactsBookLine/>,
        },
    ];

    // Menu items for Homepage Two
    const menuItemTwo = [
        {
            id: "01",
            name: "About",
            link: "/about",
            icon: <FaRegUser/>,
        },
        {
            id: "02",
            name: "Resume",
            link: "/resume",
            icon: <CgNotes/>,
        },
        {
            id: "03",
            name: "Blogs",
            link: "/blogs",
            icon: <FaBlogger/>,
        },
        {
            id: "05",
            name: "Contact",
            link: "/contact",
            icon: <RiContactsBookLine/>,
        },
    ];

    // Slider image for Clients
    const sliderImg = [
        img1,
        img2,
        img3,
        img4,
        img5,
        img1,
        img2,
        img3,
        img4,
        img5,
    ];

    // experience items for about page
    const defaultExperienceItems = useMemo(
        () => [
            {
                id: "1",
                icon: icon,
                title: "Ui/Ux Design",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#D566FF",
                bg: "#FCF4FF",
            },
            {
                id: "2",
                icon: icon1,
                title: "App Development",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#DDA10C",
                bg: "#FEFAF0",
            },
            {
                id: "3",
                icon: icon2,
                title: "Photography",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#8774FF",
                bg: "#FCF4FF",
            },
            {
                id: "4",
                icon: icon3,
                title: "Photography",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#FF6080",
                bg: "#FFF4F4",
            },
            {
                id: "5",
                icon: icon4,
                title: "Managment",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#FF75D8",
                bg: "#FFF0F8",
            },
            {
                id: "6",
                icon: icon5,
                title: "Web Development",
                des: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat.",
                color: "#269FFF",
                bg: "#F3FAFF",
            },
        ],
        []
    );

    const experienceArray = useMemo(
        () =>
            defaultExperienceItems.map((item, index) => {
                const bgVariant = paletteVariants[index % paletteVariants.length] || item.bg;
                const colorVariant =
                    paletteVariants[(index + 1) % paletteVariants.length] || item.color;
                return {
                    ...item,
                    bg: bgVariant,
                    color: colorVariant,
                };
            }),
        [defaultExperienceItems, paletteVariants]
    );

    // Resume items for Resume page
    const defaultResumeItems = useMemo(
        () => [
            {
                type: "Education",
                icon: MdOutlineSchool,
                id: "01",
                date: "2021-2023",
                title: "Ph.D in Horriblensess ",
                place: "ABC University, Los Angeles, CA",
                bg: "#FFF4F4",

                id1: "02",
                date1: "2019 - Present",
                title1: "Sr. Software Tester",
                place1: "Google Inc.",
                bg1: "#FFF1FB",

                id2: "03",
                date2: "2021",
                title2: "Best Developer ",
                place2: "University Of Melbourne, NA",
                bg2: "#FFF4F4",
            },
            {
                type: "Experience",
                icon: MdOutlineBusinessCenter,
                id: "04",
                date: "2017-2021",
                title: "Computer Science",
                place: "Imperialize Technical Institute",
                bg: "#EEF5FA",

                id1: "05",
                date1: "2015-2017",
                title1: "Cr. Web Developer",
                place1: "ib-themes ltd.",
                bg1: "#F2F4FF",

                id2: "06",
                date2: "2008",
                title2: "Best Writter",
                place2: "Online Typodev Soluation Ltd.",
                bg2: "#EEF5FA",
            },
            {
                type: "Awards",
                icon: FaAward,
                id: "07",
                date: "2015-2017",
                title: "  Graphic Designer",
                place: "Web Graphy, Los Angeles, CA",
                bg: "#FCF4FF",

                id1: "08",
                date1: "2014 - 2015",
                title1: "Jr. Web Developer",
                place1: "Creative Gigs.",
                bg1: "#FCF9F2",

                id2: "09",
                date2: "2015-2017",
                title2: "Best Freelancer",
                place2: "Fiver & Upwork Level 2 & Top Rated",
                bg2: "#FCF4FF",
            },
        ],
        []
    );

    const resumeArray = useMemo(
        () =>
            defaultResumeItems.map((item, index) => {
                const bg0 = paletteVariants[index % paletteVariants.length] || item.bg;
                const bg1 =
                    paletteVariants[(index + 1) % paletteVariants.length] || item.bg1;
                const bg2 =
                    paletteVariants[(index + 2) % paletteVariants.length] || item.bg2;
                return {
                    ...item,
                    bg: bg0,
                    bg1,
                    bg2,
                };
            }),
        [defaultResumeItems, paletteVariants]
    );

    // Working Skills items for Resume page
    const defaultSkillLines = useMemo(
        () => [
            {
                id: "01",
                color: "#FF6464",
                name: "Web Design",
                number: "80",
            },
            {
                id: "02",
                color: "#9272D4",
                name: "Mobile App ",
                number: "95",
            },
            {
                id: "03",
                color: "#5185D4",
                name: "Illustrator",
                number: "65",
            },
            {
                id: "03",
                color: "#CA56F2",
                name: "Photoshope",
                number: "75",
            },
        ],
        []
    );

    const lineArray = useMemo(
        () =>
            defaultSkillLines.map((item, index) => ({
                ...item,
                color: paletteVariants[index % paletteVariants.length] || item.color,
            })),
        [defaultSkillLines, paletteVariants]
    );

    // Personal information for contact pages
    const defaultContactItems = useMemo(
        () => [
            {
                id: "01",
                icon: iconPhone,
                title: "Phone ",
                item1: "+452 666 386",
                item2: "+452 666 386",
                bg: "#FCF4FF",
            },
            {
                id: "02",
                icon: iconEmail,
                title: "Email ",
                item1: "support@gmail.com",
                item2: "example@gmail.com",
                bg: "#EEFBFF",
            },
            {
                id: "03",
                icon: iconMap,
                title: "Address ",
                item1: "Maount View, Oval",
                item2: "Road, New York, USA",
                bg: "#F2F4FF",
            },
        ],
        []
    );

    const contactArray = useMemo(
        () =>
            defaultContactItems.map((item, index) => ({
                ...item,
                bg: paletteVariants[index % paletteVariants.length] || item.bg,
            })),
        [defaultContactItems, paletteVariants]
    );

    const handleData = useCallback(
        (text) => {
            if (!text || text === "All") {
                setData(workItems);
                return;
            }
            const filtered = workItems.filter(
                (item) => item.tag?.toLowerCase() === text.toLowerCase()
            );
            setData(filtered);
        },
        [workItems]
    );

    const handleModelData = useCallback(
        (id) => {
            const find = workItems.find((item) => String(item?.id) === String(id));
            if (find) {
                setSingleData(find);
                setIsOpen(true);
            }
        },
        [workItems]
    );

    const handleBlogsData = useCallback(
        (id) => {
            const source =
                Array.isArray(apiData?.blogs) && apiData.blogs.length > 0
                    ? apiData.blogs
                    : blogsData;
            const find = source?.find((item) => String(item?.id) === String(id));
            if (find) {
                setSingleData(find);
                setIsOpen(true);
            }
        },
        [apiData?.blogs, blogsData]
    );

    return {
        config,
        setConfig,
        layout: effectiveLayout,
        features: effectiveFeatures,
        theme: {
            id: activeThemeId,
            mode: themeMode,
            palette: themePalette,
            variants: paletteVariants,
            backgroundOverlay:
                effectiveTheme.backgroundOverlay || defaultTheme.backgroundOverlay,
            availableThemes:
                effectiveTheme.availableThemes || defaultTheme.availableThemes,
            animations:
                effectiveTheme.animations ||
                effectiveFeatures.animations ||
                defaultTheme.animations,
        },
        themeDefinition,
        activeThemeId,
        availableThemes:
            effectiveTheme.availableThemes || defaultTheme.availableThemes,
        animations:
            effectiveFeatures.animations ||
            effectiveTheme.animations ||
            defaultTheme.animations,
        themeMode,
        isDarkMode,
        handleTheme,
        toggleTheme,
        refreshConfig,
        updateLayout,
        loading,
        error,
        check,
        local,
        handleData,
        data,
        workItems,
        singleData,
        handleModelData,
        isOpen,
        setIsOpen,
        blogsData,
        handleBlogsData,
        menuItem,
        NavLink,
        menuItemTwo,
        experienceArray,
        sliderImg,
        resumeArray,
        lineArray,
        contactArray,
        apiData,
    };
};

export default AllData;
