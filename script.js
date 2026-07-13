document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. SCROLL REVEAL ANIMATION ENGINE
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Stop observing once animated into view
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ----------------------------------------------------
    // 2. AVATAR PLAYFUL SPEECH BUBBLES
    // ----------------------------------------------------
    const headShot = document.getElementById('head_shot');
    const speechBubble = document.getElementById('speech-bubble');
    
    const devQuotes = [
        "It works on my machine! 💻",
        "Coffee: a liquid that converts thoughts into code. ☕",
        "Compile success on first try? Something's wrong... 🤔",
        "There are 10 types of people: those who understand binary, and those who don't. 🔢",
        "Just one more print statement to debug this... 🔍",
        "Don't worry, it's not a bug. It's an undocumented feature! 🐛",
        "Deep Learning is basically linear algebra on steroids. 🧠",
        "C++ templates: making developers cry since 1998. 😭",
        "Computer Vision: teaching computers to see, yet they still can't find my keys. 🔑"
    ];

    function showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * devQuotes.length);
        speechBubble.textContent = devQuotes[randomIndex];
    }

    if (headShot && speechBubble) {
        // Show quote on hover
        headShot.addEventListener('mouseenter', showRandomQuote);
        
        // Show quote on click (mobile support)
        headShot.addEventListener('click', (e) => {
            e.stopPropagation();
            showRandomQuote();
            const container = headShot.closest('.avatar-container');
            container.classList.add('active');
            setTimeout(() => {
                container.classList.remove('active');
            }, 3000);
        });
    }

    // ----------------------------------------------------
    // 3. INTERACTIVE DEVELOPER TERMINAL CLI
    // ----------------------------------------------------
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    const quickBtns = document.querySelectorAll('.terminal-btn');
    let coffeeCount = 0;

    const commands = {
        help: () => [
            "Available commands:",
            "  <span class='cmd-text'>skills</span> - Print my core tech capabilities",
            "  <span class='cmd-text'>joke</span>   - Output a developer joke",
            "  <span class='cmd-text'>coffee</span> - Drink virtual coffee",
            "  <span class='cmd-text'>hack</span>   - Run a simulated hack screen",
            "  <span class='cmd-text'>clear</span>  - Clear the console history"
        ],
        skills: () => [
            "Core Technologies:",
            "  Python       [====================] 100%",
            "  C++          [==================  ] 90%",
            "  Deep Learning[=================   ] 85%",
            "  Comp Vision  [==================  ] 90%",
            "  Rust / WASM  [=============      ] 65%",
            "  JavaScript   [============       ] 60%"
        ],
        joke: () => {
            const jokes = [
                "Why do programmers wear glasses? Because they can't C#!",
                "Why did the programmer quit his job? Because he didn't get arrays.",
                "['hip', 'hip'] (hip hip array!)",
                "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
                "How many programmers does it take to change a light bulb? None, it's a hardware problem."
            ];
            return [jokes[Math.floor(Math.random() * jokes.length)]];
        },
        coffee: () => {
            coffeeCount++;
            let msg = `Caffeinating... Virt-coffee count: ${coffeeCount}. ☕`;
            if (coffeeCount >= 5) msg += " (Warning: Developer jitter limits exceeded!)";
            return [msg];
        },
        hack: () => {
            // Simulated hack sequence output
            setTimeout(() => appendLines(["Initializing security override...", "Bypassing firewalls...", "Downloading Google secrets... 🔐"]), 200);
            setTimeout(() => appendLines(["Access granted! User: Admin", "Level of fun: Over 9000! 🚀"]), 700);
            return ["Attempting connection to mainframes..."];
        },
        clear: () => {
            // Handled separately
            return [];
        }
    };

    function appendLines(lines) {
        lines.forEach(line => {
            const lineEl = document.createElement('div');
            lineEl.className = 'terminal-line';
            lineEl.innerHTML = line;
            // Insert before the input line
            const inputLineEl = terminalBody.querySelector('.input-line');
            terminalBody.insertBefore(lineEl, inputLineEl);
        });
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function processCommand(cmdText) {
        const cleanCmd = cmdText.trim().toLowerCase();
        
        // Print the command that was entered
        appendLines([`<span class="prompt">kuanying$</span> ${cmdText}`]);

        if (cleanCmd === '') return;

        if (cleanCmd === 'clear') {
            const lines = terminalBody.querySelectorAll('.terminal-line:not(.input-line)');
            lines.forEach(line => line.remove());
            return;
        }

        if (commands[cleanCmd]) {
            const result = commands[cleanCmd]();
            appendLines(result);
        } else {
            appendLines([
                `Command not found: <span class="cmd-text">${cmdText}</span>.`,
                "Type <span class='cmd-text'>help</span> to see a list of commands."
            ]);
        }
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdVal = terminalInput.value;
                processCommand(cmdVal);
                terminalInput.value = '';
            }
        });

        // Ensure clicking the terminal body focuses the input
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    // Connect quick buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            processCommand(cmd);
            if (terminalInput) terminalInput.focus();
        });
    });
});
