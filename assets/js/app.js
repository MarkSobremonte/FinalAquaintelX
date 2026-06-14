import { AppController } from "./controllers/AppController.js";

console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired");

    const app = new AppController();
    app.init();

    console.log("AppController initialized");

    // =====================================================
    // FORCE SYSTEM STATUS DISPLAY
    // This makes sure READING / FLUSHING / REFILLING / SETTLING
    // always appears in the frontend even if other dashboard code runs.
    // =====================================================

    function formatCountdown(seconds) {
        const total = Math.max(0, parseInt(seconds || 0, 10));
        const minutes = Math.floor(total / 60);
        const remainingSeconds = total % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function statusColorByState(state) {
        if (state === "READING") return "var(--success)";
        if (state === "FLUSHING") return "var(--danger)";
        if (state === "REFILLING") return "var(--warning)";
        if (state === "SETTLING") return "var(--accent)";
        return "var(--warning)";
    }

    function defaultMessage(state) {
        if (state === "READING") return "Showing real-time water data";
        if (state === "FLUSHING") return "Flushing old water";
        if (state === "REFILLING") return "Refilling water container";
        if (state === "SETTLING") return "Waiting for sensors to stabilize";
        if (state === "ERROR") return "System error detected";
        return "System running";
    }

    function calculateLiveRemaining(data) {
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

    async function forceLoadSystemStatus() {
        try {
            const response = await fetch("get_status.php?nocache=" + Date.now());
            const result = await response.json();

            console.log("FORCE SYSTEM STATUS:", result);

            if (result.status !== "success" || !result.data) {
                return;
            }

            const data = result.data;

            const state = String(data.system_state || "READING").toUpperCase();
            const remaining = calculateLiveRemaining(data);
            const countdown = formatCountdown(remaining);
            const message = data.message || defaultMessage(state);
            const timeText = remaining <= 0 ? "Waiting for next step" : countdown;

            // Top system status text
            const statusText = document.querySelector(".system-status span");
            const statusIndicator = document.querySelector(".status-indicator");

            if (statusText) {
                statusText.textContent = `${state} - ${timeText}`;
                statusText.title = message;
            }

            if (statusIndicator) {
                statusIndicator.classList.add("active");
                statusIndicator.style.backgroundColor = statusColorByState(state);
            }

            // Metric card status text
            document.querySelectorAll(".metric-card .metric-trend").forEach((trend) => {
                trend.innerHTML = `
                    <i class="ph ph-clock-countdown"></i>
                    <span>${message} - ${timeText}</span>
                `;
            });

            // AI insight override during non-reading modes
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
            console.error("Force system status failed:", error);
        }
    }

    forceLoadSystemStatus();
    setInterval(forceLoadSystemStatus, 1000);
});