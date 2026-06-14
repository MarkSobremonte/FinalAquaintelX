export class NavigationController {
    constructor(onHistoryOpen) {
        this.navItems = document.querySelectorAll(".nav-item");
        this.pageSections = document.querySelectorAll(".page-section");
        this.mainTitle = document.getElementById("main-title");
        this.mainSubtitle = document.getElementById("main-subtitle");
        this.mobileMenuBtn = document.getElementById("mobile-menu-btn");
        this.sidebar = document.getElementById("sidebar");
        this.closeSidebarBtn = document.getElementById("close-sidebar-btn");
        this.mobileOverlay = document.getElementById("mobile-overlay");
        this.onHistoryOpen = onHistoryOpen;

        this.pageTitles = {
            analytics: {
                title: "Live Analytics",
                subtitle: "Real-time telemetry and anomaly detection"
            },
            history: {
                title: "History & Logs",
                subtitle: "Historical sensor data and exportable reports"
            },
            about: {
                title: "About AquaIntelX",
                subtitle: "System architecture and mission"
            },
            contact: {
                title: "Contact Support",
                subtitle: "Technical support and hardware requests"
            }
        };
    }

    init() {
        this.setupMobileMenu();
        this.setupPageNavigation();
    }

    setupMobileMenu() {
        const toggleMenu = () => {
            this.sidebar?.classList.toggle("open");
            this.mobileOverlay?.classList.toggle("open");
        };

        this.mobileMenuBtn?.addEventListener("click", toggleMenu);
        this.closeSidebarBtn?.addEventListener("click", toggleMenu);
        this.mobileOverlay?.addEventListener("click", toggleMenu);
    }

    setupPageNavigation() {
        this.navItems.forEach((item) => {
            item.addEventListener("click", (event) => {
                const targetId = item.getAttribute("data-target");
                if (!targetId) return;

                event.preventDefault();

                this.navItems.forEach((nav) => nav.classList.remove("active"));
                item.classList.add("active");

                this.pageSections.forEach((section) => section.classList.remove("active"));
                document.getElementById(targetId)?.classList.add("active");

                const page = this.pageTitles[targetId];
                if (page) {
                    if (this.mainTitle) this.mainTitle.textContent = page.title;
                    if (this.mainSubtitle) this.mainSubtitle.textContent = page.subtitle;
                }

                if (targetId === "history") {
                    this.onHistoryOpen?.();
                }

                if (window.innerWidth <= 768) {
                    this.sidebar?.classList.remove("open");
                    this.mobileOverlay?.classList.remove("open");
                }
            });
        });
    }
}
