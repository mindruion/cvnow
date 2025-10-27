import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import fallbackAvatar from "../../assets/images/about/avatar.jpg";

const PAGE_WIDTH = 595; // A4 width in points
const PAGE_HEIGHT = 842; // A4 height in points

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
  const paletteColors = colors && colors.length ? colors : ["#FFFFFF"];
  const points = [];

  for (let index = 0; index < count; index += 1) {
    const size = 3 + random() * 7;
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

const createStyles = (palette = {}) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: palette.background || "#0B0C10",
      color: palette.text || "#F5F5F5",
      padding: 0,
      fontFamily: "Helvetica",
      letterSpacing: 0.1,
      position: "relative",
      overflow: "hidden",
    },
    pageContent: {
      position: "relative",
      zIndex: 1,
      flexDirection: "column",
      flex: 1,
    },
    backgroundOverlay: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
    },
    backgroundPoint: {
      position: "absolute",
      borderRadius: 9999,
    },
    // Header Section - Compact and professional
    header: {
      flexDirection: "row",
      backgroundColor: palette.primary || "#FF4C60",
      padding: 30,
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      flex: 1,
      paddingRight: 20,
    },
    name: {
      fontSize: 28,
      fontWeight: 800,
      color: "#FFFFFF",
      marginBottom: 5,
      letterSpacing: -0.5,
    },
    profession: {
      fontSize: 16,
      fontWeight: 500,
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: 8,
    },
    shortDescription: {
      fontSize: 12,
      color: "rgba(255, 255, 255, 0.8)",
      lineHeight: 1.4,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: "#FFFFFF",
    },
    // Contact Bar - Horizontal
    contactBar: {
      flexDirection: "row",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      paddingVertical: 12,
      paddingHorizontal: 30,
      justifyContent: "space-around",
      borderBottomWidth: 1,
      borderBottomColor: palette.border || "#2E3442",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      fontSize: 10,
      color: palette.textMuted || "#A0A8B5",
    },
    contactIcon: {
      marginRight: 6,
      fontSize: 12,
    },
    // Main Content - Two Column Layout
    mainContent: {
      flexDirection: "row",
      flex: 1,
    },
    leftColumn: {
      width: "40%",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      padding: 25,
      borderRightWidth: 1,
      borderRightColor: palette.border || "#2E3442",
    },
    rightColumn: {
      width: "60%",
      padding: 25,
    },
    // Section Styles
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: palette.primary || "#FF4C60",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 2,
      borderBottomColor: palette.primary || "#FF4C60",
      paddingBottom: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitleLarge: {
      fontSize: 16,
      fontWeight: 700,
      color: palette.primary || "#FF4C60",
      marginBottom: 15,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 2,
      borderBottomColor: palette.primary || "#FF4C60",
      paddingBottom: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    sectionIcon: {
      marginRight: 8,
      fontSize: 12,
      color: palette.primary || "#FF4C60",
    },
    // About Section
    aboutText: {
      fontSize: 11,
      lineHeight: 1.5,
      color: palette.textMuted || "#A0A8B5",
      marginBottom: 15,
    },
    // Skills Section
    skillItem: {
      marginBottom: 10,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    skillRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    skillName: {
      fontSize: 10,
      color: palette.text || "#F5F5F5",
      fontWeight: 500,
      flexDirection: "row",
      alignItems: "center",
    },
    skillIcon: {
      marginRight: 6,
      fontSize: 10,
      color: palette.secondary || "#4ACCF7",
    },
    skillPercentage: {
      fontSize: 9,
      color: palette.primary || "#FF4C60",
      fontWeight: 600,
      backgroundColor: "rgba(255, 76, 96, 0.1)",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 3,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
    },
    progressFill: {
      height: "100%",
      backgroundColor: palette.primary || "#FF4C60",
      borderRadius: 2,
    },
    // Knowledge Tags
    knowledgeContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 8,
    },
    knowledgeTag: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: palette.textMuted || "#A0A8B5",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      fontSize: 8,
      marginBottom: 4,
    },
    // Experience Section
    experienceItem: {
      marginBottom: 15,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    experienceTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: palette.emphasis || "#FFFFFF",
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    experienceIcon: {
      marginRight: 6,
      fontSize: 10,
      color: palette.primary || "#FF4C60",
    },
    experienceDuration: {
      fontSize: 9,
      color: palette.textMuted || "#A0A8B5",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    experienceCompany: {
      fontSize: 11,
      color: palette.primary || "#FF4C60",
      fontWeight: 500,
      marginBottom: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    companyIcon: {
      marginRight: 4,
      fontSize: 9,
      color: palette.secondary || "#4ACCF7",
    },
    experienceDescription: {
      fontSize: 10,
      lineHeight: 1.4,
      color: palette.textMuted || "#A0A8B5",
    },
    currentBadge: {
      backgroundColor: palette.primary || "#FF4C60",
      color: "#FFFFFF",
      fontSize: 8,
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 6,
      marginLeft: 4,
    },
    // Education Section
    educationItem: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    educationTitle: {
      fontSize: 11,
      fontWeight: 600,
      color: palette.emphasis || "#FFFFFF",
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    educationIcon: {
      marginRight: 6,
      fontSize: 10,
      color: palette.secondary || "#4ACCF7",
    },
    educationDuration: {
      fontSize: 9,
      color: palette.textMuted || "#A0A8B5",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    educationInstitution: {
      fontSize: 10,
      color: palette.secondary || "#4ACCF7",
      fontWeight: 500,
      marginBottom: 3,
      flexDirection: "row",
      alignItems: "center",
    },
    institutionIcon: {
      marginRight: 4,
      fontSize: 9,
      color: palette.primary || "#FF4C60",
    },
    educationField: {
      fontSize: 9,
      color: palette.textMuted || "#A0A8B5",
      flexDirection: "row",
      alignItems: "center",
    },
    fieldIcon: {
      marginRight: 4,
      fontSize: 8,
      color: palette.textMuted || "#A0A8B5",
    },
    // What I Do Section
    whatIDoItem: {
      marginBottom: 10,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: palette.secondary || "#4ACCF7",
    },
    whatIDoTitle: {
      fontSize: 11,
      fontWeight: 600,
      color: palette.emphasis || "#FFFFFF",
      marginBottom: 3,
    },
    whatIDoDescription: {
      fontSize: 10,
      lineHeight: 1.4,
      color: palette.textMuted || "#A0A8B5",
    },
    // Social Links
    socialContainer: {
      flexDirection: "row",
      gap: 15,
      marginTop: 10,
    },
    socialLink: {
      fontSize: 10,
      color: palette.textMuted || "#A0A8B5",
      textDecoration: "none",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    // Stats Section
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 10,
      padding: 15,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: 700,
      color: palette.primary || "#FF4C60",
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 8,
      color: palette.textMuted || "#A0A8B5",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    // Utility classes
    textMuted: {
      color: palette.textMuted || "#A0A8B5",
    },
    primary: {
      color: palette.primary || "#FF4C60",
    },
    secondary: {
      color: palette.secondary || "#4ACCF7",
    },
    emphasis: {
      color: palette.emphasis || "#FFFFFF",
    },
  });

const RyancvDocument = ({ data, theme }) => {
  const themeMode = theme?.mode || "light";
  const palette = {
    ...(theme?.palette || {}),
  };

  if (themeMode === "dark") {
    palette.background = palette.background || "#050505";
    palette.text = palette.text || "#F5F5F5";
  } else {
    palette.background = palette.surface || palette.background || "#F5F5F5";
    palette.text = palette.text || "#1F2933";
  }

  const variants = theme?.variants || [];

  // Helper function to get variant colors
  const getVariant = (index, fallback) =>
    (variants && variants.length ? variants[index % variants.length] : undefined) || fallback;

  // Enhanced palette with variants
  const enhancedPalette = {
    ...palette,
    variant1: getVariant(0, palette.secondary || "#4ACCF7"),
    variant2: getVariant(1, palette.primary || "#FF4C60"),
    variant3: getVariant(2, "#FFB66D"),
  };

  const styles = createStyles(enhancedPalette);

  const pointColors = [
    enhancedPalette.variant1,
    enhancedPalette.variant2,
    enhancedPalette.variant3,
    enhancedPalette.secondary,
    enhancedPalette.primary,
    themeMode === "dark" ? "#2D3748" : "#E2E8F0",
  ].filter(Boolean);

  const seed = hashStringToSeed(
    `${theme?.id || "theme"}-${themeMode}-${data?.name || "cv"}`
  );
  const pointCount = themeMode === "dark" ? 150 : 120;
  const pointPattern = generatePointPattern(pointCount, seed, pointColors);

  // Extract data with proper fallbacks
  const experiences = Array.isArray(data?.experiences)
    ? data.experiences
    : Array.isArray(data?.experience)
      ? data.experience
      : [];
  const education = Array.isArray(data?.educations)
    ? data.educations
    : Array.isArray(data?.education)
      ? data.education
      : [];
  const workingSkills = Array.isArray(data?.working_skills)
    ? data.working_skills
    : Array.isArray(data?.skills)
      ? data.skills
      : [];
  const languages = Array.isArray(data?.languages) ? data.languages : [];
  const knowledgeEntries = Array.isArray(data?.knowledge) ? data.knowledge : [];
  const knowledge = knowledgeEntries
    .map((item) => (typeof item === "string" ? item : item?.title))
    .filter(Boolean);
  const whatIDo = Array.isArray(data?.what_i_dos)
    ? data.what_i_dos
    : Array.isArray(data?.what_i_do)
      ? data.what_i_do
      : [];

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatRange = (item) => {
    if (item?.date) {
      return item.date;
    }
    const start = formatDate(item?.start_date);
    const end = item?.current ? "Present" : formatDate(item?.end_date);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || "";
  };

  const resolvePercentage = (value) => {
    if (typeof value === "number") {
      return Math.max(0, Math.min(value, 100));
    }
    const rawValue =
      value?.percentage !== undefined
        ? value.percentage
        : value?.value !== undefined
          ? value.value
          : value?.number;

    let candidate = rawValue;
    if (typeof candidate === "string") {
      candidate = Number(candidate.replace(/[^0-9.]/g, ""));
    }

    if (typeof candidate === "number" && !Number.isNaN(candidate)) {
      return Math.max(0, Math.min(candidate, 100));
    }

    const parsed = Number(rawValue || 0);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return Math.max(0, Math.min(parsed, 100));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.backgroundOverlay}>
          {pointPattern.map((point) => (
            <View
              key={point.key}
              style={[
                styles.backgroundPoint,
                {
                  left: point.left,
                  top: point.top,
                  width: point.size,
                  height: point.size,
                  opacity: point.opacity,
                  backgroundColor: point.color,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.pageContent}>
          {/* Header Section */}
          <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{data?.name || "Your Name"}</Text>
            <Text style={styles.profession}>
              {data?.profession || "Professional Title"}
            </Text>
            <Text style={styles.shortDescription}>
              {data?.about?.short_description ||
                "Passionate professional dedicated to creating amazing experiences."}
            </Text>
          </View>
          <Image src={data?.avatar || fallbackAvatar} style={styles.avatar} />
        </View>

        {/* Contact Bar */}
        <View style={styles.contactBar}>
          {data?.email && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text>{data.email}</Text>
            </View>
          )}
          {data?.phone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📱</Text>
              <Text>{data.phone}</Text>
            </View>
          )}
          {data?.location && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text>{data.location}</Text>
            </View>
          )}
        </View>

        {/* Main Content - Two Column Layout */}
        <View style={styles.mainContent}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* About Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionIcon}>👋</Text>
                <Text>About</Text>
              </View>
              <Text style={styles.aboutText}>
                {data?.about?.description ||
                  "I'm a passionate professional dedicated to creating amazing experiences and delivering exceptional results."}
              </Text>
            </View>

            {/* Skills Section */}
              {workingSkills.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionTitle}>
                    <Text style={styles.sectionIcon}>⚡</Text>
                    <Text>Technical Skills</Text>
                  </View>
                  {workingSkills.map((skill, index) => {
                    const percent = resolvePercentage(skill);
                    return (
                      <View key={index} style={styles.skillItem}>
                        <View style={styles.skillRow}>
                          <View style={styles.skillName}>
                            <Text style={styles.skillIcon}>💻</Text>
                            <Text>{skill.title || skill.name || "Skill"}</Text>
                          </View>
                          <Text style={styles.skillPercentage}>{percent}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${percent}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

            {/* Languages Section */}
              {languages.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionTitle}>
                    <Text style={styles.sectionIcon}>🌍</Text>
                    <Text>Languages</Text>
                  </View>
                  {languages.map((language, index) => {
                    const percent = resolvePercentage(language);
                    return (
                      <View key={index} style={styles.skillItem}>
                        <View style={styles.skillRow}>
                          <View style={styles.skillName}>
                            <Text style={styles.skillIcon}>🗣️</Text>
                            <Text>{language.title || language.name || "Language"}</Text>
                          </View>
                          <Text style={styles.skillPercentage}>{percent}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${percent}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

            {/* Knowledge Section */}
            {knowledge.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitle}>
                  <Text style={styles.sectionIcon}>🧠</Text>
                  <Text>Knowledge</Text>
                </View>
                <View style={styles.knowledgeContainer}>
                  {knowledge.map((item, index) => (
                    <Text key={index} style={styles.knowledgeTag}>
                      {item}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Social Links */}
            {(data?.facebook || data?.linkedin || data?.twitter) && (
              <View style={styles.section}>
                <View style={styles.sectionTitle}>
                  <Text style={styles.sectionIcon}>🌐</Text>
                  <Text>Social</Text>
                </View>
                <View style={styles.socialContainer}>
                  {data?.facebook && (
                    <Link style={styles.socialLink} src={data.facebook}>
                      Facebook
                    </Link>
                  )}
                  {data?.linkedin && (
                    <Link style={styles.socialLink} src={data.linkedin}>
                      LinkedIn
                    </Link>
                  )}
                  {data?.twitter && (
                    <Link style={styles.socialLink} src={data.twitter}>
                      Twitter
                    </Link>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{experiences.length}</Text>
                <Text style={styles.statLabel}>Experiences</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{education.length}</Text>
                <Text style={styles.statLabel}>Education</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workingSkills.length + languages.length}</Text>
                <Text style={styles.statLabel}>Skills</Text>
              </View>
            </View>

            {/* What I Do Section */}
            {whatIDo.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleLarge}>
                  <Text style={styles.sectionIcon}>🎯</Text>
                  <Text>What I Do</Text>
                </View>
                {whatIDo.map((item, index) => (
                  <View key={index} style={styles.whatIDoItem}>
                    <View style={styles.whatIDoTitle}>
                      <Text style={styles.sectionIcon}>✨</Text>
                      <Text>{item.title || "Service"}</Text>
                    </View>
                    <Text style={styles.whatIDoDescription}>
                      {item.description || item.des ||
                        "Description of the service or skill."}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Experience Section */}
            {experiences.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleLarge}>
                  <Text style={styles.sectionIcon}>💼</Text>
                  <Text>Experience</Text>
                </View>
                {experiences.map((item, index) => {
                  const duration = formatRange(item);
                  return (
                    <View key={index} style={styles.experienceItem}>
                      <View style={styles.experienceHeader}>
                        <View style={styles.experienceTitle}>
                          <Text style={styles.experienceIcon}>💼</Text>
                          <Text>{item.role || item.title || "Position"}</Text>
                        </View>
                        {duration ? (
                          <View style={styles.experienceDuration}>
                            <Text>{duration}</Text>
                            {item?.current && (
                              <Text style={styles.currentBadge}>Current</Text>
                            )}
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.experienceCompany}>
                        <Text style={styles.companyIcon}>🏢</Text>
                        <Text>{item.company || item.place || item.location || "Company"}</Text>
                      </View>
                      {(item.description || item.des) && (
                        <Text style={styles.experienceDescription}>
                          {item.description || item.des}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleLarge}>
                  <Text style={styles.sectionIcon}>🎓</Text>
                  <Text>Education</Text>
                </View>
                {education.map((item, index) => {
                  const duration = formatRange(item);
                  return (
                    <View key={index} style={styles.educationItem}>
                      <View style={styles.educationHeader}>
                        <View style={styles.educationTitle}>
                          <Text style={styles.educationIcon}>🎓</Text>
                          <Text>{item.degree || item.title || "Degree"}</Text>
                        </View>
                        {duration ? (
                          <View style={styles.educationDuration}>
                            <Text>{duration}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.educationInstitution}>
                        <Text style={styles.institutionIcon}>🏫</Text>
                        <Text>{item.institution || item.place || "Institution"}</Text>
                      </View>
                      {(item.field_of_study || item.notes || item.description) && (
                        <View style={styles.educationField}>
                          <Text style={styles.fieldIcon}>📚</Text>
                          <Text>{item.field_of_study || item.notes || item.description}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </Page>
    </Document>
  );
};

export default RyancvDocument;
