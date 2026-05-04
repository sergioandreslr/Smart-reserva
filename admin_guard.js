function validarAdmin() {
    const sesionActual = localStorage.getItem('smart_sesion');
    
    if (!sesionActual) {
        console.log('[admin_guard] No hay sesión en localStorage');
        window.location.href = 'login.html';
        return;
    }

    try {
        const sesion = JSON.parse(sesionActual);
        
        if (!sesion || !sesion.rol || sesion.rol !== 'admin') {
            console.log('[admin_guard] Acceso denegado. Rol actual:', sesion ? sesion.rol : 'null');
            window.location.href = 'login.html';
            return;
        }
        
        // Si todo está correcto
        console.log('[admin_guard] Acceso permitido para admin:', sesion.email);
        
    } catch (error) {
        console.log('[admin_guard] Error parseando sesión:', error);
        localStorage.removeItem('smart_sesion');
        window.location.href = 'login.html';
    }
}

validarAdmin();
