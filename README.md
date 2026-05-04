# Proyecto: Smart Reserva
**Sistema web para gestión de reservas de restaurante.**

## Descripción del Proyecto
Este proyecto simula una aplicación web para la reserva de mesas en un restaurante. Forma parte de una evidencia de aprendizaje (nivel principiante/intermedio) del SENA. Está construido utilizando tecnologías estándar de la web y no requiere instalación de programas pesados adicionales.

## Tecnologías Utilizadas
* **HTML5:** Estructura semántica de la página.
* **CSS3:** Hoja de estilos con variables, CSS Grid, Flexbox y Media Queries para garantizar el *Responsive Design* (adaptación a dispositivos móviles).
* **JavaScript Puro (Vanilla JS):** Lógica del sistema, manipulación del DOM, validación de formularios y almacenamiento local de datos.
* **LocalStorage:** Utilizado para la persistencia de datos simulando una base de datos local en el navegador. No requiere un servidor backend (Node.js/Express) para funcionar en esta etapa, facilitando el despliegue del aprendiz.
* **FontAwesome:** Repositorio de íconos web.
* **Google Fonts:** Fuentes tipográficas ("Montserrat").

## Estructura de Archivos
* `index.html`: Archivo principal (protegido por sesión). Contiene la estructura visual del asistente de reservas y la vista de la carta para el cliente.
* `login.html`: Página de inicio de sesión.
* `registro.html`: Página para registro de usuarios.
* `admin.html`: Panel de control exclusivo para el Administrador (Dashboard con KPIs y tabla general).
* `styles.css`: Reglas de diseño y presentación. Colores, márgenes, responsividad.
* `script.js`: Archivo con la lógica funcional del cliente (crear, editar, y listar reservas personales).
* `admin.js`: Archivo con la lógica funcional del administrador (búsqueda, filtros, KPIs en tiempo real).
* `auth.js`: Gestión del proceso de inicio de sesión, registro e inicialización y limpieza de la cuenta Administrador.
* `auth_guard.js` y `admin_guard.js`: Capas de seguridad estricta para bloquear el acceso a usuarios no autenticados o sin permisos adecuados, evitando el acceso a rutas protegidas.
* `README.md`: Este archivo, con la documentación del programa.

## Características de la Aplicación
1. **Sistema de Autenticación Local y Roles:** Los usuarios pueden ser "clientes" o "admin". Toda la información se persiste en el almacenamiento local.
2. **Auto-inicialización Segura (NUEVO):** El sistema crea por defecto la cuenta de administrador la primera vez que se carga. Además, posee un mecanismo de *self-healing* (auto-limpieza) que detecta y elimina cuentas falsas que intenten usurpar el correo del administrador.
3. **Guardias de Rutas (NUEVO):** 
   - `auth_guard.js`: Bloquea `index.html` para no logueados y redirige administradores a su panel.
   - `admin_guard.js`: Bloquea estrictamente `admin.html` para que solo usuarios con `rol: 'admin'` puedan visualizarlo.
4. **Dashboard Administrativo (NUEVO):** Un panel (`admin.html`) que cuenta con:
   - Tarjetas de KPIs (Indicadores) en tiempo real: Reservas totales, reservas de hoy, confirmadas, canceladas, etc.
   - Tabla general para gestionar (editar/cancelar) las reservas de **todos** los clientes.
   - Filtros avanzados por nombre, correo, fecha y estado.
5. **Asistente (Wizard) de Reservas para Clientes:** Un paso a paso interactivo donde el cliente elige el número de personas, la fecha y verifica disponibilidad de horas.
6. **Persistencia y Simulación de Correos:** Se validan los cruces de horarios para que no hayan reservas duplicadas y se simulan notificaciones por consola.

## Instrucciones de Instalación y Ejecución (Cómo correr el proyecto)

Al estar desarrollado en tecnologías puros (HTML/CSS/JS) con `localStorage`, el inicio del proyecto es inmediato.

1. Descarga o abre la carpeta con los 3 archivos principales (`index.html`, `styles.css`, `script.js`).
2. Dale **doble clic** (o click derecho -> Abrir con tu navegador) al archivo `index.html`.
3. Alternativamente, si tienes un editor como Visual Studio Code, puedes abrir la carpeta allí, instalar la extensión **"Live Server"** y darle clic a "Go Live" para ver la página en vivo en tiempo real y sin problemas de caché.
4. Interactúa con el formulario para probar el guardado, recarga la página para comprobar la persistencia y elimina tarjetas usando el botón rojo para revisar su función.

## Notas para el Tutor / Instructor (Prácticas de Código)
El código dentro de los archivos JavaScript fue redactado asumiendo un nivel "principiante-intermedio" pero incorporando muy buenas prácticas de desarrollo web moderno:
- Separación de responsabilidades: Un JS para la autenticación, uno para la vista cliente y uno para la vista admin.
- Manejo estricto de seguridad visual mediante `Guardias de Rutas`.
- Uso avanzado de arreglos (`filter`, `map`, `some`, `findIndex`) para la manipulación de datos en Memoria y LocalStorage.
- Código auto-documentado y limpio.

### 🔑 Credenciales de Prueba (Rol: Administrador)
Para probar la nueva gestión administrativa y evaluar todas las funciones del restaurante (KPIs, lista de clientes, validación estricta), ingrese con la cuenta autogenerada:

- **Usuario / Correo:** `admin@smartreserva.com`
- **Contraseña:** `Admin123*`

*(Nota: Si crea una cuenta desde la vista de registro, el sistema le asignará automáticamente el rol de "cliente").*
