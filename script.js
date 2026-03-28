// Initialize Chart.js
document.addEventListener('DOMContentLoaded', () => {

    // Enforce authentication
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.replace('login.html');
        return; // Stop rendering
    }

    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    // Gradient for the line chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    gradientFill.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    const gradientFill2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill2.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradientFill2.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // Start with empty data, or initial historical data
    let chartTimeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    let turbData = [1.1, 1.2, 1.3, 1.2, 1.4, 1.25, 1.2];
    let phData   = [7.1, 7.2, 7.2, 7.3, 7.2, 7.15, 7.2];

    const trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartTimeLabels,
            datasets: [
                {
                    label: 'Turbidity (NTU)',
                    data: turbData,
                    borderColor: '#00e5ff',
                    backgroundColor: gradientFill,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0a0e17',
                    pointBorderColor: '#00e5ff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'pH Level',
                    data: phData,
                    borderColor: '#8b5cf6',
                    backgroundColor: gradientFill2,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0a0e17',
                    pointBorderColor: '#8b5cf6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: '500' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 22, 36, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    suggestedMin: 0,
                    suggestedMax: 5
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false }, // avoid overlapping grid lines
                    suggestedMin: 0,
                    suggestedMax: 14
                }
            }
        }
    });

    // ==========================================
    // THEME TOGGLE
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeIcon.className = 'ph ph-moon';
        updateChartTheme('light');
    }

    themeBtn.addEventListener('click', () => {
        let theme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icon
        themeIcon.className = theme === 'light' ? 'ph ph-moon' : 'ph ph-sun';
        
        // Update Chart
        updateChartTheme(theme);
    });

    function updateChartTheme(theme) {
        if (!trendsChart) return;
        
        if (theme === 'light') {
            Chart.defaults.color = '#64748b'; // --text-muted
            trendsChart.options.plugins.tooltip.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            trendsChart.options.plugins.tooltip.titleColor = '#0f172a';
            trendsChart.options.plugins.tooltip.bodyColor = '#0f172a';
            trendsChart.options.plugins.tooltip.borderColor = 'rgba(0,0,0,0.1)';
            
            trendsChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.05)';
            trendsChart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.05)';
            
            trendsChart.update();
        } else {
            Chart.defaults.color = '#94a3b8';
            trendsChart.options.plugins.tooltip.backgroundColor = 'rgba(15, 22, 36, 0.9)';
            trendsChart.options.plugins.tooltip.titleColor = '#e2e8f0';
            trendsChart.options.plugins.tooltip.bodyColor = '#e2e8f0';
            trendsChart.options.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
            
            trendsChart.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.05)';
            trendsChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.05)';
            
            trendsChart.update();
        }
    }

    // ==========================================
    // HARDWARE INTEGRATION (TELEMETRY MANAGER)
    // ==========================================
    class HardwareConnection {
        constructor() {
            // Check storage for user's hardware URL, default to WebSocket mode
            this.mode = localStorage.getItem('hw_mode') || 'WEBSOCKET'; 
            this.websocketUrl = localStorage.getItem('hw_url') || 'ws://192.168.1.100:81'; 
            this.restEndpoint = 'http://192.168.1.100/data';
            this.pollingInterval = 3000; // ms

            // DOM Elements
            this.ui = {
                temp: document.getElementById('temp-val'),
                turb: document.getElementById('turb-val'),
                tds:  document.getElementById('tds-val'),
                ph:   document.getElementById('ph-val')
            };

            this.setupInteractiveStatus();
            this.init();
        }

        setupInteractiveStatus() {
            const statusEl = document.querySelector('.system-status');
            statusEl.style.cursor = 'pointer';
            statusEl.title = 'Click to configure hardware connection';
            
            statusEl.addEventListener('click', () => {
                const url = prompt("Enter your Hardware WebSocket URL (e.g. ws://192.168.1.x:81)\nOr type 'MOCK' to return to simulated data:", this.websocketUrl);
                if (url) {
                    if (url.toUpperCase() === 'MOCK') {
                        this.mode = 'MOCK';
                        localStorage.setItem('hw_mode', 'MOCK');
                    } else {
                        this.mode = 'WEBSOCKET';
                        this.websocketUrl = url;
                        localStorage.setItem('hw_mode', 'WEBSOCKET');
                        localStorage.setItem('hw_url', url);
                    }
                    this.init(); // Re-initialize with new settings
                }
            });
        }

        init() {
            // Clean up old connections if re-initializing
            if (this.ws) { this.ws.onclose = null; this.ws.close(); }
            if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
            if (this.mockIntervalId) clearInterval(this.mockIntervalId);

            document.querySelector('.status-indicator').classList.remove('active');
            document.querySelector('.system-status span').textContent = "Connecting...";
            document.querySelector('.status-indicator').style.backgroundColor = "var(--warning)";

            if (this.mode === 'WEBSOCKET') {
                this.connectWebSocket();
            } else if (this.mode === 'REST') {
                this.startRestPolling();
            } else {
                this.startMockData();
            }
        }

        connectWebSocket() {
            console.log(`Attempting to connect to hardware via WebSocket at ${this.websocketUrl}...`);
            try {
                this.ws = new WebSocket(this.websocketUrl);

                this.ws.onopen = () => {
                    console.log("Hardware connected successfully.");
                    document.querySelector('.status-indicator').classList.add('active');
                    document.querySelector('.status-indicator').style.backgroundColor = "var(--success)";
                    document.querySelector('.system-status span').textContent = "Hardware Connected";
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.updateDashboard(data);
                    } catch (e) {
                        console.error("Error parsing hardware data:", e);
                    }
                };

                this.ws.onclose = () => {
                    console.warn(`Hardware disconnected from ${this.websocketUrl}. Reconnecting in 5s...`);
                    document.querySelector('.status-indicator').classList.remove('active');
                    document.querySelector('.status-indicator').style.backgroundColor = "var(--danger)";
                    document.querySelector('.system-status span').textContent = "Connection Lost (Click to Edit)";
                    setTimeout(() => { if(this.mode === 'WEBSOCKET') this.connectWebSocket(); }, 5000);
                };
                
                this.ws.onerror = (error) => {
                    console.error("WebSocket Error:", error);
                    // onclose will handle reconnection
                };
            } catch (err) {
                console.error("Invalid WebSocket URL:", err);
                document.querySelector('.status-indicator').style.backgroundColor = "var(--danger)";
                document.querySelector('.system-status span').textContent = "Invalid IP (Click to Edit)";
            }
        }

        startRestPolling() {
            console.log("Starting REST polling to hardware...");
            document.querySelector('.status-indicator').classList.add('active');
            document.querySelector('.status-indicator').style.backgroundColor = "var(--success)";
            document.querySelector('.system-status span').textContent = "Polling Hardware";

            this.pollingIntervalId = setInterval(async () => {
                try {
                    const response = await fetch(this.restEndpoint);
                    if (!response.ok) throw new Error("Hardware unavailable");
                    const data = await response.json();
                    this.updateDashboard(data);
                } catch (error) {
                    console.error("REST Polling Error:", error);
                }
            }, this.pollingInterval);
        }

        startMockData() {
            console.log("Running in MOCK mode. No hardware connected.");
            document.querySelector('.status-indicator').classList.add('active');
            document.querySelector('.status-indicator').style.backgroundColor = "var(--primary)";
            document.querySelector('.system-status span').textContent = "Mock Data (Click to Edit)";

            let mockTemp = 22.4, mockTurb = 1.2, mockTds = 145, mockPh = 7.2;

            this.mockIntervalId = setInterval(() => {
                if (Math.random() > 0.5) {
                    mockTemp += (Math.random() * 0.4 - 0.2);
                    mockTurb += (Math.random() * 0.1 - 0.05);
                    mockPh   += (Math.random() * 0.04 - 0.02);
                    
                    this.updateDashboard({
                        temperature: mockTemp,
                        turbidity: Math.max(0, mockTurb),
                        tds: mockTds, 
                        ph: Math.min(14, Math.max(0, mockPh)) 
                    });
                }
            }, 3000);
        }

        updateDashboard(data) {
            const updateMetric = (el, value, suffix, decimals = 1) => {
                const formatted = parseFloat(value).toFixed(decimals);
                const current = parseFloat(el.innerText);
                
                if (formatted != current) {
                    el.innerHTML = `${formatted}<span class="unit">${suffix}</span>`;
                    el.classList.remove('value-update');
                    void el.offsetWidth;
                    el.classList.add('value-update');
                }
            };

            if(data.temperature !== undefined) updateMetric(this.ui.temp, data.temperature, '°C');
            if(data.turbidity !== undefined)   updateMetric(this.ui.turb, data.turbidity, 'NTU', 2);
            if(data.tds !== undefined)         updateMetric(this.ui.tds,  data.tds, 'ppm', 0);
            if(data.ph !== undefined) {
                const formatted = parseFloat(data.ph).toFixed(2);
                if(this.ui.ph.innerText !== formatted) {
                    this.ui.ph.innerText = formatted;
                    this.ui.ph.classList.remove('value-update');
                    void this.ui.ph.offsetWidth;
                    this.ui.ph.classList.add('value-update');
                }
            }

            // Trigger AI insight analysis
            this.analyzeWaterQuality({
                temp: data.temperature !== undefined ? data.temperature : parseFloat(this.ui.temp.innerText),
                turb: data.turbidity !== undefined ? data.turbidity : parseFloat(this.ui.turb.innerText),
                tds: data.tds !== undefined ? data.tds : parseFloat(this.ui.tds.innerText),
                ph: data.ph !== undefined ? data.ph : parseFloat(this.ui.ph.innerText)
            });
        }

        analyzeWaterQuality(metrics) {
            const listEl = document.getElementById('ai-insights-list');
            if (!listEl) return;
            
            let insights = [];
            
            // Temperature analysis
            if (metrics.temp < 15) {
                insights.push({ type: 'warning', title: 'Low Temperature Alert', desc: `Water is unusually cold (${metrics.temp.toFixed(1)}°C).` });
            } else if (metrics.temp > 30) {
                insights.push({ type: 'warning', title: 'High Temperature Alert', desc: `Water is unusually warm (${metrics.temp.toFixed(1)}°C). Elevated risk of bacterial growth.` });
            }

            // pH analysis
            if (metrics.ph < 6.5) {
                insights.push({ type: 'warning', title: 'Acidic Water Detected', desc: `pH level dropped to ${metrics.ph.toFixed(2)}. Heavy metal leaching risk is elevated.` });
            } else if (metrics.ph > 8.5) {
                insights.push({ type: 'warning', title: 'Alkaline Water Detected', desc: `pH level rose to ${metrics.ph.toFixed(2)}. Hard water scale buildup is highly likely.` });
            }
            
            // Turbidity analysis
            if (metrics.turb > 5.0) {
                insights.push({ type: 'warning', title: 'Critical Turbidity', desc: `Water clarity is extremely poor (${metrics.turb.toFixed(2)} NTU). Immediate physical filter check required.` });
            } else if (metrics.turb > 2.0) {
                insights.push({ type: 'warning', title: 'Elevated Turbidity', desc: `Minor sediment spike detected (${metrics.turb.toFixed(2)} NTU).` });
            }
            
            // TDS analysis
            if (metrics.tds > 500) {
                insights.push({ type: 'warning', title: 'TDS Threshold Exceeded', desc: `Dissolved solids are very high (${Math.round(metrics.tds)} ppm). Osmosis membrane may be failing.` });
            }
            
            // If no issues, show optimal state
            if (insights.length === 0) {
                insights.push({ type: 'normal', title: 'Optimal Conditions', desc: 'All telemetry metrics indicate premium water purity. No physical or chemical anomalies detected by the system.' });
            } else {
                // Limit to top 2 most urgent insights
                insights = insights.slice(0, 2);
            }
            
            // Update the DOM
            listEl.innerHTML = insights.map(i => `
                <div class="insight-item ${i.type}">
                    <i class="ph ${i.type === 'normal' ? 'ph-check-circle' : 'ph-warning-circle'} insight-icon"></i>
                    <div class="insight-content">
                        <h4>${i.title}</h4>
                        <p>${i.desc}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // Start the connection manager
    const hardwareTracker = new HardwareConnection();


    // ==========================================
    // SPA ROUTING & UI INTERACTIONS
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    const pageTitles = {
        'analytics': { title: 'Live Analytics', subtitle: 'Real-time telemetry and anomaly detection' },
        'history': { title: 'History & Logs', subtitle: 'Historical sensor data and exportable reports' },
        'about': { title: 'About AquaIntelX', subtitle: 'System architecture and mission' },
        'contact': { title: 'Contact Support', subtitle: 'Technical support and hardware requests' }
    };

    // ==========================================
    // MOBILE NAV TOGGLE
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');

    const toggleMenu = () => {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('open');
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
        closeSidebarBtn.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    // Handle navigation interaction
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return; 

            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            pageSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');

            if(pageTitles[targetId]) {
                mainTitle.textContent = pageTitles[targetId].title;
                mainSubtitle.textContent = pageTitles[targetId].subtitle;
            }

            // Closes menu nicely on mobile after selection
            if(window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });

    // Handle explicit log out
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAuthenticated');
        });
    }

    // Form submission simulation
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Sending...';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="ph ph-check"></i> Sent Successfully';
                btn.style.backgroundColor = 'var(--success)';
                btn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.boxShadow = '';
                }, 3000);
            }, 1500);
        });
    }
});
