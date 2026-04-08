const API_BASE = "http://localhost:3008/api";
const PADRON_API = "http://127.0.0.1:8000";

function cerrarModal() {
    document.getElementById("cedulaModal").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const msg = document.getElementById("msg");
    const btn = document.getElementById("btnRegister");
    const cedulaInput = document.getElementById("cedula");


    function setMsg(text, type = "") {
        msg.textContent = text;
        msg.className = `msg ${type}`;
    }

    cedulaInput.addEventListener("blur", async () => {
        const cedula = cedulaInput.value.trim();

        if (cedula.length !== 9 || !cedula.match(/^\d+$/)) {
            setMsg("La cédula debe tener 9 dígitos", "err");
            return;
        }

        const modal = document.getElementById("cedulaModal");
        document.getElementById("modalLoading").style.display = "block";
        document.getElementById("modalSuccess").style.display = "none";
        document.getElementById("modalError").style.display = "none";
        modal.classList.add("active");

        try {
            const resp = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);
            document.getElementById("modalLoading").style.display = "none";

            if (!resp.ok) {
                document.getElementById("modalErrorMsg").textContent = "Cédula no encontrada en el padrón electoral.";
                document.getElementById("modalError").style.display = "block";
                document.getElementById("name").value = "";
                return;
            }

        const person = await resp.json();
        const nombreCompleto = `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`;
        document.getElementById("name").value = nombreCompleto;
        document.getElementById("modalName").textContent = nombreCompleto;
        document.getElementById("modalSuccess").style.display = "block";

    } catch (err) {
        console.error(err);
        document.getElementById("modalLoading").style.display = "none";
        document.getElementById("modalErrorMsg").textContent = "No se pudo conectar al servicio del padrón.";
        document.getElementById("modalError").style.display = "block";
    }
});

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const cedula = document.getElementById("cedula").value.trim();

        if (cedula.length !== 9 || !cedula.match(/^\d+$/)) return setMsg("La cédula debe tener 9 dígitos", "err");
        if (name.length < 2) return setMsg("El nombre es muy corto", "err");
        if (!email.includes("@")) return setMsg("Correo inválido", "err");
        if (password.length < 6) return setMsg("La contraseña debe tener mínimo 6 caracteres", "err");

        btn.disabled = true;
        btn.textContent = "Registrando...";

        try {
            const resp = await fetch(`${API_BASE}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, cedula })
            });

            if (!resp.ok) {
                const data = await resp.json();
                setMsg(data.message || "Error al registrar usuario", "err");
                return;
            }

            document.getElementById("successModal").classList.add("active");
            
        } catch (err) {
            console.error(err);
            setMsg("No se pudo conectar al servidor", "err");
        } finally {
            btn.disabled = false;
            btn.textContent = "Registrarse";
        }
    });
});