import { CONFIG } from "../config.js";
import { StatusView } from "../views/StatusView.js";

export class StatusController {
    constructor(apiService) {
        this.api = apiService;
        this.view = new StatusView();
        this.currentState = "READING";
    }

    init() {
        console.log("StatusController started");
        this.loadStatus();
        setInterval(() => this.loadStatus(), CONFIG.refresh.statusMs || 1000);
    }

    calculateRemainingSeconds(data) {
        const state = String(data.system_state || "READING").toUpperCase();

        const originalSeconds = parseInt(
            data.seconds_remaining ?? CONFIG.processDurations[state] ?? 0,
            10
        );

        if (!data.updated_at) {
            return originalSeconds;
        }

        const updatedAt = new Date(String(data.updated_at).replace(" ", "T"));
        const updatedAtMs = updatedAt.getTime();

        if (Number.isNaN(updatedAtMs)) {
            return originalSeconds;
        }

        const elapsedSeconds = Math.floor((Date.now() - updatedAtMs) / 1000);

        return Math.max(0, originalSeconds - elapsedSeconds);
    }

    async loadStatus() {
        try {
            const result = await this.api.getSystemStatus();

            console.log("SYSTEM STATUS RESULT:", result);

            if (result.status !== "success" || !result.data) return;

            const data = result.data;
            const state = String(data.system_state || "READING").toUpperCase();

            this.currentState = state;

            this.view.render({
                system_state: state,
                message: data.message,
                remaining_seconds: this.calculateRemainingSeconds(data)
            });

        } catch (error) {
            console.error("System status load failed:", error);
        }
    }

    isReading() {
        return this.currentState === "READING";
    }
}