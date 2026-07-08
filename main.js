(function() {
    const currentScript = document.currentScript;
    if (!currentScript) return;

    // 1. Injection du CSS global
    if (!document.getElementById("inline-captcha-styles")) {
        const style = document.createElement('style');
        style.id = "inline-captcha-styles";
        style.textContent = `
            .inline-captcha-container {
                display: flex; align-items: center; justify-content: space-between;
                width: 300px; height: 74px; background-color: #f9f9f9;
                border: 1px solid #d3d3d3; border-radius: 3px; padding: 0 10px 0 14px;
                font-family: Arial, sans-serif; box-sizing: border-box;
                box-shadow: 0 0 4px rgba(0,0,0,0.08); margin: 15px 0;
            }
            .inline-captcha-left { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
            .inline-captcha-checkbox { display: none; }
            .inline-captcha-custom-box { width: 24px; height: 24px; border: 2px solid #c1c1c1; border-radius: 2px; background-color: #fff; position: relative; }
            .inline-captcha-text { color: #282828; font-size: 14px; }
            
            .inline-captcha-spinner {
                display: none; width: 20px; height: 20px; border: 3px solid #4d90fe;
                border-radius: 50%; border-top-color: transparent;
                animation: inline-spin 1s linear infinite; position: absolute; top: 0; left: 0;
            }
            @keyframes inline-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .inline-captcha-checkmark {
                display: none; position: absolute; top: 2px; left: 7px;
                width: 5px; height: 12px; border: solid #00aa6c; border-width: 0 3px 3px 0; transform: rotate(45deg);
            }
            .inline-captcha-right { display: flex; flex-direction: column; align-items: center; }
            .inline-captcha-brand-text { font-size: 8px; color: #555; text-align: center; margin-top: 2px; }

            .inline-captcha-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.6); z-index: 999998; align-items: center; justify-content: center;
                user-select: none;
            }
            .inline-captcha-popup {
                background: white; border: 1px solid #ccc; box-shadow: 0 4px 25px rgba(0,0,0,0.3);
                border-radius: 6px; width: 340px; padding: 20px; box-sizing: border-box;
                animation: inline-fadein 0.2s ease-out; pointer-events: auto;
            }
            @keyframes inline-fadein { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .inline-captcha-popup-header {
                background-color: #4d90fe; color: white; padding: 12px;
                margin: -20px -20px 15px -20px; font-size: 14px;
                border-top-left-radius: 5px; border-top-right-radius: 5px; line-height: 1.4;
            }
            .inline-captcha-progress { font-size: 12px; color: #555; margin-bottom: 10px; font-weight: bold; text-align: right; }
            .inline-captcha-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
            
            .inline-captcha-tile {
                border: 1px solid #ddd; padding: 8px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; background: #fdfdfd; height: 70px; border-radius: 4px; transition: background 0.15s;
                box-sizing: border-box; font-weight: bold; font-size: 14px; color: #333; pointer-events: auto;
            }
            .inline-captcha-tile:hover { background: #f0f0f0; border-color: #bbb; }
            .inline-captcha-tile svg { width: 40px; height: 40px; pointer-events: none; }

            .inline-captcha-timer-display {
                font-size: 22px; font-weight: bold; color: #e67e22; text-align: center; margin: 15px 0; display: none;
            }

            .inline-captcha-action-btn {
                width: 100%; padding: 12px; background-color: #2ecc71; color: white;
                border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;
                transition: background 0.15s; text-transform: uppercase; user-select: none;
            }
            .inline-captcha-action-btn:active { background-color: #27ae60; }
        `;
        document.head.appendChild(style);
    }

    // 2. Initialisation HTML
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
        <div class="inline-captcha-popup" oncontextmenu="return false;">
            <div class="inline-captcha-popup-header" id="header-${uniqueId}"></div>
            <div class="inline-captcha-progress" id="progress-${uniqueId}">Progression : 1/5</div>
            <div class="inline-captcha-timer-display" id="timer-${uniqueId}">0.0s ou 0.0s</div>
            <div class="inline-captcha-grid" id="grid-${uniqueId}"></div>
            <button type="button" class="inline-captcha-action-btn" id="action-${uniqueId}">Valider</button>
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
    const timerDisplay = overlay.querySelector(`#timer-${uniqueId}`);
    const grid = overlay.querySelector(`#grid-${uniqueId}`);
    const actionBtn = overlay.querySelector(`#action-${uniqueId}`);

    let isVerified = false;
    let currentStep = 1;
    const totalStepsNeeded = 5;

    let activeChallengeType = ""; 
    let startTime = 0;
    let targetHoldTime = 0; 
    let visualInterval = null;
    const allowedMargin = 600; 

    let requiredKeys = [];
    let keysPressed = {};

    window.addEventListener("keydown", function(e) { keysPressed[e.key.toLowerCase()] = true; });
    window.addEventListener("keyup", function(e) { keysPressed[e.key.toLowerCase()] = false; });

    const svgs = {
        plane: `<svg viewBox="0 0 24 24" fill="#34495e"><path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"/></svg>`,
        car: `<svg viewBox="0 0 24 24" fill="#e74c3c"><path d="M18.92,11L18.03,8.33C17.78,7.58 17.07,7 16.22,7H7.78C6.93,7 6.22,7.58 5.97,8.33L5.08,11C4.46,11.75 4,12.81 4,14V20A1,1 0 0,0 5,21H6A1,1 0 0,0 7,20V19H17V20A1,1 0 0,0 18,21H19A1,1 0 0,0 20,20V14C20,12.81 19.54,11.75 18.92,11M6.85,9H17.14L17.81,11H6.18L6.85,9M8,16A1.5,1.5 0 1,1 9.5,14.5A1.5,1.5 0 0,1 8,16M16,16A1.5,1.5 0 1,1 17.5,14.5A1.5,1.5 0 0,1 16,16Z"/></svg>`,
        key: `<svg viewBox="0 0 24 24" fill="#7f8c8d"><path d="M7,14A5,5 0 0,1 2,9A5,5 0 0,1 7,4A5,5 0 0,1 12,9C12,10.7 11.16,12.21 9.88,13.12L14,17.24V20H17V17H20V14L14.76,8.76M7,6A3,3 0 0,0 4,9A3,3 0 0,0 7,12A3,3 0 0,0 10,9Z"/></svg>`,
        train: `<svg viewBox="0 0 24 24" fill="#3498db"><path d="M19 2H5C3.34 2 2 3.34 2 5V17C2 18.1 2.9 19 4 19V21C4 21.55 4.45 22 5 22H6C6.55 22 7 21.55 7 21V19H17V21C17 21.55 17.45 22 18 22H19C19.55 22 20 21.55 20 21V19C21.1 19 22 18.1 22 17V5C22 3.34 20.66 2 19 2ZM6 16C5.17 16 4.5 15.33 4.5 14.5C4.5 13.67 5.17 13 6 13C6.83 13 7.5 13.67 7.5 14.5C7.5 15.33 6.83 16 6 16ZM18 16C17.17 16 16.5 15.33 16.5 14.5C16.5 13.67 17.17 13 18 13C18.83 13 19.5 13.67 19.5 14.5C19.5 15.33 18.83 16 18 16ZM20 10H4V5C4 4.45 4.45 4 5 4H19C19.55 4 20 4.45 20 5V10Z"/></svg>`,
        traffic_light: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="2" width="10" height="20" rx="2" fill="#333333"/><circle cx="12" cy="6" r="2.5" fill="#e74c3c"/><circle cx="12" cy="12" r="2.5" fill="#f1c40f"/><circle cx="12" cy="18" r="2.5" fill="#2ecc71"/></svg>`,
        bicycle: `<svg viewBox="0 0 24 24" fill="#e67e22"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm7-6.2c-1 0-1.9-.7-2-1.7l-.6-3.1c-.2-1.1.5-2.1 1.6-2.3l2.8-.5 1.3-2.2c.4-.7 1.2-1 1.9-.7l2.8 1.1c.6.2 1 1 .7 1.6s-1 1-1.6.7l-2.1-.8-1.1 1.9 2.1 1.8c.5.4.8 1 .8 1.7v3.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-2.3l-1.5-1.3-.8 4.2c-.1.5-.6.9-1.1.9zm7-2.3c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>`,
        boat: `<svg viewBox="0 0 24 24" fill="#2980b9"><path d="M20 12.5L12 6l-8 6.5V11L12 4.5l8 6.5v1.5zM12 2L4.3 8.3c-.5.4-.8 1-.8 1.7v7.5c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V10c0-.7-.3-1.3-.8-1.7L12 2zm6.5 15.5h-13v-6.2l6.5-5.3 6.5 5.3v6.2z"/></svg>`,
        truck: `<svg viewBox="0 0 24 24" fill="#7f8c8d"><path d="M20 8h-3V4H4c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM7 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zM15 12H4V6h11v6z"/></svg>`,
        pedestrian: `<svg viewBox="0 0 24 24" fill="#16a085"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.4L6.8 22h2.1l2.1-9.5 2.1 4.5V22h2v-6.8l-2.4-5.1 1.5-4c1.1 1.4 2.8 2.4 4.8 2.4v-2c-1.8 0-3.3-1.1-3.9-2.7l-.8-2c-.3-.8-1.1-1.3-2-1.3H9c-1.1 0-2 .9-2 2v5h2V8.4h.8z"/></svg>`
    };

    // 3. Système Multi-Types de défis avec tirage aléatoire imbriqué
    function buildChallenge() {
        grid.innerHTML = "";
        actionBtn.style.backgroundImage = "none";
        grid.style.display = "grid";
        timerDisplay.style.display = "none";
        actionBtn.style.pointerEvents = "auto";
        actionBtn.onmousedown = null;
        actionBtn.onmouseup = null;
        actionBtn.onmouseleave = null;
        clearInterval(visualInterval);

        // Sélection aléatoire d'un TYPE de défi parmi 4 grandes familles
        const typeChoice = Math.floor(Math.random() * 4);

        if (typeChoice === 0) {
            // ================= TYPE 0 : INTERACTION GRILLE VISUELLE ET TEXTUELLE =================
            // Sélection d'un sous-défi au hasard à l'intérieur du type 0
            const subType = Math.floor(Math.random() * 4);

            if (subType === 0) {
                // Défi classique : Intrus icône
                activeChallengeType = "CLASSIC_ICON";
                const options = [
                    { inst: "Sélectionnez l'<strong>AVION</strong> dans la grille.", target: "plane", noise: ["car", "key", "train", "traffic_light", "bicycle", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez la <strong>VOITURE</strong> dans la grille.", target: "car", noise: ["plane", "key", "train", "traffic_light", "bicycle", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez la <strong>CLÉ</strong> dans la grille.", target: "key", noise: ["plane", "car", "train", "traffic_light", "bicycle", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>TRAIN</strong> dans la grille.", target: "train", noise: ["plane", "car", "key", "traffic_light", "bicycle", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>FEU TRICOLORE</strong> dans la grille.", target: "traffic_light", noise: ["plane", "car", "key", "train", "bicycle", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>VÉLO</strong> dans la grille.", target: "bicycle", noise: ["plane", "car", "key", "train", "traffic_light", "boat", "truck", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>BATEAU</strong> dans la grille.", target: "boat", noise: ["plane", "car", "key", "train", "traffic_light", "bicycle", "truck", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>CAMION</strong> dans la grille.", target: "truck", noise: ["plane", "car", "key", "train", "traffic_light", "bicycle", "boat", "pedestrian"] },
                    { inst: "Sélectionnez le <strong>PIÉTON</strong> dans la grille.", target: "pedestrian", noise: ["plane", "car", "key", "train", "traffic_light", "bicycle", "boat", "truck"] }
                ];
                const chosen = options[Math.floor(Math.random() * options.length)];
                header.innerHTML = "<strong>Vérification :</strong> " + chosen.inst;
                actionBtn.textContent = "Sélectionnez l'image correcte";

                // On ajoute la réponse correcte
                let tilesData = [{ correct: true, html: svgs[chosen.target] }];
        
                // On ajoute tous les éléments de bruit présents dans la liste
                chosen.noise.forEach(function(noiseKey) {
                    if (svgs[noiseKey]) {
                        tilesData.push({ correct: false, html: svgs[noiseKey] });
                    }
                });
        
                // Mélange aléatoire des cases (le correct ou les bruits)
                tilesData.sort(function() { return 0.5 - Math.random(); });

                tilesData.forEach(function(data) {
                    let tile = document.createElement("div");
                    tile.className = "inline-captcha-tile";
                    tile.innerHTML = data.html;
                    tile.onclick = function() { if (data.correct) { advanceStep(); } else { failChallenge(); } };
                    grid.appendChild(tile);
                });

            } else if (subType === 1) {
                // Défi : Camouflage textuel
                activeChallengeType = "TEXT_CAMOUFLAGE";
                const wordPairs = [
                    { inst: "Trouvez le mot exact : <strong>ROBOT</strong>", target: "ROBOT", noise: ["R0BOT", "ROB0T", "R0B0T", "RBOT", "ROBOTT"] },
                    { inst: "Trouvez le mot sans faute : <strong>SÉCURITÉ</strong>", target: "SÉCURITÉ", noise: ["SECURITE", "SÉCURTÉ", "SÉCCURITÉ"] }
                ];
                const chosen = wordPairs[Math.floor(Math.random() * wordPairs.length)];
                header.innerHTML = "<strong>Vérification :</strong> " + chosen.inst;
                actionBtn.textContent = "Sélectionnez la bonne case";

                let tilesData = [{ correct: true, html: chosen.target }];
                for (let i = 0; i < 8; i++) {
                    let randomNoise = chosen.noise[Math.floor(Math.random() * chosen.noise.length)];
                    tilesData.push({ correct: false, html: randomNoise });
                }
                tilesData.sort(function() { return 0.5 - Math.random(); });

                tilesData.forEach(function(data) {
                    let tile = document.createElement("div");
                    tile.className = "inline-captcha-tile";
                    tile.textContent = data.html;
                    tile.onclick = function() { if (data.correct) { advanceStep(); } else { failChallenge(); } };
                    grid.appendChild(tile);
                });

            } else if (subType === 2) {
                // Défi : Calcul arithmétique
                activeChallengeType = "MATH";
                const num = Math.floor(Math.random() * 20) + 10;
                const targetAnswer = num * 2;
                header.innerHTML = `<strong>Vérification :</strong> Calculez de tête : Combien font <strong>${num} + ${num}</strong> ?`;
                actionBtn.textContent = "Sélectionnez le résultat";

                let tilesData = [{ correct: true, html: targetAnswer.toString() }];
                while (tilesData.length < 9) {
                    let fake = targetAnswer + (Math.floor(Math.random() * 10) - 5);
                    if (fake !== targetAnswer && !tilesData.some(t => t.html === fake.toString())) {
                        tilesData.push({ correct: false, html: fake.toString() });
                    }
                }
                tilesData.sort(function() { return 0.5 - Math.random(); });

                tilesData.forEach(function(data) {
                    let tile = document.createElement("div");
                    tile.className = "inline-captcha-tile";
                    tile.textContent = data.html;
                    tile.onclick = function() { if (data.correct) { advanceStep(); } else { failChallenge(); } };
                    grid.appendChild(tile);
                });

            } else {
                // Défi : Le piège absolu (Rien n'est sélectionnable)
                activeChallengeType = "TRAP";
                header.innerHTML = "<strong>Vérification :</strong> Ne touchez à aucune case de la grille. Cliquez directement sur le bouton vert en bas.";
                actionBtn.textContent = "Suivant";

                for (let i = 0; i < 9; i++) {
                    let tile = document.createElement("div");
                    tile.className = "inline-captcha-tile";
                    tile.innerHTML = svgs.car;
                    tile.onclick = function() { failChallenge(); };
                    grid.appendChild(tile);
                }
            }

        } else if (typeChoice === 1) {
                // ================= TYPE 1 : APPUI LONG AVEC REMPLISSAGE CSS SANS TEMPS TEXTUEL =================
            activeChallengeType = "HOLD";
            targetHoldTime = Math.floor(Math.random() * 16) + 5; // Demande entre 5 ou 20 secondes secrètes
    
            header.innerHTML = "<strong>Analyse Comportementale :</strong> Maintenez le bouton vert enfoncé jusqu'à ce qu'il soit <strong>complètement rempli</strong> de vert foncé, puis relâchez immédiatement.";
            actionBtn.textContent = "Maintenir longuement...";
            grid.style.display = "none";
    
            actionBtn.onmousedown = function() {
                startTime = performance.now();
        
        // Intervalle fluide (toutes les 30ms) pour mettre à jour la jauge de remplissage CSS
                visualInterval = setInterval(function() {
                    let elapsedMs = performance.now() - startTime;
                    let targetMs = targetHoldTime * 1000;
                    let percentage = Math.min((elapsedMs / targetMs) * 100, 100);
            
            // Modification dynamique des paliers de couleur du gradient linéaire
                    actionBtn.style.backgroundImage = `linear-gradient(to right, #27ae60 ${percentage}%, #2ecc71 ${percentage}%)`;
            
                    if (percentage >= 100) {
                        actionBtn.textContent = "Vous pouvez relacher.";
                    }
                }, 30);
            };
    
            actionBtn.onmouseup = function() {
                if (startTime === 0) return;
                clearInterval(visualInterval);
        
                const durationElapsed = performance.now() - startTime;
                startTime = 0; 
                const targetInMs = targetHoldTime * 1000;
        
        // Valide si le bouton a été maintenu au moins le temps requis sans dépasser la marge d'erreur
                if (durationElapsed >= targetInMs) {
                    actionBtn.style.pointerEvents = "none";
                    advanceStep();
                } else {
                    failChallenge();
                }
            };
            actionBtn.onmouseleave = actionBtn.onmouseup;

        } else {
            // ================= TYPE 2 : COMBINAISON ET EXÉCUTION CLAVIER =================
            activeChallengeType = "KEYS";
            const combos = [
                { keys: ["control", "shift"], text: "CTRL et SHIFT" },
                { keys: ["alt", "shift"], text: "ALT et SHIFT" }
            ];
            const chosenCombo = combos[Math.floor(Math.random() * combos.length)];
            requiredKeys = chosenCombo.keys;

            header.innerHTML = "<strong>Action Clavier :</strong> Maintenez enfoncées les touches <strong>" + chosenCombo.text + "</strong> de votre clavier, puis cliquez sur le bouton vert.";
            actionBtn.textContent = "Vérifier le combo clavier";
            grid.style.display = "none";
        }
    }

    // 4. Moteur logique centralisé
    function launchChallenge() {
        progressDisplay.textContent = "Progression : " + currentStep + "/" + totalStepsNeeded;
        buildChallenge();
    }

    function advanceStep() {
        if (currentStep >= totalStepsNeeded) {
            overlay.style.display = "none";
            spinner.style.display = "none";
            customBox.style.backgroundColor = "transparent";
            checkmark.style.display = "block";
            isVerified = true;
            document.dispatchEvent(new CustomEvent("captchaSuccess", { detail: { id: uniqueId } }));
        } else {
            currentStep++;
            launchChallenge();
        }
    }

    function failChallenge() {
        alert("Action incorrecte ! Le test recommence.");
        currentStep = 1;
        launchChallenge();
    }

    // Gestion de l'action sur le bouton vert principal
    actionBtn.addEventListener("click", function() {
        if (activeChallengeType === "TRAP") {
            advanceStep();
        } else if (activeChallengeType === "KEYS") {
            let allKeysActive = requiredKeys.every(function(key) { return keysPressed[key] === true; });
            if (allKeysActive) { advanceStep(); } else { failChallenge(); }
        } else if (activeChallengeType === "CLASSIC_ICON" || activeChallengeType === "TEXT_CAMOUFLAGE" || activeChallengeType === "MATH") {
            failChallenge(); // Pas le droit de cliquer sur le bouton général pour ces défis à cases
        }
    });

    label.addEventListener("click", function(e) {
        e.preventDefault();
        if (isVerified) return;

        customBox.style.borderColor = "transparent";
        spinner.style.block = "block";
        spinner.style.display = "block";

        setTimeout(function() {
            currentStep = 1;
            launchChallenge();
            overlay.style.display = "flex";
        }, 800);
    });

})();
