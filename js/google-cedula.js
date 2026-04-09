
const API_BASE = "http://localhost:3008/api";
const PADRON_API = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
    window.location.href = "login.html";
}

function showNotif(icon, title, msg) {
    document.getElementById("notifIcon").textContent = icon;
    document.getElementById("notifTitle").textContent = title;
    document.getElementById("notifMsg").textContent = msg;
    document.getElementById("notifModal").classList.add("active");
}

function cerrarNotif() {
    document.getElementById("notifModal").classList.remove("active");    
}

async function verificarCedula() {
    const cedula = document.getElementById("cedula").value.trim();

    if (cedula.length !== 9 || !cedula.match(/^\d+$/)) {
        showNotif("⚠️", "Cédula inválida", "La cédula debe tener exactamente 9 dígitos.");
        return;
    }

    const btn = document.getElementById("btnVerificar");
    btn.disabled = true;
    btn.textContent = "Verificando...";

    try {
        const padronResp = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);

        if (!padronResp.ok) {
            showNotif("❌", "Cédula no encontrada", "La cédula no existe en el padrón electoral.");
            btn.disabled = false;
            btn.textContent = "Verificar Cédula";
            return;
        }

        const person = await padronResp.json();
        const nombreCompleto = `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`;

        document.getElementById("nombreCompleto").textContent = `✅ ${nombreCompleto}`;
        document.getElementById("nombreCompleto").style.display = "block";

        const resp = await fetch(`${API_BASE}/users/google/cedula`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ cedula })
        });

        if (!resp.ok) {
            if (resp.status === 409) {
                showNotif("❌", "Cédula ya registrada", "Esta cédula ya está asociada a otra cuenta.");
            } else {
                 showNotif("❌", "Error", "No se pudo completar el registro. Intenta de nuevo.");
            }
            btn.disabled = false;
             btn.textContent = "Verificar Cédula";
             return;
        }
         sessionStorage.setItem("authToken", token);
        showNotif("✅", "¡Registro completado!", "Tu cuenta ha sido verificada exitosamente.");
        setTimeout(() => { window.location.href = "index.html"; }, 2000);

    } catch (err) {
        console.error(err);
        showNotif("❌", "Error de conexión", "No se pudo conectar al servidor.");
        btn.disabled = false;
        btn.textContent = "Verificar Cédula";
    }
}