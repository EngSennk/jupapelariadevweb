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


            menuMobile.classList.toggle(
                'hidden'
            );


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



        /* ================================================
           FECHAR MENU AO CLICAR EM LINK
        ================================================= */

        const mobileLinks =
            menuMobile.querySelectorAll('a');


        mobileLinks.forEach(link => {


            link.addEventListener('click', () => {


                menuMobile.classList.add(
                    'hidden'
                );


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
       CARROSSÉIS
    ===================================================== */

    const carousels =
        document.querySelectorAll(
            '.produto-carousel'
        );


    carousels.forEach((carousel) => {


        initializeCarousel(
            carousel
        );


    });



    /* =====================================================
       FUNÇÃO DE INICIALIZAÇÃO
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


        if (
            !slides.length ||
            !dotsContainer
        ) {

            return;

        }


        /* ================================================
           ESTADO
        ================================================= */

        let currentIndex = 0;

        let touchStartX = 0;

        let touchEndX = 0;

        let autoPlayTimer = null;


        carousel.dataset.current = '0';



        /* ================================================
           CRIAR DOTS
        ================================================= */

        slides.forEach((slide, index) => {


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
                () => {

                    showSlide(
                        index,
                        true
                    );

                }
            );


            dotsContainer.appendChild(
                dot
            );


        });



        const dots =
            Array.from(
                dotsContainer.querySelectorAll(
                    '.carousel-dot'
                )
            );



        /* ================================================
           MOSTRAR SLIDE
        ================================================= */

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


            if (
                index >= slides.length
            ) {

                index = 0;

            }


            currentIndex =
                index;


            carousel.dataset.current =
                String(currentIndex);



            slides.forEach(
                (slide, slideIndex) => {


                    slide.classList.toggle(
                        'active',
                        slideIndex === currentIndex
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



            /* ==========================================
               ACESSIBILIDADE
            =========================================== */

            slides.forEach(
                (slide, slideIndex) => {


                    slide.setAttribute(
                        'aria-hidden',
                        slideIndex !== currentIndex
                    );


                }
            );



            if (userInteraction) {

                restartAutoPlay();

            }


        }



        /* ================================================
           PRÓXIMO SLIDE
        ================================================= */

        function nextSlide() {

            showSlide(
                currentIndex + 1,
                true
            );

        }



        /* ================================================
           SLIDE ANTERIOR
        ================================================= */

        function previousSlide() {

            showSlide(
                currentIndex - 1,
                true
            );

        }



        /* ================================================
           BOTÕES
        ================================================= */

        if (prevButton) {

            prevButton.addEventListener(
                'click',
                previousSlide
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                'click',
                nextSlide
            );

        }



        /* ================================================
           SWIPE / TOUCH
        ================================================= */

        carousel.addEventListener(
            'touchstart',
            (event) => {


                touchStartX =
                    event.changedTouches[0].screenX;


            },
            {
                passive: true
            }
        );


        carousel.addEventListener(
            'touchend',
            (event) => {


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
                touchEndX - touchStartX;


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



        /* ================================================
           AUTOPLAY
        ================================================= */

        function startAutoPlay() {


            /* Evita autoplay se houver apenas uma imagem */

            if (slides.length <= 1) {

                return;

            }


            autoPlayTimer =
                setInterval(
                    () => {

                        showSlide(
                            currentIndex + 1
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

            startAutoPlay();

        }



        /* ================================================
           PAUSAR QUANDO O MOUSE ESTÁ SOBRE O CARD
        ================================================= */

        carousel.addEventListener(
            'mouseenter',
            stopAutoPlay
        );


        carousel.addEventListener(
            'mouseleave',
            startAutoPlay
        );



        /* ================================================
           ACESSIBILIDADE / TECLADO
        ================================================= */

        carousel.setAttribute(
            'tabindex',
            '0'
        );


        carousel.addEventListener(
            'keydown',
            (event) => {


                if (
                    event.key ===
                    'ArrowLeft'
                ) {

                    event.preventDefault();

                    previousSlide();

                }


                if (
                    event.key ===
                    'ArrowRight'
                ) {

                    event.preventDefault();

                    nextSlide();

                }


            }
        );



        /* ================================================
           INICIAR
        ================================================= */

        showSlide(
            0
        );


        startAutoPlay();


    }



});