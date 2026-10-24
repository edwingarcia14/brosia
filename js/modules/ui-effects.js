/* INICIALIZADOR PRINCIPAL DE EFECTOS DE INTERFAZ */
export function initUIEffects() {
    initModalScrollLock();
    initScrollSpy();
    initScrollReveal();
    initScrollTopButton();
}

/* BLOQUEO DE SCROLL CON RETENCIÓN DE POSICIÓN PARA MODALES (<dialog>) */
function initModalScrollLock() {
    const dialogs = document.querySelectorAll('dialog');
    if (!dialogs.length) return;

    let scrollPosition = 0;

    dialogs.forEach((dialog) => {
        const originalShowModal = dialog.showModal;
        
        dialog.showModal = function () {
            const hasOpenDialog = Array.from(dialogs).some((d) => d.open);
            if (!hasOpenDialog) {
                // Guarda la posición actual de la ventana
                scrollPosition = window.scrollY;
                document.body.style.top = `-${scrollPosition}px`;
                document.body.classList.add('no-scroll');
            }
            return originalShowModal.apply(this, arguments);
        };

        dialog.addEventListener('close', () => {
            const hasOpenDialog = Array.from(dialogs).some((d) => d.open);
            if (!hasOpenDialog) {
                // Desactiva temporalmente el scroll-behavior smooth para evitar el efecto de "bajada"
                const html = document.documentElement;
                const prevScrollBehavior = html.style.scrollBehavior;
                html.style.scrollBehavior = 'auto';

                // Remueve las clases y restaura la posición de inmediato en un solo paso
                document.body.classList.remove('no-scroll');
                document.body.style.top = '';
                window.scrollTo(0, scrollPosition);

                // Restablece la propiedad original del HTML
                html.style.scrollBehavior = prevScrollBehavior;
            }
        });
    });
}

/* RASTREO DE NAVEGACIÓN EN SCROLL (ScrollSpy con IntersectionObserver) */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (!sections.length || !navLinks.length) return;

    /* Margen de área visible en pantalla para activación */
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    /* Actualiza la clase active en la navegación superior */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
}

/* REVELADO PROGRESIVO DE SECCIONES AL HACER SCROLL */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.hero-section, .services-section, .menu-section, .location-section, .contact-section');

    revealElements.forEach((el) => el.classList.add('reveal-on-scroll'));

    /* Activa animación una única vez y desconecta la observación de la sección cargada */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach((el) => observer.observe(el));
}

/* CONTROL DEL BOTÓN VOLVER ARRIBA CON OPTIMIZACIÓN PASIVA Y REQUESTANIMATIONFRAME */
function initScrollTopButton() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    let ticking = false;

    /* Escuchador optimizado para evitar tirones durante el desplazamiento */
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}