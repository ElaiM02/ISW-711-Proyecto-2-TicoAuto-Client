const API_BASE = "http://localhost:3008/api";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const msg = document.getElementById("msg");
    const btn = document.getElementById("btnRegister");

    function setMsg(text, type = "") {
        msg.textContent = text;
        msg.className = `msg ${type}`;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (name.length < 2) return setMsg("El nombre es muy corto", "err");
        if (!email.includes("@")) return setMsg("Correo inválido", "err");
        if (password.length < 6) return setMsg("La contraseña debe tener mínimo 6 caracteres", "err");

        btn.disabled = true;
        btn.textContent = "Registrando...";

        try {
            const resp = await fetch(`${API_BASE}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            if (!resp.ok) {
                setMsg("Error al registrar usuario", "err");
                return;
            }

            setMsg("Registro exitoso", "success");
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