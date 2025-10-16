document.addEventListener("DOMContentLoaded", function () {
    let images = document.querySelectorAll("#slideshow img");
    let index = 0;
    let direction = -5; // Initial movement direction

    function changeImage() {
        let current = document.querySelector("#slideshow img.active");
        if (current) {
            current.classList.remove("active");
            current.classList.add("exit"); // Moves to the left
            setTimeout(() => current.classList.remove("exit"), 1500); // Reset after fade
        }

        index = (index + 1) % images.length;
        let next = images[index];

        next.classList.add("active");
        next.style.left = "-10%"; // Reset position
        next.style.transform = `translateX(${direction}%)`; // Apply movement

        // Alternate movement direction
        direction = direction === -5 ? 5 : -5;
    }

    // Start with the first image
    changeImage();

    // Change image every 5 seconds
    setInterval(changeImage, 5000);

    // --- Movie-style credits ---
    // Each credit: { text, type: 'exp'|'tech'|'skill', value: number, year: number }
    const currentYear = new Date().getFullYear();
    const startYear = 1997;
    const totalYears = currentYear - startYear + 1; // inclusive
    let expSoFar = 0, techSoFar = 0, skillSoFar = 0;
    const creditMessages = [
        { text: "Started with logic and algorithms (1997)", type: 'exp', value: 1, year: 1997 },
        { text: "ACPOL Game (ASCII, BASIC/CP-M → MS-DOS, 1997)", type: 'exp', value: 1, year: 1997 },
        { text: "ASCII Paint & Custom Format for Sprites (1997)", type: 'exp', value: 1, year: 1997 },
        { text: "QBasic Inventory System (1998)", type: 'exp', value: 1, year: 1998 },
        { text: "Dot-Matrix Printer Reports (1999)", type: 'exp', value: 1, year: 1999 },
        { text: "First logic puzzles and games (late 90s)", type: 'exp', value: 2, year: 1999 },
        { text: "Mallard/GW/QBasic (ASCII graphics, UI framework, 1997–2000)", type: 'tech', value: 1, year: 2000 },
        { text: "High School: Exact Sciences (2001–2004)", type: 'exp', value: 3, year: 2001 },
        { text: "Pascal, C (2000–2004)", type: 'tech', value: 1, year: 2002 },
        { text: "JavaScript (2003–present)", type: 'tech', value: 1, year: 2003 },
        { text: "First Drupal Websites (2005)", type: 'exp', value: 1, year: 2005 },
        { text: "B.Sc. Software Engineering (CUJAE, 2005–2010)", type: 'exp', value: 5, year: 2005 },
        { text: "University: Calculus, Physics, Computer Architecture, Numerical Methods, Statistics, AI (2005–2010)", type: 'exp', value: 5, year: 2005 },
        { text: "C++ / C# / Java (2005–present)", type: 'tech', value: 1, year: 2005 },
        { text: "PHP + Drupal + WordPress (2005–present)", type: 'tech', value: 1, year: 2005 },
        { text: "PostgreSQL / SQL (2005–present)", type: 'tech', value: 1, year: 2005 },
        { text: "Operations Research, Office Tools (Excel, Access, VBA, 2000–present)", type: 'skill', value: 1, year: 2006 },
        { text: "Software Engineering (RUP, UML, 2006–present)", type: 'skill', value: 1, year: 2006 },
        { text: "Artificial Intelligence (since university, 2006–present)", type: 'skill', value: 1, year: 2006 },
        { text: "BPM, Node-RED (2007–present)", type: 'skill', value: 1, year: 2007 },
        { text: "Linux / GitHub (2007–present)", type: 'skill', value: 1, year: 2007 },
        { text: "Python / Prolog (2011–present)", type: 'tech', value: 1, year: 2011 },
        { text: "Launch of Apretaste! (2011)", type: 'exp', value: 1, year: 2011 },
        { text: "Start with Python (2011)", type: 'exp', value: 1, year: 2011 },
        { text: "Co-founder — Apretaste! (2011–present)", type: 'skill', value: 1, year: 2011 },
        { text: "Founder — Divengine (2011–present)", type: 'skill', value: 1, year: 2011 },
        { text: "Mentoring and growing developers (2010–present)", type: 'skill', value: 1, year: 2012 },
        { text: "Workflow automation & scalable solutions (2010–present)", type: 'skill', value: 1, year: 2012 },
        { text: "Node.js (2015–present)", type: 'tech', value: 1, year: 2015 },
        { text: "TypeScript (2016–present)", type: 'tech', value: 1, year: 2016 },
        { text: "React / Vue / Vite (2016–present)", type: 'tech', value: 1, year: 2016 },
        { text: "Dart, .NET MAUI, Docker, DigitalOcean (2018–present)", type: 'tech', value: 1, year: 2018 },
        { text: "Software Engineer — Magaya (2020–2025)", type: 'skill', value: 1, year: 2020 },
        { text: "R (2020–present)", type: 'tech', value: 1, year: 2020 },
        { text: "Joining Magaya (2020)", type: 'exp', value: 1, year: 2020 },
        { text: "Odoo (2024–present)", type: 'tech', value: 1, year: 2024 },
        { text: "Entering Odoo Ecosystem (2024)", type: 'exp', value: 1, year: 2024 },
        { text: "Exploring new tech, always learning", type: 'exp', value: 1, year: 2025 }
    ];

    // Sort credits by year for a chronological experience
    creditMessages.sort((a, b) => a.year - b.year);

    // Dynamically adjust values so exp reaches totalYears, and tech/skill never stay at 0
    let expSum = 0, techSum = 0, skillSum = 0;
    creditMessages.forEach(c => {
        if (c.type === 'exp') expSum += c.value;
        if (c.type === 'tech') techSum += c.value;
        if (c.type === 'skill') skillSum += c.value;
    });
    // Adjust exp values proportionally if needed
    if (expSum !== totalYears) {
        let diff = totalYears - expSum;
        // Distribute the difference over exp credits
        for (let i = 0; i < creditMessages.length && diff !== 0; i++) {
            if (creditMessages[i].type === 'exp') {
                creditMessages[i].value += 1;
                diff--;
            }
        }
    }
    // Ensure tech and skill start >0
    if (techSum === 0) creditMessages.find(c => c.type === 'tech').value = 1;
    if (skillSum === 0) creditMessages.find(c => c.type === 'skill').value = 1;

    let scores = { exp: 0, tech: 0, skill: 0 };
    const creditPositions = ["center", "left", "right"]; // Alternate positions
    let creditIndex = 0;
    let creditTimeout;

    function updateScores(type, value) {
        if (value > 0) {
            scores[type] += value;
            const el = document.querySelector(`#score-${type} .score-value`);
            if (el) {
                el.textContent = scores[type];
                el.animate([
                    { transform: 'scale(1)', color: '#ffe066' },
                    { transform: 'scale(1.25)', color: '#fff' },
                    { transform: 'scale(1)', color: '#ffe066' }
                ], { duration: 400, fill: 'forwards' });
            }
        }
    }

    function resetScores() {
        scores = { exp: 0, tech: 0, skill: 0 };
        ["exp", "tech", "skill"].forEach(type => {
            const el = document.querySelector(`#score-${type} .score-value`);
            if (el) el.textContent = 0;
        });
    }

    function showCreditMessage() {
        const container = document.getElementById("movie-credits");
        container.innerHTML = "";
        const msg = document.createElement("div");
        msg.className = "movie-credit-message";
        // Alternate position
        const pos = creditPositions[creditIndex % creditPositions.length];
        if (pos !== "center") msg.classList.add(pos);
        msg.textContent = creditMessages[creditIndex].text;
        container.appendChild(msg);
        // Update scores
        updateScores(creditMessages[creditIndex].type, creditMessages[creditIndex].value);
        // Entry effect
        setTimeout(() => {
            msg.classList.add("show", "slide-in");
            // Randomly trigger TV glitch effect 1-2 times during show
            let glitchCount = Math.random() > 0.5 ? 2 : 1;
            for (let i = 0; i < glitchCount; i++) {
                setTimeout(() => {
                    msg.style.animation = (msg.style.animation ? msg.style.animation + ',' : '') + `tvGlitch 0.18s linear`;
                    setTimeout(() => {
                        msg.style.animation = msg.style.animation.replace(/tvGlitch 0.18s linear,?/g, '');
                    }, 180);
                }, 500 + Math.random() * 1800);
            }
        }, 50);
        // Exit effect
        creditTimeout = setTimeout(() => {
            msg.classList.remove("slide-in");
            msg.classList.add("slide-out");
            setTimeout(() => {
                creditIndex = (creditIndex + 1) % creditMessages.length;
                if (creditIndex === 0) resetScores();
                showCreditMessage();
            }, 800);
        }, 3200);
    }

    showCreditMessage();

    // --- Terminal overlay for career commands ---
    const terminalLines = [
        "$ whoami",
        "rafageist — Senior Software Engineer",
        "$ date",
        "Started: 1997",
        "$ echo $EDUCATION",
        "High School: Exact Sciences (2001–2004)",
        "B.Sc. Software Engineering (CUJAE, 2005–2010)",
        "$ skills --list",
        "Python, C, C++, Pascal, PHP, JavaScript, Node.js, TypeScript, Dart, C#, Java, .NET MAUI, React, Vue, Vite, Docker, Linux, SQL, Odoo, TLA+",
        "$ experience | grep -i 'project'",
        "Project Manager (2015–present)",
        "$ companies",
        "Apretaste! (Co-founder)",
        "Divengine (Founder)",
        "Magaya (Software Engineer)",
        "$ milestones",
        "ACPOL Game (1997)",
        "ASCII Paint (1997)",
        "QBasic Inventory (1998)",
        "First Drupal Websites (2005)",
        "Launch of Apretaste! (2011)",
        "Joining Magaya (2020)",
        "$ motto",
        "Always learning. Always building. Always sharing."
    ];
    let terminalIndex = 0;
    function typeTerminalLine() {
        const terminal = document.getElementById("terminal-content");
        if (!terminal) return;
        if (terminalIndex === 0) terminal.textContent = "";
        if (terminalIndex < terminalLines.length) {
            let line = terminalLines[terminalIndex];
            let i = 0;
            function typeChar() {
                if (i <= line.length) {
                    terminal.textContent = terminal.textContent.replace(/\u2588$/,"") + line.slice(0, i) + "\u2588";
                    i++;
                    setTimeout(typeChar, 18 + Math.random() * 32);
                } else {
                    terminal.textContent = terminal.textContent.replace(/\u2588$/,"") + line + "\n";
                    terminalIndex++;
                    setTimeout(typeTerminalLine, 400 + Math.random() * 600);
                }
            }
            typeChar();
        } else {
            terminalIndex = 0;
            setTimeout(typeTerminalLine, 2000);
        }
    }
    setTimeout(typeTerminalLine, 1200);

    // --- Preload only the first 2 slideshow images, then hide loading overlay ---
    const loadingOverlay = document.getElementById("loading-overlay");
    const slideshowImgs = Array.from(document.querySelectorAll("#slideshow img"));
    let loadedCount = 0;

    // ASCII progress bar logic
    const progressBar = document.getElementById("loading-progressbar");
    const PROGRESS_BAR_LENGTH = 18; // Number of ASCII blocks
    function setProgressBar(percent) {
        const filled = Math.round(PROGRESS_BAR_LENGTH * percent);
        const empty = PROGRESS_BAR_LENGTH - filled;
        // Use █ for filled, ░ for empty (classic 80s look)
        progressBar.textContent = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
    }
    setProgressBar(0);

    function hideLoading() {
        loadingOverlay.style.opacity = 0;
        setTimeout(() => loadingOverlay.style.display = "none", 700);
    }
    function checkFirstLoaded() {
        loadedCount++;
        setProgressBar(loadedCount / 2);
        if (loadedCount === 2) {
            setTimeout(hideLoading, 250); // Small delay for effect
            // Start loading the rest in the background
            for (let i = 2; i < slideshowImgs.length; i++) {
                if (!slideshowImgs[i].complete || slideshowImgs[i].naturalWidth === 0) {
                    slideshowImgs[i].src = slideshowImgs[i].src; // trigger load if not already
                }
            }
        }
    }
    // Preload only first 2 images
    for (let i = 0; i < 2; i++) {
        const img = slideshowImgs[i];
        if (img.complete && img.naturalWidth > 0) {
            checkFirstLoaded();
        } else {
            img.addEventListener('load', checkFirstLoaded);
            img.addEventListener('error', checkFirstLoaded);
        }
    }
    // Prevent interaction until loaded
    document.body.style.overflow = 'hidden';
    function enableScrollAfterLoad() {
        document.body.style.overflow = '';
    }
    loadingOverlay.addEventListener('transitionend', enableScrollAfterLoad);
});
