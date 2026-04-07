const API_BASE = "http://localhost:3008/api";
const PADRON_API = "http://127.0.0.1:8000";

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

        try {
            const resp = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);

            if (!resp.ok) {
                setMsg("Cédula no encontrada en el padrón electoral", "err");
                document.getElementById("name").value = "";
                return;
            }

            const person = await resp.json();

            document.getElementById("name").value = 
                `${person.nombre} ${person.primer_apellido} ${person.segundo_apellido}`;

            setMsg("Cédula verificada correctamente", "success");

        } catch (err) {
            console.error(err);
            setMsg("No se pudo conectar al servicio del padrón", "err");
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

            setMsg("Registro exitoso. Revisa tu correo para verificar tu cuenta.", "success");
            setTimeout(() => { window.location.href = "login.html"; }, 1000);

        } catch (err) {
            console.error(err);
            setMsg("No se pudo conectar al servidor", "err");
        } finally {
            btn.disabled = false;
            btn.textContent = "Registrarse";
        }
    });
});