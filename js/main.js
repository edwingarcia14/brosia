/* ARCHIVO PRINCIPAL DE ENTRADA (ENTRY POINT) */
import { initBookingForm } from './modules/booking.js';
import { initUIEffects } from './modules/ui-effects.js';
import { initMenuModal } from './modules/menu-modal.js';

/* Inicialización segura de todos los módulos una vez que el árbol DOM está completamente disponible */
document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
    initUIEffects();
    initMenuModal();
});