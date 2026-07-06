(function() {
    const currentScript = document.currentScript;
    if (!currentScript) return;

    // 1. Injection du CSS mis à jour avec barre de progression
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
                padding: 15px 10px;
                text-align: center;
                cursor: pointer;
                background: #fdfdfd;
                font-size: 24px;
                border-radius: 4px;
                transition: background 0.15s;
                user-select: none;
            }
            .inline-captcha-tile:hover { background: #f0f0f0; border-color: #bbb; }
        `;
        document.head.appendChild(style);
    }

    // 2. Structure HTML
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

    // 3. Variables de ciblage DOM
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

    // BANQUE DE 10 DÉFIS UNIQUES
    const challenges = [
        { instruction: "Sélectionnez le <strong>CARRÉ (⬛)</strong>.", target: "⬛", noise: ["🔺", "🔵", "⭐", "🔶", "🛑"] },
        { instruction: "Sélectionnez le <strong>CHAT (🐱)</strong>.", target: "🐱", noise: ["🚗", "🍏", "🍕", "⏰", "✈️"] },
        { instruction: "Sélectionnez la <strong style='color:#3498db;'>VOITURE BLEUE (🚙)</strong>.", target: "🚙", noise: ["🚗", "🚕", "🚑", "🚒", "🚜"] },
        { instruction: "Sélectionnez la <strong>POMME VERTE (🍏)</strong>.", target: "🍏", noise: ["🏀", "🚀", "🦊", "🍦", "🛸"] },
        { instruction: "Sélectionnez le <strong>MARTEAU (🔨)</strong>.", target: "🔨", noise: ["🍩", "🍍", "🦁", "🛹", "🎈"] },
        { instruction: "Sélectionnez l'<strong>AVION (✈️)</strong>.", target: "✈️", noise: ["⛵", "🚲", "🛴", "🛺", "🛸"] },
        { instruction: "Sélectionnez le <strong>BALLON DE FOOT (⚽)</strong>.", target: "⚽", noise: ["🏀", "🏈", "🎾", "🏐", "🎱"] },
        { instruction: "Sélectionnez la <strong>PIZZA (🍕)</strong>.", target: "🍕", noise: ["🍔", "🍟", "🌭", "🍣", "🍦"] },
        { instruction: "Sélectionnez la <strong>GUITARE (🎸)</strong>.", target: "🎸", noise: ["🎨", "🎧", "🎮", "🎲", "🎬"] },
        { instruction: "Sélectionnez la <strong style='color:#e74c3c;'>VALISE ROUGE (🧳)</strong>.", target: "🧳", noise: ["👜", "🎒", "💼", "👛", "📁"] }
    ];

    // 4. Logique du jeu de défis
    function launchChallenge() {
        grid.innerHTML = "";
        progressDisplay.textContent = "Defi : " + currentStep + " ou " + totalStepsNeeded;
        
        // Choisir un défi aléatoire parmi les 10
        const currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        header.innerHTML = "<strong>Défi de sécurité :</strong><br>" + currentChallenge.instruction;

        // Construire le set de 9 cases
        let items = [currentChallenge.target];
        for (let i = 0; i < 8; i++) {
            const randomNoise = currentChallenge.noise[Math.floor(Math.random() * currentChallenge.noise.length)];
            items.push(randomNoise);
        }

        // Mélanger la grille
        items.sort(function() { return 0.5 - Math.random(); });

        // Générer les tuiles cliquables
        items.forEach(function(icon) {
            const tile = document.createElement("div");
            tile.className = "inline-captcha-tile";
            tile.textContent = icon;
            
            tile.addEventListener("click", function() {
                if (icon === currentChallenge.target) {
                    if (currentStep >= totalStepsNeeded) {
                        // VICTOIRE TOTALE DES 5 ÉTAPES
                        overlay.style.display = "none";
                        spinner.style.display = "none";
                        customBox.style.backgroundColor = "transparent";
                        checkmark.style.display = "block";
                        isVerified = true;
                        
                        console.log("Les 5 defis ont ete reussis");
                        document.dispatchEvent(new CustomEvent("captchaSuccess", { detail: { id: uniqueId } }));
                    } else {
                        // ÉTAPE SUIVANTE
                        currentStep++;
                        launchChallenge();
                    }
                } else {
                    // ÉCHEC : Reset complet à 1 ou 5
                    console.log("Erreur dans le choix. Reset du score");
                    alert("Erreur ! Recommencez depuis le debut.");
                    currentStep = 1;
                    launchChallenge();
                }
            });
            grid.appendChild(tile);
        });
    }

    // Gestion du clic de base
    label.addEventListener("click", function(e) {
        e.preventDefault();
        if (isVerified) return;

        customBox.style.borderColor = "transparent";
        spinner.style.display = "block";

        setTimeout(function() {
            currentStep = 1; // Reset de sécurité à chaque ouverture volontaire
            launchChallenge();
            overlay.style.display = "flex";
        }, 800);
    });

})();
