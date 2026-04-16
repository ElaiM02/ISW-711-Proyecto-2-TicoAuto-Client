const API_BASE = "http://localhost:3008";

let userEmail = "";

function showMsg(text, isError = false) {
    const el = document.getElementById("result");
    if (el) {
        el.textContent = text;
        el.style.color = isError ? "red" : "green";
    }
}

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showMsg("Email y contraseña son requeridos.", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/token`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const msg = data.message || "Credenciales inválidas.";
            showMsg(msg, true);
            return;
        }

        if (data.requires2FA) {
            userEmail = email;
            document.getElementById("loginForm").style.display = "none";
            document.getElementById("twoFAForm").style.display = "block";
            document.getElementById("smsBanner").style.display = "flex";
        }

    } catch (err) {
        console.error(err);
        showMsg("No se pudo conectar al servidor.", true);
    }
}

async function verify2FA(event) {
    event.preventDefault();

    const code = document.getElementById("twoFACode")?.value.trim();

    if (!code) {
        showMsg("Ingresa el código de verificación.", true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/2fa`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: userEmail, code })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errEl = document.getElementById("twoFAResult");
            errEl.textContent = "Código inválido o expirado.";
            errEl.style.display = "block";
            return;
        }

        if (data.token) {
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("userEmail", userEmail);
            window.location.href = "index.html";
        }

    } catch (err) {
        console.error(err);
        showMsg("No se pudo conectar al servidor.", true);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", login);
    }

    const twoFAForm = document.getElementById("twoFAForm");
    if (twoFAForm) {
        twoFAForm.addEventListener("submit", verify2FA);
    }
});