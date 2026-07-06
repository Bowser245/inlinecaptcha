(function() {
    const currentScript = document.currentScript;
    if (!currentScript) return;

    // 1. Injection du CSS (Widget + Pop-up du Défi)
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
                position: relative;
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
            
            /* Spinner animatique */
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

            /* FENÊTRE DE DÉFI (POP-UP) */
            .inline-captcha-popup {
                display: none;
                position: absolute;
                bottom: 85px;
                left: 0;
                width: 300px;
                background: white;
                border: 1px solid #ccc;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                border-radius: 4px;
                z-index: 99999;
                padding: 15px;
                box-sizing: border-box;
            }
            .inline-captcha-popup-header {
                background-color: #4d90fe;
                color: white;
                padding: 10px;
                margin: -15px -15px 15px -15px;
                font-size: 14px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            .inline-captcha-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }
            .inline-captcha-tile {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                background: #fcfcfc;
                font-size: 20px;
                border-radius: 4px;
            }
            .inline-captcha-tile:hover { background: #eee; }
        `;
        document.head.appendChild(style);
    }

    // 2. Création du Widget InlineCAPTCHA avec Logo SVG natif
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

        <div class="inline-captcha-popup" id="popup-${uniqueId}">
            <div class="inline-captcha-popup-header">
                <strong>Défi de sécurité :</strong><br>Sélectionnez le <strong>CARRÉ (⬛)</strong> pour continuer.
            </div>
            <div class="inline-captcha-grid" id="grid-${uniqueId}"></div>
        </div>
    `;

    currentScript.parentNode.insertBefore(widget, currentScript);

    // 3. Éléments du DOM internes
    const label = widget.querySelector(`#label-${uniqueId}`);
    const customBox = widget.querySelector(`#box-${uniqueId}`);
    const spinner = widget.querySelector(`#spinner-${uniqueId}`);
    const checkmark = widget.querySelector(`#mark-${uniqueId}`);
    const popup = widget.querySelector(`#popup-${uniqueId}`);
    const grid = widget.querySelector(`#grid-${uniqueId}`);

    let isVerified = false;

    // Banque d'icônes pour le défi
    const targetItem = "⬛"; // Ce qu'il faut chercher
    const noiseItems = ["🔺", "🔵", "⭐", "🔶", "🛑"]; // Les leurres

    // Générer le défi aléatoirement
    function launchChallenge() {
        grid.innerHTML = "";
        
        // Créer une liste de 9 cases contenant 1 carré et 8 formes aléatoires
        let items = [targetItem];
        for (let i = 0; i < 8; i++) {
            const randomNoise = noiseItems[Math.floor(Math.random() * noiseItems.length)];
            items.push(randomNoise);
        }
        // Mélanger le tableau
        items.sort(function() { return 0.5 - Math.random(); });

        // Injecter les tuiles dans la grille
        items.forEach(function(icon) {
            const tile = document.createElement("div");
            tile.className = "inline-captcha-tile";
            tile.textContent = icon;
            
            tile.addEventListener("click", function() {
                if (icon === targetItem) {
                    // RÉUSSI !
                    popup.style.display = "none";
                    spinner.style.display = "none";
                    customBox.style.backgroundColor = "transparent";
                    checkmark.style.display = "block";
                    isVerified = true;
                    
                    console.log("Defi InlineCAPTCHA reussi");
                    document.dispatchEvent(new CustomEvent("captchaSuccess", { detail: { id: uniqueId } }));
                } else {
                    // ÉCHEC : On secoue et on régénère le défi
                    alert("Faux ! Reessayez.");
                    launchChallenge();
                }
            });
            grid.appendChild(tile);
        });
    }

    // Clic sur la checkbox principale
    label.addEventListener("click", function(e) {
        e.preventDefault();
        if (isVerified) return;

        customBox.style.borderColor = "transparent";
        spinner.style.display = "block";

        // Déclenche le pop-up du défi après 800ms de "réflexion"
        setTimeout(function() {
            launchChallenge();
            popup.style.display = "block";
        }, 800);
    });

})();
