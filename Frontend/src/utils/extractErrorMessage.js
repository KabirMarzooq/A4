// utils/extractErrorMessage.js
// Laravel validation failures come back as { field: ["message", ...], ... }
// (no top-level "message" or "error" key), so a plain data.message ||
// data.error lookup misses them and silently falls back to a generic
// string. This reads whichever shape the backend actually sent.
export function extractErrorMessage(error, fallback) {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    const firstFieldErrors = Object.values(data).find(
        (value) => Array.isArray(value) && typeof value[0] === "string"
    );
    if (firstFieldErrors) return firstFieldErrors[0];

    return fallback;
}
