document.addEventListener('DOMContentLoaded', () => {
    const nombreDisplay = document.getElementById('adminNombreDisplay');
    const kpiTotal = document.getElementById('kpiTotal');
    const kpiHoy = document.getElementById('kpiHoy');
    const kpiConfirmadas = document.getElementById('kpiConfirmadas');
    const kpiEditadas = document.getElementById('kpiEditadas');
    const kpiCanceladas = document.getElementById('kpiCanceladas');
    const tablaBody = document.getElementById('adminTablaBody');

    const buscarInput = document.getElementById('adminBuscar');
    const fechaFiltroInput = document.getElementById('adminFechaFiltro');
    const estadoFiltroSelect = document.getElementById('adminEstadoFiltro');

    const detalleModal = document.getElementById('adminDetalleModal');
    const detalleContenido = document.getElementById('adminDetalleContenido');
    const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');

    const editarModal = document.getElementById('adminEditarModal');
    const btnCerrarEditarAdmin = document.getElementById('btnCerrarEditarAdmin');
    const editarForm = document.getElementById('adminEditarForm');
    const editarId = document.getElementById('adminEditarId');
    const editarPersonas = document.getElementById('adminEditarPersonas');
    const editarFecha = document.getElementById('adminEditarFecha');
    const editarHora = document.getElementById('adminEditarHora');
    const editarOcasion = document.getElementById('adminEditarOcasion');
    const adminToast = document.getElementById('adminToast');

    const horasDisponibles = ['18:00', '19:00', '20:00', '21:00', '22:00'];
    let reservas = leerListaStorage('smart_reservas');
    const sesion = leerSesion();

    if (!sesion || sesion.rol !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    nombreDisplay.innerHTML = `<i class="fa-solid fa-user-shield"></i> ${sesion.nombre}`;
    construirOpcionesHoras();
    actualizarDashboard();

    const refrescoAutomatico = window.setInterval(() => {
        const actualizadas = leerListaStorage('smart_reservas');
        if (JSON.stringify(actualizadas) !== JSON.stringify(reservas)) {
            reservas = actualizadas;
            actualizarDashboard();
        }
    }, 3500);

    window.addEventListener('beforeunload', () => window.clearInterval(refrescoAutomatico));

    buscarInput.addEventListener('input', actualizarDashboard);
    fechaFiltroInput.addEventListener('change', actualizarDashboard);
    estadoFiltroSelect.addEventListener('change', actualizarDashboard);

    tablaBody.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-action]');
        if (!btn) {
            return;
        }

        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (!id) {
            return;
        }

        if (action === 'detalle') {
            abrirDetalle(id);
            return;
        }
        if (action === 'editar') {
            abrirEditar(id);
            return;
        }
        if (action === 'cancelar') {
            confirmarCancelacion(id);
        }
    });

    btnCerrarDetalle.addEventListener('click', () => cerrarModal(detalleModal));
    btnCerrarEditarAdmin.addEventListener('click', () => cerrarModal(editarModal));

    detalleModal.addEventListener('click', (event) => {
        if (event.target === detalleModal) {
            cerrarModal(detalleModal);
        }
    });
    editarModal.addEventListener('click', (event) => {
        if (event.target === editarModal) {
            cerrarModal(editarModal);
        }
    });

    editarForm.addEventListener('submit', (event) => {
        event.preventDefault();
        guardarEdicion();
    });

    function actualizarDashboard() {
        const todas = reservas.slice();
        const visibles = aplicarFiltros(todas);
        renderKpis(todas);
        renderTabla(visibles);
    }

    function renderKpis(lista) {
        const hoy = fechaISOActual();
        kpiTotal.textContent = String(lista.length);
        kpiHoy.textContent = String(lista.filter((r) => r.fecha === hoy).length);
        kpiConfirmadas.textContent = String(lista.filter((r) => estadoReserva(r) === 'Confirmada').length);
        kpiEditadas.textContent = String(lista.filter((r) => estadoReserva(r) === 'Editada').length);
        kpiCanceladas.textContent = String(lista.filter((r) => estadoReserva(r) === 'Cancelada').length);
    }

    function renderTabla(lista) {
        tablaBody.innerHTML = '';
        if (!lista.length) {
            tablaBody.innerHTML = '<tr><td colspan="8" class="admin-empty">No hay reservas para los filtros seleccionados.</td></tr>';
            return;
        }

        lista.forEach((reserva) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${reserva.nombre || '-'}</td>
                <td>${reserva.usuarioEmail || '-'}</td>
                <td>${reserva.personas || '-'}</td>
                <td>${formatearFecha(reserva.fecha)}</td>
                <td>${formatearHora(reserva.hora)}</td>
                <td>${formatearOcasionConEmoji(reserva.ocasion || 'Ninguna ocasión especial')}</td>
                <td><span class="badge-estado">${estadoReserva(reserva)}</span></td>
                <td class="admin-actions">
                    <button class="btn btn-secundario btn-inline" data-action="detalle" data-id="${reserva.id}">Detalle</button>
                    <button class="btn btn-primario btn-inline" data-action="editar" data-id="${reserva.id}">Editar</button>
                    <button class="btn btn-peligro btn-inline" data-action="cancelar" data-id="${reserva.id}">Cancelar</button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
    }

    function aplicarFiltros(lista) {
        const q = buscarInput.value.trim().toLowerCase();
        const fecha = fechaFiltroInput.value;
        const estado = estadoFiltroSelect.value;

        return lista.filter((r) => {
            const estadoActual = estadoReserva(r);
            const nombre = (r.nombre || '').toLowerCase();
            const correo = (r.usuarioEmail || '').toLowerCase();
            const coincideBusqueda = !q || nombre.includes(q) || correo.includes(q);
            const coincideFecha = !fecha || r.fecha === fecha;
            const coincideEstado = !estado || estadoActual === estado;
            return coincideBusqueda && coincideFecha && coincideEstado;
        });
    }

    function abrirDetalle(id) {
        const reserva = reservas.find((r) => r.id === id);
        if (!reserva) {
            return;
        }
        detalleContenido.innerHTML = `
            <p><strong>Cliente:</strong> ${reserva.nombre || '-'}</p>
            <p><strong>Correo:</strong> ${reserva.usuarioEmail || '-'}</p>
            <p><strong>Personas:</strong> ${reserva.personas || '-'}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(reserva.fecha)}</p>
            <p><strong>Hora:</strong> ${formatearHora(reserva.hora)}</p>
            <p><strong>Ocasión:</strong> ${formatearOcasionConEmoji(reserva.ocasion || 'Ninguna ocasión especial')}</p>
            <p><strong>Estado:</strong> ${estadoReserva(reserva)}</p>
        `;
        abrirModal(detalleModal);
    }

    function abrirEditar(id) {
        const reserva = reservas.find((r) => r.id === id);
        if (!reserva) {
            return;
        }
        editarId.value = reserva.id;
        editarPersonas.value = Number(reserva.personas) || 1;
        editarFecha.value = reserva.fecha || '';
        editarHora.value = reserva.hora || horasDisponibles[0];
        editarOcasion.value = reserva.ocasion || 'Ninguna ocasión especial';
        abrirModal(editarModal);
    }

    function guardarEdicion() {
        const id = editarId.value;
        const personas = Number(editarPersonas.value);
        const fecha = editarFecha.value;
        const hora = editarHora.value;
        const ocasion = editarOcasion.value;

        if (!id || Number.isNaN(personas) || personas < 1 || !fecha || !hora || !ocasion) {
            mostrarToast('Valida los datos antes de guardar.');
            return;
        }
        if (!horaDisponible(fecha, hora, id)) {
            mostrarToast('La hora seleccionada ya está ocupada.');
            return;
        }

        reservas = reservas.map((r) => {
            if (r.id !== id) return r;
            return {
                ...r,
                personas: String(personas),
                fecha,
                hora,
                ocasion,
                estado: 'Editada'
            };
        });

        guardarReservas();
        cerrarModal(editarModal);
        actualizarDashboard();
        mostrarToast('Reserva actualizada.');
    }

    function confirmarCancelacion(id) {
        confirmarAccionAdmin(
            'Cancelar reserva',
            'Esta acción cambiará el estado de la reserva a cancelada. ¿Deseas continuar?',
            'Mantener reserva',
            'Sí, cancelar'
        ).then((confirmar) => {
            if (!confirmar) return;

            reservas = reservas.map((r) => {
                if (r.id !== id) return r;
                return { ...r, estado: 'Cancelada' };
            });
            guardarReservas();
            actualizarDashboard();
            mostrarToast('Reserva cancelada.');
        });
    }

    function guardarReservas() {
        localStorage.setItem('smart_reservas', JSON.stringify(reservas));
    }

    function abrirModal(modal) {
        modal.classList.remove('oculto');
        modal.setAttribute('aria-hidden', 'false');
    }

    function cerrarModal(modal) {
        modal.classList.add('oculto');
        modal.setAttribute('aria-hidden', 'true');
    }

    function mostrarToast(mensaje) {
        adminToast.textContent = mensaje;
        adminToast.classList.remove('oculto');
        adminToast.classList.add('toast-visible');
        setTimeout(() => {
            adminToast.classList.remove('toast-visible');
            adminToast.classList.add('oculto');
        }, 2600);
    }

    function construirOpcionesHoras() {
        editarHora.innerHTML = '';
        horasDisponibles.forEach((hora) => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = formatearHora(hora);
            editarHora.appendChild(option);
        });
    }

    function horaDisponible(fecha, hora, idExcluir) {
        return !reservas.some((r) =>
            r.id !== idExcluir &&
            estadoReserva(r) !== 'Cancelada' &&
            r.fecha === fecha &&
            r.hora === hora
        );
    }

    function estadoReserva(reserva) {
        if (!reserva.estado) return 'Confirmada';
        return reserva.estado;
    }

    function fechaISOActual() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatearFecha(fechaISO) {
        if (!fechaISO || !fechaISO.includes('-')) return fechaISO || '-';
        const [yyyy, mm, dd] = fechaISO.split('-');
        return `${dd}/${mm}/${yyyy}`;
    }

    function formatearHora(hora24) {
        if (!hora24 || !hora24.includes(':')) return hora24 || '-';
        const [h, m] = hora24.split(':');
        const n = Number(h);
        const periodo = n >= 12 ? 'pm' : 'am';
        const h12 = ((n + 11) % 12) + 1;
        return `${h12}:${m} ${periodo}`;
    }

    function formatearOcasionConEmoji(ocasion) {
        const mapa = {
            'Cumpleaños': '🎂 Cumpleaños',
            'Aniversario': '💍 Aniversario',
            'Cena de negocios': '💼 Cena de negocios',
            'Cena romántica': '❤️ Cena romántica',
            'Celebración': '🎉 Celebración',
            'Otra ocasión': '✨ Otra ocasión',
            'Ninguna ocasión especial': '🙂 Ninguna ocasión especial'
        };
        return mapa[ocasion] || ocasion;
    }

    function confirmarAccionAdmin(titulo, mensaje, textoCancelar, textoConfirmar) {
        return new Promise((resolve) => {
            const modalExistente = document.getElementById('adminActionModal');
            if (modalExistente) {
                modalExistente.remove();
            }

            const overlay = document.createElement('div');
            overlay.id = 'adminActionModal';
            overlay.className = 'modal-overlay cancel-modal-overlay';
            overlay.innerHTML = `
                <div class="modal-panel cancel-modal-panel" role="dialog" aria-modal="true">
                    <h3 class="cancel-modal-title">
                        <i class="fa-solid fa-triangle-exclamation"></i> ${titulo}
                    </h3>
                    <p class="cancel-modal-texto">${mensaje}</p>
                    <div class="cancel-modal-acciones">
                        <button type="button" class="btn btn-secundario" id="adminActionCancel">${textoCancelar}</button>
                        <button type="button" class="btn btn-peligro" id="adminActionConfirm">${textoConfirmar}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const btnCancelar = document.getElementById('adminActionCancel');
            const btnConfirmar = document.getElementById('adminActionConfirm');

            const cerrarModal = (resultado) => {
                overlay.classList.add('cancel-modal-cerrando');
                window.setTimeout(() => {
                    overlay.remove();
                    resolve(resultado);
                }, 180);
            };

            btnCancelar.addEventListener('click', () => cerrarModal(false));
            btnConfirmar.addEventListener('click', () => cerrarModal(true));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    cerrarModal(false);
                }
            });

            const onEsc = (event) => {
                if (event.key === 'Escape') {
                    cerrarModal(false);
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);

            btnCancelar.focus();
        });
    }
});

function leerSesion() {
    try {
        return JSON.parse(localStorage.getItem('smart_sesion'));
    } catch (error) {
        return null;
    }
}

function leerListaStorage(clave) {
    try {
        const valor = JSON.parse(localStorage.getItem(clave));
        return Array.isArray(valor) ? valor : [];
    } catch (error) {
        localStorage.removeItem(clave);
        return [];
    }
}
