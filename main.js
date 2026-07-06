(function() {
    // 1. Récupérer l'emplacement exact du script actuel dans le DOM
    const currentScript = document.currentScript;

    // 2. Injection globale du CSS dans le head (une seule fois)
    if (!document.getElementById("custom-captcha-styles")) {
        const style = document.createElement('style');
        style.id = "custom-captcha-styles";
        style.textContent = `
            .custom-captcha-box {
                font-family: Arial, sans-serif;
                border: 2px solid #ccc;
                padding: 15px;
                border-radius: 8px;
                width: 280px;
                background-color: #f9f9f9;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                margin: 10px 0;
            }
            .custom-captcha-header {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            .custom-captcha-display {
                background: linear-gradient(45deg, #e0e0e0, #f5f5f5);
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 5px;
                text-align: center;
                padding: 10px;
                margin-bottom: 10px;
                user-select: none;
                font-style: italic;
                color: #2c3e50;
                border-radius: 4px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            .custom-captcha-input {
                width: 92%;
                padding: 8px;
                margin-bottom: 10px;
                border: 1px solid #aaa;
                border-radius: 4px;
                box-sizing: border-box;
            }
            .custom-captcha-btn {
                width: 100%;
                padding: 8px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            .custom-captcha-btn:hover {
                background-color: #2980b9;
            }
            .custom-captcha-status {
                margin-top: 10px;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Création du conteneur HTML du CAPTCHA
    const captchaContainer = document.createElement("div");
    captchaContainer.className = "custom-captcha-box";
    
    // Génération d'un identifiant unique au cas où il y a plusieurs CAPTCHA sur la page
    const uniqueId = Math.random().toString(36).substr(2, 9);
    
    captchaContainer.innerHTML = `
        <div class="custom-captcha-header">InlineCaptcha</div>
        <div class="custom-captcha-display" id="code-${uniqueId}"></div>
        <input type="text" class="custom-captcha-input" id="input-${uniqueId}" placeholder="Entrez le code ci-dessus" autocomplete="off"/>
        <button type="button" class="custom-captcha-btn" id="btn-${uniqueId}">Vérifier</button>
        <div class="custom-captcha-status" id="status-${uniqueId}"></div>
    `;

    // 4. Insertion du CAPTCHA dans la page, pile là où se trouve le script
    currentScript.parentNode.insertBefore(captchaContainer, currentScript);

    // 5. Logique interne du CAPTCHA
    const codeDisplay = captchaContainer.querySelector(`#code-${uniqueId}`);
    const inputField = captchaContainer.querySelector(`#input-${uniqueId}`);
    const verifyBtn = captchaContainer.querySelector(`#btn-${uniqueId}`);
    const statusDisplay = captchaContainer.querySelector(`#status-${uniqueId}`);

    let generatedCode = "";

    function generateCaptcha() {
        const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz023456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        generatedCode = result;
        codeDisplay.textContent = generatedCode;
        
        console.log("Nouveau code genere");
    }

    verifyBtn.addEventListener("click", function() {
        const userValue = inputField.value.trim();

        if (userValue === generatedCode) {
            statusDisplay.style.color = "green";
            statusDisplay.textContent = "Validation reussie !";
            
            // Déclenche un événement personnalisé global
            const event = new CustomEvent("captchaSuccess", { detail: { id: uniqueId } });
            document.dispatchEvent(event);
        } else {
            statusDisplay.style.color = "red";
            statusDisplay.textContent = "Code incorrect. Reessayez.";
            inputField.value = "";
            generateCaptcha();
        }
    });

    // Initialisation immédiate
    generateCaptcha();
})();
