export class StatusView {
    constructor() {
        this.statusText = document.querySelector(".system-status span");
        this.statusIndicator = document.querySelector(".status-indicator");
        this.metricTrends = document.querySelectorAll(".metric-card .metric-trend");
        this.aiList = document.getElementById("ai-insights-list");
    }

    formatCountdown(seconds) {
        const total = Math.max(0, parseInt(seconds || 0, 10));
        const minutes = Math.floor(total / 60);
        const remainingSeconds = total % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    getColor(state) {
        if (state === "READING") return "var(--success)";
        if (state === "FLUSHING") return "var(--danger)";
        if (state === "REFILLING") return "var(--warning)";
        if (state === "SETTLING") return "var(--accent)";
        return "var(--warning)";
    }

    getDefaultMessage(state) {
        if (state === "READING") return "Showing real-time water data";
        if (state === "FLUSHING") return "Flushing old water";
        if (state === "REFILLING") return "Refilling water container";
        if (state === "SETTLING") return "Waiting for sensors to stabilize";
        return "System running";
    }

    render(status) {
        console.log("Rendering status to frontend:", status);

        const state = String(status.system_state || "READING").toUpperCase();
        const countdown = this.formatCountdown(status.remaining_seconds);
        const message = status.message || this.getDefaultMessage(state);

        if (this.statusText) {
            this.statusText.textContent = `${state} • ${countdown}`;
            this.statusText.title = message;
        }

        if (this.statusIndicator) {
            this.statusIndicator.classList.add("active");
            this.statusIndicator.style.backgroundColor = this.getColor(state);
        }

        this.metricTrends.forEach((trend) => {
            trend.innerHTML = `
                <i class="ph ph-clock-countdown"></i>
                <span>${message} • ${countdown}</span>
            `;
        });

        if (state !== "READING" && this.aiList) {
            this.aiList.innerHTML = `
                <div class="insight-item warning">
                    <i class="ph ph-warning-circle insight-icon"></i>
                    <div class="insight-content">
                        <h4>${state}</h4>
                        <p>${message}</p>
                        <p><strong>Time Remaining:</strong> ${countdown}</p>
                        <p>Sensor readings are not saved during ${state.toLowerCase()} mode.</p>
                    </div>
                </div>
            `;
        }
    }
}