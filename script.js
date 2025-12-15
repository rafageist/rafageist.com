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
    const totalWizardSteps = 9;

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

    function showWizardStep(step) {
        wizardSteps.forEach((el, idx) => {
            el.classList.toggle("active", idx + 1 === step);
        });
        wizardIndicators.forEach((el, idx) => {
            el.classList.remove("active", "completed");
            if (idx + 1 < step) el.classList.add("completed");
            if (idx + 1 === step) el.classList.add("active");
        });
        if (prevStep) prevStep.style.display = step === 1 ? "none" : "inline-flex";
        if (nextStep) nextStep.textContent = step === totalWizardSteps ? "Finish" : "Next";
        if (summaryBlock) summaryBlock.style.display = step === totalWizardSteps ? "block" : "none";
    }

    function validateWizardStep(step) {
        const current = document.querySelector(`.wizard-step[data-step="${step}"]`);
        if (!current) return true;
        const requiredFields = current.querySelectorAll("input[required], textarea[required]");
        for (const field of requiredFields) {
            if ((field.type === "radio" || field.type === "checkbox")) {
                const groupChecked = current.querySelectorAll(`input[name="${field.name}"]:checked`).length > 0;
                if (!groupChecked) return false;
            } else if (!field.value.trim()) {
                return false;
            }
        }
        return true;
    }

    function generateSurveyMessage() {
        const form = document.getElementById("surveyForm");
        if (!form || !summaryField) return;
        const data = new FormData(form);
        const name = data.get("name") || "";
        const situation = data.get("situation") || "";
        const experienceTime = data.get("experience_time") || "";
        const currentTech = data.get("current-tech") || "";
        const perception = data.get("perception") || "";
        const partialTopics = data.get("partial-topics") || "";
        const built = data.getAll("built[]").join(", ");
        const troubleshoot = data.get("troubleshoot") || "";
        const confusing = data.get("confusing") || "";
        const progressFeeling = data.get("progress_feeling") || "";
        const missing = data.getAll("missing[]").join(", ");
        const outcome = data.get("outcome") || "";
        const priority = data.get("priority") || "";
        const learn = data.getAll("learn[]").join(", ");
        const comfort = data.get("comfort") || "";
        const oneQuestion = data.get("one-question") || "";
        const closingNotes = data.get("closing-notes") || "";

        const message = `
Context survey
Name: ${name}

Context:
- Situation: ${situation}
- Time learning/working with computing or software: ${experienceTime}
- Currently studying/working in tech: ${currentTech}

Self-perception:
- Closest statement: ${perception}
- Topics I "kind of know" but don't fully trust: ${partialTopics}

Practical experience:
- Built/worked on: ${built}
- When something fails, I usually: ${troubleshoot}

Blockers and expectations:
- Most confusing/frustrating: ${confusing}
- Felt learning a lot but not progressing: ${progressFeeling}
- Missing right now: ${missing}
- Good outcome in next months: ${outcome}
- What matters more right now: ${priority}

Learning style:
- Preferred ways to learn: ${learn}
- Comfort admitting I don't understand: ${comfort}

Open reflection:
- One question I'd ask now: ${oneQuestion}
- Other notes: ${closingNotes}
`;
        summaryField.value = message.trim();
    }

    function goToStep(direction) {
        if (direction === 1) {
            if (!validateWizardStep(wizardStep)) return;
            wizardStep = Math.min(totalWizardSteps, wizardStep + 1);
        } else if (direction === -1) {
            wizardStep = Math.max(1, wizardStep - 1);
        }
        if (wizardStep === totalWizardSteps) {
            generateSurveyMessage();
        }
        showWizardStep(wizardStep);
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
});
