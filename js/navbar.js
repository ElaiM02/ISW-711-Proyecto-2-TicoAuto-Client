const token = sessionStorage.getItem('authToken');
const email = sessionStorage.getItem('email');

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;

    let links = `
        <li><a href="index.html">Inicio</a></li>
    `;

    if (!token) {

        links += `
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Registro</a></li>
        `;
    }

    else {

        links += `
            <li><a href="Vehicle.html">Mis Vehículos</a></li>
            <li><a href="#" id="logoutBtn">Logout</a></li>
        `;
    }

    navbar.innerHTML = `
        <nav class="navbar">
        
            <div class="logo">
                TicoAuto
            </div>

            <ul class="nav-links">
                ${links}
            </ul>
        </nav>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('email');
            window.location.href = 'index.html';
        });
    }
});