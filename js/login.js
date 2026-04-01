const API_BASE = "http://localhost:3008";

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
            showMsg("Credenciales inválidas.", true);
            return;
        }

        if (data && data.token) {
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("userEmail", email);
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
});