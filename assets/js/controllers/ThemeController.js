export class ThemeController {
    constructor(chartView) {
        this.chartView = chartView;
        this.button = document.getElementById("theme-toggle");
        this.icon = document.getElementById("theme-icon");
    }

    init() {
        const currentTheme = localStorage.getItem("theme") || "dark";
        this.applyTheme(currentTheme);

        if (!this.button) return;

        this.button.addEventListener("click", () => {
            const nextTheme = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
            this.applyTheme(nextTheme);
            localStorage.setItem("theme", nextTheme);
        });
    }

    applyTheme(theme) {
        if (theme === "light") {
            document.body.setAttribute("data-theme", "light");
            if (this.icon) this.icon.className = "ph ph-moon";
            this.chartView.updateTheme("light");
        } else {
            document.body.removeAttribute("data-theme");
            if (this.icon) this.icon.className = "ph ph-sun";
            this.chartView.updateTheme("dark");
        }
    }
}
