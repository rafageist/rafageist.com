document.addEventListener("DOMContentLoaded", function () {
    // --- Slideshow ---
    const images = document.querySelectorAll("#slideshow img");
    let index = 0;
    const slideMessages = [
        "Learning computing, but nothing makes sense yet?",
        "You follow steps and still feel lost.",
        "Too many concepts, no clear picture.",
        "Things work, but you do not know why."
    ];
    const heroSlideText = document.getElementById("hero-slide-text");

    function changeImage() {
        const current = images[index];
        if (current) {
            current.classList.remove("active");
            current.classList.add("exit");
            // Reset position after exit transition ends
            setTimeout(() => {
                current.classList.remove("exit");
            }, 1500);
        }

        const nextIndex = (index + 1) % images.length;
        const next = images[nextIndex];

        next.classList.add("active");
        // Ensure starting position fully covers viewport
        if (heroSlideText) {
            const msg = slideMessages[nextIndex % slideMessages.length];
            heroSlideText.textContent = msg;
        }

        index = nextIndex;
    }

    // Swap slide sources for portrait (use *.vertical.png)
    images.forEach(img => {
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.getAttribute("src");
            const original = img.dataset.originalSrc;
            const vertical = original.replace(/\.png(\?.*)?$/, ".vertical.png$1");
            img.dataset.verticalSrc = vertical;
        }
    });

    function updateSlideSources() {
        const useVertical = window.innerHeight > window.innerWidth;
        images.forEach(img => {
            const target = useVertical ? img.dataset.verticalSrc : img.dataset.originalSrc;
            if (target && img.getAttribute("src") !== target) {
                img.setAttribute("src", target);
            }
        });
    }

    updateSlideSources();

    if (heroSlideText) {
        heroSlideText.textContent = slideMessages[0];
    }

    setInterval(changeImage, 5000);

    // Loading overlay intentionally disabled for instant access.

    window.addEventListener("resize", updateSlideSources);
    window.addEventListener("orientationchange", updateSlideSources);

    // Survey modal controls
    const openSurvey = document.getElementById("open-survey");
    const closeSurvey = document.getElementById("close-survey");
    const surveyModal = document.getElementById("survey-modal");
    const surveyBackdrop = document.getElementById("survey-backdrop");
    const openSurveyHero = document.getElementById("open-survey-hero");
    let wizardStep = 1;
    const totalWizardSteps = 4;

    function toggleSurvey(show) {
        if (!surveyModal) return;
        surveyModal.classList.toggle("show", show);
        surveyModal.setAttribute("aria-hidden", show ? "false" : "true");
        document.body.classList.toggle("nav-open", show);
    }

    if (openSurvey) {
        openSurvey.addEventListener("click", () => toggleSurvey(true));
    }
    if (openSurveyHero) {
        openSurveyHero.addEventListener("click", () => toggleSurvey(true));
    }
    if (closeSurvey) {
        closeSurvey.addEventListener("click", () => toggleSurvey(false));
    }
    if (surveyBackdrop) {
        surveyBackdrop.addEventListener("click", () => toggleSurvey(false));
    }

    const prevStep = document.getElementById("prevStep");
    const nextStep = document.getElementById("nextStep");
    const wizardSteps = document.querySelectorAll(".wizard-step");
    const wizardIndicators = document.querySelectorAll(".wizard-progress .step");
    const summaryBlock = document.getElementById("wizard-summary");
    const summaryField = document.getElementById("generatedSurveyMessage");
    const copyBtn = document.getElementById("copy-survey");
    const emailBtn = document.getElementById("email-survey");
    const whatsappBtn = document.getElementById("whatsapp-survey");
    const wizardError = document.getElementById("wizard-error");
    const wizardPreview = document.getElementById("wizard-preview-text");
    const summaryPreview = document.getElementById("wizard-summary-text");
    const surveyForm = document.getElementById("surveyForm");
    const surveyIntro = document.querySelector(".survey-intro");
    const wizardProgress = document.querySelector(".wizard-progress");

    function showWizardStep(step) {
        wizardSteps.forEach((el, idx) => {
            el.classList.toggle("active", idx + 1 === step);
        });
        wizardIndicators.forEach((el, idx) => {
            el.classList.remove("active", "completed");
            if (idx + 1 < step) el.classList.add("completed");
            if (idx + 1 === step) el.classList.add("active");
        });
        if (prevStep) {
            prevStep.style.display = "inline-flex";
            prevStep.disabled = step === 1;
        }
        if (nextStep) {
            nextStep.textContent = "Next";
            nextStep.disabled = step === totalWizardSteps;
        }
        if (summaryBlock) summaryBlock.style.display = step === totalWizardSteps ? "block" : "none";
        if (surveyIntro) surveyIntro.style.display = step === totalWizardSteps ? "none" : "block";
        if (wizardProgress) wizardProgress.style.display = step === totalWizardSteps ? "none" : "grid";
    }

    function validateWizardStep(step) {
        const current = document.querySelector(`.wizard-step[data-step="${step}"]`);
        if (!current) return true;

        current.querySelectorAll(".field-error").forEach(el => el.classList.remove("field-error"));
        if (wizardError) wizardError.classList.remove("show");

        const requiredFields = current.querySelectorAll("input[required]");
        let valid = true;

        requiredFields.forEach(field => {
            if (field.type === "radio" || field.type === "checkbox") {
                const groupChecked = current.querySelectorAll(`input[name="${field.name}"]:checked`).length > 0;
                if (!groupChecked) {
                    valid = false;
                    const container = field.closest(".options") || field.parentElement;
                    if (container) container.classList.add("field-error");
                }
            } else if (!field.value.trim()) {
                valid = false;
                field.classList.add("field-error");
            }
        });

        if (!valid && wizardError) {
            wizardError.textContent = "Please complete required fields before continuing.";
            wizardError.classList.add("show");
        }

        return valid;
    }

    function generateSurveyMessage() {
        const form = surveyForm;
        if (!form) return "";
        const data = new FormData(form);
        const starting = data.get("starting_point") || "";
        const difficulty = data.get("difficulty") || "";
        const help = data.get("help") || "";

        const greetings = ["Hi Rafa,", "Hello Rafa,", "Hi there,"];
        const closings = ["Thanks for reading.", "Thanks for taking a look.", "Regards."];
        const bridge = ["I'm reaching out because", "I'm writing because", "Sharing where I am right now:"];

        const parts = [];
        if (starting) parts.push(`I'm coming from this starting point: ${starting}`);
        if (difficulty) parts.push(`Right now my main difficulty is ${difficulty}`);
        if (help) parts.push(`It would help me most to have ${help.toLowerCase()}`);

        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        const body = parts.join(". ") + (parts.length ? "." : "");
        const message = `${pick(greetings)} ${pick(bridge)} ${body} ${pick(closings)}`.replace(/\s+/g, " ").trim();
        const fallback = "Your answers will appear here as a short note.";
        if (summaryField) summaryField.value = message;
        if (wizardPreview) wizardPreview.textContent = message || fallback;
        if (summaryPreview) summaryPreview.textContent = message || fallback;
        return message;
    }

    function goToStep(direction) {
        if (direction === 1) {
            if (!validateWizardStep(wizardStep)) return;
            if (wizardStep < totalWizardSteps) {
                wizardStep = Math.min(totalWizardSteps, wizardStep + 1);
            }
        } else if (direction === -1) {
            wizardStep = Math.max(1, wizardStep - 1);
        }
        generateSurveyMessage();
        showWizardStep(wizardStep);
    }

    if (surveyForm) {
        surveyForm.addEventListener("input", () => {
            generateSurveyMessage();
        });
    }

    if (prevStep) prevStep.addEventListener("click", () => goToStep(-1));
    if (nextStep) nextStep.addEventListener("click", () => goToStep(1));
    wizardIndicators.forEach((indicator, idx) => {
        indicator.style.cursor = "pointer";
        indicator.addEventListener("click", () => {
            const target = idx + 1;
            if (target <= wizardStep && target >= 1) {
                wizardStep = target;
                showWizardStep(wizardStep);
            }
        });
    });

    function copySurvey() {
        if (!summaryField) return;
        summaryField.select();
        summaryField.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(summaryField.value);
        alert("Copied to clipboard.");
    }

    function emailSurvey() {
        if (!summaryField) return;
        const subject = "Context survey";
        const body = encodeURIComponent(summaryField.value);
        window.location.href = `mailto:rafageist@divengine.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    }

    function whatsappSurvey() {
        if (!summaryField) return;
        const msg = encodeURIComponent(summaryField.value);
        window.open(`https://wa.me/5978401275?text=${msg}`, "_blank");
    }

    if (copyBtn) copyBtn.addEventListener("click", copySurvey);
    if (emailBtn) emailBtn.addEventListener("click", emailSurvey);
    if (whatsappBtn) whatsappBtn.addEventListener("click", whatsappSurvey);

    showWizardStep(wizardStep);
    generateSurveyMessage();
});
