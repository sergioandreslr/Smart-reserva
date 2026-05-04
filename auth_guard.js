const sesionActual = localStorage.getItem('smart_sesion');
let sesion = null;

try {
    sesion = JSON.parse(sesionActual);
} catch (error) {
    sesion = null;
}

const sesionValida = !!(sesion && sesion.email);
if (!sesionValida) {
    localStorage.removeItem('smart_sesion');
    window.location.href = 'login.html';
} else if (sesion.rol === 'admin') {
    window.location.href = 'admin.html';
}
