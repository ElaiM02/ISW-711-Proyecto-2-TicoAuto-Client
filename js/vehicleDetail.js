const API_BASE = "http://localhost:3008/api";

let vehicleId = null;
let ownerId = null;

window.onload = function () {

    const params = new URLSearchParams(window.location.search);
    vehicleId = params.get("id");

    if (!vehicleId) {
        document.getElementById("vehicleDetail").innerHTML = "No hay ID";
        return;
    }

    loadVehicle(vehicleId);
    loadQuestions();
};

function getUserIdFromToken() {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload.userId;
    } catch (error) {
        return null;
    }
}

async function loadVehicle(id) {

    const token = sessionStorage.getItem("authToken");

    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
    const response = await fetch(`${API_BASE}/vehicle/${id}`, { headers });

    if (!response.ok) {
        throw new Error("Error al cargar el vehículo");
    }

    const data = await response.json();
    const v = data.data || data;

    ownerId = v.owner?._id || v.owner;

    document.getElementById("vehicleDetail").innerHTML = `
    <img src="http://localhost:3008/upload/${v.image}" />

    <h2>${v.brand} ${v.model}</h2>
    <p><b>Año:</b> ${v.year}</p>
    <p><b>Precio:</b> $${v.price}</p>
    <p>${v.description || "Sin descripción"}</p>
`;
    } catch (error) {
        console.error(error);
        alert("Error al cargar el vehículo");
    }
}

async function loadQuestions() {
  try {
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(`${API_BASE}/question/${vehicleId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("ERROR BACKEND: ", result);
      alert(result.message);
      return;
    }

    const questions = result.data;
    const container = document.getElementById("questionList");
    const input = document.getElementById("questionInput");

    const userId = getUserIdFromToken();

    if (questions.length === 0) {
      container.innerHTML = "<p>No hay preguntas aún</p>";
      return;
    }

    const alreadyAsked = questions.some(q => q.userId === userId && !q.answer);
    if (alreadyAsked && input) input.disabled = true;

    let html = "";

    if (alreadyAsked) {
      html += `
        <p style="color:red;">
          Ya hiciste una pregunta. Espera la respuesta del propietario.
        </p>
      `;
    }

    questions.forEach(q => {
      html += `
        <div class="question-card">
          <p>
            <b>${q.user?.name || "Usuario"}:</b> ${q.question}
            ${q.userId === userId ? '<span style="color:green;"> (Tu pregunta)</span>' : ''}
          </p>
          <small>${new Date(q.createdAt).toLocaleString()}</small>
      `;

      if (q.answer) {
        html += `
          <div class="answer">
            <p><b>${q.answer.user?.name || "Propietario"} respondió:</b> ${q.answer.answer}</p>
            <small>${new Date(q.answer.createdAt).toLocaleString()}</small>
          </div>
        `;
      }

      if (!q.answer && userId === ownerId) {
        html += `
          <textarea id="answer-${q._id}" placeholder="Responder..."></textarea>
          <button class="answer-btn" onclick="createAnswer('${q._id}')">
            Responder
          </button>
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

    const token = sessionStorage.getItem("authToken");

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

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            input.value = "";
            return;
        }

        alert(data.message);
        input.value = "";
        loadQuestions();

        }catch (error) {
            console.error(error);
            alert("Error al enviar la pregunta");
        }
    }


    async function createAnswer(questionId) {

        const token = sessionStorage.getItem("authToken");

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

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            loadQuestions();
        }catch (error) {
            console.error(error);
            alert("Error al enviar la respuesta");
        }
    }