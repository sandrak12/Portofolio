/**
 * Sandrak — Professional Portfolio Script
 * Features:
 * 1. Logo-Only Loading Screen
 * 2. Ambient Shooting Stars & Twinkling Starfield Canvas Background
 * 3. Interactive 3D Portrait Photo Card (Perspective Tilt + Glare + Custom Photo Upload)
 * 4. Multi-Column Staggered Page Slide Transitions & Contextual Side Hotbar
 * 5. Project Card Spotlight & Animated Mockups
 */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================================
       1. LOGO-ONLY LOADING SCREEN
       ========================================================================= */
    const preloader = document.getElementById("preloader");

    setTimeout(() => {
        preloader?.classList.add("is-loaded");
        initScrollReveal();
        updateHotbarGliders("home");
    }, 1300);

    /* =========================================================================
       2. AMBIENT SHOOTING STARS & STARFIELD CANVAS BACKGROUND
       ========================================================================= */
    const canvas = document.getElementById("starfieldCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const stars = [];
        const shootingStars = [];
        const STAR_COUNT = Math.min(110, Math.floor((width * height) / 14000));

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.35 + 0.3,
                alpha: Math.random() * 0.65 + 0.15,
                twinkleSpeed: (Math.random() * 0.012 + 0.003) * (Math.random() < 0.5 ? 1 : -1)
            });
        }

        function spawnShootingStar() {
            if (shootingStars.length >= 2) return;
            const startX = Math.random() * width * 0.85 + width * 0.1;
            const startY = Math.random() * height * 0.45;
            const angle = (Math.PI / 180) * (125 + Math.random() * 20); // diagonal down-left
            const speed = 9 + Math.random() * 6;
            const isAccent = Math.random() < 0.38;

            shootingStars.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                len: 95 + Math.random() * 65,
                alpha: 1,
                color: isAccent ? "248, 111, 3" : "255, 255, 255"
            });
        }

        setInterval(() => {
            if (Math.random() < 0.72) {
                spawnShootingStar();
            }
        }, 2200);

        function renderStarfield() {
            ctx.clearRect(0, 0, width, height);
            const isLight = document.documentElement.getAttribute("data-theme") === "light";
            const starColor = isLight ? "20, 20, 30" : "255, 255, 255";

            // Draw twinkling ambient stars
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.alpha += s.twinkleSpeed;
                if (s.alpha > 0.85 || s.alpha < 0.12) {
                    s.twinkleSpeed *= -1;
                }
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${starColor}, ${s.alpha})`;
                ctx.fill();
            }

            // Draw shooting stars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const st = shootingStars[i];
                st.x += st.vx;
                st.y += st.vy;
                st.alpha -= 0.016;

                if (st.alpha <= 0 || st.x < -150 || st.y > height + 150) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                const tailX = st.x - (st.vx / Math.hypot(st.vx, st.vy)) * st.len;
                const tailY = st.y - (st.vy / Math.hypot(st.vx, st.vy)) * st.len;

                const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
                grad.addColorStop(0, `rgba(${st.color}, ${st.alpha})`);
                grad.addColorStop(1, `rgba(${st.color}, 0)`);

                ctx.beginPath();
                ctx.moveTo(st.x, st.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.7;
                ctx.lineCap = "round";
                ctx.stroke();

                // Glowing head dot
                ctx.beginPath();
                ctx.arc(st.x, st.y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
                ctx.fill();
            }

            requestAnimationFrame(renderStarfield);
        }

        renderStarfield();

        window.addEventListener("resize", () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }

    /* =========================================================================
       3. INTERACTIVE 3D PORTRAIT CARD & CUSTOM PHOTO UPLOADER
       ========================================================================= */
    const photo3dStage = document.getElementById("photo3dStage");
    const photo3dCard = document.getElementById("photo3dCard");
    const cardGlare = document.getElementById("cardGlare");
    const customPhotoInput = document.getElementById("customPhotoInput");
    const sandrakPortraitImg = document.getElementById("sandrakPortraitImg");
    const aboutMiniPhoto = document.getElementById("aboutMiniPhoto");

    if (photo3dStage && photo3dCard) {
        photo3dStage.addEventListener("mousemove", (e) => {
            const rect = photo3dCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            photo3dCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

            if (cardGlare) {
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                cardGlare.style.setProperty("--glare-x", `${glareX}%`);
                cardGlare.style.setProperty("--glare-y", `${glareY}%`);
            }
        });

        photo3dStage.addEventListener("mouseleave", () => {
            photo3dCard.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
    }

    // Clear any stale localStorage photo override so assets/sandrak-photo.png loads directly
    localStorage.removeItem("sandrak_custom_photo");

    customPhotoInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result;
            if (typeof dataUrl === "string") {
                if (sandrakPortraitImg) sandrakPortraitImg.src = dataUrl;
                if (aboutMiniPhoto) aboutMiniPhoto.src = dataUrl;
                try {
                    localStorage.setItem("sandrak_custom_photo", dataUrl);
                } catch (_) {
                    // Ignore storage quota errors for very large photos
                }
            }
        };
        reader.readAsDataURL(file);
    });

    /* =========================================================================
       4. DARK / LIGHT MODE TOGGLE
       ========================================================================= */
    const htmlEl = document.documentElement;
    const themeModeBtn = document.getElementById("themeModeBtn");
    const modeText = document.getElementById("modeText");

    localStorage.removeItem("sandrak_palette");
    localStorage.removeItem("selectedTheme");

    function applyThemeMode(mode) {
        htmlEl.setAttribute("data-theme", mode);
        localStorage.setItem("sandrak_theme_mode", mode);
        if (modeText) {
            modeText.textContent = mode === "dark" ? "Dark" : "Light";
        }
    }

    const savedMode = localStorage.getItem("sandrak_theme_mode") || "dark";
    applyThemeMode(savedMode);

    themeModeBtn?.addEventListener("click", () => {
        const current = htmlEl.getAttribute("data-theme") === "light" ? "light" : "dark";
        applyThemeMode(current === "dark" ? "light" : "dark");
    });

    /* =========================================================================
       5. HOTBAR GLIDERS & STAGGERED MULTI-COLUMN PAGE SLIDE TRANSITION
       ========================================================================= */
    const navItems = document.querySelectorAll(".nav-item");
    const sideItems = document.querySelectorAll(".side-item");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const navGlider = document.getElementById("navGlider");
    const sideGlider = document.getElementById("sideGlider");
    const sections = document.querySelectorAll(".page-section[id]");
    const pageTransitionLayer = document.getElementById("pageTransitionLayer");
    const transitionLabel = document.getElementById("transitionLabel");

    function updateHotbarGliders(activeId) {
        navItems.forEach((item) => {
            const isMatch = item.dataset.target === activeId;
            item.classList.toggle("active", isMatch);
            if (isMatch && navGlider) {
                navGlider.style.width = `${item.offsetWidth}px`;
                navGlider.style.transform = `translateX(${item.offsetLeft - 5}px)`;
            }
        });

        sideItems.forEach((item, index) => {
            const isMatch = item.dataset.target === activeId;
            item.classList.toggle("active", isMatch);
            if (isMatch && sideGlider) {
                const offsetY = index * 46;
                sideGlider.style.transform = `translateY(${offsetY}px)`;
            }
        });

        mobileLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.target === activeId);
        });
    }

    window.addEventListener("resize", () => {
        const currentActive = document.querySelector(".nav-item.active")?.dataset.target || "home";
        updateHotbarGliders(currentActive);
    });

    let isTransitioning = false;

    function navigateWithSlide(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection || isTransitioning) return;

        isTransitioning = true;
        const sectionTitle = targetSection.getAttribute("data-section-title") || targetId;
        if (transitionLabel) {
            transitionLabel.textContent = sectionTitle;
        }

        pageTransitionLayer?.classList.remove("is-active");
        void pageTransitionLayer?.offsetWidth;
        pageTransitionLayer?.classList.add("is-active");

        updateHotbarGliders(targetId);

        setTimeout(() => {
            const headerOffset = 72;
            const topPos = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: topPos, behavior: "instant" });

            sections.forEach((sec) => sec.classList.remove("slide-enter"));
            targetSection.classList.add("slide-enter");
        }, 340);

        setTimeout(() => {
            pageTransitionLayer?.classList.remove("is-active");
            isTransitioning = false;
        }, 900);
    }

    document.querySelectorAll("[data-target]").forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("data-target");
            if (!targetId) return;
            e.preventDefault();
            closeDrawer();
            closeModal();
            navigateWithSlide(targetId);
        });
    });

    /* =========================================================================
       6. SCROLL SPY & SIDE HOTBAR APPEARANCE
       ========================================================================= */
    const scrollTopBtn = document.getElementById("scrollTopBtn");

    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 260) {
            document.body.classList.add("side-dock-active");
        } else {
            document.body.classList.remove("side-dock-active");
        }

        if (isTransitioning) return;

        let activeSectionId = "home";
        sections.forEach((sec) => {
            const top = sec.offsetTop - 200;
            if (scrollY >= top && scrollY < top + sec.offsetHeight) {
                activeSectionId = sec.id;
            }
        });

        updateHotbarGliders(activeSectionId);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    scrollTopBtn?.addEventListener("click", () => {
        navigateWithSlide("home");
    });

    /* =========================================================================
       7. MOBILE DRAWER NAVIGATION
       ========================================================================= */
    const mobileMenuTrigger = document.getElementById("mobileMenuTrigger");
    const drawerClose = document.getElementById("drawerClose");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const mobileBackdrop = document.getElementById("mobileBackdrop");

    function openDrawer() {
        mobileDrawer?.classList.add("open");
        mobileBackdrop?.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
        mobileDrawer?.classList.remove("open");
        mobileBackdrop?.classList.remove("active");
        document.body.style.overflow = "";
    }

    mobileMenuTrigger?.addEventListener("click", openDrawer);
    drawerClose?.addEventListener("click", closeDrawer);
    mobileBackdrop?.addEventListener("click", closeDrawer);

    /* =========================================================================
       8. HERO ROLE TYPEWRITER
       ========================================================================= */
    const typedRoleEl = document.getElementById("typedRole");
    const roles = [
        "Frontend Developer",
        "UI/UX Designer",
        "Web Engineer",
        "Interface Specialist"
    ];
    let rIdx = 0;
    let cIdx = roles[0].length;
    let isDeleting = true;

    function tickRole() {
        if (!typedRoleEl) return;
        const word = roles[rIdx];

        if (isDeleting) {
            cIdx--;
            typedRoleEl.textContent = word.substring(0, cIdx);
            if (cIdx === 0) {
                isDeleting = false;
                rIdx = (rIdx + 1) % roles.length;
                setTimeout(tickRole, 260);
                return;
            }
            setTimeout(tickRole, 40);
        } else {
            cIdx++;
            typedRoleEl.textContent = word.substring(0, cIdx);
            if (cIdx === word.length) {
                isDeleting = true;
                setTimeout(tickRole, 2400);
                return;
            }
            setTimeout(tickRole, 75);
        }
    }

    setTimeout(tickRole, 2200);

    /* =========================================================================
       9. SCROLL REVEAL & SKILL BARS
       ========================================================================= */
    const revealItems = document.querySelectorAll(".reveal-item");
    const skillFills = document.querySelectorAll(".skill-fill");

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    const skillObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    bar.style.width = bar.getAttribute("data-width") || "85%";
                    skillObserver.unobserve(bar);
                }
            });
        },
        { threshold: 0.25 }
    );

    function initScrollReveal() {
        revealItems.forEach((el) => revealObserver.observe(el));
        skillFills.forEach((bar) => skillObserver.observe(bar));
    }

    /* =========================================================================
       10. PROJECT CARDS MOUSE SPOTLIGHT, FILTER ANIMATION & MODAL
       ========================================================================= */
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    // Mouse-tracking radial glow on each project card
    projectCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            projectCards.forEach((card) => {
                const match = filter === "all" || card.dataset.category === filter;
                card.classList.toggle("is-hidden", !match);
                if (match) {
                    card.classList.remove("filter-pop");
                    void card.offsetWidth;
                    card.classList.add("filter-pop");
                }
            });
        });
    });

    const projectModal = document.getElementById("projectModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modalClose = document.getElementById("modalClose");
    const modalCat = document.getElementById("modalCat");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalStack = document.getElementById("modalStack");

    function openModal(btn) {
        if (!projectModal) return;
        if (modalCat) modalCat.textContent = btn.dataset.cat || "";
        if (modalTitle) modalTitle.textContent = btn.dataset.title || "";
        if (modalDesc) modalDesc.textContent = btn.dataset.desc || "";
        if (modalStack) modalStack.textContent = btn.dataset.stack || "";
        projectModal.removeAttribute("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        if (!projectModal) return;
        projectModal.setAttribute("hidden", "");
        document.body.style.overflow = "";
    }

    document.querySelectorAll("button.btn-detail").forEach((btn) => {
        btn.addEventListener("click", () => openModal(btn));
    });

    modalClose?.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
            closeDrawer();
        }
    });

    /* =========================================================================
       11. CONTACT FORM VALIDATION
       ========================================================================= */
    const contactForm = document.getElementById("contactForm");
    const formFeedback = document.getElementById("formFeedback");

    contactForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;

        const requiredInputs = contactForm.querySelectorAll("input[required], textarea[required]");
        requiredInputs.forEach((input) => {
            const err = input.parentElement.querySelector(".error-text");
            const val = input.value.trim();
            const isEmail = input.type === "email";
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

            if (!val || (isEmail && !emailOk)) {
                input.classList.add("error");
                if (err) err.style.display = "block";
                valid = false;
            } else {
                input.classList.remove("error");
                if (err) err.style.display = "none";
            }
        });

        if (valid) {
            const name = document.getElementById("fullName")?.value.trim() || "Anda";
            if (formFeedback) {
                formFeedback.textContent = `Terima kasih, ${name}! Pesan Anda telah diterima oleh Sandrak.`;
                formFeedback.removeAttribute("hidden");
            }
            contactForm.reset();
            setTimeout(() => formFeedback?.setAttribute("hidden", ""), 5000);
        }
    });

    contactForm?.querySelectorAll("input, textarea").forEach((field) => {
        field.addEventListener("input", () => {
            field.classList.remove("error");
            const err = field.parentElement.querySelector(".error-text");
            if (err) err.style.display = "none";
        });
    });

    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
