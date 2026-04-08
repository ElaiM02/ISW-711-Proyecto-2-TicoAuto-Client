const API_BASE = "http://localhost:3008/api";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

const loading = document.getElementById("loading");        
const success = document.getElementById("success");
const error = document.getElementById("error");
const errorMsg = document.getElementById("errorMsg");

const verify = async () => {
    if (!token) {
        loading.style.display = "none";
        errorMsg.textContent = "No se encontró el token de verificación.";
        error.style.display = "block";
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/users/verify?token=${token}`);

        loading.style.display = "none";

        if (resp.ok) {
            success.style.display = "block";
        } else {
            const data = await resp.json();
            errorMsg.textContent = data.message || "Token inválido o expirado.";
            error.style.display = "block";
        }

    } catch (err) {
        console.error(err);
        loading.style.display = "none";
        errorMsg.textContent = "No se pudo conectar al servidor.";
        error.style.display = "block";
    }
};

verify();