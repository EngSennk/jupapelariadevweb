// Inicializar os ícones da biblioteca Lucide
lucide.createIcons();

// Lógica do Menu Mobile (Hamburguer)
const btnMenu = document.getElementById('mobile-menu-btn');
const menuMobile = document.getElementById('mobile-menu');

if (btnMenu && menuMobile) {
    btnMenu.addEventListener('click', () => {
        menuMobile.classList.toggle('hidden');
    });

    // Fechar automaticamente o menu mobile ao clicar em qualquer link
    const mobileLinks = menuMobile.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuMobile.classList.add('hidden');
        });
    });
}