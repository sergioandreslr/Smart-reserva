document.addEventListener('DOMContentLoaded', () => {
    const displayNombre = document.getElementById('nombreUsuarioDisplay');
    const contenedorReservas = document.getElementById('contenedorReservas');
    const decisionScreen = document.getElementById('decisionScreen');
    const menuScreen = document.getElementById('menuScreen');
    const reservaScreen = document.getElementById('reservaScreen');

    const btnGoMenu = document.getElementById('btnGoMenu');
    const btnGoReserva = document.getElementById('btnGoReserva');
    const btnMenuBack = document.getElementById('btnMenuBack');
    const btnMenuToReserva = document.getElementById('btnMenuToReserva');
    const btnReservaBackToDecision = document.getElementById('btnReservaBackToDecision');

    const menuGrid = document.getElementById('menuGrid');
    const wizardForm = document.getElementById('wizardReserva');
    const personasOpciones = document.getElementById('personasOpciones');
    const personasCustomContainer = document.getElementById('personasCustomContainer');
    const personasCustomInput = document.getElementById('personasCustomInput');
    const fechaReserva = document.getElementById('fechaReserva');
    const horasOpciones = document.getElementById('horasOpciones');
    const ocasionEspecial = document.getElementById('ocasionEspecial');
    const btnWizardPrev = document.getElementById('btnWizardPrev');
    const btnWizardNext = document.getElementById('btnWizardNext');
    const toastMensaje = document.getElementById('toastMensaje');
    const editarReservaModal = document.getElementById('editarReservaModal');
    const btnCerrarModalEditar = document.getElementById('btnCerrarModalEditar');
    const formEditarReserva = document.getElementById('formEditarReserva');
    const editarReservaId = document.getElementById('editarReservaId');
    const editarPersonas = document.getElementById('editarPersonas');
    const editarFecha = document.getElementById('editarFecha');
    const editarHora = document.getElementById('editarHora');
    const editarOcasion = document.getElementById('editarOcasion');

    if (!contenedorReservas || !decisionScreen || !menuScreen || !reservaScreen || !wizardForm) {
        return;
    }

    let sesionInfo = null;
    try {
        sesionInfo = JSON.parse(localStorage.getItem('smart_sesion'));
    } catch (error) {
        localStorage.removeItem('smart_sesion');
        window.location.href = 'login.html';
        return;
    }

    if (!sesionInfo || !sesionInfo.email) {
        localStorage.removeItem('smart_sesion');
        window.location.href = 'login.html';
        return;
    }

    if (displayNombre) {
        displayNombre.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${sesionInfo.nombre}`;
    }

    if (sesionInfo.rol === 'admin') {
        const btnAdmin = document.getElementById('btnPanelAdmin');
        if (btnAdmin) btnAdmin.classList.remove('oculto');
    }

    const platos = [
        {
            nombre: 'Lomo en Salsa de Vino',
            precio: '$38.000',
            descripcion: 'Lomo de res con reducción de vino tinto y puré rústico.',
            imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=280&q=80'
        },
        {
            nombre: 'Salmón al Limón',
            precio: '$42.000',
            descripcion: 'Salmón a la plancha con vegetales salteados y salsa cítrica.',
            imagen: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&h=280&q=80'
        },
        {
            nombre: 'Risotto de Champiñones',
            precio: '$34.000',
            descripcion: 'Arroz cremoso con champiñones frescos y queso parmesano.',
            imagen: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=400&h=280&q=80'
        },
        {
            nombre: 'Pasta Carbonara',
            precio: '$30.000',
            descripcion: 'Pasta artesanal con tocineta, huevo y toque de pimienta negra.',
            imagen: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&h=280&q=80'
        },
        {
            nombre: 'Ensalada Gourmet',
            precio: '$24.000',
            descripcion: 'Mix de hojas verdes, frutos secos, queso y vinagreta de la casa.',
            imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&h=280&q=80'
        },
        {
            nombre: 'Postre de la Casa',
            precio: '$16.000',
            descripcion: 'Selección de postre artesanal preparada diariamente.',
            imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&h=280&q=80'
        }
    ];

    const horasDisponibles = ['18:00', '19:00', '20:00', '21:00', '22:00'];
    let reservas = leerListaStorage('smart_reservas');
    const estadosReserva = {
        CONFIRMADA: 'Confirmada',
        EDITADA: 'Editada',
        CANCELADA: 'Cancelada'
    };

    const wizardState = {
        step: 1,
        personas: '',
        personasCustom: '',
        fecha: '',
        hora: '',
        ocasion: ''
    };

    inicializarUI();
    renderizarMenu();
    renderizarHoras();
    renderizarHorasEditar();
    renderizarReservas();

    btnGoMenu.addEventListener('click', () => mostrarPantalla('menu'));
    btnGoReserva.addEventListener('click', () => mostrarPantalla('reserva'));
    btnMenuBack.addEventListener('click', () => mostrarPantalla('decision'));
    btnMenuToReserva.addEventListener('click', () => mostrarPantalla('reserva'));
    btnReservaBackToDecision.addEventListener('click', () => mostrarPantalla('decision'));

    btnGoMenu.addEventListener('keydown', activarConEnterEspacio);
    btnGoReserva.addEventListener('keydown', activarConEnterEspacio);

    personasOpciones.addEventListener('click', (event) => {
        const boton = event.target.closest('[data-personas]');
        if (!boton) {
            return;
        }
        wizardState.personas = boton.dataset.personas;
        if (wizardState.personas === '5+') {
            personasCustomContainer.classList.remove('oculto');
            personasCustomInput.focus();
        } else {
            wizardState.personasCustom = '';
            personasCustomInput.value = '';
            personasCustomContainer.classList.add('oculto');
        }
        actualizarSeleccion(personasOpciones, '[data-personas]', wizardState.personas);
    });

    personasCustomInput.addEventListener('input', () => {
        wizardState.personasCustom = personasCustomInput.value.trim();
    });

    horasOpciones.addEventListener('click', (event) => {
        const boton = event.target.closest('[data-hora]');
        if (!boton) {
            return;
        }
        wizardState.hora = boton.dataset.hora;
        actualizarSeleccion(horasOpciones, '[data-hora]', wizardState.hora);
    });

    fechaReserva.addEventListener('change', () => {
        wizardState.fecha = fechaReserva.value;
        wizardState.hora = '';
        actualizarSeleccion(horasOpciones, '[data-hora]', '');
        renderizarHoras();
    });

    ocasionEspecial.addEventListener('change', () => {
        wizardState.ocasion = ocasionEspecial.value;
    });

    btnWizardPrev.addEventListener('click', () => {
        if (wizardState.step > 1) {
            wizardState.step -= 1;
            renderizarPaso();
        }
    });

    btnWizardNext.addEventListener('click', () => {
        if (!validarPasoActual()) {
            return;
        }

        if (wizardState.step < 3) {
            wizardState.step += 1;
            renderizarPaso();
            return;
        }

        crearReserva();
    });

    contenedorReservas.addEventListener('click', (event) => {
        const botonEditar = event.target.closest('[data-accion="editar"]');
        const botonCancelar = event.target.closest('[data-accion="eliminar"]');
        const botonEliminarAdmin = event.target.closest('[data-accion="eliminar-admin"]');

        if (botonEditar) {
            abrirModalEditar(botonEditar.dataset.id);
            return;
        }

        if (botonCancelar) {
            const idACancelar = botonCancelar.dataset.id;
            if (!idACancelar) return;
            confirmarCancelacionReserva().then((confirmar) => {
                if (!confirmar) return;
                reservas = reservas.map((reserva) => {
                    if (reserva.id !== idACancelar) return reserva;
                    return { ...reserva, estado: estadosReserva.CANCELADA };
                });
                guardarReservas();
                renderizarReservas();
                mostrarToast('Reserva cancelada.');
            });
            return;
        }

        if (botonEliminarAdmin) {
            eliminarReserva(botonEliminarAdmin.dataset.id);
        }
    });

    btnCerrarModalEditar.addEventListener('click', cerrarModalEditar);
    editarReservaModal.addEventListener('click', (event) => {
        if (event.target === editarReservaModal) {
            cerrarModalEditar();
        }
    });

    formEditarReserva.addEventListener('submit', (event) => {
        event.preventDefault();
        guardarEdicionReserva();
    });

    function inicializarUI() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        fechaReserva.min = `${yyyy}-${mm}-${dd}`;
        mostrarPantalla('decision');
        renderizarPaso();
    }

    function mostrarPantalla(nombrePantalla) {
        decisionScreen.classList.add('oculto');
        menuScreen.classList.add('oculto');
        reservaScreen.classList.add('oculto');

        if (nombrePantalla === 'menu') {
            menuScreen.classList.remove('oculto');
            return;
        }

        if (nombrePantalla === 'reserva') {
            reservaScreen.classList.remove('oculto');
            return;
        }

        decisionScreen.classList.remove('oculto');
    }

    function renderizarMenu() {
        menuGrid.innerHTML = '';
        platos.forEach((plato) => {
            const card = document.createElement('article');
            card.className = 'menu-card';
            card.innerHTML = `
                <img
                    class="menu-card-img"
                    src="${plato.imagen}"
                    alt="${plato.nombre}"
                    loading="lazy"
                >
                <div class="menu-card-body">
                    <h3>${plato.nombre}</h3>
                    <p>${plato.descripcion}</p>
                    <span class="menu-card-precio">${plato.precio}</span>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    function renderizarHoras() {
        horasOpciones.innerHTML = '';
        horasDisponibles.forEach((hora) => {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'selector-btn';
            boton.dataset.hora = hora;
            boton.textContent = formatearHora(hora);
            if (wizardState.fecha && !horaDisponible(wizardState.fecha, hora)) {
                boton.disabled = true;
                boton.classList.add('selector-btn-inactivo');
            }
            horasOpciones.appendChild(boton);
        });
    }

    function renderizarHorasEditar() {
        editarHora.innerHTML = '';
        horasDisponibles.forEach((hora) => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = formatearHora(hora);
            editarHora.appendChild(option);
        });
    }

    function renderizarPaso() {
        wizardForm.querySelectorAll('[data-step]').forEach((bloque) => {
            const pasoBloque = Number(bloque.dataset.step);
            bloque.classList.toggle('oculto', pasoBloque !== wizardState.step);
        });

        document.querySelectorAll('[data-step-chip]').forEach((chip) => {
            const pasoChip = Number(chip.dataset.stepChip);
            chip.classList.toggle('activo', pasoChip === wizardState.step);
        });

        btnWizardPrev.disabled = wizardState.step === 1;
        btnWizardNext.innerHTML = wizardState.step === 3
            ? '<i class="fa-solid fa-check"></i> Confirmar Reserva'
            : 'Siguiente';
    }

    function validarPasoActual() {
        if (wizardState.step === 1 && !wizardState.personas) {
            mostrarAlertaPersonalizada('Por favor selecciona el número de personas.');
            return false;
        }

        if (wizardState.step === 1 && wizardState.personas === '5+') {
            const numeroCustom = Number(wizardState.personasCustom);
            if (!wizardState.personasCustom || Number.isNaN(numeroCustom) || numeroCustom <= 5) {
                mostrarAlertaPersonalizada('Si seleccionas 5+, ingresa un número válido mayor a 5.');
                return false;
            }
        }

        if (wizardState.step === 2) {
            wizardState.fecha = fechaReserva.value;
            if (!wizardState.fecha) {
                mostrarAlertaPersonalizada('Debes elegir una fecha.');
                return false;
            }
        }

        if (wizardState.step === 3 && !wizardState.hora) {
            mostrarAlertaPersonalizada('Selecciona una hora disponible.');
            return false;
        }

        if (wizardState.step === 3 && !wizardState.ocasion) {
            mostrarAlertaPersonalizada('Indica la ocasión de tu reserva.');
            return false;
        }

        return true;
    }

    function crearReserva() {
        const personasNumero = wizardState.personas === '5+' ? Number(wizardState.personasCustom) : Number(wizardState.personas);
        if (Number.isNaN(personasNumero) || personasNumero < 1) {
            mostrarAlertaPersonalizada('El número de personas debe ser mínimo 1.');
            return;
        }

        const fechaHoraReserva = new Date(`${wizardState.fecha}T${wizardState.hora}`);
        if (fechaHoraReserva < new Date()) {
            mostrarAlertaPersonalizada('No puedes realizar una reserva en una fecha u hora que ya pasó.', 'advertencia');
            return;
        }

        if (!horaDisponible(wizardState.fecha, wizardState.hora)) {
            mostrarAlertaPersonalizada('La hora seleccionada no está disponible para esa fecha.', 'advertencia');
            return;
        }

        const nuevaReserva = {
            id: Date.now().toString(),
            usuarioEmail: sesionInfo.email,
            nombre: sesionInfo.nombre,
            personas: String(personasNumero),
            fecha: wizardState.fecha,
            hora: wizardState.hora,
            ocasion: wizardState.ocasion,
            estado: estadosReserva.CONFIRMADA
        };

        reservas.push(nuevaReserva);
        guardarReservas();
        simularEnvioCorreo(nuevaReserva, 'confirmacion');
        renderizarReservas();
        reiniciarWizard();
        mostrarPantalla('decision');
        mostrarToast('Reserva confirmada, revisa tu correo.');
    }

    function reiniciarWizard() {
        wizardState.step = 1;
        wizardState.personas = '';
        wizardState.personasCustom = '';
        wizardState.fecha = '';
        wizardState.hora = '';
        wizardState.ocasion = '';
        fechaReserva.value = '';
        personasCustomInput.value = '';
        personasCustomContainer.classList.add('oculto');
        ocasionEspecial.value = '';
        actualizarSeleccion(personasOpciones, '[data-personas]', '');
        actualizarSeleccion(horasOpciones, '[data-hora]', '');
        renderizarPaso();
    }

    function renderizarReservas() {
        contenedorReservas.innerHTML = '';
        const esAdmin = sesionInfo.rol === 'admin';

        const reservasVisibles = reservas.filter((reserva) =>
            esAdmin
                ? reserva.estado !== estadosReserva.CANCELADA
                : reserva.usuarioEmail === sesionInfo.email && reserva.estado !== estadosReserva.CANCELADA
        );

        if (reservasVisibles.length === 0) {
            contenedorReservas.innerHTML = `
                <div class="mensaje-vacio">
                    <i class="fa-regular fa-folder-open fa-2x" style="margin-bottom:10px;"></i>
                    <p>${esAdmin ? 'No hay reservas activas en el sistema.' : 'No tienes reservas registradas en este momento.'}</p>
                </div>
            `;
            return;
        }

        reservasVisibles.forEach((reserva) => {
            const [ano, mes, dia] = reserva.fecha.split('-');
            const fechaFormateada = `${dia}/${mes}/${ano}`;

            const filaCliente = esAdmin
                ? `<p class="reserva-cliente-admin"><i class="fa-solid fa-envelope"></i> ${reserva.usuarioEmail}</p>`
                : '';

            const btnEliminarAdmin = esAdmin
                ? `<button class="btn btn-eliminar-admin btn-inline" data-accion="eliminar-admin" data-id="${reserva.id}">
                       <i class="fa-solid fa-trash-can"></i> Eliminar
                   </button>`
                : '';

            const tarjeta = document.createElement('article');
            tarjeta.className = 'reserva-card';
            tarjeta.innerHTML = `
                <div class="reserva-info">
                    <h3><i class="fa-solid fa-user"></i> ${reserva.nombre}</h3>
                    ${filaCliente}
                    <p><i class="fa-solid fa-users"></i> ${reserva.personas} persona(s)</p>
                    <p><i class="fa-regular fa-calendar"></i> ${fechaFormateada}</p>
                    <p><i class="fa-regular fa-clock"></i> ${formatearHora(reserva.hora)}</p>
                    <p><i class="fa-solid fa-star"></i> ${formatearOcasionConEmoji(reserva.ocasion || 'Ninguna ocasión especial')}</p>
                    <p><span class="badge-estado">${reserva.estado || estadosReserva.CONFIRMADA}</span></p>
                </div>
                <div class="reserva-acciones">
                    <button class="btn btn-secundario btn-inline" data-accion="editar" data-id="${reserva.id}">
                        <i class="fa-solid fa-pen"></i> Editar reserva
                    </button>
                    <button class="btn btn-peligro btn-inline" data-accion="eliminar" data-id="${reserva.id}">
                        <i class="fa-solid fa-ban"></i> Cancelar
                    </button>
                    ${btnEliminarAdmin}
                </div>
            `;
            contenedorReservas.appendChild(tarjeta);
        });
    }

    function abrirModalEditar(idReserva) {
        const reserva = reservas.find((item) => item.id === idReserva);
        if (!reserva || reserva.estado === estadosReserva.CANCELADA) {
            return;
        }

        editarReservaId.value = reserva.id;
        editarPersonas.value = Number(reserva.personas) || 1;
        editarFecha.value = reserva.fecha;
        editarHora.value = reserva.hora;
        editarOcasion.value = reserva.ocasion || 'Ninguna ocasión especial';

        actualizarHorasEditarDisponibles(reserva.id, reserva.fecha);
        editarReservaModal.classList.remove('oculto');
        editarReservaModal.setAttribute('aria-hidden', 'false');
    }

    function cerrarModalEditar() {
        editarReservaModal.classList.add('oculto');
        editarReservaModal.setAttribute('aria-hidden', 'true');
        formEditarReserva.reset();
    }

    function guardarEdicionReserva() {
        const id = editarReservaId.value;
        const personas = Number(editarPersonas.value);
        const hora = editarHora.value;
        const ocasion = editarOcasion.value;
        const fecha = editarFecha.value;

        if (!id || !fecha || !hora || !ocasion) {
            mostrarAlertaPersonalizada('Completa todos los datos para editar la reserva.');
            return;
        }

        if (Number.isNaN(personas) || personas < 1) {
            mostrarAlertaPersonalizada('El número de personas debe ser mínimo 1.');
            return;
        }

        if (!horaDisponible(fecha, hora, id)) {
            mostrarAlertaPersonalizada('La hora seleccionada no está disponible para esa fecha.', 'advertencia');
            return;
        }

        reservas = reservas.map((reserva) => {
            if (reserva.id !== id) {
                return reserva;
            }
            return {
                ...reserva,
                personas: String(personas),
                hora,
                ocasion,
                estado: estadosReserva.EDITADA
            };
        });

        const reservaActualizada = reservas.find((reserva) => reserva.id === id);
        guardarReservas();
        simularEnvioCorreo(reservaActualizada, 'edicion');
        renderizarReservas();
        cerrarModalEditar();
        mostrarToast('Reserva editada y correo de actualización enviado.');
    }

    function guardarReservas() {
        localStorage.setItem('smart_reservas', JSON.stringify(reservas));
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

    function actualizarSeleccion(contenedor, selector, valorSeleccionado) {
        contenedor.querySelectorAll(selector).forEach((item) => {
            const valor = item.dataset.personas || item.dataset.hora;
            item.classList.toggle('activo', valor === valorSeleccionado);
        });
    }

    function horaDisponible(fecha, hora, idExcluir = '') {
        return !reservas.some((reserva) =>
            reserva.estado !== estadosReserva.CANCELADA &&
            reserva.fecha === fecha &&
            reserva.hora === hora &&
            reserva.id !== idExcluir
        );
    }

    function actualizarHorasEditarDisponibles(idExcluir, fecha) {
        Array.from(editarHora.options).forEach((option) => {
            const libre = horaDisponible(fecha, option.value, idExcluir);
            option.disabled = !libre;
        });
    }

    function simularEnvioCorreo(reserva, tipo) {
        if (!reserva) {
            return;
        }

        const asunto = tipo === 'edicion' ? 'Actualizacion de reserva' : 'Confirmacion de reserva';
        const plantilla = `
Asunto: ${asunto}
Para: ${sesionInfo.email}

Hola ${reserva.nombre},

Tu reserva ha sido ${tipo === 'edicion' ? 'actualizada' : 'confirmada'}.

- Cliente: ${reserva.nombre}
- Numero de personas: ${reserva.personas}
- Fecha: ${reserva.fecha}
- Hora: ${formatearHora(reserva.hora)}
- Ocasion especial: ${formatearOcasionConEmoji(reserva.ocasion || 'Ninguna ocasion especial')}
- Estado: ${reserva.estado || estadosReserva.CONFIRMADA}

Gracias por elegir Smart Reserva.
        `.trim();

        const historialCorreos = leerListaStorage('smart_correos');
        historialCorreos.push({
            id: Date.now().toString(),
            fechaEnvio: new Date().toISOString(),
            para: sesionInfo.email,
            asunto,
            cuerpo: plantilla
        });
        localStorage.setItem('smart_correos', JSON.stringify(historialCorreos));
        console.log('[Correo simulado enviado]\n', plantilla);
    }

    function mostrarToast(mensaje) {
        if (!toastMensaje) {
            mostrarAlertaPersonalizada(mensaje, 'exito');
            return;
        }
        toastMensaje.textContent = mensaje;
        toastMensaje.classList.remove('oculto');
        toastMensaje.classList.add('toast-visible');
        window.setTimeout(() => {
            toastMensaje.classList.remove('toast-visible');
            toastMensaje.classList.add('oculto');
        }, 3200);
    }

    function eliminarReserva(id) {
        if (!id) return;
        confirmarEliminacionReserva().then((confirmar) => {
            if (!confirmar) return;
            reservas = reservas.filter((reserva) => reserva.id !== id);
            guardarReservas();
            renderizarReservas();
            mostrarToast('Reserva eliminada del sistema.');
        });
    }

    function confirmarEliminacionReserva() {
        return new Promise((resolve) => {
            const modalExistente = document.getElementById('eliminarReservaModal');
            if (modalExistente) modalExistente.remove();

            const overlay = document.createElement('div');
            overlay.id = 'eliminarReservaModal';
            overlay.className = 'modal-overlay cancel-modal-overlay';
            overlay.innerHTML = `
                <div class="modal-panel cancel-modal-panel" role="dialog" aria-modal="true" aria-labelledby="eliminarModalTitle">
                    <h3 id="eliminarModalTitle" class="cancel-modal-title eliminar-modal-title">
                        <i class="fa-solid fa-circle-exclamation"></i> Eliminar reserva
                    </h3>
                    <p class="cancel-modal-texto">Esta acción es <strong>permanente</strong> y no se puede deshacer. ¿Confirmas que deseas eliminar esta reserva del sistema?</p>
                    <div class="cancel-modal-acciones">
                        <button type="button" class="btn btn-secundario" id="btnMantenerElim">Mantener reserva</button>
                        <button type="button" class="btn btn-eliminar-confirm" id="btnConfirmarElim">Sí, eliminar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.classList.add('cancel-modal-visible');

            const btnMantener = document.getElementById('btnMantenerElim');
            const btnConfirmar = document.getElementById('btnConfirmarElim');

            const cerrarModal = (resultado) => {
                overlay.classList.add('cancel-modal-cerrando');
                window.setTimeout(() => {
                    overlay.remove();
                    resolve(resultado);
                }, 180);
            };

            btnMantener.addEventListener('click', () => cerrarModal(false));
            btnConfirmar.addEventListener('click', () => cerrarModal(true));
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) cerrarModal(false);
            });

            const onEsc = (event) => {
                if (event.key === 'Escape') {
                    cerrarModal(false);
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
            btnMantener.focus();
        });
    }

    function confirmarCancelacionReserva() {
        return new Promise((resolve) => {
            const modalExistente = document.getElementById('cancelReservaModal');
            if (modalExistente) {
                modalExistente.remove();
            }

            const overlay = document.createElement('div');
            overlay.id = 'cancelReservaModal';
            overlay.className = 'modal-overlay cancel-modal-overlay';
            overlay.innerHTML = `
                <div class="modal-panel cancel-modal-panel" role="dialog" aria-modal="true" aria-labelledby="cancelModalTitle">
                    <h3 id="cancelModalTitle" class="cancel-modal-title">
                        <i class="fa-solid fa-triangle-exclamation"></i> Cancelar reserva
                    </h3>
                    <p class="cancel-modal-texto">Esta acción cambiará el estado de la reserva a cancelada. ¿Deseas continuar?</p>
                    <div class="cancel-modal-acciones">
                        <button type="button" class="btn btn-secundario" id="btnMantenerReserva">Mantener reserva</button>
                        <button type="button" class="btn btn-peligro" id="btnConfirmarCancelacion">Sí, cancelar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const btnMantener = document.getElementById('btnMantenerReserva');
            const btnConfirmar = document.getElementById('btnConfirmarCancelacion');

            const cerrarModal = (resultado) => {
                overlay.classList.add('cancel-modal-cerrando');
                window.setTimeout(() => {
                    overlay.remove();
                    resolve(resultado);
                }, 180);
            };

            btnMantener.addEventListener('click', () => cerrarModal(false));
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

            btnMantener.focus();
        });
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

    // CORRECCIÓN: se agrega validación defensiva para evitar crash si hora llega undefined o malformada.
    // La versión original no tenía esta comprobación, lo que podía causar un error en .split(':')
    // si el valor era null, undefined o una cadena sin ':'.
    function formatearHora(hora24) {
        if (!hora24 || !hora24.includes(':')) return hora24 || '-';
        const [horaTexto, minutos] = hora24.split(':');
        const horaNumero = Number(horaTexto);
        const periodo = horaNumero >= 12 ? 'pm' : 'am';
        const hora12 = ((horaNumero + 11) % 12) + 1;
        return `${hora12}:${minutos} ${periodo}`;
    }

    function activarConEnterEspacio(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
        }
    }
});
