export class ContactController {
    constructor() {
        this.form = document.getElementById("contactForm");
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            const button = this.form.querySelector(".submit-btn");
            if (!button) return;

            const originalText = button.textContent;

            button.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Sending...';

            setTimeout(() => {
                button.innerHTML = '<i class="ph ph-check"></i> Sent Successfully';
                button.style.backgroundColor = "var(--success)";
                button.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
                this.form.reset();

                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = "";
                    button.style.boxShadow = "";
                }, 3000);
            }, 1500);
        });
    }
}
