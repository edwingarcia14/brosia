import { initCustomCalendar, resetCalendarState } from './calendar.js';

const PHONE_NUMBER = '573117364163'; // Número predeterminado para recepción por WhatsApp
const WEB3FORMS_KEY = '1aad7b84-81df-4e0f-8548-199c662c8773'; // Tu clave de Web3Forms

/* INICIALIZADOR PRINCIPAL DEL MÓDULO DE RESERVAS */
export function initBookingForm() {
    initPeopleCounter();
    initTimeCounter();
    initCustomCalendar();
    initWhatsAppSync();
    initFormSubmit();
}

/* HELPER PARA CONSTRUIR MENSAJE Y ENLACE ESTRUCTURADO DE WHATSAPP */
function getWhatsAppUrl() {
    const name = document.getElementById('name')?.value.trim() || 'No especificado';
    const email = document.getElementById('email')?.value.trim() || 'No especificado';
    const dateInput = document.getElementById('dateInput') || document.getElementById('date');
    const date = dateInput?.value.trim() || 'Por definir';
    const time = document.getElementById('time')?.value || 'Por definir';
    const people = document.getElementById('people')?.value || '2';

    // Construimos las líneas individualmente para evitar fallos de codificación de salto de línea
    const lines = [
        "Hola, quiero solicitar una reserva en Brosia con los siguientes datos:",
        "",
        `*Nombre:* ${name}`,
        `*Correo:* ${email}`,
        `*Fecha:* ${date}`,
        `*Hora:* ${time}`,
        `*Personas:* ${people}`
    ];

    // Unimos con %0A que es el estándar universal de salto de línea en URLs
    const encodedMessage = lines.map(line => encodeURIComponent(line)).join('%0A');

    return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
}

/* HELPER PARA REINICIAR COMPLETAMENTE EL FORMULARIO, ERRORES Y EL CALENDARIO */
function resetBookingForm(bookingForm) {
    if (!bookingForm) return;

    // 1. Reset nativo de valores de inputs (texto, selectores)
    bookingForm.reset();

    // 2. Limpieza de mensajes y clases de error visuales
    const errorElements = bookingForm.querySelectorAll('.error-message');
    errorElements.forEach((el) => (el.textContent = ''));

    const invalidInputs = bookingForm.querySelectorAll('.input-invalid');
    invalidInputs.forEach((input) => input.classList.remove('input-invalid'));

    // 3. Reinicio del estado interno del calendario a la fecha actual
    resetCalendarState();
}

