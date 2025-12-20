document.addEventListener("DOMContentLoaded", function () {
    // --- Slideshow ---
    const images = document.querySelectorAll("#slideshow img");
    let index = 0;
    const slideMessages = [
        "You keep learning computing, but the picture still feels incomplete\?",
        "You follow steps and the picture is missing.",
        "Too many concepts, no clear shape yet.",
        "You want to understand, not just repeat moves."
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

    // Swap slide sources for portrait (use *.vertical.webp)
    images.forEach(img => {
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.getAttribute("src");
            const original = img.dataset.originalSrc;
            const vertical = original.replace(/\.webp(\?.*)?$/, ".vertical.webp$1");
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

    const keywordGlossary = {
        "programming": {
            definition: "Writing instructions that tell a computer what to do.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer_programming",
                "Britannica|https://www.britannica.com/technology/computer-programming-language"
            ]
        },
        "programming languages": {
            definition: "Formal languages used to write software instructions.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Programming_language",
                "Britannica|https://www.britannica.com/technology/programming-language"
            ]
        },
        "code": {
            definition: "Written instructions in a programming language.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Source_code",
                "Oxford Languages|https://languages.oup.com/google-dictionary-en/"
            ]
        },
        "software": {
            definition: "Programs and data that tell a computer how to operate.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software",
                "Britannica|https://www.britannica.com/technology/software"
            ]
        },
        "technologies": {
            definition: "Tools and methods used to build and operate systems.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Technology",
                "Britannica|https://www.britannica.com/technology/technology"
            ]
        },
        "computing generations": {
            definition: "Historical eras of computing defined by dominant hardware and software ideas.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/History_of_computing_hardware",
                "Britannica|https://www.britannica.com/technology/computer"
            ]
        },
        "computing systems": {
            definition: "Integrated hardware and software working together to perform computation.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Computer_system",
                "IBM|https://www.ibm.com/topics/systems"
            ]
        },
        "scientific": {
            definition: "Based on systematic study and rigorous methods.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Science",
                "Britannica|https://www.britannica.com/science/science"
            ]
        },
        "data": {
            definition: "Information represented for processing and analysis.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data",
                "IBM|https://www.ibm.com/topics/data"
            ]
        },
        "structure": {
            definition: "The organized arrangement of parts in a system or document.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Structure",
                "Britannica|https://www.britannica.com/science/structure"
            ]
        },
        "components": {
            definition: "Individual parts that form a larger system.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Component-based_software_engineering",
                "IBM|https://www.ibm.com/topics/component-based-development"
            ]
        },
        "editors": {
            definition: "Software used to write and edit code or text.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Source-code_editor",
                "Visual Studio Code|https://code.visualstudio.com/"
            ]
        },
        "repos": {
            definition: "Repositories that store and track code changes.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Repository_(version_control)",
                "Git|https://git-scm.com/docs/git-init"
            ]
        },
        "environments": {
            definition: "Configured setups where software is built and run.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Development_environment",
                "AWS|https://aws.amazon.com/what-is/devops/"
            ]
        },
        "mental model": {
            definition: "An internal explanation of how something works.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Mental_model",
                "Interaction Design Foundation|https://www.interaction-design.org/literature/topics/mental-models"
            ]
        },
        "model": {
            definition: "A simplified representation of a system or concept.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Model",
                "Britannica|https://www.britannica.com/science/model"
            ]
        },
        "intelligence": {
            definition: "The ability to learn, reason, and solve problems.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Intelligence",
                "Britannica|https://www.britannica.com/science/intelligence"
            ]
        },
        "cause and effect": {
            definition: "The relationship between events where one produces another.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Causality",
                "Britannica|https://www.britannica.com/topic/causation"
            ]
        },
        "juniors": {
            definition: "Early-career practitioners who are still building experience.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_engineering",
                "Stack Overflow|https://stackoverflow.com/jobs"
            ]
        },
        "mentorship": {
            definition: "Guidance from a more experienced person to support learning and growth.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Mentorship",
                "Harvard Business Review|https://hbr.org/2021/02/how-to-get-the-mentoring-you-need"
            ]
        },
        "software engineering": {
            definition: "Applying engineering principles to design, build, and maintain software systems.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_engineering",
                "IEEE|https://www.computer.org/education/bodies-of-knowledge/software-engineering"
            ]
        },
        "algorithms": {
            definition: "Step-by-step procedures for solving problems or performing computations.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Algorithm",
                "Khan Academy|https://www.khanacademy.org/computing/computer-science/algorithms"
            ]
        },
        "data structures": {
            definition: "Ways of organizing data for efficient access and modification.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data_structure",
                "GeeksforGeeks|https://www.geeksforgeeks.org/data-structures/"
            ]
        },
        "Python": {
            definition: "High-level programming language known for readability.",
            links: [
                "Python.org|https://www.python.org/",
                "Wikipedia|https://en.wikipedia.org/wiki/Python_(programming_language)"
            ]
        },
        "C / C++": {
            definition: "Systems programming languages used for low-level control and performance.",
            links: [
                "Wikipedia (C)|https://en.wikipedia.org/wiki/C_(programming_language)",
                "Wikipedia (C++)|https://en.wikipedia.org/wiki/C%2B%2B"
            ]
        },
        "JavaScript": {
            definition: "Programming language of the web and browser.",
            links: [
                "MDN|https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "Wikipedia|https://en.wikipedia.org/wiki/JavaScript"
            ]
        },
        "TypeScript": {
            definition: "Typed superset of JavaScript that compiles to JS.",
            links: [
                "TypeScript|https://www.typescriptlang.org/",
                "Wikipedia|https://en.wikipedia.org/wiki/TypeScript"
            ]
        },
        "web development": {
            definition: "Building and maintaining websites and web applications.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Web_development",
                "MDN Learn|https://developer.mozilla.org/en-US/docs/Learn"
            ]
        },
        "frontend": {
            definition: "User-facing part of a web or app interface.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Front-end_web_development",
                "MDN Front-end|https://developer.mozilla.org/en-US/docs/Learn/Front-end_web_developer"
            ]
        },
        "backend": {
            definition: "Server-side logic, data access, and APIs.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Front-end_and_back-end",
                "IBM|https://www.ibm.com/topics/backend"
            ]
        },
        "APIs": {
            definition: "Interfaces that let software systems communicate.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/API",
                "IBM|https://www.ibm.com/topics/api"
            ]
        },
        "REST": {
            definition: "Architectural style for web APIs using HTTP.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Representational_state_transfer",
                "RESTful API|https://restfulapi.net/"
            ]
        },
        "GraphQL": {
            definition: "Query language and runtime for APIs.",
            links: [
                "GraphQL|https://graphql.org/",
                "Wikipedia|https://en.wikipedia.org/wiki/GraphQL"
            ]
        },
        "DevOps": {
            definition: "Practices that unify software development and operations.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/DevOps",
                "AWS|https://aws.amazon.com/devops/"
            ]
        },
        "CI / CD": {
            definition: "Continuous integration and continuous delivery or deployment.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/CI/CD",
                "Atlassian|https://www.atlassian.com/continuous-delivery/ci-vs-ci-vs-cd"
            ]
        },
        "Docker": {
            definition: "Platform for packaging and running apps in containers.",
            links: [
                "Docker|https://www.docker.com/resources/what-container/",
                "Wikipedia|https://en.wikipedia.org/wiki/Docker_(software)"
            ]
        },
        "Kubernetes": {
            definition: "Container orchestration platform for deploying and scaling.",
            links: [
                "Kubernetes|https://kubernetes.io/",
                "Wikipedia|https://en.wikipedia.org/wiki/Kubernetes"
            ]
        },
        "cloud (AWS / Azure / GCP)": {
            definition: "Cloud computing services from major providers.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Cloud_computing",
                "IBM|https://www.ibm.com/topics/cloud-computing"
            ]
        },
        "databases": {
            definition: "Structured collections of data managed by a database system.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Database",
                "IBM|https://www.ibm.com/topics/database"
            ]
        },
        "SQL": {
            definition: "Standard language for relational databases.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/SQL",
                "PostgreSQL Docs|https://www.postgresql.org/docs/current/sql.html"
            ]
        },
        "NoSQL": {
            definition: "Non-relational databases designed for scale and flexibility.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/NoSQL",
                "MongoDB|https://www.mongodb.com/nosql-explained"
            ]
        },
        "caching": {
            definition: "Storing data for faster access.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Cache_(computing)",
                "Cloudflare|https://www.cloudflare.com/learning/cdn/what-is-caching/"
            ]
        },
        "microservices": {
            definition: "Architecture of small independent services.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Microservices",
                "Martin Fowler|https://martinfowler.com/articles/microservices.html"
            ]
        },
        "distributed systems": {
            definition: "Systems with components on multiple networked computers.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Distributed_computing",
                "Distributed Systems|https://www.distributed-systems.net/index.php/books/ds3/"
            ]
        },
        "systems thinking": {
            definition: "Understanding how parts interact within a whole.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Systems_thinking",
                "iSee Systems|https://www.iseesystems.com/resources/what-is-systems-thinking"
            ]
        },
        "testing": {
            definition: "Checking software behavior and quality.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_testing",
                "IBM|https://www.ibm.com/topics/software-testing"
            ]
        },
        "TDD": {
            definition: "Test-driven development: tests before code.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Test-driven_development",
                "Martin Fowler|https://martinfowler.com/bliki/TestDrivenDevelopment.html"
            ]
        },
        "refactoring": {
            definition: "Improving code structure without changing behavior.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Code_refactoring",
                "Refactoring.com|https://refactoring.com/"
            ]
        },
        "performance": {
            definition: "Speed and efficiency of software under load.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_performance_testing",
                "MDN|https://developer.mozilla.org/en-US/docs/Web/Performance"
            ]
        },
        "observability": {
            definition: "Ability to infer system state from its outputs.",
            links: [
                "OpenTelemetry|https://opentelemetry.io/docs/concepts/observability-primer/",
                "Wikipedia|https://en.wikipedia.org/wiki/Observability"
            ]
        },
        "security basics": {
            definition: "Core practices that reduce software risk.",
            links: [
                "OWASP|https://owasp.org/www-project-top-ten/",
                "CISA|https://www.cisa.gov/cybersecurity"
            ]
        },
        "architecture": {
            definition: "High-level structure and organization of software systems.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_architecture",
                "Martin Fowler|https://martinfowler.com/architecture/"
            ]
        },
        "design patterns": {
            definition: "Reusable solutions to common design problems.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Software_design_pattern",
                "Refactoring Guru|https://refactoring.guru/design-patterns"
            ]
        },
        "Git": {
            definition: "Distributed version control system.",
            links: [
                "Git|https://git-scm.com/",
                "Wikipedia|https://en.wikipedia.org/wiki/Git"
            ]
        },
        "GitHub": {
            definition: "Platform for hosting and collaborating on Git repositories.",
            links: [
                "GitHub|https://github.com/about",
                "Wikipedia|https://en.wikipedia.org/wiki/GitHub"
            ]
        },
        "Node.js": {
            definition: "JavaScript runtime built on V8.",
            links: [
                "Node.js|https://nodejs.org/en",
                "Wikipedia|https://en.wikipedia.org/wiki/Node.js"
            ]
        },
        "React": {
            definition: "UI library for building interfaces.",
            links: [
                "React|https://react.dev/",
                "Wikipedia|https://en.wikipedia.org/wiki/React_(software)"
            ]
        },
        "Vue": {
            definition: "Progressive JavaScript framework for UIs.",
            links: [
                "Vue|https://vuejs.org/",
                "Wikipedia|https://en.wikipedia.org/wiki/Vue.js"
            ]
        },
        "AI / ML": {
            definition: "Artificial intelligence and machine learning.",
            links: [
                "Wikipedia (AI)|https://en.wikipedia.org/wiki/Artificial_intelligence",
                "Wikipedia (ML)|https://en.wikipedia.org/wiki/Machine_learning"
            ]
        },
        "LLMs": {
            definition: "Large language models trained on text data.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Large_language_model",
                "IBM|https://www.ibm.com/topics/large-language-models"
            ]
        },
        "prompting": {
            definition: "Formulating inputs to guide model outputs.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Prompt_engineering",
                "IBM|https://www.ibm.com/topics/prompt-engineering"
            ]
        },
        "data pipelines": {
            definition: "Systems that move and transform data between sources.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Data_pipeline",
                "Google Cloud|https://cloud.google.com/learn/what-is-a-data-pipeline"
            ]
        },
        "infrastructure as code": {
            definition: "Managing infrastructure through code and automation.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Infrastructure_as_code",
                "HashiCorp|https://www.hashicorp.com/resources/what-is-infrastructure-as-code"
            ]
        },
        "command line": {
            definition: "Text-based interface to run commands.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Command-line_interface",
                "GNU Bash|https://www.gnu.org/software/bash/"
            ]
        },
        "automation": {
            definition: "Using tools to perform tasks with minimal manual effort.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Automation",
                "IBM|https://www.ibm.com/topics/automation"
            ]
        },
        "code reviews": {
            definition: "Systematic peer review of code changes.",
            links: [
                "Wikipedia|https://en.wikipedia.org/wiki/Code_review",
                "Google|https://google.github.io/eng-practices/review/"
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

    function closeGlossary() {
        if (!glossaryModal) return;
        glossaryModal.classList.remove("show");
        glossaryModal.setAttribute("aria-hidden", "true");
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
                if (!label || !url) return;
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener";
                a.textContent = label;
                li.appendChild(a);
                glossaryLinks.appendChild(li);
            });
            if (glossaryReferences) {
                glossaryReferences.style.display = items.length ? "block" : "none";
            }
        }

        glossaryModal.classList.add("show");
        glossaryModal.setAttribute("aria-hidden", "false");
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

    if (glossaryBackdrop) glossaryBackdrop.addEventListener("click", closeGlossary);
    if (glossaryClose) glossaryClose.addEventListener("click", closeGlossary);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && glossaryModal && glossaryModal.classList.contains("show")) {
            closeGlossary();
        }
    });

    showWizardStep(wizardStep);
    generateSurveyMessage();
});

