

(function () {
    "use strict";

    function initAlphaTelecom() {
        const body = document.body;
        const pageLoader = document.getElementById("pageLoader");
        const mainHeader = document.getElementById("mainHeader");
        const menuToggle = document.getElementById("menuToggle");
        const navMenu = document.getElementById("navMenu");
        const navLinks = Array.from(
            document.querySelectorAll("#navMenu .nav-link")
        );

        const backToTop = document.getElementById("backToTop");
        const currentYear = document.getElementById("currentYear");
        const contactForm = document.getElementById("contactForm");
        const formStatus = document.getElementById("formStatus");

        const reducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;


        /* =====================================================
           1. PAGE LOADER
        ===================================================== */

        function hidePageLoader() {
            if (!pageLoader) return;

            pageLoader.classList.add("loaded", "hide");
            pageLoader.setAttribute("aria-hidden", "true");
            body.classList.remove("loading");
        }

        if (pageLoader) {
            body.classList.add("loading");

            if (document.readyState === "complete") {
                window.setTimeout(hidePageLoader, 250);
            } else {
                window.addEventListener("load", function () {
                    window.setTimeout(hidePageLoader, 350);
                }, { once: true });
            }

            // Fallback: prevent the loader from blocking the website.
            window.setTimeout(hidePageLoader, 3500);
        }


        /* =====================================================
           2. MOBILE NAVIGATION
        ===================================================== */

        function closeMobileMenu() {
            if (navMenu) {
                navMenu.classList.remove("open", "active");
            }

            if (menuToggle) {
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            }

            body.classList.remove("menu-open");
        }

        function openMobileMenu() {
            if (!navMenu || !menuToggle) return;

            navMenu.classList.add("open", "active");

            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

            body.classList.add("menu-open");
        }

        if (menuToggle && navMenu) {
            menuToggle.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const isOpen =
                    navMenu.classList.contains("open") ||
                    navMenu.classList.contains("active");

                if (isOpen) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });


            // Close the menu when clicking outside it.
            document.addEventListener("click", function (event) {
                const menuIsOpen =
                    navMenu.classList.contains("open") ||
                    navMenu.classList.contains("active");

                if (
                    menuIsOpen &&
                    !navMenu.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {
                    closeMobileMenu();
                }
            });


            // Close the menu with the Escape key.
            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    closeMobileMenu();
                }
            });


            // Reset the mobile menu when switching to desktop view.
            window.addEventListener("resize", function () {
                if (window.innerWidth > 850) {
                    closeMobileMenu();
                }
            }, { passive: true });
        }


        /* =====================================================
           3. ACTIVE NAVIGATION LINK
        ===================================================== */

        const sectionLinks = navLinks
            .map(function (link) {
                const href = link.getAttribute("href");

                if (!href || !href.startsWith("#")) {
                    return null;
                }

                const section = document.getElementById(
                    href.substring(1)
                );

                if (!section) {
                    return null;
                }

                return {
                    link: link,
                    section: section,
                    id: href.substring(1)
                };
            })
            .filter(Boolean);


        function setActiveLink(id) {
            navLinks.forEach(function (link) {
                const href = link.getAttribute("href");
                const isActive = href === "#" + id;

                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }


        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                const href = link.getAttribute("href");

                if (href && href.startsWith("#")) {
                    setActiveLink(href.substring(1));
                }

                closeMobileMenu();
            });
        });


        // Logo and other Home links.
        document.querySelectorAll('a[href="#home"]').forEach(
            function (link) {
                link.addEventListener("click", function () {
                    setActiveLink("home");
                    closeMobileMenu();
                });
            }
        );


        /* =====================================================
           4. SMOOTH SCROLLING
        ===================================================== */

        document.querySelectorAll('a[href^="#"]').forEach(
            function (link) {
                link.addEventListener("click", function (event) {
                    const href = link.getAttribute("href");

                    if (!href || href === "#") return;

                    const target = document.getElementById(
                        href.substring(1)
                    );

                    if (!target) return;

                    event.preventDefault();

                    const headerHeight = mainHeader
                        ? mainHeader.getBoundingClientRect().height
                        : 0;

                    const targetTop =
                        target.getBoundingClientRect().top +
                        window.pageYOffset -
                        headerHeight -
                        12;

                    window.scrollTo({
                        top: Math.max(0, targetTop),
                        behavior: reducedMotion ? "auto" : "smooth"
                    });

                    if (target.id) {
                        setActiveLink(target.id);
                    }

                    closeMobileMenu();

                    // Update the URL without triggering another jump.
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState(
                            null,
                            "",
                            href
                        );
                    }
                });
            }
        );


        /* =====================================================
           5. HEADER SCROLL EFFECT & ACTIVE SECTION TRACKING
        ===================================================== */

        let scrollTicking = false;

        function updateScrollState() {
            const scrollY =
                window.pageYOffset ||
                document.documentElement.scrollTop;

            // Header styling.
            if (mainHeader) {
                mainHeader.classList.toggle(
                    "scrolled",
                    scrollY > 20
                );
            }

            // Back-to-top button visibility.
            if (backToTop) {
                backToTop.classList.toggle(
                    "show",
                    scrollY > 450
                );
            }

            // Determine the active section.
            if (sectionLinks.length) {
                const marker =
                    (mainHeader ? mainHeader.offsetHeight : 0) + 100;

                let currentId = sectionLinks[0].id;

                sectionLinks.forEach(function (item) {
                    if (
                        item.section.getBoundingClientRect().top <= marker
                    ) {
                        currentId = item.id;
                    }
                });

                // Handle the bottom of the page.
                const nearBottom =
                    window.innerHeight + scrollY >=
                    document.documentElement.scrollHeight - 8;

                if (nearBottom) {
                    const lastItem =
                        sectionLinks[sectionLinks.length - 1];

                    if (
                        lastItem &&
                        lastItem.section.getBoundingClientRect().top <
                            window.innerHeight
                    ) {
                        currentId = lastItem.id;
                    }
                }

                setActiveLink(currentId);
            }

            scrollTicking = false;
        }


        window.addEventListener("scroll", function () {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateScrollState);
                scrollTicking = true;
            }
        }, { passive: true });

        updateScrollState();


        /* =====================================================
           6. BACK TO TOP BUTTON
        ===================================================== */

        if (backToTop) {
            backToTop.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: reducedMotion ? "auto" : "smooth"
                });

                setActiveLink("home");
            });
        }


        /* =====================================================
           7. SCROLL REVEAL ANIMATIONS
        ===================================================== */

        const revealElements = document.querySelectorAll(
            ".section-heading, " +
            ".service-card, " +
            ".process-card, " +
            ".why-content, " +
            ".why-visual, " +
            ".contact-main-card, " +
            ".final-cta-card, " +
            ".location-card, " +
            ".trust-item, " +
            ".contact-method, " +
            ".footer-column"
        );


        if ("IntersectionObserver" in window && !reducedMotion) {
            const revealObserver = new IntersectionObserver(
                function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -35px 0px"
                }
            );

            revealElements.forEach(function (element) {
                element.classList.add("reveal");
                revealObserver.observe(element);
            });

            window.setTimeout(updateScrollState, 100);
        } else {
            revealElements.forEach(function (element) {
                element.classList.add("visible");
            });
        }


        /* =====================================================
           8. CONTACT FORM -> WHATSAPP
        ===================================================== */

        if (contactForm) {
            contactForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const nameInput =
                    document.getElementById("customerName");

                const phoneInput =
                    document.getElementById("customerPhone");

                const serviceInput =
                    document.getElementById("serviceType");

                const messageInput =
                    document.getElementById("customerMessage");


                const name = nameInput
                    ? nameInput.value.trim()
                    : "";

                const phone = phoneInput
                    ? phoneInput.value.trim()
                    : "";

                const service = serviceInput
                    ? serviceInput.value.trim()
                    : "";

                const message = messageInput
                    ? messageInput.value.trim()
                    : "";


                // Validate required fields.
                if (!name || !message) {
                    if (formStatus) {
                        formStatus.textContent =
                            "Please enter your name and enquiry message.";

                        formStatus.classList.add("error");
                    }

                    if (!name && nameInput) {
                        nameInput.focus();
                    } else if (messageInput) {
                        messageInput.focus();
                    }

                    return;
                }


                // Validate an optional phone number.
                const phoneDigits = phone.replace(/[^\d+]/g, "");

                if (
                    phone &&
                    phoneDigits.replace(/\D/g, "").length < 10
                ) {
                    if (formStatus) {
                        formStatus.textContent =
                            "Please enter a valid phone number, or leave it blank.";

                        formStatus.classList.add("error");
                    }

                    if (phoneInput) {
                        phoneInput.focus();
                    }

                    return;
                }


                // Build the WhatsApp message.
                const lines = [
                    "Hello Alpha Telecom,",
                    "",
                    "I would like to enquire about your services.",
                    "",
                    "Name: " + name
                ];

                if (phone) {
                    lines.push("Phone: " + phone);
                }

                if (service) {
                    lines.push("Service: " + service);
                }

                lines.push(
                    "Enquiry: " + message,
                    "",
                    "Thank you."
                );


                // Alpha Telecom WhatsApp number.
                const whatsappNumber = "919732880427";

                const whatsappUrl =
                    "https://wa.me/" +
                    whatsappNumber +
                    "?text=" +
                    encodeURIComponent(lines.join("\n"));


                if (formStatus) {
                    formStatus.classList.remove("error");
                    formStatus.textContent =
                        "Opening WhatsApp with your enquiry…";
                }


                const whatsappWindow = window.open(
                    whatsappUrl,
                    "_blank",
                    "noopener,noreferrer"
                );


                // Fallback if the browser blocks the new tab.
                if (!whatsappWindow) {
                    window.location.href = whatsappUrl;
                }
            });


            // Clear validation messages when the user edits the form.
            contactForm.addEventListener("input", function () {
                if (formStatus) {
                    formStatus.textContent = "";
                    formStatus.classList.remove("error");
                }
            });
        }


        /* =====================================================
           9. AUTOMATIC FOOTER YEAR
        ===================================================== */

        if (currentYear) {
            currentYear.textContent =
                String(new Date().getFullYear());
        }


        /* =====================================================
           10. OPTIONAL CLICKABLE CARDS
        ===================================================== */

        document.querySelectorAll("[data-href]").forEach(
            function (element) {
                const destination =
                    element.getAttribute("data-href");

                if (!destination) return;

                element.style.cursor = "pointer";

                element.addEventListener("click", function (event) {
                    if (
                        event.target.closest(
                            "a, button, input, textarea, select"
                        )
                    ) {
                        return;
                    }

                    window.location.href = destination;
                });
            }
        );
    }


    /* =========================================================
       START AFTER THE HTML IS READY
    ========================================================= */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initAlphaTelecom,
            { once: true }
        );
    } else {
        initAlphaTelecom();
    }

})();