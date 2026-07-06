(function() {
    const currentScript = document.currentScript;
    if (!currentScript) return;

    // 1. Injection du CSS
    if (!document.getElementById("inline-captcha-styles")) {
        const style = document.createElement('style');
        style.id = "inline-captcha-styles";
        style.textContent = `
            .inline-captcha-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 300px;
                height: 74px;
                background-color: #f9f9f9;
                border: 1px solid #d3d3d3;
                border-radius: 3px;
                padding: 0 10px 0 14px;
                font-family: Arial, sans-serif;
                box-sizing: border-box;
                box-shadow: 0 0 4px rgba(0,0,0,0.08);
                margin: 15px 0;
            }
            .inline-captcha-left {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
            }
            .inline-captcha-checkbox { display: none; }
            .inline-captcha-custom-box {
                width: 24px;
                height: 24px;
                border: 2px solid #c1c1c1;
                border-radius: 2px;
                background-color: #fff;
                position: relative;
            }
            .inline-captcha-text { color: #282828; font-size: 14px; }
            
            .inline-captcha-spinner {
                display: none;
                width: 20px;
                height: 20px;
                border: 3px solid #4d90fe;
                border-radius: 50%;
                border-top-color: transparent;
                animation: inline-spin 1s linear infinite;
                position: absolute;
                top: 0; left: 0;
            }
            @keyframes inline-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .inline-captcha-checkmark {
                display: none;
                position: absolute;
                top: 2px; left: 7px;
                width: 5px; height: 12px;
                border: solid #00aa6c;
                border-width: 0 3px 3px 0;
                transform: rotate(45deg);
            }
            .inline-captcha-right { display: flex; flex-direction: column; align-items: center; }
            .inline-captcha-brand-text { font-size: 8px; color: #555; text-align: center; margin-top: 2px; }

            .inline-captcha-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999998;
                align-items: center;
                justify-content: center;
            }

            .inline-captcha-popup {
                background: white;
                border: 1px solid #ccc;
                box-shadow: 0 4px 25px rgba(0,0,0,0.3);
                border-radius: 6px;
                width: 320px;
                padding: 20px;
                box-sizing: border-box;
                animation: inline-fadein 0.2s ease-out;
            }
            @keyframes inline-fadein {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .inline-captcha-popup-header {
                background-color: #4d90fe;
                color: white;
                padding: 12px;
                margin: -20px -20px 15px -20px;
                font-size: 14px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                line-height: 1.4;
            }
            .inline-captcha-progress {
                font-size: 12px;
                color: #555;
                margin-bottom: 10px;
                font-weight: bold;
                text-align: right;
            }
            .inline-captcha-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 15px;
            }
            .inline-captcha-tile {
                border: 1px solid #ddd;
                padding: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: #fdfdfd;
                height: 60px;
                border-radius: 4px;
                transition: background 0.15s;
                box-sizing: border-box;
            }
            .inline-captcha-tile:hover { background: #f0f0f0; border-color: #bbb; }
            .inline-captcha-tile svg { width: 36px; height: 36px; }
        `;
        document.head.appendChild(style);
    }

    // 2. Création de la structure
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const widget = document.createElement("div");
    widget.className = "inline-captcha-container";
    widget.innerHTML = `
        <label class="inline-captcha-left" id="label-${uniqueId}">
            <input type="checkbox" class="inline-captcha-checkbox" id="check-${uniqueId}">
            <div class="inline-captcha-custom-box" id="box-${uniqueId}">
                <div class="inline-captcha-spinner" id="spinner-${uniqueId}"></div>
                <div class="inline-captcha-checkmark" id="mark-${uniqueId}"></div>
            </div>
            <span class="inline-captcha-text">Je ne suis pas un robot</span>
        </label>
        <div class="inline-captcha-right">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#4d90fe"/>
                <path d="M9 11L11 13L15 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="inline-captcha-brand-text">InlineCAPTCHA</div>
        </div>
    `;

    const overlay = document.createElement("div");
    overlay.className = "inline-captcha-overlay";
    overlay.innerHTML = `
        <div class="inline-captcha-popup">
            <div class="inline-captcha-popup-header" id="header-${uniqueId}"></div>
            <div class="inline-captcha-progress" id="progress-${uniqueId}">Progression : 1 / 5</div>
            <div class="inline-captcha-grid" id="grid-${uniqueId}"></div>
        </div>
    `;

    currentScript.parentNode.insertBefore(widget, currentScript);
    document.body.appendChild(overlay);

    const label = widget.querySelector(`#label-${uniqueId}`);
    const customBox = widget.querySelector(`#box-${uniqueId}`);
    const spinner = widget.querySelector(`#spinner-${uniqueId}`);
    const checkmark = widget.querySelector(`#mark-${uniqueId}`);
    
    const header = overlay.querySelector(`#header-${uniqueId}`);
    const progressDisplay = overlay.querySelector(`#progress-${uniqueId}`);
    const grid = overlay.querySelector(`#grid-${uniqueId}`);

    let isVerified = false;
    let currentStep = 1;
    const totalStepsNeeded = 5;

    // 3. DICTIONNAIRE DES DESSINS SVG (Pas de texte informatique lisible)
    const svgs = {
        circle: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e74c3c"/></svg>`,
        square: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" fill="#3498db"/></svg>`,
        triangle: `<svg viewBox="0 0 24 24"><polygon points="12,3 2,21 22,21" fill="#2ecc71"/></svg>`,
        star: `<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#f1c40f"/></svg>`,
        diamond: `<svg viewBox="0 0 24 24"><polygon points="12,2 22,12 12,22 2,12" fill="#9b59b6"/></svg>`,
        cross: `<svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="#7f8c8d"/></svg>`,
        heart: `<svg viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" fill="#e91e63"/></svg>`,
        moon: `<svg viewBox="0 0 24 24"><path d="M12.3,2a10,10,0,0,0-1.9,19.8,10.4,10.4,0,0,0,1-.1,10,10,0,0,1,1-.5,10,10,0,0,1,8.1-10,10.1,10.1,0,0,0-1-1.7A10,10,0,0,0,12.3,2Z" fill="#f39c12"/></svg>`,
        hexagon: `<svg viewBox="0 0 24 24"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="#1abc9c"/></svg>`,
        ring: `<svg viewBox="0 0 24 24"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,16a6,6,0,1,1,6-6A6,6,0,0,1,12,18Z" fill="#34495e"/></svg>`
    };

    // BANQUE DES 10 DÉFIS GÉOMÉTRIQUES BASÉS SUR LES CLÉS SVG
    const challenges = [
        { instruction: "Sélectionnez le <strong>CERCLE ROUGE</strong>.", target: "circle", noise: ["square", "triangle", "star", "diamond", "cross"] },
        { instruction: "Sélectionnez le <strong>CARRÉ BLEU</strong>.", target: "square", noise: ["circle", "triangle", "heart", "moon", "hexagon"] },
        { instruction: "Sélectionnez le <strong>TRIANGLE VERT</strong>.", target: "triangle", noise: ["square", "star", "cross", "ring", "diamond"] },
        { instruction: "Sélectionnez l'<strong>ÉTOILE JAUNE</strong>.", target: "star", noise: ["circle", "heart", "moon", "hexagon", "ring"] },
        { instruction: "Sélectionnez le <strong>LOSANGE VIOLET</strong>.", target: "diamond", noise: ["square", "triangle", "cross", "heart", "hexagon"] },
        { instruction: "Sélectionnez la <strong style='color:#7f8c8d;'>CROIX GRISE</strong>.", target: "cross", noise: ["circle", "star", "moon", "ring", "triangle"] },
        { instruction: "Sélectionnez le <strong style='color:#e91e63;'>CŒUR ROSE</strong>.", target: "heart", noise: ["square", "diamond", "hexagon", "ring", "cross"] },
        { instruction: "Sélectionnez le <strong>CROISSANT DE LUNE</strong>.", target: "moon", noise: ["circle", "star", "triangle", "diamond", "hexagon"] },
        { instruction: "Sélectionnez l'<strong>HEXAGONE TURQUOISE</strong>.", target: "hexagon", noise: ["square", "heart", "cross", "ring", "star"] },
        { instruction: "Sélectionnez l'<strong>ANNEAU SOMBRE</strong>.", target: "ring", noise: ["circle", "triangle", "diamond", "moon", "heart"] }
    ];

    // 4. Moteur de rendu des défis
    function launchChallenge() {
        grid.innerHTML = "";
        progressDisplay.textContent = "Defi : " + currentStep + " ou " + totalStepsNeeded;
        
        const currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        header.innerHTML = "<strong>Défi de sécurité :</strong><br>" + currentChallenge.instruction;

        let items = [currentChallenge.target];
        for (let i = 0; i < 8; i++) {
            const randomNoise = currentChallenge.noise[Math.floor(Math.random() * currentChallenge.noise.length)];
            items.push(randomNoise);
        }

        items.sort(function() { return 0.5 - Math.random(); });

        items.forEach(function(type) {
            const tile = document.createElement("div");
            tile.className = "inline-captcha-tile";
            
            // On injecte directement le code brut du SVG (pas de texte)
            tile.innerHTML = svgs[type];
            
            tile.addEventListener("click", function() {
                if (type === currentChallenge.target) {
                    if (currentStep >= totalStepsNeeded) {
                        overlay.style.display = "none";
                        spinner.style.display = "none";
                        customBox.style.backgroundColor = "transparent";
                        checkmark.style.display = "block";
                        isVerified = true;
                        
                        console.log("Les 5 etapes en SVG sont validees");
                        document.dispatchEvent(new CustomEvent("captchaSuccess", { detail: { id: uniqueId } }));
                    } else {
                        currentStep++;
                        launchChallenge();
                    }
                } else {
                    console.log("Erreur visuelle. Reinitialisation");
                    alert("Erreur ! Recommencez depuis le debut.");
                    currentStep = 1;
                    launchChallenge();
                }
            });
            grid.appendChild(tile);
        });
    }

    label.addEventListener("click", function(e) {
        e.preventDefault();
        if (isVerified) return;

        customBox.style.borderColor = "transparent";
        spinner.style.display = "block";

        setTimeout(function() {
            currentStep = 1;
            launchChallenge();
            overlay.style.display = "flex";
        }, 800);
    });

})();
