const normalizeBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "");
};

const DEFAULT_BASE_URL = "http://localhost:8000";

export const API_BASE_URL = normalizeBaseUrl(
  process.env.REACT_APP_API_URL
) || DEFAULT_BASE_URL;

export const getApiBaseUrl = () => API_BASE_URL;

export const buildApiUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getSubdomain = () => {
  return "demo";
  if (typeof window === "undefined" || !window.location) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const override = params.get("tenant") || params.get("subdomain");
  if (override) {
    return override;
  }

  const { hostname } = window.location;
  if (!hostname) {
    return "";
  }

  // Treat localhost and IP addresses as single-tenant instances.
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  if (hostname === "localhost" || isIpAddress) {
    return hostname;
  }

  const parts = hostname.split(".");
  if (parts.length <= 2) {
    return parts[0] || "";
  }

  const [first, second] = parts;
  if (first === "www") {
    return second || "";
  }

  return first || "";
};

export const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("token");
};

export const withAuthToken = (url, token = getAuthToken()) => {
  if (!token) {
    return url;
  }

  const resolvedUrl = new URL(url, API_BASE_URL);
  resolvedUrl.searchParams.set("token", token);
  return resolvedUrl.toString();
};

export const fetchJson = async (path, init = {}, options = {}) => {
  const { withToken = false } = options;
  const url = buildApiUrl(path);
  const finalUrl = withToken ? withAuthToken(url) : url;

  const response = await fetch(finalUrl, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = new Error(
      `Request to ${finalUrl} failed with status ${response.status}`
    );
    error.status = response.status;
    try {
      error.body = await response.json();
    } catch (err) {
      error.body = null;
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const fetchTenantJson = async (pathBuilder, init = {}, options = {}) => {
  const subdomain = getSubdomain();
  const path =
    typeof pathBuilder === "function"
      ? pathBuilder(subdomain)
      : pathBuilder.replace(":subdomain", subdomain);
  return fetchJson(path, init, options);
};
