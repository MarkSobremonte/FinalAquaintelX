import { TelemetryModel } from "../models/TelemetryModel.js";

export class InsightsView {
    constructor() {
        this.list = document.getElementById("ai-insights-list");
    }

    render(reading) {
        if (!this.list || !reading) return;

        const risk = reading.risk_level || "Unknown";
        const confidence = reading.confidence ?? "0";
        const aiStatus = reading.ai_confidence_status || "Unknown";
        const cssClass = TelemetryModel.riskToCssClass(risk);
        const suggestion = TelemetryModel.riskSuggestion(risk);

        this.list.innerHTML = `
            <div class="insight-item ${cssClass}">
                <i class="ph ph-brain insight-icon"></i>
                <div class="insight-content">
                    <h4>Risk Level: ${risk}</h4>
                    <p><strong>Confidence:</strong> ${confidence}%</p>
                    <p><strong>Status:</strong> ${aiStatus}</p>
                    <p><strong>Suggestion:</strong> ${suggestion}</p>
                </div>
            </div>
        `;
    }

    renderOffline(message = "Unable to load AI insight data.") {
        if (!this.list) return;

        this.list.innerHTML = `
            <div class="insight-item warning">
                <i class="ph ph-warning-circle insight-icon"></i>
                <div class="insight-content">
                    <h4>AI Data Not Available</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}