/* CONTROL DEL SELECTOR INCREMENTAL DE PERSONAS (+ / -) */
function initPeopleCounter() {
    const btnDecrement = document.getElementById('btnDecrement');
    const btnIncrement = document.getElementById('btnIncrement');
    const inputPeople = document.getElementById('people');

    if (!btnDecrement || !btnIncrement || !inputPeople) return;

    btnDecrement.addEventListener('click', () => {
        let val = parseInt(inputPeople.value, 10) || 1;
        const min = parseInt(inputPeople.min, 10) || 1;
        if (val > min) {
            inputPeople.value = val - 1;
            inputPeople.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    btnIncrement.addEventListener('click', () => {
        let val = parseInt(inputPeople.value, 10) || 1;
        const max = parseInt(inputPeople.max, 10) || 20;
        if (val < max) {
            inputPeople.value = val + 1;
            inputPeople.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

/* CONTROL DEL SELECTOR INCREMENTAL DE HORA (+ / -) EN FORMATO 12 HORAS */
function initTimeCounter() {
    const btnDec = document.getElementById('btnTimeDec');
    const btnInc = document.getElementById('btnTimeInc');
    const inputTime = document.getElementById('time');

    if (!btnDec || !btnInc || !inputTime) return;

    const MIN_MINUTES = 12 * 60; // 12:00 p. m.
    const MAX_MINUTES = 22 * 60; // 10:00 p. m.
    const STEP = 30;             // Saltos de 30 minutos

    const timeToMinutes = (timeStr) => {
        const isPM = timeStr.includes('p. m.');
        const cleanStr = timeStr.replace(/(a\. m\.|p\. m\.)/g, '').trim();
        let [h, m] = cleanStr.split(':').map(Number);
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        return h * 60 + m;
    };

    const minutesTo12HourStr = (totalMinutes) => {
        let h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const period = h >= 12 ? 'p. m.' : 'a. m.';
        h = h % 12 || 12;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    };

    btnDec.addEventListener('click', () => {
        let current = timeToMinutes(inputTime.value);
        if (current - STEP >= MIN_MINUTES) {
            inputTime.value = minutesTo12HourStr(current - STEP);
            inputTime.dispatchEvent(new Event('change', { bubbles: true }));
            inputTime.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    btnInc.addEventListener('click', () => {
        let current = timeToMinutes(inputTime.value);
        if (current + STEP <= MAX_MINUTES) {
            inputTime.value = minutesTo12HourStr(current + STEP);
            inputTime.dispatchEvent(new Event('change', { bubbles: true }));
            inputTime.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

/* SINCRONIZACIÓN Y VALIDACIÓN DEL BOTÓN DE ATENCIÓN POR WHATSAPP (SECCIÓN CONTACTO) */
function initWhatsAppSync() {
    const whatsappBtn = document.querySelector('.contact-alternative .btn-whatsapp');
    const bookingForm = document.getElementById('bookingForm');

    if (!whatsappBtn || !bookingForm) return;

    whatsappBtn.addEventListener('click', (e) => {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const dateInput = document.getElementById('dateInput') || document.getElementById('date');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isFormValid = nameInput?.value.trim() &&
            emailInput?.value.trim() &&
            emailRegex.test(emailInput.value.trim()) &&
            dateInput?.value.trim();

        if (!isFormValid) {
            e.preventDefault();
            bookingForm.requestSubmit();
        } else {
            whatsappBtn.href = getWhatsAppUrl();
        }
    });
}

/* LIMPIEZA DINÁMICA DE ERRORES AL ESCRIBIR O SELECCIONAR */
export function clearInputError(input, errorEl) {
    if (errorEl) errorEl.textContent = '';
    if (input) input.classList.remove('input-invalid');
}

/* ENVÍO DIRECTO Y SEGURO DEL FORMULARIO A WEB3FORMS Y MODAL DINÁMICO */
function initFormSubmit() {
    const bookingForm = document.getElementById('bookingForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const dateInput = document.getElementById('dateInput') || document.getElementById('date');

    const errorName = document.getElementById('errorName');
    const errorEmail = document.getElementById('errorEmail');
    const errorDate = document.getElementById('errorDate');

    // Elementos del modal de respuesta
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
    const btnSubmit = bookingForm?.querySelector('button[type="submit"]');

    if (!bookingForm) return;

    // Escuchamos 'input' y 'change' para limpiar errores inmediatamente
    nameInput?.addEventListener('input', () => clearInputError(nameInput, errorName));
    emailInput?.addEventListener('input', () => clearInputError(emailInput, errorEmail));

    dateInput?.addEventListener('change', () => clearInputError(dateInput, errorDate));
    dateInput?.addEventListener('input', () => clearInputError(dateInput, errorDate));

    /* Cierra el modal y reinicia completamente el formulario y calendario */
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            modal?.close();
            resetBookingForm(bookingForm);
        });
    }

    /* Redirige a WhatsApp y limpia inmediatamente la vista para una nueva reserva */
    if (modalWhatsappBtn) {
        modalWhatsappBtn.addEventListener('click', () => {
            modal?.close();
            resetBookingForm(bookingForm);
        });
    }

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;

        if (!nameInput.value.trim()) {
            if (errorName) errorName.textContent = 'Por favor, ingresa tu nombre completo.';
            nameInput.classList.add('input-invalid');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            if (errorEmail) errorEmail.textContent = 'Por favor, ingresa tu correo electrónico.';
            emailInput.classList.add('input-invalid');
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            if (errorEmail) errorEmail.textContent = 'Por favor, ingresa un correo válido.';
            emailInput.classList.add('input-invalid');
            isValid = false;
        }

        if (!dateInput.value.trim()) {
            if (errorDate) errorDate.textContent = 'Por favor, selecciona una fecha para la reserva.';
            dateInput.classList.add('input-invalid');
            isValid = false;
        }

        if (!isValid) return;

        const originalText = btnSubmit ? btnSubmit.textContent : '';
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando solicitud...';
        }

        // Preparamos los datos del formulario utilizando FormData y agregando la clave de Web3Forms
        const formData = new FormData(bookingForm);
        formData.append("access_key", WEB3FORMS_KEY);

        try {
            // Petición directa a Web3Forms validada por el navegador del cliente (evita bloqueo de Cloudflare)
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (modalTitle) modalTitle.textContent = '¡Reserva Solicitada!';
                if (modalMessage) modalMessage.textContent = 'Hemos recibido tu solicitud. Nos pondremos en contacto contigo para confirmar.';
                if (modalWhatsappBtn) modalWhatsappBtn.classList.add('btn-whatsapp-hidden');
                modal?.showModal();
            } else {
                throw new Error(result.message || 'Error al procesar el envío');
            }
        } catch (error) {
            if (modalTitle) modalTitle.textContent = 'Error de envío';
            if (modalMessage) modalMessage.textContent = 'No fue posible registrar la reserva desde la web. Puedes solicitarla directamente por WhatsApp:';
            if (modalWhatsappBtn) {
                modalWhatsappBtn.href = getWhatsAppUrl();
                modalWhatsappBtn.classList.remove('btn-whatsapp-hidden');
            }
            modal?.showModal();
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = originalText;
            }
        }
    });
}