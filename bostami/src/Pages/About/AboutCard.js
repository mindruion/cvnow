import React, {useMemo} from "react";
import icon from "../../assets/images/icons/icon-1.svg";
import icon1 from "../../assets/images/icons/icon-2.svg";
import icon2 from "../../assets/images/icons/icon-3.svg";
import icon3 from "../../assets/images/icons/icon-4.svg";
import icon4 from "../../assets/images/icons/icon-5.svg";
import icon5 from "../../assets/images/icons/icon-6.svg";

const SERVICE_ICON_MAP = [
  {keywords: ["ui", "ux", "interface", "design", "prototype"], asset: icon},
  {keywords: ["app", "mobile", "ios", "android", "react native", "flutter"], asset: icon1},
  {keywords: ["photo", "photography", "camera", "retouch", "edit"], asset: icon2},
  {keywords: ["video", "motion", "media", "animation", "film", "visual"], asset: icon3},
  {keywords: ["manage", "project", "strategy", "consult", "plan", "lead"], asset: icon4},
  {keywords: ["web", "develop", "code", "frontend", "backend", "fullstack", "javascript"], asset: icon5},
  {keywords: ["brand", "identity", "logo", "marketing", "campaign"], asset: icon},
  {keywords: ["illustration", "art", "drawing", "sketch"], asset: icon2},
  {keywords: ["seo", "search", "optimize", "traffic"], asset: icon4},
  {keywords: ["content", "writing", "copy", "blog"], asset: icon3},
  {keywords: ["data", "analytics", "dashboard", "insight"], asset: icon5},
  {keywords: ["cloud", "aws", "azure", "devops", "infrastructure"], asset: icon5},
  {keywords: ["security", "audit", "pentest", "compliance"], asset: icon4},
  {keywords: ["training", "workshop", "coaching", "mentoring"], asset: icon4},
  {keywords: ["support", "maintenance", "bug", "fix"], asset: icon1},
  {keywords: ["ecommerce", "shop", "store", "checkout"], asset: icon5},
];

const getServiceIcon = (title = "") => {
  const normalized = title.toLowerCase();
  const match = SERVICE_ICON_MAP.find(({keywords}) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.asset || icon4;
};

const AboutCard = ({ item, local }) => {
  const resolvedIcon = useMemo(() => getServiceIcon(item?.title), [item?.title]);

  return (
    <div
      style={{ background: `${local === "dark" ? "transparent" : item?.bg}` }}
      className="about-box dark:bg-transparent"
    >
      <img className="w-10 h-10 object-contain  block" src={resolvedIcon} alt="" />

      <div className="space-y-2">
        <h3 className="dark:text-white text-2xl font-semibold">
          {item?.title}
        </h3>
        <p className=" leading-8 text-gray-lite dark:text-[#A6A6A6]">
          {item?.description || item?.des}
        </p>
      </div>
    </div>
  );
};
export default AboutCard;
