const API_BASE = "http://localhost:3008/api";

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

            if (name.length < 2) {
                setMsg("El nombre es muy corto", "err");
                return;
            }

            if (!email.includes("@")) {
                setMsg("Correo inválido", "err");
                return;
            }

            if (password.length < 6) {
                setMsg("La contraseña debe tener mínimo 6 caracteres", "err");
                return;
            }

            btn.disabled = true;
            btn.textContent = "Registrando...";

            try {

                const resp = await fetch(`${API_BASE}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                });

                const data = await resp.json().catch(() => ({}));

                if (!resp.ok) {
                    setMsg("Error al registrar usuario", "err");
                    return;
                }

                setMsg("Registro exitoso", "success");

                sessionStorage.setItem("lastEmail", email);

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);

            } catch (err) {

                console.error(err);
                setMsg("No se pudo conectar al servidor", "err");

            } finally {

                btn.disabled = false;
                btn.textContent = "Registrarse";

            }

        });