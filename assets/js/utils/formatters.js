export function numberOrNull(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

export function formatNumber(value, decimals = 1, fallback = "--") {
    const n = numberOrNull(value);
    return n === null ? fallback : n.toFixed(decimals);
}

export function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "medium"
    });
}

export function formatTime(value) {
    const date = value instanceof Date
        ? value
        : new Date(String(value || "").replace(" ", "T"));

    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

    return safeDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}
