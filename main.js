(function() {
    // 1. Emplacement du script
    const currentScript = document.currentScript;
    if (!currentScript) return;

    // 2. CSS pour le look "Mythique" (Case à cocher style Google)
    if (!document.getElementById("modern-captcha-styles")) {
        const style = document.createElement('style');
        style.id = "modern-captcha-styles";
        style.textContent = `
            .modern-captcha-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 300px;
                height: 74px;
                background-color: #f9f9f9;
                border: 1px solid #d3d3d3;
                border-radius: 3px;
                padding: 0 10px 0 14px;
                font-family: Roboto, Helvetica, Arial, sans-serif;
                box-sizing: border-box;
                box-shadow: 0 0 4px rgba(0,0,0,0.08);
                margin: 15px 0;
            }
            .modern-captcha-left {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                user-select: none;
            }
            /* Cache la vraie checkbox */
            .modern-captcha-checkbox {
                display: none;
            }
            /* Le faux carré de la checkbox */
            .modern-captcha-custom-box {
                width: 24px;
                height: 24px;
                border: 2px solid #c1c1c1;
                border-radius: 2px;
                background-color: #fff;
                position: relative;
                transition: border-color 0.2s;
            }
            .modern-captcha-left:hover .modern-captcha-custom-box {
                border-color: #b2b2b2;
            }
            /* Texte "Je ne suis pas un robot" */
            .modern-captcha-text {
                color: #282828;
                font-size: 14px;
                font-weight: 400;
            }
            /* Spinner de chargement */
            .modern-captcha-spinner {
                display: none;
                width: 22px;
                height: 22px;
                border: 3px solid #4d90fe;
                border-radius: 50%;
                border-top-color: transparent;
                animation: captcha-spin 1s linear infinite;
                position: absolute;
                top: -1px;
                left: -1px;
            }
            @keyframes captcha-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            /* Coche verte de succès */
            .modern-captcha-checkmark {
                display: none;
                position: absolute;
                top: 2px;
                left: 7px;
                width: 5px;
                height: 12px;
                border: solid #00aa6c;
                border-width: 0 3px 3px 0;
                transform: rotate(45deg);
            }
            /* Bloc Logo de droite */
            .modern-captcha-right {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
            }
            .modern-captcha-logo {
                width: 32px;
                height: 32px;
                background: url('https://upload.wikimedia.org/wikipedia/commons/a/ad/RecaptchaLogo.svg') no-repeat center;
                background-size: contain;
            }
            .modern-captcha-brand-text {
                font-size: 8px;
                color: #555;
                margin-top: 4px;
                text-align: center;
                line-height: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Création du HTML du Widget
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const widget = document.createElement("div");
    widget.className = "modern-captcha-container";
    
    widget.innerHTML = `
        <label class="modern-captcha-left" id="label-${uniqueId}">
            <input type="checkbox" class="modern-captcha-checkbox" id="check-${uniqueId}">
            <div class="modern-captcha-custom-box" id="box-${uniqueId}">
                <div class="modern-captcha-spinner" id="spinner-${uniqueId}"></div>
                <div class="modern-captcha-checkmark" id="mark-${uniqueId}"></div>
            </div>
            <span class="modern-captcha-text">Je ne suis pas un robot</span>
        </label>
        <div class="modern-captcha-right">
            <div class="modern-captcha-logo"></div>
            <div class="modern-captcha-brand-text">reCAPTCHA<br><span>Maison</span></div>
        </div>
    `;

    // Insertion immédiate à la place de la balise script
    currentScript.parentNode.insertBefore(widget, currentScript);

    // 4. Logique d'animation et de validation
    const checkbox = widget.querySelector(`#check-${uniqueId}`);
    const label = widget.querySelector(`#label-${uniqueId}`);
    const customBox = widget.querySelector(`#box-${uniqueId}`);
    const spinner = widget.querySelector(`#spinner-${uniqueId}`);
    const checkmark = widget.querySelector(`#mark-${uniqueId}`);

    let isVerified = false;

    label.addEventListener("click", function(e) {
        // Empêche le double-clic ou le déclenchement si déjà validé
        if (isVerified) {
            e.preventDefault();
            return;
        }
        
        // Bloque le comportement par défaut temporairement pour gérer l'animation
        e.preventDefault(); 
        
        isVerified = true; // Évite les clics multiples pendant le chargement
        customBox.style.borderColor = "transparent";
        spinner.style.display = "block";

        // Simulation d'une analyse de comportement du robot (1.5 seconde)
        setTimeout(function() {
            spinner.style.display = "none";
            customBox.style.borderColor = "transparent";
            customBox.style.backgroundColor = "transparent";
            checkmark.style.display = "block";
            checkbox.checked = true;

            console.log("Validation du captcha reussie");

            // Envoi de l'événement pour débloquer ton formulaire
            const event = new CustomEvent("captchaSuccess", { detail: { id: uniqueId } });
            document.dispatchEvent(event);
        }, 1500);
    });

})();
