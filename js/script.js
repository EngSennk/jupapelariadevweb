/* =========================================================
   JU PAPELARIA PERSONALIZADA
   SCRIPT.JS
========================================================= */


document.addEventListener('DOMContentLoaded', () => {


    /* =====================================================
       LUCIDE
    ===================================================== */

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const btnMenu =
        document.getElementById('mobile-menu-btn');

    const menuMobile =
        document.getElementById('mobile-menu');


    if (btnMenu && menuMobile) {

        btnMenu.addEventListener('click', () => {

            const isOpen =
                !menuMobile.classList.contains('hidden');

            menuMobile.classList.toggle('hidden');

            btnMenu.setAttribute(
                'aria-expanded',
                String(!isOpen)
            );

            btnMenu.setAttribute(
                'aria-label',
                isOpen
                    ? 'Abrir menu'
                    : 'Fechar menu'
            );

        });


        menuMobile
            .querySelectorAll('a')
            .forEach(link => {

                link.addEventListener('click', () => {

                    menuMobile.classList.add('hidden');

                    btnMenu.setAttribute(
                        'aria-expanded',
                        'false'
                    );

                    btnMenu.setAttribute(
                        'aria-label',
                        'Abrir menu'
                    );

                });

            });

    }


    /* =====================================================
       LIGHTBOX GLOBAL
    ===================================================== */

    const lightbox =
        document.getElementById('image-lightbox');

    const lightboxImage =
        document.getElementById('lightbox-image');

    const lightboxProduct =
        document.getElementById('lightbox-product');

    const lightboxCategory =
        document.getElementById('lightbox-category');

    const lightboxCounter =
        document.getElementById('lightbox-counter');

    const lightboxThumbnails =
        document.getElementById('lightbox-thumbnails');

    const lightboxClose =
        document.getElementById('lightbox-close');

    const lightboxPrev =
        document.getElementById('lightbox-prev');

    const lightboxNext =
        document.getElementById('lightbox-next');

    const lightboxFullscreen =
        document.getElementById('lightbox-fullscreen');


    let activeCarousel = null;

    let lightboxIndex = 0;

    let lightboxSlides = [];

    let previousFocusedElement = null;


    /* =====================================================
       SUPORTE A FULLSCREEN (com fallback para Safari/webkit)
       -----------------------------------------------------
       iOS Safari não implementa a Fullscreen API para
       elementos genéricos (só para <video>), então tudo
       aqui é tratado como um "extra": se não for suportado,
       o botão dedicado de tela cheia é escondido e a
       visualização ampliada (que já cobre a tela inteira
       via CSS) continua funcionando normalmente.
    ===================================================== */

    const fullscreenSupported =
        !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled
        );


    if (
        !fullscreenSupported &&
        lightboxFullscreen
    ) {

        lightboxFullscreen.style.display =
            'none';

    }


    function getFullscreenElement() {

        return (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            null
        );

    }


    function requestElementFullscreen(element) {

        if (!element) {

            return Promise.reject(
                new Error('Elemento inválido')
            );

        }


        if (element.requestFullscreen) {

            return element.requestFullscreen();

        }


        if (element.webkitRequestFullscreen) {

            return element.webkitRequestFullscreen();

        }


        return Promise.reject(
            new Error('Fullscreen não suportado')
        );

    }


    function exitElementFullscreen() {

        if (document.exitFullscreen) {

            return document.exitFullscreen();

        }


        if (document.webkitExitFullscreen) {

            return document.webkitExitFullscreen();

        }


        return Promise.resolve();

    }


    function updateFullscreenIcon() {

        if (!lightboxFullscreen) {
            return;
        }


        const isFullscreen =
            !!getFullscreenElement();


        lightboxFullscreen.innerHTML =
            isFullscreen
                ? '<i data-lucide="minimize"></i>'
                : '<i data-lucide="maximize"></i>';


        lightboxFullscreen.setAttribute(
            'aria-label',
            isFullscreen
                ? 'Sair da tela cheia'
                : 'Entrar em tela cheia'
        );


        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    }



    /* =====================================================
       FUNÇÕES DO LIGHTBOX
    ===================================================== */


    function openLightbox(
        carousel,
        index
    ) {

        if (!lightbox || !carousel) {
            return;
        }


        /*
         * Para qualquer autoplay do carrossel
         * antes de abrir a visualização.
         */

        if (typeof carousel.stopAutoPlay === 'function') {
            carousel.stopAutoPlay();
        }


        activeCarousel =
            carousel;


        lightboxSlides =
            Array.from(
                carousel.querySelectorAll('.carousel-slide')
            );


        if (!lightboxSlides.length) {
            return;
        }


        lightboxIndex =
            Math.max(
                0,
                Math.min(
                    index,
                    lightboxSlides.length - 1
                )
            );


        const productCard =
            carousel.closest('.produto-card');


        if (productCard) {

            const title =
                productCard.querySelector('.produto-info h3');

            const category =
                productCard.querySelector('.produto-categoria');


            if (title) {
                lightboxProduct.textContent =
                    title.textContent.trim();
            }


            if (category) {
                lightboxCategory.textContent =
                    category.textContent.trim();
            }

        }


        createLightboxThumbnails();

        updateLightbox();


        previousFocusedElement =
            document.activeElement;


        lightbox.classList.add('open');

        lightbox.setAttribute(
            'aria-hidden',
            'false'
        );


        document.body.classList.add(
            'lightbox-open'
        );


        /*
         * Tenta entrar em tela cheia nativa automaticamente
         * ao abrir a imagem — ainda dentro da mesma cadeia
         * síncrona do clique do usuário, o que é exigido
         * pelos navegadores para permitir a chamada.
         *
         * Se o navegador bloquear ou não suportar (ex: iOS
         * Safari), o catch garante que nada quebre: a
         * visualização ampliada por CSS já cobre a tela
         * inteira e continua 100% navegável.
         */

        if (fullscreenSupported) {

            requestElementFullscreen(lightbox)
                .catch(() => {

                    /*
                     * Fullscreen automático bloqueado ou
                     * indisponível neste momento — sem problema,
                     * o modo ampliado continua funcionando.
                     */

                });

        }


        setTimeout(() => {

            if (lightboxClose) {
                lightboxClose.focus();
            }

        }, 50);

    }



    function closeLightbox() {

        if (!lightbox) {
            return;
        }


        /*
         * Se estiver usando Fullscreen API,
         * sai primeiro do fullscreen real.
         */

        if (getFullscreenElement()) {

            exitElementFullscreen()
                .catch(() => {});

        }


        lightbox.classList.remove('open');

        lightbox.setAttribute(
            'aria-hidden',
            'true'
        );


        document.body.classList.remove(
            'lightbox-open'
        );


        /*
         * Só depois de fechar a visualização
         * o autoplay do carrossel normal pode voltar.
         */

        if (
            activeCarousel &&
            typeof activeCarousel.restartAutoPlay === 'function'
        ) {

            activeCarousel.restartAutoPlay();

        }


        if (
            previousFocusedElement &&
            typeof previousFocusedElement.focus === 'function'
        ) {

            previousFocusedElement.focus();

        }


        activeCarousel =
            null;

    }



    /* =====================================================
       MINIATURAS DO LIGHTBOX
    ===================================================== */

    function createLightboxThumbnails() {

        if (!lightboxThumbnails) {
            return;
        }


        lightboxThumbnails.innerHTML = '';


        lightboxSlides.forEach(
            (slide, index) => {

                const image =
                    slide.querySelector('img');


                if (!image) {
                    return;
                }


                const thumbnail =
                    document.createElement('button');


                thumbnail.type =
                    'button';


                thumbnail.className =
                    'lightbox-thumbnail';


                thumbnail.setAttribute(
                    'aria-label',
                    `Visualizar imagem ${index + 1}`
                );


                thumbnail.dataset.index =
                    String(index);


                const thumbnailImage =
                    document.createElement('img');


                thumbnailImage.src =
                    image.currentSrc ||
                    image.src;


                thumbnailImage.alt =
                    image.alt || '';


                thumbnailImage.loading =
                    'lazy';


                thumbnail.appendChild(
                    thumbnailImage
                );


                thumbnail.addEventListener(
                    'click',
                    () => {

                        lightboxIndex =
                            index;

                        updateLightbox();

                    }
                );


                lightboxThumbnails.appendChild(
                    thumbnail
                );

            }
        );

    }



    /* =====================================================
       ATUALIZAR LIGHTBOX
    ===================================================== */

    function updateLightbox() {

        if (
            !lightboxSlides.length ||
            !lightboxImage
        ) {
            return;
        }


        const slide =
            lightboxSlides[lightboxIndex];


        const image =
            slide.querySelector('img');


        if (!image) {
            return;
        }


        lightboxImage.src =
            image.currentSrc ||
            image.src;


        lightboxImage.alt =
            image.alt || 'Imagem do produto';


        if (lightboxCounter) {

            lightboxCounter.textContent =
                `${lightboxIndex + 1} / ${lightboxSlides.length}`;

        }


        /*
         * Atualiza miniaturas
         */

        const thumbnails =
            lightboxThumbnails
                ? lightboxThumbnails.querySelectorAll(
                    '.lightbox-thumbnail'
                )
                : [];


        thumbnails.forEach(
            (thumbnail, index) => {

                thumbnail.classList.toggle(
                    'active',
                    index === lightboxIndex
                );

                thumbnail.setAttribute(
                    'aria-current',
                    index === lightboxIndex
                        ? 'true'
                        : 'false'
                );

            }
        );


        /*
         * Mantém a miniatura atual visível.
         */

        const activeThumbnail =
            lightboxThumbnails
                ? lightboxThumbnails.querySelector(
                    '.lightbox-thumbnail.active'
                )
                : null;


        if (activeThumbnail) {

            activeThumbnail.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });

        }

    }



    /* =====================================================
       NAVEGAÇÃO LIGHTBOX
    ===================================================== */

    function lightboxNextImage() {

        if (!lightboxSlides.length) {
            return;
        }


        lightboxIndex =
            (lightboxIndex + 1)
            % lightboxSlides.length;


        updateLightbox();

    }



    function lightboxPreviousImage() {

        if (!lightboxSlides.length) {
            return;
        }


        lightboxIndex =
            (
                lightboxIndex -
                1 +
                lightboxSlides.length
            ) %
            lightboxSlides.length;


        updateLightbox();

    }



    /* =====================================================
       EVENTOS LIGHTBOX
    ===================================================== */

    if (lightboxClose) {

        lightboxClose.addEventListener(
            'click',
            closeLightbox
        );

    }


    if (lightboxPrev) {

        lightboxPrev.addEventListener(
            'click',
            lightboxPreviousImage
        );

    }


    if (lightboxNext) {

        lightboxNext.addEventListener(
            'click',
            lightboxNextImage
        );

    }


    /*
     * Clique no fundo fecha.
     */

    lightbox
        ?.querySelectorAll('[data-lightbox-close]')
        .forEach(element => {

            element.addEventListener(
                'click',
                closeLightbox
            );

        });


    /*
     * ESC / setas do teclado
     */

    document.addEventListener(
        'keydown',
        event => {

            if (
                !lightbox ||
                !lightbox.classList.contains('open')
            ) {
                return;
            }


            if (event.key === 'Escape') {

                event.preventDefault();

                closeLightbox();

                return;
            }


            if (event.key === 'ArrowRight') {

                event.preventDefault();

                lightboxNextImage();

                return;
            }


            if (event.key === 'ArrowLeft') {

                event.preventDefault();

                lightboxPreviousImage();

            }

        }
    );


    /* =====================================================
       BOTÃO MANUAL DE TELA CHEIA
    ===================================================== */

    if (lightboxFullscreen) {

        lightboxFullscreen.addEventListener(
            'click',
            async () => {

                try {

                    if (!getFullscreenElement()) {

                        await requestElementFullscreen(lightbox);

                    } else {

                        await exitElementFullscreen();

                    }

                } catch (error) {

                    /*
                     * Alguns navegadores bloqueiam
                     * Fullscreen API em determinados contextos.
                     * O próprio lightbox continua funcionando.
                     */

                    console.warn(
                        'Fullscreen não disponível:',
                        error
                    );

                }

            }
        );

    }


    /*
     * Atualiza ícone quando entra/sai
     * do fullscreen real (padrão e com prefixo webkit).
     */

    document.addEventListener(
        'fullscreenchange',
        updateFullscreenIcon
    );


    document.addEventListener(
        'webkitfullscreenchange',
        updateFullscreenIcon
    );



    /* =====================================================
       CARROSSÉIS
    ===================================================== */

    const carousels =
        document.querySelectorAll(
            '.produto-carousel'
        );


    carousels.forEach(
        carousel => {

            initializeCarousel(
                carousel
            );

        }
    );



    /* =====================================================
       INICIALIZAÇÃO DO CARROSSEL
    ===================================================== */

    function initializeCarousel(carousel) {

        const slides =
            Array.from(
                carousel.querySelectorAll(
                    '.carousel-slide'
                )
            );


        const dotsContainer =
            carousel.querySelector(
                '.carousel-dots'
            );


        const prevButton =
            carousel.querySelector(
                '.carousel-btn.prev'
            );


        const nextButton =
            carousel.querySelector(
                '.carousel-btn.next'
            );


        const zoomButton =
            carousel.querySelector(
                '.zoom-hint'
            );


        if (
            !slides.length ||
            !dotsContainer
        ) {

            return;

        }


        let currentIndex = 0;

        let touchStartX = 0;

        let touchEndX = 0;

        let autoPlayTimer = null;


        carousel.dataset.current =
            '0';



        /* =================================================
           DOTS
        ================================================== */

        slides.forEach(
            (slide, index) => {

                const dot =
                    document.createElement(
                        'button'
                    );


                dot.type =
                    'button';


                dot.className =
                    'carousel-dot';


                dot.setAttribute(
                    'aria-label',
                    `Ver imagem ${index + 1}`
                );


                dot.addEventListener(
                    'click',
                    event => {

                        event.stopPropagation();

                        showSlide(
                            index,
                            true
                        );

                    }
                );


                dotsContainer.appendChild(
                    dot
                );

            }
        );


        const dots =
            Array.from(
                dotsContainer.querySelectorAll(
                    '.carousel-dot'
                )
            );



        /* =================================================
           MOSTRAR SLIDE
        ================================================== */

        function showSlide(
            index,
            userInteraction = false
        ) {

            if (!slides.length) {
                return;
            }


            if (index < 0) {

                index =
                    slides.length - 1;

            }


            if (index >= slides.length) {

                index =
                    0;

            }


            currentIndex =
                index;


            carousel.dataset.current =
                String(currentIndex);


            slides.forEach(
                (slide, slideIndex) => {

                    const active =
                        slideIndex === currentIndex;


                    slide.classList.toggle(
                        'active',
                        active
                    );


                    slide.setAttribute(
                        'aria-hidden',
                        String(!active)
                    );

                }
            );


            dots.forEach(
                (dot, dotIndex) => {

                    dot.classList.toggle(
                        'active',
                        dotIndex === currentIndex
                    );

                }
            );


            if (userInteraction) {

                restartAutoPlay();

            }

        }



        /* =================================================
           PRÓXIMO
        ================================================== */

        function nextSlide() {

            showSlide(
                currentIndex + 1,
                true
            );

        }



        /* =================================================
           ANTERIOR
        ================================================== */

        function previousSlide() {

            showSlide(
                currentIndex - 1,
                true
            );

        }



        /* =================================================
           BOTÕES
        ================================================== */

        if (prevButton) {

            prevButton.addEventListener(
                'click',
                event => {

                    event.stopPropagation();

                    previousSlide();

                }
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                'click',
                event => {

                    event.stopPropagation();

                    nextSlide();

                }
            );

        }



        /* =================================================
           BOTÃO DE AMPLIAR (ZOOM) → LIGHTBOX
        ================================================== */

        if (zoomButton) {

            zoomButton.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    openLightbox(
                        carousel,
                        currentIndex
                    );

                }
            );

        }



        /* =================================================
           CLIQUE NA IMAGEM → LIGHTBOX
        ================================================== */

        slides.forEach(
            (slide, index) => {

                const image =
                    slide.querySelector(
                        '.carousel-image'
                    );


                if (!image) {
                    return;
                }


                image.addEventListener(
                    'click',
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        /*
                         * Só permite abrir a imagem
                         * que está atualmente ativa.
                         */

                        if (
                            !slide.classList.contains(
                                'active'
                            )
                        ) {
                            return;
                        }


                        openLightbox(
                            carousel,
                            index
                        );

                    }
                );

            }
        );



        /* =================================================
           SWIPE / TOUCH
        ================================================== */

        carousel.addEventListener(
            'touchstart',
            event => {

                touchStartX =
                    event.changedTouches[0].screenX;

            },
            {
                passive: true
            }
        );


        carousel.addEventListener(
            'touchend',
            event => {

                touchEndX =
                    event.changedTouches[0].screenX;


                handleSwipe();

            },
            {
                passive: true
            }
        );


        function handleSwipe() {

            const distance =
                touchEndX -
                touchStartX;


            const minimumDistance =
                45;


            if (
                Math.abs(distance) <
                minimumDistance
            ) {

                return;

            }


            if (distance < 0) {

                nextSlide();

            } else {

                previousSlide();

            }

        }



        /* =================================================
           AUTOPLAY
        ================================================== */

        function startAutoPlay() {

            if (
                slides.length <= 1 ||
                document.body.classList.contains(
                    'lightbox-open'
                )
            ) {

                return;

            }


            stopAutoPlay();


            autoPlayTimer =
                setInterval(
                    () => {

                        /*
                         * Segurança:
                         * jamais avançar automaticamente
                         * enquanto o lightbox estiver aberto.
                         */

                        if (
                            document.body.classList.contains(
                                'lightbox-open'
                            )
                        ) {

                            stopAutoPlay();

                            return;

                        }


                        showSlide(
                            currentIndex + 1,
                            false
                        );

                    },
                    5000
                );

        }



        function stopAutoPlay() {

            if (autoPlayTimer) {

                clearInterval(
                    autoPlayTimer
                );

                autoPlayTimer =
                    null;

            }

        }



        function restartAutoPlay() {

            stopAutoPlay();

            /*
             * Se o lightbox estiver aberto,
             * NÃO inicia o cronômetro.
             */

            if (
                !document.body.classList.contains(
                    'lightbox-open'
                )
            ) {

                startAutoPlay();

            }

        }



        /*
         * Expõe as funções para o Lightbox.
         */

        carousel.stopAutoPlay =
            stopAutoPlay;


        carousel.restartAutoPlay =
            restartAutoPlay;



        /* =================================================
           PAUSAR COM MOUSE SOBRE O CARROSSEL
        ================================================== */

        carousel.addEventListener(
            'mouseenter',
            stopAutoPlay
        );


        carousel.addEventListener(
            'mouseleave',
            () => {

                /*
                 * Se estiver no lightbox,
                 * não reinicia.
                 */

                if (
                    !document.body.classList.contains(
                        'lightbox-open'
                    )
                ) {

                    startAutoPlay();

                }

            }
        );



        /* =================================================
           TECLADO NO CARROSSEL NORMAL
        ================================================== */

        carousel.setAttribute(
            'tabindex',
            '0'
        );


        carousel.addEventListener(
            'keydown',
            event => {

                /*
                 * Não interfere nas setas
                 * quando o lightbox estiver aberto.
                 */

                if (
                    document.body.classList.contains(
                        'lightbox-open'
                    )
                ) {

                    return;

                }


                if (event.key === 'ArrowLeft') {

                    event.preventDefault();

                    previousSlide();

                }


                if (event.key === 'ArrowRight') {

                    event.preventDefault();

                    nextSlide();

                }


                if (event.key === 'Enter') {

                    const activeSlide =
                        slides[currentIndex];


                    const image =
                        activeSlide.querySelector(
                            '.carousel-image'
                        );


                    if (image) {

                        event.preventDefault();

                        openLightbox(
                            carousel,
                            currentIndex
                        );

                    }

                }

            }
        );



        /* =================================================
           INICIALIZA
        ================================================== */

        showSlide(
            0,
            false
        );


        startAutoPlay();

    }


});