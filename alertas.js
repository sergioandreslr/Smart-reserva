/**
 * alertas.js - Sistema de alertas visuales personalizadas para Smart Reserva
 */
(function () {
    var DURACION_AUTO = 4000;
    var DURACION_SALIDA = 320;

    var TIPOS = {
        error:       { icono: 'fa-circle-exclamation' },
        exito:       { icono: 'fa-circle-check'       },
        advertencia: { icono: 'fa-triangle-exclamation' }
    };

    function obtenerContenedor() {
        var c = document.getElementById('sr-alerta-contenedor');
        if (!c) {
            c = document.createElement('div');
            c.id = 'sr-alerta-contenedor';
            c.setAttribute('aria-live', 'assertive');
            c.setAttribute('aria-atomic', 'false');
            document.body.appendChild(c);
        }
        return c;
    }

    function cerrar(el) {
        clearTimeout(el._srTimer);
        el.classList.remove('sr-alerta-visible');
        setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, DURACION_SALIDA);
    }

    /**
     * Muestra una alerta visual personalizada.
     * @param {string} mensaje  - Texto a mostrar
     * @param {string} [tipo]   - 'error' | 'exito' | 'advertencia'  (default: 'error')
     * @param {Function} [onCerrar] - Callback opcional al cerrar (útil para redirigir después)
     */
    window.mostrarAlertaPersonalizada = function (mensaje, tipo, onCerrar) {
        if (!TIPOS[tipo]) tipo = 'error';
        var cfg = TIPOS[tipo];
        var contenedor = obtenerContenedor();

        var el = document.createElement('div');
        el.className = 'sr-alerta sr-alerta-' + tipo;
        el.setAttribute('role', 'alert');
        el.innerHTML =
            '<span class="sr-alerta-icono"><i class="fa-solid ' + cfg.icono + '"></i></span>' +
            '<span class="sr-alerta-texto">' + mensaje + '</span>' +
            '<button class="sr-alerta-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>';

        el.querySelector('.sr-alerta-cerrar').addEventListener('click', function () {
            cerrar(el);
            if (typeof onCerrar === 'function') onCerrar();
        });

        contenedor.appendChild(el);
        void el.offsetWidth;
        el.classList.add('sr-alerta-visible');

        el._srTimer = setTimeout(function () {
            cerrar(el);
            if (typeof onCerrar === 'function') onCerrar();
        }, DURACION_AUTO);
    };
})();
