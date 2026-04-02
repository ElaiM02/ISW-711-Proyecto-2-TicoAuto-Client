const API_BASE = "http://localhost:3008/api";
const getToken = () => sessionStorage.getItem("authToken");

let vehicleId = null;
let ownerId = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    vehicleId = params.get("id");

    if (!vehicleId) {
        document.getElementById("vehicleDetail").innerHTML = "No hay ID";
        return;
    }

    loadVehicle(vehicleId);
    loadQuestions();
});

function getUserIdFromToken() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
    } catch (error) {
        return null;
    }
}

async function loadVehicle(id) {
    try {
        const headers = {};
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/vehicle/${id}`, { headers });
        if (!response.ok) throw new Error("Error al cargar el vehículo");

        const data = await response.json();
        const v = data.data || data;

        ownerId = v.owner?._id || v.owner;

        const imgSrc = v.image 
            ? `http://localhost:3008/uploads/${v.image}` 
            : "https://via.placeholder.com/400";

        document.getElementById("vehicleDetail").innerHTML = `
            <img src="${imgSrc}" />
            <h2>${v.brand} ${v.model}</h2>
            <p><b>Año:</b> ${v.year}</p>
            <p><b>Precio:</b> $${v.price}</p>
            <p>${v.description || "Sin descripción"}</p>
            <p><b>Propietario:</b> ${v.owner?.name || "No disponible"}</p>
        `;
    } catch (error) {
        console.error(error);
        alert("Error al cargar el vehículo");
    }
}

async function loadQuestions() {
  try {
    const token = getToken();
    const userId = getUserIdFromToken();

    if (!token) {
        document.getElementById("questionList").innerHTML = "<p>Inicia sesión para ver las preguntas.</p>";
        return;
    }

    const response = await fetch(`${API_BASE}/question/${vehicleId}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();
    const questions = result.data;
    const container = document.getElementById("questionList");
    const input = document.getElementById("questionInput");
    const questionSection = document.getElementById("questionSection");

    if (userId && userId !== ownerId.toString()) {
        questionSection.style.display = "block";
    } else {
        questionSection.style.display = "none";
    }

    if (questions.length === 0) {
      container.innerHTML = "<p>No hay preguntas aún</p>";
      return;
    }

    const alreadyAsked = questions.some(q => q.userId === userId && !q.answer);
    if (alreadyAsked && input) input.disabled = true;

    let html = "";

    if (alreadyAsked) {
        html += `<p style="color:red;">Ya hiciste una pregunta. Espera la respuesta del propietario.</p>`;
    }

    questions.forEach(q => {
        html += `
            <div class="question-card">
                <p>
                    <b>${q.user || "Usuario"}:</b> ${q.question}
                    ${q.userId === userId ? '<span style="color:green;"> (Tu pregunta)</span>' : ''}
                </p>
                <small>${new Date(q.createdAt).toLocaleString()}</small>
      `;

        if (q.answer) {
            html += `
                <div class="answer">
                    <p><b>${q.answer.user || "Propietario"} respondió:</b> ${q.answer.text}</p>
                    <small>${new Date(q.answer.createdAt).toLocaleString()}</small>
                </div>
            `;
        }

        if (!q.answer && userId === ownerId) {
            html += `
                <textarea id="answer-${q.id}" placeholder="Responder..."></textarea>
                <button class="answer-btn" onclick="createAnswer('${q.id}')">Responder</button>
            `;
        }
        html += `</div>`;
    });

    container.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}

async function createQuestion() {
    const token = getToken();
    if (!token) {
        alert("Debes iniciar sesión para preguntar");
        return;
    }

    const input = document.getElementById("questionInput");
    const question = input.value;

    if (!question.trim()) {
        alert("Escribe una pregunta");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/question/${vehicleId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            alert("Error al enviar la pregunta");
            return;
        }

        input.value = "";
        loadQuestions();

    } catch (error) {
        console.error(error);
        alert("Error al enviar la pregunta");
    }
}


async function createAnswer(questionId) {
    const token = getToken();
    if (!token) {
        alert("Debes iniciar sesión");
        return;
    }

    const textarea = document.getElementById(`answer-${questionId}`);
    const answer = textarea.value;

    if (!answer.trim()) {
        alert("Escribe una respuesta");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/answer/${questionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ answer })
            });

            if (!response.ok) {
            alert("Error al enviar la respuesta");
            return;
        }
        loadQuestions();
    } catch (error) {
        console.error(error);
        alert("Error al enviar la respuesta");
    }
}

function shareVehicle() {
    const url = window.location.href;   
    navigator.clipboard.writeText(url).then(() => {
        alert("¡Enlace copiado al portapapeles!\n" + url);
    }).catch(() => {
        prompt("Copia este enlace:", url);
    });
}