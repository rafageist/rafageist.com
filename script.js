document.addEventListener("DOMContentLoaded", function () {
    // --- Slideshow ---
    const slideshow = document.getElementById("slideshow");
    let images = slideshow ? Array.from(slideshow.querySelectorAll("img")) : [];
    let index = 0;
    let slideshowTimer = null;
    const slideMessages = [
        "If you don’t understand it, you can’t trust it.",
        "Producing results is not the same as making decisions.",
        "Engineering starts before you write code.",
        "If you want answers, this may not help. If you want clarity, it will."
    ];

    const heroSlideText = document.getElementById("hero-slide-text");
    const heroChalkText = document.getElementById("hero-chalk-text");
    const heroSection = document.querySelector(".hero");
    const welcomeAudio = document.getElementById("welcome-audio");
    const audioToggle = document.getElementById("audio-toggle");
    const audioLabel = audioToggle ? audioToggle.querySelector(".audio-label") : null;

    function applyHeroSlide(slideIndex) {
        const isIntro = slideIndex === 0;
        if (heroSection) heroSection.classList.toggle("hero-slide-00", isIntro);
        if (heroSlideText) {
            if (isIntro) {
                heroSlideText.textContent = "";
                heroSlideText.setAttribute("aria-hidden", "true");
            } else {
                const msgIndex = (slideIndex - 1 + slideMessages.length) % slideMessages.length;
                heroSlideText.textContent = slideMessages[msgIndex];
                heroSlideText.setAttribute("aria-hidden", "false");
            }
        }
        if (heroChalkText) {
            heroChalkText.setAttribute("aria-hidden", isIntro ? "false" : "true");
        }
    }

    function refreshSlides() {
        images = slideshow ? Array.from(slideshow.querySelectorAll("img")) : [];
    }

    function changeImage() {
        if (images.length < 2) return;
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

        if (next) {
            next.classList.add("active");
            // Ensure starting position fully covers viewport
            applyHeroSlide(nextIndex);
        }

        index = nextIndex;
    }

    applyHeroSlide(0);

    function startSlideshow() {
        if (slideshowTimer || images.length < 2) return;
        slideshowTimer = setInterval(changeImage, 5000);
    }

    startSlideshow();

    let hasAttemptedWelcomePlayback = false;
    let userStoppedWelcomeAudio = false;
    let autoPlayUnlockBound = false;
    let autoPlayUnlockHandler = null;

    function updateWelcomeAudioUI() {
        if (!audioToggle || !welcomeAudio) return;
        const isPlaying = !welcomeAudio.paused && !welcomeAudio.ended;
        audioToggle.classList.toggle("is-playing", isPlaying);
        audioToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
        audioToggle.setAttribute("aria-label", isPlaying ? "Stop welcome audio" : "Play welcome audio");
        if (audioLabel) {
            audioLabel.innerHTML = isPlaying ? "<i class=\"fas fa-stop\"></i>" : "<i class=\"fas fa-play\"></i>";
        }
    }

    function toggleWelcomeAudio() {
        if (!welcomeAudio) return;
        if (welcomeAudio.paused || welcomeAudio.ended) {
            if (welcomeAudio.ended) {
                welcomeAudio.currentTime = 0;
            }
            userStoppedWelcomeAudio = false;
            const playPromise = welcomeAudio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => { });
            }
        } else {
            welcomeAudio.pause();
            welcomeAudio.currentTime = 0;
            userStoppedWelcomeAudio = true;
            updateWelcomeAudioUI();
        }
    }

    function bindAutoPlayUnlock() {
        if (autoPlayUnlockBound) return;
        autoPlayUnlockBound = true;
        autoPlayUnlockHandler = (event) => {
            if (audioToggle && event && audioToggle.contains(event.target)) {
                return;
            }
            if (autoPlayUnlockHandler) {
                window.removeEventListener("pointerdown", autoPlayUnlockHandler);
                window.removeEventListener("keydown", autoPlayUnlockHandler);
                window.removeEventListener("touchstart", autoPlayUnlockHandler);
            }
            autoPlayUnlockBound = false;
            if (userStoppedWelcomeAudio || !welcomeAudio) return;
            welcomeAudio.play().catch(() => { });
        };
        window.addEventListener("pointerdown", autoPlayUnlockHandler);
        window.addEventListener("keydown", autoPlayUnlockHandler);
        window.addEventListener("touchstart", autoPlayUnlockHandler);
    }

    function attemptWelcomePlayback(force = false) {
        if (!welcomeAudio || userStoppedWelcomeAudio) return;
        if (hasAttemptedWelcomePlayback && !force) return;
        hasAttemptedWelcomePlayback = true;
        let playResult = null;
        try {
            playResult = welcomeAudio.play();
        } catch (error) {
            bindAutoPlayUnlock();
            return;
        }
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(() => {
                bindAutoPlayUnlock();
            });
        } else {
            bindAutoPlayUnlock();
        }
    }

    attemptWelcomePlayback();

    if (audioToggle) {
        audioToggle.addEventListener("click", (event) => {
            event.preventDefault();
            toggleWelcomeAudio();
        });
    }

    if (welcomeAudio) {
        welcomeAudio.addEventListener("play", updateWelcomeAudioUI);
        welcomeAudio.addEventListener("pause", updateWelcomeAudioUI);
        welcomeAudio.addEventListener("ended", updateWelcomeAudioUI);
        welcomeAudio.addEventListener("canplaythrough", () => {
            if (welcomeAudio.paused && !userStoppedWelcomeAudio) {
                attemptWelcomePlayback(true);
            }
        });
        if (welcomeAudio.readyState >= 1) {
            updateWelcomeAudioUI();
        } else {
            welcomeAudio.addEventListener("loadedmetadata", updateWelcomeAudioUI, { once: true });
        }
    }

    window.addEventListener("pageshow", () => {
        if (welcomeAudio && welcomeAudio.paused && !userStoppedWelcomeAudio) {
            attemptWelcomePlayback(true);
        }
    });

    function injectSlides() {
        if (!slideshow) return;
        const data = slideshow.dataset.slides;
        if (!data) return;
        const sources = data.split(",").map(src => src.trim()).filter(Boolean);
        if (!sources.length) return;
        sources.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            img.width = 1920;
            img.height = 600;
            slideshow.appendChild(img);
        });
        refreshSlides();
        startSlideshow();
    }

    if (slideshow && slideshow.dataset.slides) {
        window.addEventListener("load", () => {
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(injectSlides, { timeout: 2000 });
            } else {
                window.setTimeout(injectSlides, 1200);
            }
        });
    }

    // Loading overlay intentionally disabled for instant access.

    // Map sidebar controls
    const mapToggle = document.getElementById("map-toggle");
    const mapSidebar = document.getElementById("site-map");
    const mapBackdrop = document.getElementById("map-backdrop");
    const mapClose = document.getElementById("map-close");
    let mapLastFocus = null;

    function toggleMap(show) {
        if (!mapSidebar) return;
        mapSidebar.classList.toggle("open", show);
        if (mapBackdrop) mapBackdrop.classList.toggle("show", show);
        mapSidebar.setAttribute("aria-hidden", show ? "false" : "true");
        if (show) {
            mapSidebar.removeAttribute("inert");
        } else {
            mapSidebar.setAttribute("inert", "");
        }
        if (mapToggle) mapToggle.setAttribute("aria-expanded", show ? "true" : "false");
        document.body.classList.toggle("map-open", show);

        if (show) {
            mapLastFocus = document.activeElement;
            const firstFocus = mapSidebar.querySelector("button, a, [tabindex]:not([tabindex=\"-1\"])");
            if (firstFocus) firstFocus.focus();
        } else if (mapLastFocus) {
            mapLastFocus.focus();
        }
    }

    if (mapToggle) {
        mapToggle.addEventListener("click", () => toggleMap(true));
    }
    if (mapClose) {
        mapClose.addEventListener("click", () => toggleMap(false));
    }
    if (mapBackdrop) {
        mapBackdrop.addEventListener("click", () => toggleMap(false));
    }

    if (mapSidebar) {
        mapSidebar.querySelectorAll("a[href^=\"#\"]").forEach(link => {
            link.addEventListener("click", event => {
                const target = link.getAttribute("href");
                const el = target ? document.querySelector(target) : null;
                if (el) {
                    event.preventDefault();
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    toggleMap(false);
                }
            });
        });
    }

    document.addEventListener("keydown", event => {
        if (!mapSidebar || !mapSidebar.classList.contains("open")) return;
        if (event.key === "Escape") {
            toggleMap(false);
            return;
        }
        if (event.key !== "Tab") return;
        const focusable = mapSidebar.querySelectorAll("button, a, [tabindex]:not([tabindex=\"-1\"])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    // Survey modal controls
    const openSurveyTriggers = document.querySelectorAll(".open-survey-trigger");
    const totalWizardSteps = 4;
    let wizardStep = 1;
    let surveyModalReady = false;
    let surveyModal = null;
    let surveyBackdrop = null;
    let closeSurvey = null;
    let prevStep = null;
    let nextStep = null;
    let wizardSteps = [];
    let wizardIndicators = [];
    let summaryBlock = null;
    let summaryField = null;
    let copyBtn = null;
    let emailBtn = null;
    let whatsappBtn = null;
    let wizardError = null;
    let wizardPreview = null;
    let summaryPreview = null;
    let surveyForm = null;
    let surveyIntro = null;
    let wizardProgress = null;

    function toggleSurvey(show) {
        if (!surveyModal) return;
        surveyModal.classList.toggle("show", show);
        surveyModal.setAttribute("aria-hidden", show ? "false" : "true");
        if (show) {
            surveyModal.removeAttribute("inert");
        } else {
            surveyModal.setAttribute("inert", "");
        }
        document.body.classList.toggle("nav-open", show);
    }

    function ensureSurveyModal() {
        if (surveyModalReady) return;
        surveyModal = document.getElementById("survey-modal");
        if (!surveyModal) return;
        surveyBackdrop = document.getElementById("survey-backdrop");
        closeSurvey = document.getElementById("close-survey");
        prevStep = document.getElementById("prevStep");
        nextStep = document.getElementById("nextStep");
        wizardSteps = Array.from(document.querySelectorAll(".wizard-step"));
        wizardIndicators = Array.from(document.querySelectorAll(".wizard-progress .step"));
        summaryBlock = document.getElementById("wizard-summary");
        summaryField = document.getElementById("generatedSurveyMessage");
        copyBtn = document.getElementById("copy-survey");
        emailBtn = document.getElementById("email-survey");
        whatsappBtn = document.getElementById("whatsapp-survey");
        wizardError = document.getElementById("wizard-error");
        wizardPreview = document.getElementById("wizard-preview-text");
        summaryPreview = document.getElementById("wizard-summary-text");
        surveyForm = document.getElementById("surveyForm");
        surveyIntro = document.querySelector(".survey-intro");
        wizardProgress = document.querySelector(".wizard-progress");
        const modalGlossaryTerms = surveyModal ? surveyModal.querySelectorAll(".glossary-term") : [];
        modalGlossaryTerms.forEach(termEl => {
            termEl.addEventListener("click", (event) => {
                event.preventDefault();
                openGlossary(termEl);
            });
            termEl.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openGlossary(termEl);
                }
            });
        });

        if (closeSurvey) {
            closeSurvey.addEventListener("click", () => toggleSurvey(false));
        }
        if (surveyBackdrop) {
            surveyBackdrop.addEventListener("click", () => toggleSurvey(false));
        }
        if (prevStep) prevStep.addEventListener("click", () => goToStep(-1));
        if (nextStep) nextStep.addEventListener("click", () => goToStep(1));
        if (surveyForm) {
            surveyForm.addEventListener("input", () => {
                generateSurveyMessage();
            });
        }
        if (copyBtn) copyBtn.addEventListener("click", copySurvey);
        if (emailBtn) emailBtn.addEventListener("click", emailSurvey);
        if (whatsappBtn) whatsappBtn.addEventListener("click", whatsappSurvey);
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

        surveyModalReady = true;
        showWizardStep(wizardStep);
        generateSurveyMessage();
    }

    function openSurveyModal() {
        ensureSurveyModal();
        toggleSurvey(true);
    }

    if (openSurveyTriggers.length) {
        openSurveyTriggers.forEach(btn => {
            btn.addEventListener("click", openSurveyModal);
        });
    }

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
            prevStep.disabled = step === 1;
        }
        if (nextStep) {
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

    // Glossary modal controls
    const glossaryModal = document.getElementById("glossary-modal");
    const glossaryBackdrop = document.getElementById("glossary-backdrop");
    const glossaryClose = document.getElementById("glossary-close");
    const glossaryTitle = document.getElementById("glossary-title");
    const glossaryDefinition = document.getElementById("glossary-definition");
    const glossaryLinks = document.getElementById("glossary-links");
    const glossaryReferences = document.querySelector(".glossary-references");
    const glossarySearchGoogle = document.getElementById("glossary-search-google");
    const glossarySearchWikipedia = document.getElementById("glossary-search-wikipedia");
    const glossarySearchBing = document.getElementById("glossary-search-bing");
    const glossarySearchAcm = document.getElementById("glossary-search-acm");
    const glossaryImage = document.getElementById("glossary-image");
    const glossaryPanel = document.querySelector(".glossary-panel");

    const keywordGlossary = {
        "ai": {
            definition: "Systems that perform tasks typically associated with human intelligence.",
            image: "/images/glossary/ai.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Artificial_intelligence",
                "Britannica|https://www.britannica.com/technology/artificial-intelligence"
            ]
        },
        "algorithms": {
            definition: "Step-by-step procedures for solving problems or performing computations.",
            image: "/images/glossary/algorithms.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Algorithm",
                "Britannica|https://www.britannica.com/science/algorithm"
            ]
        },
        "apis": {
            definition: "Interfaces that let software systems communicate and share data.",
            image: "/images/glossary/apis.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/API",
                "IBM|https://www.ibm.com/topics/api"
            ]
        },
        "architecture": {
            definition: "High-level structure and key decisions in a software system.",
            image: "/images/glossary/architecture.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_architecture",
                "SEI|https://www.sei.cmu.edu/our-work/software-architecture/"
            ]
        },
        "cause and effect": {
            definition: "The relationship where one event produces another.",
            image: "/images/glossary/cause-and-effect.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Causality",
                "Britannica|https://www.britannica.com/topic/causation"
            ]
        },
        "code": {
            definition: "Written instructions in a programming language.",
            image: "/images/glossary/code.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Source_code",
                "Oxford Languages|https://languages.oup.com/google-dictionary-en/"
            ]
        },
        "components": {
            definition: "Individual parts that make up a larger system.",
            image: "/images/glossary/components.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_component",
                "IBM|https://www.ibm.com/topics/component-based-development"
            ]
        },
        "computer": {
            definition: "A programmable machine that processes data and executes instructions.",
            image: "/images/glossary/computer.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer",
                "Britannica|https://www.britannica.com/technology/computer"
            ]
        },
        "constraints": {
            definition: "Limits or requirements that shape possible solutions.",
            image: "/images/glossary/constraints.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Design_constraint",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/constraint"
            ]
        },
        "computing": {
            definition: "Processing information using computers and related systems.",
            image: "/images/glossary/computing.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computing",
                "Britannica|https://www.britannica.com/technology/computer"
            ]
        },
        "computing generations": {
            definition: "Historical eras of computing defined by dominant hardware and ideas.",
            image: "/images/glossary/computing-generations.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/History_of_computing_hardware",
                "Wikipedia|https://en.wikipedia.org/wiki/History_of_computing"
            ]
        },
        "computing systems": {
            definition: "Integrated hardware and software working together to perform computation.",
            image: "/images/glossary/computing-systems.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer_system",
                "IBM|https://www.ibm.com/topics/systems"
            ]
        },
        "data": {
            definition: "Information represented for processing and analysis.",
            image: "/images/glossary/data.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data",
                "IBM|https://www.ibm.com/topics/data"
            ]
        },
        "data structures": {
            definition: "Ways of organizing data for efficient access and modification.",
            image: "/images/glossary/data-structures.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data_structure",
                "GeeksforGeeks|https://www.geeksforgeeks.org/data-structures/"
            ]
        },
        "editors": {
            definition: "Tools used to write and edit code or text.",
            image: "/images/glossary/editors.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Text_editor",
                "Wikipedia|https://en.wikipedia.org/wiki/Source-code_editor"
            ]
        },
        "environments": {
            definition: "Configured setups where software is built, run, or tested.",
            image: "/images/glossary/environments.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Development_environment",
                "Wikipedia|https://en.wikipedia.org/wiki/Runtime_environment"
            ]
        },
        "ides": {
            definition: "Integrated development environments combine editing, build, and debugging tools.",
            image: "/images/glossary/ides.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Integrated_development_environment",
                "IBM|https://www.ibm.com/topics/ide"
            ]
        },
        "intelligence": {
            definition: "The ability to learn, reason, and solve problems.",
            image: "/images/glossary/intelligence.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Intelligence",
                "APA|https://www.apa.org/topics/intelligence"
            ]
        },
        "mental model": {
            definition: "An internal explanation of how something works.",
            image: "/images/glossary/mental-model.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Mental_model",
                "Interaction Design Foundation|https://www.interaction-design.org/literature/topics/mental-models"
            ]
        },
        "mentorship": {
            definition: "Guidance from a more experienced person to support learning and growth.",
            image: "/images/glossary/mentorship.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Mentorship",
                "APA|https://www.apa.org/education-career/grad/mentoring"
            ]
        },
        "model": {
            definition: "A simplified representation of a system or concept.",
            image: "/images/glossary/model.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Model",
                "Stanford Encyclopedia of Philosophy|https://plato.stanford.edu/entries/models-science/"
            ]
        },
        "programming": {
            definition: "Writing instructions that tell a computer what to do.",
            image: "/images/glossary/programming.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer_programming",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/programming"
            ]
        },
        "programming languages": {
            definition: "Formal languages used to write software instructions.",
            image: "/images/glossary/programming-languages.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Programming_language",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/programming-language"
            ]
        },
        "repos": {
            definition: "Repositories that store and track code changes.",
            image: "/images/glossary/repos.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Repository_(version_control)",
                "Git|https://git-scm.com/docs/git-init"
            ]
        },
        "version control": {
            definition: "Systems that track changes to files over time.",
            image: "/images/glossary/version-control.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Version_control",
                "Git|https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control"
            ]
        },
        "scientific": {
            definition: "Based on systematic study and rigorous methods.",
            image: "/images/glossary/scientific.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Science",
                "Britannica|https://www.britannica.com/science/science"
            ]
        },
        "software": {
            definition: "Programs and data that tell a computer how to operate.",
            image: "/images/glossary/software.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software",
                "Britannica|https://www.britannica.com/technology/software"
            ]
        },
        "software engineering": {
            definition: "Applying engineering principles to design, build, and maintain software systems.",
            image: "/images/glossary/software-engineering.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_engineering",
                "IEEE|https://www.computer.org/education/bodies-of-knowledge/software-engineering"
            ]
        },
        "structure": {
            definition: "The organized arrangement of parts in a system or document.",
            image: "/images/glossary/structure.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Structure",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/structure"
            ]
        },
        "systems": {
            definition: "Sets of interacting parts that work together.",
            image: "/images/glossary/systems.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/System",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/system"
            ]
        },
        "technologies": {
            definition: "Tools and methods used to build and operate systems.",
            image: "/images/glossary/technologies.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Technology",
                "Britannica|https://www.britannica.com/technology/technology"
            ]
        },
        "tools": {
            definition: "Software utilities used to build, test, or analyze systems.",
            image: "/images/glossary/tools.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_tool",
                "IBM|https://www.ibm.com/topics/devops-tools"
            ]
        },
        "trade-offs": {
            definition: "Choices where improving one aspect reduces another.",
            image: "/images/glossary/trade-offs.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Trade-off",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/trade-off"
            ]
        },
        "abstractions": {
            definition: "Abstractions are simplified representations that hide details to manage complexity.",
            image: "/images/glossary/abstractions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Abstraction",
                "Wikipedia|https://en.wikipedia.org/wiki/Abstraction_(computer_science)"
            ]
        },
        "aptitude": {
            definition: "Aptitude is the natural capacity to learn and reason within a domain when effort is applied.",
            image: "/images/glossary/aptitude.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Aptitude",
                "APA|https://dictionary.apa.org/aptitude"
            ]
        },
        "assumptions": {
            definition: "Assumptions are beliefs taken as true without explicit verification.",
            image: "/images/glossary/assumptions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Assumption",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/assumption"
            ]
        },
        "automated tools": {
            definition: "Tools that run tasks automatically with minimal manual input.",
            image: "/images/glossary/automated-tools.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Automation",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_tool"
            ]
        },
        "blind spots": {
            definition: "Blind spots are areas where understanding is missing but not immediately noticed.",
            image: "/images/glossary/blind-spots.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Blind_spot_(cognitive)",
                "Wikipedia|https://en.wikipedia.org/wiki/Metacognition"
            ]
        },
        "boundaries": {
            definition: "Boundaries define where one responsibility or system ends and another begins.",
            image: "/images/glossary/boundaries.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Boundary_(systems_theory)",
                "Wikipedia|https://en.wikipedia.org/wiki/Interface_(computing)"
            ]
        },
        "building blocks": {
            definition: "Building blocks are simple concepts that combine to form more complex ideas.",
            image: "/images/glossary/building-blocks.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Modular_design",
                "Wikipedia|https://en.wikipedia.org/wiki/Component-based_software_engineering"
            ]
        },
        "context": {
            definition: "Context is the surrounding information, constraints, and conditions that give meaning to a problem.",
            image: "/images/glossary/context.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Context",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/context"
            ]
        },
        "decision-making": {
            definition: "Decision-making is the act of choosing between alternatives based on reasoning, constraints, and expected consequences.",
            image: "/images/glossary/decision-making.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Decision-making",
                "Britannica|https://www.britannica.com/topic/decision-making"
            ]
        },
        "defensible": {
            definition: "Defensible means that decisions can be justified when questioned or challenged.",
            image: "/images/glossary/defensible.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/defensible",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/defensible"
            ]
        },
        "debugging": {
            definition: "Debugging is the process of locating and understanding the causes of incorrect behavior.",
            image: "/images/glossary/debugging.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Debugging",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_bug"
            ]
        },
        "design decisions": {
            definition: "Design decisions are choices that shape how a system is structured and behaves.",
            image: "/images/glossary/design-decisions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Design_rationale",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_design"
            ]
        },
        "documentation": {
            definition: "Documentation is written knowledge that preserves reasoning, decisions, and shared understanding.",
            image: "/images/glossary/documentation.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_documentation",
                "Wikipedia|https://en.wikipedia.org/wiki/Knowledge_management"
            ]
        },
        "execution": {
            definition: "Execution is the act of carrying out decisions through concrete actions or implementations.",
            image: "/images/glossary/execution.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/execution",
                "Wikipedia|https://en.wikipedia.org/wiki/Implementation"
            ]
        },
        "explainable": {
            definition: "Explainable means that decisions or results can be clearly justified and described.",
            image: "/images/glossary/explainable.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/explainable",
                "Wikipedia|https://en.wikipedia.org/wiki/Explanation"
            ]
        },
        "failure modes": {
            definition: "Failure modes describe the ways in which a system can break or behave incorrectly.",
            image: "/images/glossary/failure-modes.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Failure_mode",
                "Wikipedia|https://en.wikipedia.org/wiki/Fault_(technology)"
            ]
        },
        "foundations": {
            definition: "Foundations are the basic concepts and principles that support further understanding and learning.",
            image: "/images/glossary/foundations.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/foundation",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/foundation"
            ]
        },
        "fragmented learning": {
            definition: "Fragmented learning occurs when knowledge is acquired in isolated pieces without a coherent structure or mental model.",
            image: "/images/glossary/fragmented-learning.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Learning",
                "Wikipedia|https://en.wikipedia.org/wiki/Mental_model"
            ]
        },
        "fundamentals": {
            definition: "Fundamentals are core principles that remain valid regardless of tools or technologies.",
            image: "/images/glossary/fundamentals.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/fundamental",
                "Wikipedia|https://en.wikipedia.org/wiki/Fundamental"
            ]
        },
        "guidance": {
            definition: "Guidance is structured support that helps a learner reason, decide, and progress without removing responsibility for thinking or execution.",
            image: "/images/glossary/guidance.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/guidance",
                "Wikipedia|https://en.wikipedia.org/wiki/Mentoring"
            ]
        },
        "invariants": {
            definition: "Invariants are conditions that must always remain true within a system.",
            image: "/images/glossary/invariants.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Invariant_(computer_science)",
                "Wikipedia|https://en.wikipedia.org/wiki/Invariant_(mathematics)"
            ]
        },
        "iterate": {
            definition: "Repeat a process to improve or refine results.",
            image: "/images/glossary/iterate.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Iteration",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/iterate"
            ]
        },
        "iteration": {
            definition: "Iteration is the repeated process of refining understanding or solutions based on feedback.",
            image: "/images/glossary/iteration.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Iteration",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/iteration"
            ]
        },
        "judgment": {
            definition: "Judgment is the ability to make sound decisions based on experience and reasoning.",
            image: "/images/glossary/judgment.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Judgement",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/judgement"
            ]
        },
        "knowledge gaps": {
            definition: "Knowledge gaps are missing pieces of understanding that prevent concepts from fully making sense.",
            image: "/images/glossary/knowledge-gaps.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Knowledge",
                "Wikipedia|https://en.wikipedia.org/wiki/Skill_gap"
            ]
        },
        "learning path": {
            definition: "A learning path is an ordered sequence of topics designed to build understanding progressively.",
            image: "/images/glossary/learning-path.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Curriculum",
                "Wikipedia|https://en.wikipedia.org/wiki/Learning"
            ]
        },
        "learning situations": {
            definition: "Contexts or scenarios where learning takes place.",
            image: "/images/glossary/learning-situations.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Learning",
                "Wikipedia|https://en.wikipedia.org/wiki/Educational_psychology"
            ]
        },
        "mental effort": {
            definition: "Cognitive effort required to process information and solve problems.",
            image: "/images/glossary/mental-effort.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Cognitive_load",
                "Wikipedia|https://en.wikipedia.org/wiki/Effort"
            ]
        },
        "output": {
            definition: "Output refers to visible results such as code, features, or answers, regardless of whether understanding exists.",
            image: "/images/glossary/output.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Input/output",
                "Wikipedia|https://en.wikipedia.org/wiki/Output"
            ]
        },
        "production": {
            definition: "Production refers to real-world usage where systems affect users, data, and responsibility.",
            image: "/images/glossary/production.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Production_environment",
                "Wikipedia|https://en.wikipedia.org/wiki/Responsibility"
            ]
        },
        "real-world systems": {
            definition: "Real-world systems are systems that operate under real constraints such as users, failures, and time.",
            image: "/images/glossary/real-world-systems.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/System",
                "Wikipedia|https://en.wikipedia.org/wiki/Real_world"
            ]
        },
        "reasoning": {
            definition: "Reasoning is the process of connecting facts, assumptions, and rules to reach justified conclusions.",
            image: "/images/glossary/reasoning.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Reasoning",
                "Wikipedia|https://en.wikipedia.org/wiki/Logic"
            ]
        },
        "reflection": {
            definition: "Reflection is the deliberate examination of one's own thinking and decisions.",
            image: "/images/glossary/reflection.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Reflective_practice",
                "Wikipedia|https://en.wikipedia.org/wiki/Reflection_(philosophy)"
            ]
        },
        "reusable ideas": {
            definition: "Concepts that can be applied across different problems or contexts.",
            image: "/images/glossary/reusable-ideas.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Abstraction",
                "Wikipedia|https://en.wikipedia.org/wiki/Reuse"
            ]
        },
        "shared expectations": {
            definition: "Shared expectations are mutual agreements about roles, responsibilities, and effort.",
            image: "/images/glossary/shared-expectations.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Expectation_(psychology)",
                "Wikipedia|https://en.wikipedia.org/wiki/Psychological_contract"
            ]
        },
        "understanding": {
            definition: "Understanding means grasping why something works, not just knowing how to use it.",
            image: "/images/glossary/understanding.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Understanding",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/understanding"
            ]
        },
        "ai tools -> assumptions": {
            definition: "AI tools rely on assumptions about data, prompts, and context.",
            image: "/images/glossary/ai-tools-assumptions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Artificial_intelligence",
                "Wikipedia|https://en.wikipedia.org/wiki/Assumption"
            ]
        },
        "apis -> boundaries": {
            definition: "APIs define the boundary where systems agree on how to interact.",
            image: "/images/glossary/apis-boundaries.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/API",
                "Wikipedia|https://en.wikipedia.org/wiki/Interface_(computing)"
            ]
        },
        "architecture -> structure": {
            definition: "Architecture describes the structure that holds system decisions together.",
            image: "/images/glossary/architecture-structure.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_architecture",
                "Wikipedia|https://en.wikipedia.org/wiki/Structure"
            ]
        },
        "backend -> tradeoffs": {
            definition: "Backend decisions involve tradeoffs in performance, reliability, and complexity.",
            image: "/images/glossary/backend-tradeoffs.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Front-end_and_back-end",
                "Wikipedia|https://en.wikipedia.org/wiki/Trade-off"
            ]
        },
        "code -> choices": {
            definition: "Code reflects choices about behavior, readability, and tradeoffs.",
            image: "/images/glossary/code-choices.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Source_code",
                "Wikipedia|https://en.wikipedia.org/wiki/Decision-making"
            ]
        },
        "collaboration -> alignment": {
            definition: "Collaboration works when goals and responsibilities stay aligned.",
            image: "/images/glossary/collaboration-alignment.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Collaboration",
                "Wikipedia|https://en.wikipedia.org/wiki/Strategic_alignment"
            ]
        },
        "data -> meaning": {
            definition: "Data becomes useful when interpreted with context and meaning.",
            image: "/images/glossary/data-meaning.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data",
                "Wikipedia|https://en.wikipedia.org/wiki/Information"
            ]
        },
        "databases -> invariants": {
            definition: "Databases depend on invariants like keys and constraints to stay consistent.",
            image: "/images/glossary/databases-invariants.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Database",
                "Wikipedia|https://en.wikipedia.org/wiki/Invariant_(mathematics)"
            ]
        },
        "debugging -> reasoning": {
            definition: "Debugging is a reasoning process to find causes of incorrect behavior.",
            image: "/images/glossary/debugging-reasoning.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Debugging",
                "Wikipedia|https://en.wikipedia.org/wiki/Reasoning"
            ]
        },
        "deployments -> risk": {
            definition: "Deployments carry operational risk and require careful planning.",
            image: "/images/glossary/deployments-risk.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_deployment",
                "Wikipedia|https://en.wikipedia.org/wiki/Risk"
            ]
        },
        "design -> intent": {
            definition: "Design expresses intent about how something should work.",
            image: "/images/glossary/design-intent.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Design",
                "Wikipedia|https://en.wikipedia.org/wiki/Intention"
            ]
        },
        "distributed systems -> failure modes": {
            definition: "Distributed systems face distinct failure modes like partial failure.",
            image: "/images/glossary/distributed-systems-failure-modes.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Distributed_computing",
                "Wikipedia|https://en.wikipedia.org/wiki/Failure_mode"
            ]
        },
        "documentation -> shared memory": {
            definition: "Documentation acts as shared memory for teams and future work.",
            image: "/images/glossary/documentation-shared-memory.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_documentation",
                "Wikipedia|https://en.wikipedia.org/wiki/Organizational_memory"
            ]
        },
        "frontend -> clarity": {
            definition: "Frontend work depends on clarity in interfaces and interactions.",
            image: "/images/glossary/frontend-clarity.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Front-end_and_back-end",
                "Wikipedia|https://en.wikipedia.org/wiki/User_interface_design"
            ]
        },
        "interfaces -> contracts": {
            definition: "Interfaces act as contracts between components.",
            image: "/images/glossary/interfaces-contracts.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Interface_(computing)",
                "Wikipedia|https://en.wikipedia.org/wiki/Design_by_contract"
            ]
        },
        "monitoring -> feedback": {
            definition: "Monitoring provides feedback about system behavior over time.",
            image: "/images/glossary/monitoring-feedback.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/System_monitor",
                "Wikipedia|https://en.wikipedia.org/wiki/Feedback"
            ]
        },
        "performance -> limits": {
            definition: "Performance reveals limits under load and stress.",
            image: "/images/glossary/performance-limits.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_performance_testing",
                "Wikipedia|https://en.wikipedia.org/wiki/Capacity_planning"
            ]
        },
        "production -> responsibility": {
            definition: "Production systems demand responsibility for reliability and users.",
            image: "/images/glossary/production-responsibility.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Deployment_environment",
                "Wikipedia|https://en.wikipedia.org/wiki/Responsibility"
            ]
        },
        "refactoring -> discipline": {
            definition: "Refactoring requires discipline to improve structure without changing behavior.",
            image: "/images/glossary/refactoring-discipline.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Refactoring",
                "Wikipedia|https://en.wikipedia.org/wiki/Discipline"
            ]
        },
        "requirements -> decisions": {
            definition: "Requirements guide decisions about scope and behavior.",
            image: "/images/glossary/requirements-decisions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Requirements_engineering",
                "Wikipedia|https://en.wikipedia.org/wiki/Decision-making"
            ]
        },
        "scalability -> constraints": {
            definition: "Scalability is shaped by constraints in time, resources, and cost.",
            image: "/images/glossary/scalability-constraints.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Scalability",
                "Wikipedia|https://en.wikipedia.org/wiki/Constraint"
            ]
        },
        "security -> trust": {
            definition: "Security underpins trust in systems and data.",
            image: "/images/glossary/security-trust.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer_security",
                "Wikipedia|https://en.wikipedia.org/wiki/Trust_(social_science)"
            ]
        },
        "systems -> interactions": {
            definition: "Systems are defined by interactions between their parts.",
            image: "/images/glossary/systems-interactions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/System",
                "Wikipedia|https://en.wikipedia.org/wiki/Interaction"
            ]
        },
        "tests -> evidence": {
            definition: "Tests provide evidence that behavior matches intent.",
            image: "/images/glossary/tests-evidence.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_testing",
                "Wikipedia|https://en.wikipedia.org/wiki/Evidence"
            ]
        },
        "version control -> accountability": {
            definition: "Version control supports accountability through history and review.",
            image: "/images/glossary/version-control-accountability.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Version_control",
                "Wikipedia|https://en.wikipedia.org/wiki/Accountability"
            ]
        }
    };

    // Make keyword strip terms clickable glossary entries.
    const keywordTerms = document.querySelectorAll(".keyword-strip span");
    keywordTerms.forEach(termEl => {
        const term = termEl.textContent.trim();
        const entry = keywordGlossary[term];
        termEl.classList.add("glossary-term");
        termEl.setAttribute("role", "button");
        termEl.setAttribute("tabindex", "0");
        termEl.dataset.term = term;
        if (entry) {
            termEl.dataset.definition = entry.definition;
            termEl.dataset.links = entry.links.join(";");
        }
    });

    const glossaryTerms = document.querySelectorAll(".glossary-term");

    function titleFromUrl(url) {
        if (!url) return "";
        try {
            const parsed = new URL(url);
            const parts = parsed.pathname.split("/").filter(Boolean);
            let raw = parts[parts.length - 1] || "";
            if (!raw) {
                raw = parsed.searchParams.get("search")
                    || parsed.searchParams.get("q")
                    || parsed.searchParams.get("AllField")
                    || "";
            }
            if (!raw) return "";
            const decoded = decodeURIComponent(raw);
            return decoded.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
        } catch (error) {
            return "";
        }
    }

    function buildReferenceLabel(sourceLabel, url) {
        const title = titleFromUrl(url);
        const label = (sourceLabel || "").trim();
        if (!title) return label || url;
        if (!label) return title;
        if (title.toLowerCase() === label.toLowerCase()) return title;
        return `${title} (${label})`;
    }

    function setGlossaryImage(term, termEl, lookup) {
        if (!glossaryImage) return;
        const explicitImage = (termEl && termEl.dataset.image)
            || (lookup && lookup.image)
            || "";

        if (glossaryPanel) {
            glossaryPanel.classList.toggle("glossary-panel--no-image", !explicitImage);
        }

        if (!explicitImage) {
            glossaryImage.removeAttribute("src");
            glossaryImage.alt = "";
            return;
        }

        glossaryImage.alt = term ? `Illustration for ${term}` : "Glossary illustration";
        glossaryImage.src = explicitImage;
    }

    function closeGlossary() {
        if (!glossaryModal) return;
        glossaryModal.classList.remove("show");
        glossaryModal.setAttribute("aria-hidden", "true");
        glossaryModal.setAttribute("inert", "");
    }

    function openGlossary(termEl) {
        if (!glossaryModal || !termEl) return;
        const term = termEl.dataset.term || termEl.textContent.trim();
        let definition = termEl.dataset.definition || "";
        let linksData = termEl.dataset.links || "";
        const lookup = keywordGlossary[term] || keywordGlossary[term.toLowerCase()];
        if ((!definition || !definition.trim()) && lookup) {
            definition = lookup.definition || "";
        }
        if ((!linksData || !linksData.trim()) && lookup && Array.isArray(lookup.links)) {
            linksData = lookup.links.join(";");
        }

        setGlossaryImage(term, termEl, lookup);

        if (glossaryTitle) glossaryTitle.textContent = term;
        if (glossaryDefinition) glossaryDefinition.textContent = definition;

        const termQuery = encodeURIComponent(term);
        if (glossarySearchGoogle) glossarySearchGoogle.href = `https://www.google.com/search?q=${termQuery}`;
        if (glossarySearchWikipedia) glossarySearchWikipedia.href = `https://en.wikipedia.org/wiki/Special:Search?search=${termQuery}`;
        if (glossarySearchBing) glossarySearchBing.href = `https://www.bing.com/search?q=${termQuery}`;
        if (glossarySearchAcm) glossarySearchAcm.href = `https://dl.acm.org/action/doSearch?AllField=${termQuery}`;

        if (glossaryLinks) {
            glossaryLinks.innerHTML = "";
            const items = linksData.split(";").map(item => item.trim()).filter(Boolean);
            items.forEach(item => {
                const parts = item.split("|");
                const label = (parts[0] || "").trim();
                const url = (parts[1] || "").trim();
                if (!url) return;
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener";
                a.textContent = buildReferenceLabel(label, url);
                li.appendChild(a);
                glossaryLinks.appendChild(li);
            });
            if (glossaryReferences) {
                glossaryReferences.style.display = items.length ? "block" : "none";
            }
        }

        glossaryModal.classList.add("show");
        glossaryModal.setAttribute("aria-hidden", "false");
        glossaryModal.removeAttribute("inert");
    }

    glossaryTerms.forEach(termEl => {
        termEl.addEventListener("click", (event) => {
            event.preventDefault();
            openGlossary(termEl);
        });
        termEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openGlossary(termEl);
            }
        });
    });

    if (glossaryImage) {
        glossaryImage.addEventListener("error", () => {
            if (glossaryPanel) {
                glossaryPanel.classList.add("glossary-panel--no-image");
            }
            glossaryImage.removeAttribute("src");
            glossaryImage.alt = "";
        });
    }

    if (glossaryBackdrop) glossaryBackdrop.addEventListener("click", closeGlossary);
    if (glossaryClose) glossaryClose.addEventListener("click", closeGlossary);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && glossaryModal && glossaryModal.classList.contains("show")) {
            closeGlossary();
        }
    });

    // Chat simulation
    const chatPhone = document.querySelector(".chat-phone[data-chat-loop=\"true\"]");
    if (chatPhone) {
        const chatMessages = chatPhone.querySelector(".chat-messages");
        if (!chatMessages) return;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const chatScript = [
            {
                id: "initial-confusion",
                messages: [
                    { role: "mentee", text: "i can write code but still feel lost" },
                    { role: "mentor", text: "what feels unclear" },
                    { role: "mentee", text: "i dont really know what im building" },
                    { role: "mentor", text: "what do you think the system is supposed to do" },
                    { role: "mentee", text: "thats the problem im not sure" }
                ]
            },
            {
                id: "requirements-gap",
                messages: [
                    { role: "mentee", text: "the feature works but something feels off" },
                    { role: "mentor", text: "what requirement does it satisfy" },
                    { role: "mentee", text: "i followed the task not the reason behind it" },
                    { role: "mentor", text: "so where do decisions come from in your code" },
                    { role: "mentee", text: "never thought about that" }
                ]
            },
            {
                id: "ai-trust",
                messages: [
                    { role: "mentee", text: "ai gave me the code but i cant really trust it" },
                    { role: "mentor", text: "what would make it trustworthy" },
                    { role: "mentee", text: "if i understood why it works" },
                    { role: "mentor", text: "what part doesnt make sense yet" },
                    { role: "mentee", text: "the logic behind the decisions" }
                ]
            },
            {
                id: "debugging-thinking",
                messages: [
                    { role: "mentee", text: "i keep fixing bugs and new ones appear" },
                    { role: "mentor", text: "what do you think is causing that" },
                    { role: "mentee", text: "maybe im just patching symptoms" },
                    { role: "mentor", text: "what would be underneath that" },
                    { role: "mentee", text: "i dont have a clear model of the system" }
                ]
            },
            {
                id: "structure-missing",
                messages: [
                    { role: "mentee", text: "i know the tools but everything feels messy" },
                    { role: "mentor", text: "what is organizing your decisions right now" },
                    { role: "mentee", text: "honestly nothing" },
                    { role: "mentor", text: "what could act as a structure" },
                    { role: "mentee", text: "probably a design i never made" }
                ]
            },
            {
                id: "tutorial-frustration",
                messages: [
                    { role: "mentee", text: "i followed the tutorial exactly and now im stuck" },
                    { role: "mentor", text: "what decision did the tutorial help you make" },
                    { role: "mentee", text: "none i just copied it" },
                    { role: "mentor", text: "that explains a lot" },
                    { role: "mentee", text: "yeah it does" }
                ]
            },
            {
                id: "focus-and-scope",
                messages: [
                    { role: "mentee", text: "i keep adding things but progress is slow" },
                    { role: "mentor", text: "what problem are you solving right now" },
                    { role: "mentee", text: "too many at once" },
                    { role: "mentor", text: "which one matters most" },
                    { role: "mentee", text: "i need to decide that first" }
                ]
            }
        ];


        const typingRows = {
            mentor: chatMessages.querySelector(".chat-row.typing.mentor"),
            mentee: chatMessages.querySelector(".chat-row.typing.mentee")
        };

        const scrollToBottom = () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const renderConversation = conversation => {
            const existing = chatMessages.querySelectorAll(".chat-row[data-chat-step]");
            existing.forEach(row => row.remove());

            conversation.messages.forEach((message, idx) => {
                const row = document.createElement("div");
                row.className = `chat-row ${message.role}`;
                row.dataset.chatStep = String(idx + 1);

                const avatar = document.createElement("div");
                avatar.className = `chat-avatar${message.role === "mentee" ? " chat-avatar-mentee" : ""}`;
                if (message.role === "mentor") {
                    const img = document.createElement("img");
                    img.src = "https://avatars.githubusercontent.com/u/25892480?v=4&s=96";
                    img.alt = "rafageist";
                    img.loading = "lazy";
                    img.decoding = "async";
                    img.width = 36;
                    img.height = 36;
                    avatar.appendChild(img);
                } else {
                    const icon = document.createElement("i");
                    icon.className = "fas fa-user";
                    avatar.appendChild(icon);
                }

                const bubble = document.createElement("div");
                bubble.className = "chat-bubble";

                const username = document.createElement("div");
                username.className = "chat-username";
                username.textContent = message.role === "mentor" ? "rafageist" : "mentee";

                const text = document.createElement("div");
                text.className = "chat-text";
                text.textContent = message.text;

                bubble.appendChild(username);
                bubble.appendChild(text);
                row.appendChild(avatar);
                row.appendChild(bubble);
                chatMessages.insertBefore(row, typingRows.mentor || null);
            });
            scrollToBottom();
        };

        const pickConversation = list => list[Math.floor(Math.random() * list.length)];
        const introConversation = chatScript.find(entry => entry.id === "first-contact") || chatScript[0];
        renderConversation(introConversation);

        const chatRows = () => Array.from(chatMessages.querySelectorAll(".chat-row[data-chat-step]"))
            .sort((a, b) => Number(a.dataset.chatStep) - Number(b.dataset.chatStep));

        if (prefersReducedMotion) {
            chatRows().forEach(row => row.classList.add("is-visible"));
            scrollToBottom();
        } else {
            chatPhone.classList.add("is-animated");
            let index = 0;

            const hideTyping = () => {
                Object.values(typingRows).forEach(row => {
                    if (row) row.classList.remove("is-visible");
                });
            };

            const showTyping = role => {
                hideTyping();
                const row = typingRows[role];
                if (row) row.classList.add("is-visible");
                scrollToBottom();
            };

            const resetChat = () => {
                hideTyping();
                chatRows().forEach(row => row.classList.remove("is-visible"));
                scrollToBottom();
            };

            const playNext = () => {
                const rows = chatRows();
                if (index >= rows.length) {
                    setTimeout(() => {
                        resetChat();
                        index = 0;
                        renderConversation(pickConversation(chatScript));
                        playNext();
                    }, 2200);
                    return;
                }
                const row = rows[index];
                const role = row.classList.contains("mentor") ? "mentor" : "mentee";
                showTyping(role);
                setTimeout(() => {
                    hideTyping();
                    row.classList.add("is-visible");
                    index += 1;
                    scrollToBottom();
                    setTimeout(playNext, 1700);
                }, 2000);
            };

            resetChat();
            playNext();
        }
    }
});

