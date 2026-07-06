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
                width: 340px;
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
                gap: 10px;
                margin-bottom: 15px;
            }
            .inline-captcha-tile {
                border: 1px solid #ddd;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: #fdfdfd;
                height: 70px;
                border-radius: 4px;
                transition: background 0.15s;
                box-sizing: border-box;
            }
            .inline-captcha-tile:hover { background: #f0f0f0; border-color: #bbb; }
            .inline-captcha-tile svg { width: 42px; height: 42px; }
        `;
        document.head.appendChild(style);
    }

    // 2. Structure HTML du widget
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

    // 3. DICTIONNAIRE DES SVGS DES COMPOSANTS (Look Émojis / Icônes concrètes)
    const svgs = {
        plane: `<svg viewBox="0 0 24 24" fill="#34495e"><path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"/></svg>`,
        car: `<svg viewBox="0 0 24 24" fill="#e74c3c"><path d="M18.92,11L18.03,8.33C17.78,7.58 17.07,7 16.22,7H7.78C6.93,7 6.22,7.58 5.97,8.33L5.08,11C4.46,11.75 4,12.81 4,14V20A1,1 0 0,0 5,21H6A1,1 0 0,0 7,20V19H17V20A1,1 0 0,0 18,21H19A1,1 0 0,0 20,20V14C20,12.81 19.54,11.75 18.92,11M6.85,9H17.14L17.81,11H6.18L6.85,9M8,16A1.5,1.5 0 1,1 9.5,14.5A1.5,1.5 0 0,1 8,16M16,16A1.5,1.5 0 1,1 17.5,14.5A1.5,1.5 0 0,1 16,16Z"/></svg>`,
        pizza: `<svg viewBox="0 0 24 24" fill="#f1c40f"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,14.43 18.91,16.61 17.17,18.08L12,5.16V4M10,5.63L14.75,17.5C13.9,17.83 12.97,18 12,18A6,6 0 0,1 6,12C6,9.45 7.59,7.27 9.87,6.33L10,5.63M12,9A1,1 0 0,0 11,10A1,1 0 0,0 12,11A1,1 0 0,0 13,10A1,1 0 0,0 12,9M16,12A1,1 0 0,0 15,13A1,1 0 0,0 16,14A1,1 0 0,0 17,13A1,1 0 0,0 16,12Z"/></svg>`,
        bike: `<svg viewBox="0 0 24 24" fill="#2ecc71"><path d="M15.5,5.5A1.5,1.5 0 0,1 14,4A1.5,1.5 0 0,1 15.5,2.5A1.5,1.5 0 0,1 17,4A1.5,1.5 0 0,1 15.5,5.5M5,20A3,3 0 0,1 2,17A3,3 0 0,1 5,14A3,3 0 0,1 8,17A3,3 0 0,1 5,20M5,15.5A1.5,1.5 0 0,0 3.5,17A1.5,1.5 0 0,0 5,18.5A1.5,1.5 0 0,0 6.5,17A1.5,1.5 0 0,0 5,15.5M19,20A3,3 0 0,1 16,17A3,3 0 0,1 19,14A3,3 0 0,1 22,17A3,3 0 0,1 19,20M19,15.5A1.5,1.5 0 0,0 17.5,17A1.5,1.5 0 0,0 19,18.5A1.5,1.5 0 0,0 20.5,17A1.5,1.5 0 0,0 19,15.5M11,10.5H13V13.75L16.25,17H14.25L11.75,14.5L11,13.75V10.5M12.2,9H17V7.5H13.5L11.3,4.4C11.1,4.1 10.8,4 10.5,4C10.2,4 9.9,4.1 9.7,4.4L6,9.5V14H7.5V10.5L10.2,6.9L12.2,9Z"/></svg>`,
        coffee: `<svg viewBox="0 0 24 24" fill="#9b59b6"><path d="M2,21H20V19H2V21M20,8H18V5H20V8M2,3V15A4,4 0 0,0 6,19H14A4,4 0 0,0 18,15V3H2M16,5V8H4V5H16M4,10H16V15A2,2 0 0,1 14,17H6A2,2 0 0,1 4,15V10Z"/></svg>`,
        umbrella: `<svg viewBox="0 0 24 24" fill="#1abc9c"><path d="M12,2C17.5,2 22,6.5 22,12H13V21A1.5,1.5 0 0,1 11.5,22.5A1.5,1.5 0 0,1 10,21V20H11V12H2C2,6.5 6.5,2 12,2Z"/></svg>`,
        cloud: `<svg viewBox="0 0 24 24" fill="#3498db"><path d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04Z"/></svg>`,
        bell: `<svg viewBox="0 0 24 24" fill="#f39c12"><path d="M12,2A2,2 0 0,0 10,4V4.29C7.12,5.14 5,7.82 5,11V17L3,19V20H21V19L19,17V11C19,7.82 16.88,5.14 14,4.29V4A2,2 0 0,0 12,2M10,21A2,2 0 0,0 12,23A2,2 0 0,0 14,21H10Z"/></svg>`,
        key: `<svg viewBox="0 0 24 24" fill="#7f8c8d"><path d="M7,14A5,5 0 0,1 2,9A5,5 0 0,1 7,4A5,5 0 0,1 12,9C12,10.7 11.16,12.21 9.88,13.12L14,17.24V20H17V17H20V14L14.76,8.76C14.91,8.19 15,7.61 15,7A8,8 0 0,0 7,1A8,8 0 0,0 -1,9A8,8 0 0,0 7,17C7.61,17 8.19,16.91 8.76,16.76L7,15V14M7,6A3,3 0 0,0 4,9A3,3 0 0,0 7,12A3,3 0 0,0 10,9A3,3 0 0,0 7,6Z"/></svg>`,
        gift: `<svg viewBox="0 0 24 24" fill="#e91e63"><path d="M20,6H16.22A3,3 0 0,0 12,2A3,3 0 0,0 7.78,6H4A2,2 0 0,0 2,8V11A2,2 0 0,0 3.32,12.53L4.4,20.06A2,2 0 0,0 6.4,22H17.6A2,2 0 0,0 19.6,20.06L20.68,12.53A2,2 0 0,0 22,11V8A2,2 0 0,0 20,6M12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4M11,8V12H4V8H11M20,11H13V8H20V11M17.41,20H13V14H18.53L17.41,20M11,20H6.59L5.47,14H11V20Z"/></svg>`
    };

    // 4. BANQUE DE 10 DÉFIS TEXTUELS D'OBJETS
    const challenges = [
        { instruction: "Sélectionnez l'<strong>AVION</strong>.", target: "plane", noise: ["car", "bike", "umbrella", "cloud", "key"] },
        { instruction: "Sélectionnez la <strong>VOITURE</strong>.", target: "car", noise: ["plane", "pizza", "coffee", "bell", "gift"] },
        { instruction: "Sélectionnez la <strong>PIZZA</strong>.", target: "pizza", noise: ["coffee", "umbrella", "bike", "key", "cloud"] },
        { instruction: "Sélectionnez le <strong>VÉLO</strong>.", target: "bike", noise: ["car", "plane", "gift", "bell", "coffee"] },
        { instruction: "Sélectionnez la tasse de <strong>CAFÉ</strong>.", target: "coffee", noise: ["pizza", "umbrella", "cloud", "key", "bell"] },
        { instruction: "Sélectionnez le <strong>PARAPLUIE</strong>.", target: "umbrella", noise: ["cloud", "plane", "car", "gift", "bike"] },
        { instruction: "Sélectionnez le <strong>NUAGE</strong>.", target: "cloud", noise: ["umbrella", "pizza", "coffee", "key", "bell"] },
        { instruction: "Sélectionnez la <strong>CLOCHETTE</strong>.", target: "bell", noise: ["key", "gift", "plane", "car", "bike"] },
        { instruction: "Sélectionnez la <strong>CLÉ</strong>.", target: "key", noise: ["bell", "coffee", "pizza", "umbrella", "cloud"] },
        { instruction: "Sélectionnez le <strong>CADEAU</strong>.", target: "gift", noise: ["plane", "car", "bike", "umbrella", "cloud"] }
    ];

    // 5. Moteur logique du CAPTCHA
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
            
            // Injection de l'icône SVG correspondante
            tile.innerHTML = svgs[type];
            
            tile.addEventListener("click", function() {
                if (type === currentChallenge.target) {
                    if (currentStep >= totalStepsNeeded) {
                        // REUSSITE DES 5 ETAPES
                        overlay.style.display = "none";
                        spinner.style.display = "none";
                        customBox.style.backgroundColor = "transparent";
                        checkmark.style.display = "block";
                        isVerified = true;
                        
                        console.log("Les 5 etapes visuelles ont ete franchies");
                        document.dispatchEvent(new CustomEvent("captchaSuccess", { detail: { id: uniqueId } }));
                    } else {
                        currentStep++;
                        launchChallenge();
                    }
                } else {
                    console.log("Mauvais choix d'objet. Reset");
                    alert("Erreur ! Recommencez la serie.");
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
