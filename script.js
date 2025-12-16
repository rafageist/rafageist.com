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
    const wizardError = document.getElementById("wizard-error");
    const wizardPreview = document.getElementById("wizard-preview-text");
    const surveyForm = document.getElementById("surveyForm");

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

        current.querySelectorAll(".field-error").forEach(el => el.classList.remove("field-error"));
        if (wizardError) wizardError.classList.remove("show");

        const requiredFields = current.querySelectorAll("input[required], textarea[required]");
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

        const paragraphs = [];

        const introParts = [];
        if (name) introParts.push(`I'm ${name}`);
        if (situation) introParts.push(`a ${situation}`);
        if (experienceTime) introParts.push(`with about ${experienceTime} in computing`);
        if (introParts.length) paragraphs.push(`Hi Rafa, ${introParts.join(", ")}.`);

        if (currentTech) {
            paragraphs.push(`Right now I'm in ${currentTech}.`);
        }

        const feelingSentences = [];
        if (perception) feelingSentences.push(`I often feel I ${perception.toLowerCase()}.`);
        if (partialTopics) feelingSentences.push(`Topics that feel shaky: ${partialTopics}.`);
        if (feelingSentences.length) paragraphs.push(feelingSentences.join(" "));

        const workSentences = [];
        if (built) workSentences.push(`So far I've built or worked on ${built}.`);
        if (troubleshoot) workSentences.push(`When something fails I usually ${troubleshoot.toLowerCase()}.`);
        if (workSentences.length) paragraphs.push(workSentences.join(" "));

        const blockerSentences = [];
        if (confusing) blockerSentences.push(`The most confusing part right now is ${confusing}.`);
        if (progressFeeling) blockerSentences.push(`Lately progress has felt: ${progressFeeling}.`);
        if (missing) blockerSentences.push(`I think I'm missing ${missing}.`);
        if (blockerSentences.length) paragraphs.push(blockerSentences.join(" "));

        const goalSentences = [];
        if (outcome) goalSentences.push(`In the next months I hope for ${outcome}.`);
        if (priority) goalSentences.push(`Right now I care more about ${priority.toLowerCase()}.`);
        if (goalSentences.length) paragraphs.push(goalSentences.join(" "));

        const styleSentences = [];
        if (learn) styleSentences.push(`I learn best through ${learn}.`);
        if (comfort) styleSentences.push(`I'm ${comfort.toLowerCase()} admitting when I don't understand.`);
        if (styleSentences.length) paragraphs.push(styleSentences.join(" "));

        const questionSentences = [];
        if (oneQuestion) questionSentences.push(`A question on my mind: ${oneQuestion}.`);
        if (closingNotes) questionSentences.push(`Other notes: ${closingNotes}.`);
        if (questionSentences.length) paragraphs.push(questionSentences.join(" "));

        const message = paragraphs.join("\n\n").trim();
        summaryField.value = message;
        const fallback = "Your answers will appear here as a short note.";
        if (wizardPreview) wizardPreview.textContent = message || fallback;
    }

    function goToStep(direction) {
        if (direction === 1) {
            if (!validateWizardStep(wizardStep)) return;
            wizardStep = Math.min(totalWizardSteps, wizardStep + 1);
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
});
