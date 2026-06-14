import { CONFIG } from "../config.js";
import { TelemetryModel } from "../models/TelemetryModel.js";
import { ApiService } from "../services/ApiService.js";

import { DashboardView } from "../views/DashboardView.js";
import { InsightsView } from "../views/InsightsView.js";
import { ChartView } from "../views/ChartView.js";
import { HistoryView } from "../views/HistoryView.js";
import { StatsView } from "../views/StatsView.js";

import { ThemeController } from "./ThemeController.js";
import { NavigationController } from "./NavigationController.js";
import { ContactController } from "./ContactController.js";
import { HardwareController } from "./HardwareController.js";

export class AppController {
    constructor() {
        this.model = new TelemetryModel();
        this.api = new ApiService();

        this.dashboardView = new DashboardView();
        this.insightsView = new InsightsView();
        this.chartView = new ChartView();
        this.historyView = new HistoryView(this.api);
        this.statsView = new StatsView();

        this.currentRange = "24h";
        this.currentSystemState = "READING";
        this.lastChartReadingId = null;
    }

    init() {
        new ThemeController(this.chartView).init();
        new ContactController().init();
        new NavigationController(() => this.historyView.load(1)).init();

        this.hardwareController = new HardwareController({
            model: this.model,
            dashboardView: this.dashboardView,
            chartView: this.chartView,
            apiService: this.api,
            onSaved: () => this.loadLatestReading()
        });

        this.hardwareController.init();

        window._loadHistory = (page) => this.historyView.load(page);

        this.setupTimeFilter();

        // Live system process status:
        // READING / FLUSHING / REFILLING / SETTLING
        this.loadSystemStatus();
        setInterval(() => this.loadSystemStatus(), 1000);

        this.loadInitialData();

        setInterval(() => this.loadLatestReading(), CONFIG.refresh.latestMs || 3000);
        setInterval(() => this.refreshBackgroundData(), CONFIG.refresh.backgroundMs || 30000);
    }

    async loadInitialData() {
        await this.loadChartData(this.currentRange);
        await this.loadStats(this.currentRange);
        await this.loadLatestReading();

        if (document.getElementById("history")?.classList.contains("active")) {
            await this.historyView.load(1);
        }
    }

    async getCurrentSystemState() {
        try {
            const response = await fetch("get_status.php?nocache=" + Date.now());
            const result = await response.json();

            if (result.status === "success" && result.data) {
                return String(result.data.system_state || "READING").toUpperCase();
            }
        } catch (error) {
            console.warn("Could not check current system state:", error.message);
        }

        return "READING";
    }

async loadLatestReading() {
    try {
        const state = await this.getCurrentSystemState();

        if (state !== "READING") {
            console.log("Skipping latest reading display because system is:", state);
            return;
        }

        const result = await this.api.getLatestReading();

        if (result.status !== "success" || !result.data) {
            return;
        }

        const reading = result.data;

        this.dashboardView.updateCards(reading);
        this.insightsView.render(reading);

        /*
            Only add to chart if this is a NEW database reading.
            This prevents blinking/repeating the latest old reading.
        */
        const readingId = String(reading.id || reading.recorded_at || "");

        if (readingId && readingId !== this.lastChartReadingId) {
            this.lastChartReadingId = readingId;

            this.chartView.pushSample({
                ...reading,
                time: new Date()
            });
        }

    } catch (error) {
        console.error("Latest reading load failed:", error);
        this.insightsView.renderOffline("Unable to load latest reading from get_latest.php.");
    }
}

    async loadChartData(range) {
        try {
            const result = await this.api.getChartData(range);

            if (result.success && result.data) {
                this.chartView.replaceData(result.data);
            }
        } catch (error) {
            console.warn("Could not load chart data:", error.message);
        }
    }

    async loadStats(range) {
        try {
            const result = await this.api.getStats(range);

            if (result.success && result.data) {
                this.statsView.render(result.data, range);
            }
        } catch (error) {
            console.warn("Could not load stats:", error.message);
        }
    }

    refreshBackgroundData() {
        this.historyView.load(this.historyView.currentPage);
        this.loadStats(this.currentRange);
    }

    setupTimeFilter() {
        const timeFilterSelect = document.querySelector(".time-filter");

        if (!timeFilterSelect) return;

        timeFilterSelect.addEventListener("change", () => {
            const map = {
                "Last 24 Hours": "24h",
                "Last 7 Days": "7d",
                "Last 30 Days": "30d"
            };

            this.currentRange = map[timeFilterSelect.value] || "24h";
            this.chartView.replaceData(result.data, range);
            this.loadStats(this.currentRange);
            this.currentRange = map[timeFilterSelect.value] || "24h";

        this.loadChartData(this.currentRange);
        this.loadStats(this.currentRange);
                });
    }

    formatCountdown(seconds) {
        const total = Math.max(0, parseInt(seconds || 0, 10));
        const minutes = Math.floor(total / 60);
        const remainingSeconds = total % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    statusColorByState(state) {
        if (state === "READING") return "var(--success)";
        if (state === "FLUSHING") return "var(--danger)";
        if (state === "REFILLING") return "var(--warning)";
        if (state === "SETTLING") return "var(--accent)";
        return "var(--warning)";
    }

    defaultStatusMessage(state) {
        if (state === "READING") return "Showing real-time water data";
        if (state === "FLUSHING") return "Flushing old water";
        if (state === "REFILLING") return "Refilling water container";
        if (state === "SETTLING") return "Waiting for sensors to stabilize";
        return "System running";
    }

    calculateLiveRemaining(data) {
        const originalSeconds = parseInt(data.seconds_remaining || 0, 10);

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

    async loadSystemStatus() {
        try {
            const response = await fetch("get_status.php?nocache=" + Date.now());
            const result = await response.json();

            console.log("SYSTEM STATUS RESULT:", result);

            if (result.status !== "success" || !result.data) return;

            const data = result.data;
            const state = String(data.system_state || "READING").toUpperCase();
            const remaining = this.calculateLiveRemaining(data);
            const countdown = this.formatCountdown(remaining);
            const message = data.message || this.defaultStatusMessage(state);
            const timeText = remaining <= 0 ? "Waiting for next step" : countdown;

            this.currentSystemState = state;

            const statusText = document.querySelector(".system-status span");
            const statusIndicator = document.querySelector(".status-indicator");

            if (statusText) {
                statusText.textContent = `${state} - ${timeText}`;
                statusText.title = message;
            }

            if (statusIndicator) {
                statusIndicator.classList.add("active");
                statusIndicator.style.backgroundColor = this.statusColorByState(state);
            }

            document.querySelectorAll(".metric-card .metric-trend").forEach((trend) => {
                trend.innerHTML = `
                    <i class="ph ph-clock-countdown"></i>
                    <span>${message} - ${timeText}</span>
                `;
            });

            if (state !== "READING") {
                const listEl = document.getElementById("ai-insights-list");

                if (listEl) {
                    listEl.innerHTML = `
                        <div class="insight-item warning">
                            <i class="ph ph-warning-circle insight-icon"></i>
                            <div class="insight-content">
                                <h4>${state}</h4>
                                <p>${message}</p>
                                <p><strong>Time Remaining:</strong> ${timeText}</p>
                                <p>Sensor readings are not saved during ${state.toLowerCase()} mode.</p>
                            </div>
                        </div>
                    `;
                }
            }

        } catch (error) {
            console.error("System status load failed:", error);
        }
    }
}