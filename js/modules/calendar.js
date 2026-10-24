import { clearInputError } from './booking.js';

/* VARIABLES GLOBALES DEL MÓDULO DE CALENDARIO */
let currentDate = new Date();
let selectedDate = null;
let renderCalendarRef = null;

/* INICIALIZADOR DEL CALENDARIO PERSONALIZADO (MODAL NATIVO <dialog>) */
export function initCustomCalendar() {
    const dateInput = document.getElementById('dateInput') || document.getElementById('date');
    const calendarModal = document.getElementById('calendarModal');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const calendarDays = document.getElementById('calendarDays');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');

    if (!dateInput || !calendarModal || !calendarMonthYear || !calendarDays) return;

    dateInput.required = true;
    dateInput.value = '';

    const monthsEs = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    /* Genera los días del mes optimizando la inserción en el DOM con DocumentFragment */
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        calendarMonthYear.textContent = `${monthsEs[month]} ${year}`;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fragment = document.createDocumentFragment();
        let row = document.createElement('tr');

        for (let i = 0; i < firstDayIndex; i++) {
            row.appendChild(document.createElement('td'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            if (row.children.length === 7) {
                fragment.appendChild(row);
                row = document.createElement('tr');
            }

            const cell = document.createElement('td');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'calendar-day-btn';
            btn.textContent = day;
            btn.dataset.day = day;

            const cellDate = new Date(year, month, day);

            if (cellDate < today) {
                btn.disabled = true;
            }

            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            if (isSelected || (!selectedDate && isToday)) {
                btn.classList.add('is-selected');
            }

            cell.appendChild(btn);
            row.appendChild(cell);
        }

        fragment.appendChild(row);
        calendarDays.replaceChildren(fragment);
    }

    /* Guardamos la referencia para usarla en resetCalendarState */
    renderCalendarRef = renderCalendar;

    /* Manejador unificado de selección de fecha (Soporta Click y Touch Móvil) */
    function handleSelectDate(e) {
        const btn = e.target.closest('.calendar-day-btn');
        if (!btn || btn.disabled) return;

        e.preventDefault();

        const day = parseInt(btn.dataset.day, 10);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        selectedDate = new Date(year, month, day);
        dateInput.value = `${day} de ${monthsEs[month]}, ${year}`;

        // Disparar eventos y limpiar mensaje de error visual al instante
        const errorDate = document.getElementById('errorDate');
        clearInputError(dateInput, errorDate);

        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        calendarModal.close();
    }

    /* Delegación de eventos para escritotio y táctil */
    calendarDays.addEventListener('click', handleSelectDate);

    function resetToCurrentMonth() {
        currentDate = selectedDate ? new Date(selectedDate.getTime()) : new Date();
        renderCalendar(currentDate);
    }

    dateInput.addEventListener('click', () => {
        resetToCurrentMonth();
        calendarModal.showModal();
    });

    closeCalendarBtn?.addEventListener('click', () => {
        calendarModal.close();
        resetToCurrentMonth();
    });

    prevMonthBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);
}

/* REINICIA EL ESTADO INTERNO DEL CALENDARIO Y VUELVE A LA FECHA ACTUAL */
export function resetCalendarState() {
    selectedDate = null;
    currentDate = new Date();

    // Limpia el valor visible del campo de fecha
    const dateInput = document.getElementById('dateInput') || document.getElementById('date');
    if (dateInput) {
        dateInput.value = '';
    }

    if (renderCalendarRef) {
        renderCalendarRef(currentDate);
    }
}