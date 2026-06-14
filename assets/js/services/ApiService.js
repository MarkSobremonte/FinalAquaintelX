import { CONFIG } from "../config.js";

export class ApiService {
    async fetchJson(url, options = {}) {
        const separator = url.includes("?") ? "&" : "?";
        const response = await fetch(`${url}${separator}nocache=${Date.now()}`, options);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    }

    getLatestReading() {
        return this.fetchJson(CONFIG.endpoints.latest);
    }
    getSystemStatus() {
    return this.fetchJson(CONFIG.endpoints.status);
    }

    getHistory(page = 1, limit = 50) {
        return this.fetchJson(`${CONFIG.endpoints.history}&limit=${limit}&page=${page}`);
    }

    getChartData(range = "24h") {
        return this.fetchJson(`${CONFIG.endpoints.chart}&range=${encodeURIComponent(range)}`);
    }

    getStats(range = "24h") {
        return this.fetchJson(`${CONFIG.endpoints.stats}&range=${encodeURIComponent(range)}`);
    }

    insertReading(sample) {
        return this.fetchJson(CONFIG.endpoints.insert, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sensor_node: sample.sensor_node || "NODE-01",
                temperature: sample.temperature ?? null,
                turbidity: sample.turbidity ?? null,
                tds: sample.tds ?? null,
                ph: sample.ph ?? null
            })
        });
    }
}
