const API_BASE = "http://localhost:3008";

        function showJSON(obj) {
            const el = document.getElementById("result");
            if (el) {
                el.textContent = JSON.stringify(obj, null, 2);
            }
        }

        async function login(event) {
            event.preventDefault();

            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value;

            if (!email || !password) {
                showJSON({ error: "Email y contraseña son requeridos." });
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/auth/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    showJSON({
                        error: "Error de autenticación",
                        status: response.status,
                        ...(data || {}),
                    });
                    return;
                }

                if (data && data.token) {
                    sessionStorage.setItem("authToken", data.token);
                    sessionStorage.setItem("userEmail", email);
                    window.location.href = "index.html";
                }

            } catch (err) {
                showJSON({ error: "No se pudo conectar a la API", detail: String(err) });
            }
        }

        document.addEventListener("DOMContentLoaded", () => {
            const form = document.getElementById("loginForm");
            if (form) {
                form.addEventListener("submit", login);
            }
        });