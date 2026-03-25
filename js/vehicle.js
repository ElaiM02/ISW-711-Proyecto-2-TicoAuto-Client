const API_BASE = "http://localhost:3008/api";

let editVehicleId = null;

window.onload = function () {
    getVehicles();
};

async function createVehicle(){
    const brand = document.getElementById("brand").value;
    const model = document.getElementById("model").value;
    const year = document.getElementById("year").value;
    const price = document.getElementById("price").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("image").files[0];

    const token = sessionStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("year", year);
    formData.append("price", price);
    formData.append("description", description);

    if(image){
        formData.append("image", image);
    }

    let url = `${API_BASE}/vehicle`;
    let method = "POST";

    if(editVehicleId){
        url = `${API_BASE}/vehicle/${editVehicleId}`;
        method = "PUT"; // o PATCH según tu backend
    }

    const response = await fetch(url, {
        method,
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();

    if(response.ok){
        alert(editVehicleId ? "Vehículo actualizado" : "Vehículo creado");

        document.getElementById("vehicleForm").reset();
        document.getElementById("previewImage").style.display = "none";

        editVehicleId = null;
        document.getElementById("formTitle").innerText = "Agregar vehículo";
        document.getElementById("saveBtn").innerText = "Guardar vehículo";
        document.getElementById("cancelEdit").style.display = "none";

        getVehicles();
    } else {
        console.log(data);
        alert(data.message || "Error al guardar vehículo");
    }
}

async function getVehicles(){
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(`${API_BASE}/vehicle`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const result = await response.json();
    const vehicles = result.data;

    let html = "";

    vehicles.forEach(v => {
        html += `
        <tr>
            <td>${v.brand}</td>
            <td>${v.model}</td>
            <td>${v.year}</td>
            <td>${v.price}</td>
            <td>
                <button onclick="viewVehicle('${v._id}')">Ver Detalle</button>
                <button onclick="editVehicle('${v._id}')">Editar</button>
                <button onclick="deleteVehicle('${v._id}')">Eliminar</button>
            </td>
        </tr>
        `;
    });

    document.getElementById("vehicleList").innerHTML = html;
}

function viewVehicle(id) {
    window.location.href = `VehicleDetail.html?id=${id}`;
}

async function editVehicle(id){
    const token = sessionStorage.getItem("authToken");

    try {
        const response = await fetch(`${API_BASE}/vehicle/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const vehicle = await response.json();

        if (!response.ok) {
            alert(vehicle.message || "Error al cargar vehículo");
            return;
        }

        // Rellenar formulario
        document.getElementById("brand").value = vehicle.brand;
        document.getElementById("model").value = vehicle.model;
        document.getElementById("year").value = vehicle.year;
        document.getElementById("price").value = vehicle.price;

        editVehicleId = vehicle._id;  // Guardamos el ID que estamos editando
        document.getElementById("saveBtn").innerText = "Actualizar vehículo";

    } catch (error) {
        console.error(error);
        alert("Error al cargar vehículo");
    }
}

async function deleteVehicle(id){
    if (!confirm("¿Seguro que deseas eliminar este vehículo?")) return;

    const token = sessionStorage.getItem("authToken");

    const response = await fetch(`${API_BASE}/vehicle/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if(response.ok){
        alert("Vehículo eliminado");
        getVehicles();
    } else {
        const data = await response.json();
        alert(data.message || "Error al eliminar vehículo");
    }
}