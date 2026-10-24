/* MÓDULO PARA MANEJAR LA CARGA DINÁMICA Y APERTURA DEL MODAL DEL MENÚ */
export function initMenuModal() {
    const menuCards = document.querySelectorAll('.menu-card[data-category]');
    const menuModal = document.getElementById('menuModal');
    const menuModalTitle = document.getElementById('menuModalTitle');
    const menuModalList = document.getElementById('menuModalList');
    const closeMenuModalBtn = document.getElementById('closeMenuModalBtn');
    const closeMenuModalBottom = document.getElementById('closeMenuModalBottom');

    if (!menuCards.length || !menuModal || !menuModalList) return;

    /* Carga los datos del JSON e inyecta las cards de cada plato dinámicamente */
    async function openCategoryMenu(categoryKey, categoryTitle) {
        try {
            const response = await fetch('/js/data/menu.json');
            if (!response.ok) throw new Error('Error al cargar los datos del menú.');

            const data = await response.json();
            const items = data[categoryKey] || [];

            if (menuModalTitle) {
                menuModalTitle.textContent = categoryTitle;
            }

            const fragment = document.createDocumentFragment();

            if (items.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.className = 'modal-text';
                emptyMsg.textContent = 'No hay platos disponibles en esta categoría por el momento.';
                fragment.appendChild(emptyMsg);
            } else {
                items.forEach((item) => {
                    const article = document.createElement('article');
                    article.className = 'menu-item-article';

                    const details = document.createElement('header');
                    details.className = 'menu-item-details';

                    const title = document.createElement('h4');
                    title.textContent = item.nombre;

                    const description = document.createElement('p');
                    description.textContent = item.descripcion;

                    details.appendChild(title);
                    details.appendChild(description);

                    const price = document.createElement('span');
                    price.className = 'menu-item-price';
                    price.textContent = item.precio;

                    article.appendChild(details);
                    article.appendChild(price);
                    fragment.appendChild(article);
                });
            }

            menuModalList.replaceChildren(fragment);
            menuModal.showModal();

        } catch (error) {
            console.error(error);
        }
    }

    /* Asigna eventos click y accesibilidad por teclado (Tecla Enter / Espacio) */
    menuCards.forEach((card) => {
        const categoryKey = card.dataset.category;
        const categoryTitle = card.querySelector('figcaption')?.textContent || 'Menú';

        card.addEventListener('click', () => {
            openCategoryMenu(categoryKey, categoryTitle);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCategoryMenu(categoryKey, categoryTitle);
            }
        });
    });

    /* Cerrado del modal */
    closeMenuModalBtn?.addEventListener('click', () => menuModal.close());
    closeMenuModalBottom?.addEventListener('click', () => menuModal.close());
}