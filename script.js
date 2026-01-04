document.addEventListener("DOMContentLoaded", function () {
    // --- Slideshow ---
    const slideshow = document.getElementById("slideshow");
    let images = slideshow ? Array.from(slideshow.querySelectorAll("img")) : [];
    let index = 0;
    let slideshowTimer = null;
    const welcomeAudio = document.getElementById("welcome-audio");
    const audioToggle = document.getElementById("audio-toggle");
    const audioLabel = audioToggle ? audioToggle.querySelector(".audio-label") : null;

    function refreshSlides() {
        images = slideshow ? Array.from(slideshow.querySelectorAll("img")) : [];
    }

    const slideMediaQuery = window.matchMedia("(max-width: 500px)");
    const slidePreloadCache = new Map();

    function withVerticalSuffix(src) {
        if (!src || src.includes(".vertical.")) return src || "";
        const queryIndex = src.indexOf("?");
        const hashIndex = src.indexOf("#");
        let endIndex = src.length;
        if (queryIndex !== -1) endIndex = Math.min(endIndex, queryIndex);
        if (hashIndex !== -1) endIndex = Math.min(endIndex, hashIndex);
        const path = src.slice(0, endIndex);
        const suffix = src.slice(endIndex);
        const dotIndex = path.lastIndexOf(".");
        if (dotIndex === -1) return src;
        return `${path.slice(0, dotIndex)}.vertical${path.slice(dotIndex)}${suffix}`;
    }

    function resolveSlideSrc(baseSrc) {
        return slideMediaQuery.matches ? withVerticalSuffix(baseSrc) : baseSrc;
    }

    function preloadSlideSource(src) {
        if (!src) return Promise.reject(new Error("Missing src"));
        if (slidePreloadCache.has(src)) return slidePreloadCache.get(src);
        const preloadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => {
                slidePreloadCache.delete(src);
                reject(new Error(`Failed to load ${src}`));
            };
            img.src = src;
        });
        slidePreloadCache.set(src, preloadPromise);
        return preloadPromise;
    }

    function applyResponsiveSlideSources() {
        refreshSlides();
        images.forEach(img => {
            const baseSrc = img.dataset.baseSrc || img.getAttribute("src") || "";
            if (!baseSrc) return;
            if (!img.dataset.baseSrc) img.dataset.baseSrc = baseSrc;
            const target = resolveSlideSrc(baseSrc);
            const currentSrc = img.dataset.currentSrc || img.getAttribute("src") || "";
            if (!target) return;
            if (target === baseSrc) {
                if (currentSrc !== baseSrc) {
                    img.src = baseSrc;
                    img.dataset.currentSrc = baseSrc;
                }
                img.classList.remove("slide-missing");
                return;
            }
            const isUsingTarget = currentSrc === target && !img.classList.contains("slide-missing");
            if (isUsingTarget) return;
            img.classList.add("slide-missing");
            preloadSlideSource(target).then(() => {
                if (resolveSlideSrc(baseSrc) !== target) return;
                img.src = target;
                img.dataset.currentSrc = target;
                img.classList.remove("slide-missing");
            }).catch(() => {
                img.dataset.currentSrc = target;
                img.classList.add("slide-missing");
            });
        });
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
        }

        index = nextIndex;
    }

    applyResponsiveSlideSources();

    function startSlideshow() {
        if (slideshowTimer || images.length < 2) return;
        slideshowTimer = setInterval(changeImage, 5000);
    }

    startSlideshow();

    if (slideMediaQuery.addEventListener) {
        slideMediaQuery.addEventListener("change", applyResponsiveSlideSources);
    } else if (slideMediaQuery.addListener) {
        slideMediaQuery.addListener(applyResponsiveSlideSources);
    }

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
        const normalizeSlideSrc = (src) => {
            if (!src) return "";
            try {
                return new URL(src, window.location.href).href;
            } catch (error) {
                return src;
            }
        };
        refreshSlides();
        const existingSources = new Set(
            images
                .map(img => normalizeSlideSrc(img.dataset.baseSrc || img.currentSrc || img.getAttribute("src")))
                .filter(Boolean)
        );
        sources.forEach(baseSrc => {
            const normalized = normalizeSlideSrc(baseSrc);
            if (existingSources.has(normalized)) return;
            const img = document.createElement("img");
            img.dataset.baseSrc = baseSrc;
            img.src = baseSrc;
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            if (slideMediaQuery.matches) {
                img.classList.add("slide-missing");
            }
            slideshow.appendChild(img);
            existingSources.add(normalized);
        });
        applyResponsiveSlideSources();
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
    const mapMediaQuery = window.matchMedia("(max-width: 1100px) and (orientation: portrait)");
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
        mapToggle.addEventListener("click", () => {
            if (mapMediaQuery && !mapMediaQuery.matches) return;
            toggleMap(true);
        });
    }
    if (mapClose) {
        mapClose.addEventListener("click", () => toggleMap(false));
    }
    if (mapBackdrop) {
        mapBackdrop.addEventListener("click", () => toggleMap(false));
    }

    if (mapMediaQuery) {
        mapMediaQuery.addEventListener("change", event => {
            if (!event.matches) toggleMap(false);
        });
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

    // Desktop nav dropdowns: keep only one open at a time.
    const navGroups = document.querySelectorAll(".nav-group");
    if (navGroups.length) {
        const closeOtherNavGroups = (current) => {
            navGroups.forEach(group => {
                if (group !== current && group.hasAttribute("open")) {
                    group.removeAttribute("open");
                }
            });
        };

        navGroups.forEach(group => {
            group.addEventListener("toggle", () => {
                if (group.open) {
                    closeOtherNavGroups(group);
                }
            });
            group.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => {
                    group.removeAttribute("open");
                });
            });
        });

        document.addEventListener("click", event => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest(".nav-group")) return;
            closeOtherNavGroups(null);
        });
    }

    // About modal controls
    const aboutTrigger = document.getElementById("about-trigger");
    const aboutModal = document.getElementById("about-modal");
    const aboutBackdrop = document.getElementById("about-backdrop");
    const aboutClose = document.getElementById("about-close");
    let aboutLastFocus = null;

    function toggleAbout(show) {
        if (!aboutModal) return;
        aboutModal.classList.toggle("show", show);
        aboutModal.setAttribute("aria-hidden", show ? "false" : "true");
        if (show) {
            aboutModal.removeAttribute("inert");
        } else {
            aboutModal.setAttribute("inert", "");
        }

        if (show) {
            aboutLastFocus = document.activeElement;
            const firstFocus = aboutModal.querySelector("button, a, [tabindex]:not([tabindex=\"-1\"])");
            if (firstFocus) firstFocus.focus();
        } else if (aboutLastFocus) {
            aboutLastFocus.focus();
        }
    }

    if (aboutTrigger) {
        aboutTrigger.addEventListener("click", event => {
            event.preventDefault();
            if (mapSidebar && mapSidebar.classList.contains("open")) {
                toggleMap(false);
            }
            toggleAbout(true);
        });
    }
    if (aboutBackdrop) aboutBackdrop.addEventListener("click", () => toggleAbout(false));
    if (aboutClose) aboutClose.addEventListener("click", () => toggleAbout(false));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && aboutModal && aboutModal.classList.contains("show")) {
            toggleAbout(false);
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
        if (mapSidebar && mapSidebar.classList.contains("open")) {
            toggleMap(false);
        }
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
            definition: "Step by step procedures for solving problems or performing computations.",
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
            definition: "High level structure and key decisions in a software system.",
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
            definition: "Programs, data, and associated documentation that specify and control the behavior of a computer system.",
            image: "/images/glossary/software.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software",
                "Britannica|https://www.britannica.com/technology/software"
            ]
        },
        "software engineering": {
            definition: "The systematic application of engineering principles, methods, and practices to specify, design, develop, test, deploy, and maintain software systems.",
            image: "/images/glossary/software-engineering.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_engineering",
                "IEEE|https://www.computer.org/education/bodies-of-knowledge/software-engineering"
            ]
        },
        "structure": {
            definition: "The arrangement and organization of components and their relationships within a system, artifact, or document.",
            image: "/images/glossary/structure.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Structure",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/structure"
            ]
        },
        "systems": {
            definition: "A set of interconnected components that interact according to defined relationships to achieve a common purpose or function.",
            image: "/images/glossary/systems.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/System",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/system"
            ]
        },
        "technologies": {
            definition: "The practical application of knowledge through tools, techniques, and methods used to design, build, operate, and maintain systems.",
            image: "/images/glossary/technologies.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Technology",
                "Britannica|https://www.britannica.com/technology/technology"
            ]
        },
        "technological university of havana": {
            definition: "A public technical university in Havana, Cuba, known as CUJAE, focused on engineering and applied sciences.",
            image: "/images/glossary/technological-university-of-havana.webp",
            links: [
                "CUJAE|https://cujae.edu.cu/"
            ]
        },
        "tools": {
            definition: "Software utilities that support specific tasks in the development, operation, analysis, or maintenance of systems.",
            image: "/images/glossary/tools.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_tool",
                "IBM|https://www.ibm.com/topics/devops-tools"
            ]
        },
        "trade offs": {
            definition: "Design decisions in which improving one property or objective requires compromising another, due to inherent constraints.",
            image: "/images/glossary/trade-offs.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Trade-off",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/trade-off"
            ]
        },
        "abstractions": {
            definition: "Representations that expose essential properties while hiding unnecessary details, enabling reasoning and management of complexity.",
            image: "/images/glossary/abstractions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Abstraction",
                "Wikipedia|https://en.wikipedia.org/wiki/Abstraction_(computer_science)"
            ]
        },
        "aptitude": {
            definition: "An individual's inherent potential to acquire skills or knowledge in a specific domain through learning and practice.",
            image: "/images/glossary/aptitude.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Aptitude",
                "APA|https://dictionary.apa.org/aptitude"
            ]
        },
        "automated tools": {
            definition: "Software tools that execute predefined tasks automatically based on configured rules, workflows, or triggers, requiring limited human intervention.",
            image: "/images/glossary/automated-tools.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Automation",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_tool"
            ]
        },
        "boundaries": {
            definition: "Defined limits that separate systems, components, or responsibilities, specifying what is inside, what is outside, and how interaction occurs.",
            image: "/images/glossary/boundaries.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Boundary_(systems_theory)",
                "Wikipedia|https://en.wikipedia.org/wiki/Interface_(computing)"
            ]
        },
        "building blocks": {
            definition: "Fundamental components or concepts that can be combined and reused to construct more complex systems, structures, or solutions.",
            image: "/images/glossary/building-blocks.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Modular_design",
                "Wikipedia|https://en.wikipedia.org/wiki/Component-based_software_engineering"
            ]
        },
        "context": {
            definition: "The set of surrounding information, constraints, assumptions, and conditions that influence how a problem, system, or situation is interpreted and addressed.",
            image: "/images/glossary/context.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Context",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/context"
            ]
        },
        "decision making": {
            definition: "The process of selecting among alternatives based on reasoning, available information, constraints, and anticipated outcomes.",
            image: "/images/glossary/decision-making.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Decision-making",
                "Britannica|https://www.britannica.com/topic/decision-making"
            ]
        },
        "defensible": {
            definition: "Capable of being justified through clear reasoning, evidence, and explicit criteria when questioned or challenged.",
            image: "/images/glossary/defensible.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/defensible",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/defensible"
            ]
        },
        "debugging": {
            definition: "The systematic process of identifying, isolating, and understanding the causes of incorrect or unexpected behavior in software.",
            image: "/images/glossary/debugging.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Debugging",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_bug"
            ]
        },

        "design decisions": {
            definition: "Decisions made during design that determine a system’s structure, behavior, and trade-offs, based on requirements, constraints, and intended use.",
            image: "/images/glossary/design-decisions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Design_rationale",
                "Wikipedia|https://en.wikipedia.org/wiki/Software_design"
            ]
        },

        "documentation": {
            definition: "Written artifacts that capture knowledge, reasoning, decisions, and instructions to support understanding, use, maintenance, and evolution of a system.",
            image: "/images/glossary/documentation.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_documentation",
                "Wikipedia|https://en.wikipedia.org/wiki/Knowledge_management"
            ]
        },

        "execution": {
            definition: "The process of putting decisions, plans, or designs into effect through concrete actions or implementations.",
            image: "/images/glossary/execution.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/execution",
                "Wikipedia|https://en.wikipedia.org/wiki/Implementation"
            ]
        },

        "failure modes": {
            definition: "The specific ways in which a system, component, or process can fail to perform as intended, including the conditions and causes that lead to incorrect or degraded behavior.",
            image: "/images/glossary/failure-modes.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Failure_mode",
                "Wikipedia|https://en.wikipedia.org/wiki/Fault_(technology)"
            ]
        },
        "foundations": {
            definition: "The fundamental concepts and principles upon which deeper understanding, skills, and systems are built.",
            image: "/images/glossary/foundations.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/foundation",
                "Merriam-Webster|https://www.merriam-webster.com/dictionary/foundation"
            ]
        },
        "fragmented learning": {
            definition: "A learning pattern in which knowledge is acquired as disconnected pieces, lacking a coherent structure or underlying mental model to integrate them.",
            image: "/images/glossary/fragmented-learning.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Learning",
                "Wikipedia|https://en.wikipedia.org/wiki/Mental_model"
            ]
        },
        "fundamentals": {
            definition: "Core principles and concepts that remain valid across different tools, technologies, and implementations, forming the basis for understanding and problem-solving.",
            image: "/images/glossary/fundamentals.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/fundamental",
                "Wikipedia|https://en.wikipedia.org/wiki/Fundamental"
            ]
        },
        "guidance": {
            definition: "Structured support that assists a learner in reasoning, decision-making, and progress, while preserving responsibility for thinking and execution.",
            image: "/images/glossary/guidance.webp",
            links: [
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/guidance",
                "Wikipedia|https://en.wikipedia.org/wiki/Mentoring"
            ]
        },
        "invariants": {
            definition: "Properties or conditions of a system that remain true throughout its execution or transformations, regardless of state changes.",
            image: "/images/glossary/invariants.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Invariant_(computer_science)",
                "Wikipedia|https://en.wikipedia.org/wiki/Invariant_(mathematics)"
            ]
        },
        "iteration": {
            definition: "A repeated, controlled process in which understanding or solutions are incrementally refined through evaluation and feedback.",
            image: "/images/glossary/iteration.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Iteration",
                "Cambridge Dictionary|https://dictionary.cambridge.org/dictionary/english/iteration"
            ]
        },
        "learning path": {
            definition: "A structured sequence of topics or skills organized to build understanding progressively, with each step depending on previously acquired knowledge.",
            image: "/images/glossary/learning-path.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Curriculum",
                "Wikipedia|https://en.wikipedia.org/wiki/Learning"
            ]
        },
        "output": {
            definition: "Observable results produced by a process or system, such as code, features, or answers, independent of the level of underlying understanding.",
            image: "/images/glossary/output.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Input/output",
                "Wikipedia|https://en.wikipedia.org/wiki/Output"
            ]
        },
        "production": {
            definition: "Production refers to real world usage where systems affect users, data, and responsibility.",
            image: "/images/glossary/production.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Production_environment",
                "Wikipedia|https://en.wikipedia.org/wiki/Responsibility"
            ]
        },
        "ai tools -> assumptions": {
            definition: "AI tools operate based on implicit assumptions about data, prompts, and context, which directly influence their outputs and limitations.",
            image: "/images/glossary/ai-tools-assumptions.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Artificial_intelligence",
                "Wikipedia|https://en.wikipedia.org/wiki/Assumption"
            ]
        },
        "apis -> boundaries": {
            definition: "APIs define explicit boundaries between systems by specifying how they can interact, exchange data, and assume responsibilities without exposing internal implementation.",
            image: "/images/glossary/apis-boundaries.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/API",
                "Wikipedia|https://en.wikipedia.org/wiki/Interface_(computing)"
            ]
        },

        "architecture -> structure": {
            definition: "Architecture defines the structural organization of a system, capturing the key components, their relationships, and the decisions that constrain and shape them.",
            image: "/images/glossary/architecture-structure.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_architecture",
                "Wikipedia|https://en.wikipedia.org/wiki/Structure"
            ]
        },

        "backend -> tradeoffs": {
            definition: "Backend design decisions require balancing trade-offs among performance, reliability, scalability, and system complexity.",
            image: "/images/glossary/backend-tradeoffs.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Front-end_and_back-end",
                "Wikipedia|https://en.wikipedia.org/wiki/Trade-off"
            ]
        },

        "code -> choices": {
            definition: "Code embodies decisions about system behavior, readability, constraints, and trade-offs, making those choices explicit and observable.",
            image: "/images/glossary/code-choices.webp",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Source_code",
                "Wikipedia|https://en.wikipedia.org/wiki/Decision-making"
            ]
        },

        "collaboration -> alignment": {
            definition: "Effective collaboration depends on the alignment of goals, roles, and responsibilities toward a shared direction.",
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
    const keywordTerms = document.querySelectorAll(".keyword-strip a");
    keywordTerms.forEach(termEl => {
        const term = termEl.textContent.trim();
        const entry = keywordGlossary[term];
        termEl.classList.add("glossary-term");
        if (termEl.tagName !== "A") {
            termEl.setAttribute("role", "button");
            termEl.setAttribute("tabindex", "0");
        }
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

