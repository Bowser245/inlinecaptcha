# InlineCAPTCHA

To Intergrate in own website 

Note InlineCAPTCHA UI in on French and is not Changeable
```
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
</head>
<body>

    <form>
        <label>Username</label><br>
        <input type="text" required><br><br>

        <script src="https://bowser245.github.io/inlinecaptcha/main.js"></script>

        <br>
        <button type="submit" id="submit-btn" disabled>Subscribe</button>
	    </form>

    <script>
        // On finished captcha
        document.addEventListener("captchaSuccess", function(e) {
            document.getElementById("submit-btn").removeAttribute("disabled");
        });
    </script>

</body>
</html>
