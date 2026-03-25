const API_BASE= "http://localhost:3008/api";

let vehicles = [];

window.onload = function() {
    getVehicles();
};

async function getVehicles() {
    try {
        const response = await fetch(`${API_BASE}/vehicle`);
        const data = await response.json();
        
        vehicles = data.data;

        renderVehicles(vehicles);

    } catch (error) {
        console.error(error);
        alert('No se pudieron cargar los vehículos');
    }
}

function renderVehicles(list) {
    const container = document.getElementById('vehicleContainer');
    let html = '';

    list.forEach(vehicle => {

        const imageUrl = vehicle.image
            ? `http://localhost:3008/upload/${vehicle.image}`
            : "https://via.placeholder.com/400";
        html += `
            <div class="vehicle-card">

                <img src="${imageUrl}" class="vehicle-img">

                <h3>${vehicle.brand} ${vehicle.model}</h3>
                <p class="desc">
                    ${vehicle.description || "Sin descripción"}
                </p>

                <p><b>Año:</b> ${vehicle.year}</p>
                <p><b>Precio:</b> $${vehicle.price}</p>

                <button onclick="viewVehicle('${vehicle._id}')">
                    Ver Detalle
                </button> 
            </div>
        `;
    });

    if (list.length === 0) {
    container.innerHTML = "<p>No hay vehículos disponibles</p>";
    return;
}

    container.innerHTML = html;
}

    async function saveVehicle() {

    const formData = new FormData();

    formData.append("brand", document.getElementById("brand").value);
    formData.append("model", document.getElementById("model").value);
    formData.append("year", document.getElementById("year").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("description", document.getElementById("description").value);

    const fileInput = document.getElementById("image");
    formData.append("image", fileInput.files[0]);

    await fetch("http://localhost:3008/api/vehicle", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`
        },
        body: formData
    });

    alert("Vehículo guardado");
    getVehicles();
}


function viewVehicle(id) {
    window.location.href = `vehicleDetail.html?id=${id}`;
}

async function searchVehicles(){

const brand = document.getElementById("brandFilter").value;
const model = document.getElementById("modelFilter").value;
const minYear = document.getElementById("minYearFilter").value;
const maxYear = document.getElementById("maxYearFilter").value;
const minPrice = document.getElementById("minPriceFilter").value;
const maxPrice = document.getElementById("maxPriceFilter").value;
const status = document.getElementById("statusFilter").value;

let query = [];

if(brand) query.push(`brand=${brand}`);
if(model) query.push(`model=${model}`);
if(minYear) query.push(`minYear=${minYear}`);
if(maxYear) query.push(`maxYear=${maxYear}`);
if(minPrice) query.push(`minPrice=${minPrice}`);
if(maxPrice) query.push(`maxPrice=${maxPrice}`);
if(status) query.push(`status=${status}`);

let url = `${API_BASE}/vehicle`;

if(query.length > 0){
url += "?" + query.join("&");
}

const response = await fetch(url);
const data = await response.json();

renderVehicles(data.data);

}
function clearFilters() {

    document.getElementById("brandFilter").value = "";
    document.getElementById("modelFilter").value = "";
    document.getElementById("minYearFilter").value = "";
    document.getElementById("maxYearFilter").value = "";
    document.getElementById("minPriceFilter").value = "";
    document.getElementById("maxPriceFilter").value = "";
    document.getElementById("statusFilter").value = "";

    getVehicles();
}