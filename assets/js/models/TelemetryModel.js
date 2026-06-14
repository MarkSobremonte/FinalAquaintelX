import { numberOrNull } from "../utils/formatters.js";

export class TelemetryModel {
    constructor() {
        this.lastSample = {};
        this.lastDatabaseId = null;
    }

    normalize(raw) {
        const r = raw && typeof raw === "object" ? raw : {};

        const pick = (...keys) => {
            for (const key of keys) {
                if (r[key] === undefined || r[key] === null || r[key] === "") continue;
                const n = numberOrNull(r[key]);
                if (n !== null) return n;
            }
            return undefined;
        };

        return {
            temperature: pick("temperature", "temp", "Temperature", "TEMP"),
            turbidity: pick("turbidity", "turb", "Turbidity", "ntu", "NTU", "turbidity_ntu"),
            tds: pick("tds", "TDS", "tds_ppm", "TDS_ppm", "ec_ppm"),
            ph: pick("ph", "pH", "PH")
        };
    }

    merge(raw) {
        const normalized = this.normalize(raw);
        const merged = { ...this.lastSample };

        if (normalized.temperature !== undefined) merged.temperature = normalized.temperature;
        if (normalized.turbidity !== undefined) merged.turbidity = normalized.turbidity;
        if (normalized.tds !== undefined) merged.tds = normalized.tds;
        if (normalized.ph !== undefined) merged.ph = normalized.ph;

        this.lastSample = merged;
        return merged;
    }

    hasNewDatabaseReading(row) {
        if (!row || row.id === undefined || row.id === null) return false;

        const id = String(row.id);
        if (this.lastDatabaseId === id) return false;

        this.lastDatabaseId = id;
        return true;
    }

    static riskToCssClass(risk) {
        if (risk === "Moderate Risk") return "warning";
        if (risk === "Critical Risk") return "critical";
        return "normal";
    }

    static riskSuggestion(risk) {
        if (risk === "Low Risk") {
            return "Continue monitoring water quality.";
        }

        if (risk === "Moderate Risk") {
            return "Monitor closely. Some parameters may need attention.";
        }

        if (risk === "Critical Risk") {
            return "Immediate action required. Water quality may be unsafe.";
        }

        return "Waiting for valid AI prediction.";
    }
}
