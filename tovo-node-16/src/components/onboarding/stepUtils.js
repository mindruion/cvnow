export const applyServerErrors = (setError, fieldErrors) => {
  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }

  const assignError = (path, value) => {
    if (!path) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      if (value.every((item) => typeof item === "string")) {
        setError(path, {
          type: "server",
          message: value.join(" "),
        });
      } else {
        value.forEach((item, index) => {
          assignError(`${path}.${index}`, item);
        });
      }
      return;
    }

    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, nested]) => {
        assignError(path ? `${path}.${key}` : key, nested);
      });
      return;
    }

    if (value) {
      setError(path, {
        type: "server",
        message: String(value),
      });
    }
  };

  Object.entries(fieldErrors).forEach(([key, value]) => {
    assignError(key, value);
  });
};

export const sanitizeArrayInput = (array, factory) => {
  if (!Array.isArray(array) || array.length === 0) {
    return [factory()];
  }
  return array.map((item) => ({
    ...factory(),
    ...(item || {}),
  }));
};

const NUMERIC_PATTERN = /-?\d+(\.\d+)?/;

export const clampPercentage = (value, fallback = 0) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    const match =
      typeof value === "string" ? value.match(NUMERIC_PATTERN) : null;
    if (!match) {
      return Math.min(100, Math.max(0, Math.round(fallback)));
    }
    const parsed = Number(match[0]);
    if (Number.isNaN(parsed)) {
      return Math.min(100, Math.max(0, Math.round(fallback)));
    }
    return Math.min(100, Math.max(0, Math.round(parsed)));
  }
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

export const normalizePercentage = (value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return clampPercentage(fallback, fallback);
  }
  return clampPercentage(value, fallback);
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_DATE_REGEX = /^\d{4}-\d{2}$/;

const padNumber = (value) => value.toString().padStart(2, "0");

export const formatDateToIso = (value) => {
  if (!value) {
    return "";
  }

  if (ISO_DATE_REGEX.test(value)) {
    return value;
  }

  if (MONTH_DATE_REGEX.test(value)) {
    return `${value}-01`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = padNumber(parsed.getMonth() + 1);
  const day = padNumber(parsed.getDate());

  return `${year}-${month}-${day}`;
};

export const toMonthInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (MONTH_DATE_REGEX.test(value)) {
    return value;
  }

  if (ISO_DATE_REGEX.test(value)) {
    return value.slice(0, 7);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = padNumber(parsed.getMonth() + 1);

  return `${year}-${month}`;
};
