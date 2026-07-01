document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Logo Intro Video Controller
    // ==========================================================================
    const introOverlay = document.getElementById('logoIntroOverlay');
    const introVideo = document.getElementById('logoIntroVideo');
    const skipBtn = document.getElementById('skipIntroBtn');
    
    if (introOverlay && introVideo) {
        const hasPlayed = sessionStorage.getItem('introPlayed');
        
        if (hasPlayed) {
            // Returning visitor or page navigation: remove overlay and let page transition handle it
            introOverlay.remove();
            document.documentElement.classList.remove('intro-active');
        } else {
            // First visit of the session:
            let revealed = false;
            
            // Hide the default page transition overlay immediately to avoid stacking conflicts
            const pageTransitionOverlay = document.getElementById('pageTransitionOverlay');
            if (pageTransitionOverlay) {
                pageTransitionOverlay.classList.remove('active');
            }

            const revealWebsite = () => {
                if (revealed) return;
                revealed = true;
                
                // Mark as played in session
                sessionStorage.setItem('introPlayed', 'true');
                
                // Fade out overlay
                introOverlay.classList.add('fade-out');
                document.documentElement.classList.remove('intro-active');
                
                // Remove from DOM after transition
                setTimeout(() => {
                    introOverlay.remove();
                }, 800);
            };

            // Playback triggers
            introVideo.addEventListener('ended', revealWebsite);
            
            if (skipBtn) {
                skipBtn.addEventListener('click', revealWebsite);
            }

            // Fallback for stalling or error loading the video (graceful degradation)
            introVideo.addEventListener('error', () => {
                console.warn('Intro video failed to load, degrading gracefully.');
                revealWebsite();
            });
            
            // Safety timeout (6 seconds)
            setTimeout(() => {
                revealWebsite();
            }, 6000);
            
            // Attempt to autoplay the video
            const playPromise = introVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Autoplay blocked or video error:', error);
                    revealWebsite();
                });
            }
        }
    }

    // ==========================================================================
    // Page Transition Controller
    // ==========================================================================
    const transitionOverlay = document.getElementById('pageTransitionOverlay');
    if (transitionOverlay) {
        // Fade out on load
        setTimeout(() => {
            transitionOverlay.classList.remove('active');
        }, 80);

        // Intercept local anchors to perform transition
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.endsWith('.html') || href === '/' || href.startsWith('index.html') || href.startsWith('moving.html') || href.startsWith('improvements.html') || href.startsWith('services.html') || href.startsWith('electrician.html') || href.startsWith('janitorial.html')) && 
                !href.startsWith('#') && 
                !link.hasAttribute('download') && 
                link.getAttribute('target') !== '_blank') {
                
                link.addEventListener('click', (e) => {
                    const currentPath = window.location.pathname;
                    const targetPage = href.split('#')[0];
                    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
                    
                    if (targetPage !== currentPage && !(currentPage === 'index.html' && targetPage === '')) {
                        e.preventDefault();
                        transitionOverlay.classList.add('active');
                        setTimeout(() => {
                            window.location.href = href;
                        }, 350); // wait for fade duration
                    }
                });
            }
        });
    }

    // ==========================================================================
    // 0. VIDEO BACKGROUND INITIALIZATION (LOCAL FILE)
    // ==========================================================================
    const video = document.getElementById('heroVideo');
    if (video) {
        video.src = 'moving.mp4';
        video.play().catch(e => console.log('Autoplay blocked:', e));
    }

    // ==========================================================================
    // 1. STICKY HEADER NAVIGATION
    // ==========================================================================
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ==========================================================================
    // 2. MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ==========================================================================
    // 3. SCROLL REVEAL OBSERVER (FADE-UP TRANSITIONS)
    // ==========================================================================
    const animatedElements = document.querySelectorAll('.fade-up-init');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => animationObserver.observe(el));

    // ==========================================================================
    // 4. LENIS SMOOTH SCROLL INITIALIZATION
    // ==========================================================================
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
        });

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        lenis.scrollTo(target);
                    }
                }
            });
        });
    }

    // Register GSAP ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Create matchMedia instance for desktop-only pinning
        const mm = gsap.matchMedia();

        // ==========================================================================
        // GLOBAL GSAP TRIGGERS (Mobile and Desktop)
        // ==========================================================================
        
        // 5. HERO SPLIT-TEXT REVEAL
        const heroSplitTitle = document.querySelector('.hero-display-title .split-inner');
        if (heroSplitTitle) {
            gsap.from(".hero-display-title .split-inner", {
                y: "105%",
                duration: 1.5,
                stagger: 0.18,
                ease: "power4.out",
                delay: 0.2
            });

            // Smooth fade-in for Hero subtitle, trust badges, CTAs, and scroll explore indicator
            gsap.from(".cinematic-hero .hero-subtitle, .cinematic-hero .hero-trust-badges, .cinematic-hero .hero-ctas, .cinematic-hero .scroll-explore-indicator", {
                opacity: 0,
                y: 20,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.6
            });
        }

        // Hero snap REMOVED — it fights with Lenis smooth scroll and creates
        // jarring scroll jolts. Per stability rule: smooth scrolling > animation.

        // ==========================================================================
        // 5b. STATISTICS STRIP COUNTER ANIMATION (GLOBAL)
        // ==========================================================================
        const statVals = document.querySelectorAll('.stat-strip-val');
        if (statVals.length > 0) {
            statVals.forEach(el => {
                const text = el.textContent.trim();
                const match = text.match(/^([^\d,.]*)([\d,.]+)(.*)$/);
                if (match) {
                    const prefix = match[1];
                    const rawNum = match[2].replace(/,/g, '');
                    const targetVal = parseFloat(rawNum);
                    const suffix = match[3];
                    const isDecimal = rawNum.includes('.');
                    const isThousands = targetVal >= 1000;

                    // Set initial value to 0
                    el.textContent = prefix + (isDecimal ? '0.0' : '0') + suffix;

                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: targetVal,
                        duration: 1.8,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 95%",
                            toggleActions: "play none none none"
                        },
                        onUpdate: () => {
                            let formattedNum = obj.val;
                            if (isDecimal) {
                                formattedNum = obj.val.toFixed(1);
                            } else {
                                formattedNum = Math.floor(obj.val);
                                if (isThousands) {
                                    formattedNum = formattedNum.toLocaleString('en-US');
                                }
                            }
                            el.textContent = prefix + formattedNum + suffix;
                        }
                    });
                }
            });
        }

        // 10. GSAP SCROLL-DRIVEN TIMELINE SCENE & AXIS FILL (MOVING TIMELINE)
        const timelineProgress = document.getElementById('timelineProgressFill');
        if (timelineProgress) {
            gsap.to("#timelineProgressFill", {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: ".timeline-layout",
                    start: "top 30%",
                    end: "bottom 70%",
                    scrub: true
                }
            });
        }

        // Toggle active states for timeline milestones
        const scenes = document.querySelectorAll(".timeline-scene");
        if (scenes.length > 0) {
            scenes.forEach(scene => {
                ScrollTrigger.create({
                    trigger: scene,
                    start: "top 60%",
                    end: "bottom 40%",
                    onToggle: self => {
                        if (self.isActive) {
                            scene.classList.add("active");
                        } else {
                            if (self.progress === 0 && self.direction < 0) {
                                scene.classList.remove("active");
                            }
                        }
                    }
                });
            });
        }

        // 12. SEQUENTIAL SERVICE REVEALS (PROPERTY SERVICES PAGE)
        const servicesVisuals = [
            document.querySelector('#landscaping .statement-photo'),
            document.querySelector('#maintenance .statement-photo'),
            document.querySelector('#support .glass-card:nth-child(1)'),
            document.querySelector('#support .glass-card:nth-child(2)'),
            document.querySelector('#support .statement-photo')
        ];
        
        servicesVisuals.forEach((visual, idx) => {
            if (visual) {
                gsap.from(visual, {
                    opacity: 0,
                    y: 60,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: visual,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                });
            }
        });

        // 13. SIGNATURE MOVEMENT: TRUCK TRANSITION — moved to inline script in index.html

        // ==========================================================================
        // 13b. GSAP STACKED CARD PINNING & OVERLAY (SERVICES OVERVIEW)
        // ==========================================================================
        const stackWrapper = document.getElementById('stackCardsWrapper');
        if (stackWrapper) {
            gsap.set(".stack-card", { clearProps: "all" });
            gsap.set("#cardStack2", { yPercent: 120 });
            gsap.set("#cardStack3", { yPercent: 120 });
            gsap.set("#cardStack4", { yPercent: 120 });
            gsap.set("#cardStack5", { yPercent: 120 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stackWrapper,
                    start: "top 80px",
                    end: () => "+=" + (stackWrapper.offsetHeight * 4),
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // Receding cards drop to opacity:0 to prevent text ghosting/bleed-through
            tl.to("#cardStack2", { yPercent: 0, duration: 1, ease: "none" })
              .to("#cardStack1", { scale: 0.92, opacity: 0, duration: 1, ease: "none" }, "<")
              .to({}, { duration: 0.15 })
              
              .to("#cardStack3", { yPercent: 0, duration: 1, ease: "none" })
              .to("#cardStack2", { scale: 0.92, opacity: 0, duration: 1, ease: "none" }, "<")
              .to({}, { duration: 0.15 })
              
              .to("#cardStack4", { yPercent: 0, duration: 1, ease: "none" })
              .to("#cardStack3", { scale: 0.92, opacity: 0, duration: 1, ease: "none" }, "<")
              .to({}, { duration: 0.15 })
              
              .to("#cardStack5", { yPercent: 0, duration: 1, ease: "none" })
              .to("#cardStack4", { scale: 0.92, opacity: 0, duration: 1, ease: "none" }, "<")
              .to({}, { duration: 0.2 });
        }

        // ==========================================================================
        // DESKTOP-ONLY PINNING & STORYTELLING TRIGGERS (min-width: 1025px)
        // ==========================================================================
        mm.add("(min-width: 1025px)", () => {
            
            // A. FEATURED MOVING PINNED STORYTELLING REVEAL
            const movingShowcase = document.getElementById('movingShowcase');
            if (movingShowcase) {
                const revealTag = movingShowcase.querySelector('.reveal-tag');
                const revealQuote = movingShowcase.querySelector('.reveal-quote');
                const revealParagraph = movingShowcase.querySelector('.reveal-paragraph');
                const revealCtas = movingShowcase.querySelector('.reveal-ctas');
                const revealPhoto = movingShowcase.querySelector('.reveal-photo img');

                // Set initial hidden state via GSAP for progressive entrance
                gsap.set([revealTag, revealQuote, revealParagraph, revealCtas], { opacity: 0, y: 30 });
                gsap.set(revealPhoto, { scale: 0.8, opacity: 0 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: movingShowcase,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 0.8,
                        invalidateOnRefresh: true
                    }
                });

                tl.to(revealPhoto, { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" })
                  .to(revealTag, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
                  .to(revealQuote, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
                  .to(revealParagraph, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
                  .to(revealCtas, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
            }

            // B. GSAP STACKED CARD PINNING & OVERLAY REMOVED (Replaced by natural vertical flow reveal)

            // C. PROPERTY TRANSFORMATIONS - SCROLLTRIGGER NARRATIVE STEPS
            // Note: Left Visual Frame pins natively using CSS sticky. ScrollTrigger only manages visual transitions.
            const transPinContainer = document.getElementById('transPinContainer');
            if (transPinContainer) {
                const transSteps = document.querySelectorAll('.trans-step-block');
                const transLayers = document.querySelectorAll('.trans-image-layer');

                // Set initial state
                gsap.set(transLayers, { opacity: 0, scale: 1.05 });
                if (transLayers[0]) gsap.set(transLayers[0], { opacity: 1, scale: 1 });
                gsap.set(transSteps, { opacity: 0.25 });
                if (transSteps[0]) gsap.set(transSteps[0], { opacity: 1 });

                // Create individual triggers for narrative scroll reveals (visual changes)
                transSteps.forEach((step, idx) => {
                    const targetLayer = document.getElementById(`transLayer${idx + 1}`);
                    if (!targetLayer) return;

                    ScrollTrigger.create({
                        trigger: step,
                        start: "top 55%",
                        end: "bottom 45%",
                        onToggle: self => {
                            if (self.isActive) {
                                // Transition image layers smoothly with longer easing and smoother fades
                                gsap.to(transLayers, { opacity: 0, scale: 1.03, duration: 1.2, overwrite: "auto", ease: "power2.inOut" });
                                gsap.to(targetLayer, { opacity: 1, scale: 1, duration: 1.2, overwrite: "auto", ease: "power2.inOut" });

                                // Highlight active step block
                                gsap.to(transSteps, { opacity: 0.25, duration: 0.4, overwrite: "auto" });
                                gsap.to(step, { opacity: 1, duration: 0.4, overwrite: "auto" });
                            }
                        }
                    });
                });
            }




            // F. GSAP PINNED RENOVATION PROCESS (PROPERTY IMPROVEMENTS PAGE)
            // Note: Left Column pins natively using CSS sticky. ScrollTrigger only manages active step highlights.
            const processPinWrapper = document.getElementById('processPinWrapper');
            const processSteps = document.querySelectorAll('.process-step-item');
            if (processPinWrapper && processSteps.length > 0) {
                // Set initial states
                gsap.set(processSteps, { opacity: 0.25 });
                if (processSteps[0]) gsap.set(processSteps[0], { opacity: 1 });

                processSteps.forEach((step, idx) => {
                    ScrollTrigger.create({
                        trigger: step,
                        start: "top 55%",
                        end: "bottom 45%",
                        onToggle: self => {
                            if (self.isActive) {
                                gsap.to(processSteps, { opacity: 0.25, duration: 0.4, overwrite: "auto" });
                                gsap.to(step, { opacity: 1, duration: 0.4, overwrite: "auto" });
                            }
                        }
                    });
                });
            }

            return () => {
                // Clear any inline pinning styles on media query revert
            };
        });

        // D. GSAP CURATED HORIZONTAL PROJECTS GALLERY (Global - Mobile & Desktop)
        const galleryPin = document.getElementById('galleryPinWrapper');
        const galleryTrack = document.getElementById('galleryTrack');
        if (galleryPin && galleryTrack) {
            const getScrollAmount = () => {
                const trackWidth = galleryTrack.scrollWidth;
                const trackPaddingLeft = parseFloat(window.getComputedStyle(galleryTrack).paddingLeft) || 0;
                return trackWidth - window.innerWidth + trackPaddingLeft;
            };

            gsap.to(galleryTrack, {
                x: () => -getScrollAmount(),
                ease: "none",
                scrollTrigger: {
                    trigger: galleryPin,
                    start: "top top",
                    end: () => "+=" + getScrollAmount(),
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }

        // Parallax effect for editorial showcase images
        const parallaxImages = document.querySelectorAll('.parallax-img');
        if (parallaxImages.length > 0) {
            parallaxImages.forEach(img => {
                gsap.fromTo(img, 
                    { yPercent: -10 },
                    {
                        yPercent: 10,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.parentElement,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            });
        }

        // Process horizontal/vertical timeline animation
        const timelineContainer = document.querySelector('.timeline-horizontal-container');
        if (timelineContainer) {
            const fillLine = document.getElementById('timelineGoldFill');
            const steps = document.querySelectorAll('.timeline-horizontal-step');
            const isMobile = window.innerWidth <= 1024;
            
            const timelineTl = gsap.timeline({
                scrollTrigger: {
                    trigger: timelineContainer,
                    start: "top 75%",
                    end: "bottom 55%",
                    scrub: 0.8
                }
            });
            
            if (isMobile) {
                timelineTl.to(fillLine, { height: "100%", ease: "none" });
            } else {
                timelineTl.to(fillLine, { width: "100%", ease: "none" });
            }
            
            steps.forEach((step) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top 75%",
                    onEnter: () => {
                        step.classList.add('active');
                        step.classList.add('animated');
                    },
                    onLeaveBack: () => {
                        step.classList.remove('active');
                    }
                });
            });
        }

        // ==========================================================================
        // GLOBAL SCROLLTRIGGER REFRESH & LOAD SYNCHRONIZATION
        // ==========================================================================
        window.addEventListener('load', () => {
            // Trigger a refresh after all images and layouts are complete
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 500);
        });

        // Debounced resize handler for ScrollTrigger refresh
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        });
    }

    // ==========================================================================
    // 14. MULTI-STEP RELOCATION ESTIMATE CALCULATOR
    // ==========================================================================
    const form = document.getElementById('quoteCalculatorForm');
    if (form) {
        const steps = document.querySelectorAll('.wizard-panel');
        const stepIndicators = document.querySelectorAll('.step-indicator-node');
        const prevStepBtn = document.getElementById('stepPrevBtn');
        const nextStepBtn = document.getElementById('stepNextBtn');
        const successState = document.getElementById('modalSuccessState');

        let currentStep = 1;
        const totalSteps = steps.length;

        const serviceLabels = {
            'moving': 'White-Glove Moving Services',
            'landscaping': 'Landscape & Garden Design',
            'handyman': 'Handyman & Remodeling',
            'electrical': 'Electrical & Smart Home',
            'janitorial': 'Premium Janitorial Services'
        };

        const serviceTypeCheckboxes = document.querySelectorAll('input[name="serviceType"]');
        const movingSizeWrapper = document.getElementById('movingSizeWrapper');
        const step2Title = document.getElementById('step2Title');
        const pickupZipLabel = document.getElementById('pickupZipLabel');
        const deliveryZipWrapper = document.getElementById('deliveryZipWrapper');
        const deliveryZipInput = document.getElementById('deliveryZip');

        function updateStep2Fields() {
            const selectedCheckboxes = document.querySelectorAll('input[name="serviceType"]:checked');
            const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value);
            const isMoving = selectedValues.includes('moving');

            if (isMoving) {
                if (movingSizeWrapper) movingSizeWrapper.style.display = 'block';
                const sizeLabel = movingSizeWrapper.querySelector('label');
                if (sizeLabel) sizeLabel.textContent = 'Approximate Size of Your Space *';
                const sizeSelect = document.getElementById('spaceSize');
                if (sizeSelect) {
                    sizeSelect.innerHTML = `
                        <option value="studio">Studio Apartment</option>
                        <option value="1bed">1 Bedroom Residence</option>
                        <option value="2bed">2 Bedroom Residence</option>
                        <option value="3bed">3 Bedroom Residence</option>
                        <option value="4bedplus">4+ Bedroom Estate / Mansion</option>
                        <option value="office-small">Office (< 10 desks)</option>
                        <option value="office-large">Office (10+ desks)</option>
                    `;
                }
                if (step2Title) step2Title.textContent = 'Relocation Size & Routing';
                if (pickupZipLabel) pickupZipLabel.textContent = 'Origin Zip Code *';
                if (deliveryZipWrapper) deliveryZipWrapper.style.display = 'block';
                if (deliveryZipInput) deliveryZipInput.setAttribute('required', 'required');
            } else {
                if (movingSizeWrapper) {
                    if (selectedValues.length > 0) {
                        movingSizeWrapper.style.display = 'block';
                        const sizeLabel = movingSizeWrapper.querySelector('label');
                        if (sizeLabel) sizeLabel.textContent = 'Approximate Property/Space Size *';
                        const sizeSelect = document.getElementById('spaceSize');
                        if (sizeSelect) {
                            sizeSelect.innerHTML = `
                                <option value="under-1500">Under 1,500 sq ft</option>
                                <option value="1500-3000">1,500 - 3,000 sq ft</option>
                                <option value="3000-5000">3,000 - 5,000 sq ft</option>
                                <option value="5000-plus">5,000+ sq ft (Large Estate)</option>
                                <option value="commercial">Commercial Property</option>
                            `;
                        }
                    } else {
                        movingSizeWrapper.style.display = 'none';
                    }
                }
                if (step2Title) step2Title.textContent = 'Property Details & Location';
                if (pickupZipLabel) pickupZipLabel.textContent = 'Service Location Zip Code *';
                if (deliveryZipWrapper) deliveryZipWrapper.style.display = 'none';
                if (deliveryZipInput) {
                    deliveryZipInput.removeAttribute('required');
                    deliveryZipInput.classList.remove('invalid');
                }
            }
        }

        serviceTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateStep2Fields();
            });
        });

        // Trigger initial setup
        updateStep2Fields();

        function updateStepDisplay() {
            steps.forEach((step, idx) => {
                step.classList.toggle('active', (idx + 1) === currentStep);
            });

            stepIndicators.forEach((indicator, idx) => {
                indicator.classList.toggle('active', (idx + 1) <= currentStep);
            });

            if (prevStepBtn) prevStepBtn.disabled = currentStep === 1;

            if (nextStepBtn) {
                if (currentStep === totalSteps) {
                    nextStepBtn.textContent = 'Submit Inquiry';
                } else {
                    nextStepBtn.textContent = 'Continue';
                }
            }
        }

        function validateStep(stepNum) {
            const stepPanel = steps[stepNum - 1];
            if (!stepPanel) return true;

            let isValid = true;

            if (stepNum === 1) {
                const checkedCount = stepPanel.querySelectorAll('input[name="serviceType"]:checked').length;
                if (checkedCount === 0) {
                    isValid = false;
                    const warningLabel = stepPanel.querySelector('.form-group-block label');
                    if (warningLabel) {
                        warningLabel.style.color = '#d32f2f';
                        warningLabel.textContent = 'Please Select At Least One Property Division *';
                    }
                } else {
                    const warningLabel = stepPanel.querySelector('.form-group-block label');
                    if (warningLabel) {
                        warningLabel.style.color = '';
                        warningLabel.textContent = 'Select Your Required Property Division';
                    }
                }
            } else {
                const inputs = stepPanel.querySelectorAll('[required]');
                inputs.forEach(input => {
                    if (!input.checkValidity()) {
                        isValid = false;
                        input.classList.add('invalid');
                    } else {
                        input.classList.remove('invalid');
                    }
                });
            }

            return isValid;
        }

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    if (currentStep < totalSteps) {
                        currentStep++;
                        updateStepDisplay();
                    } else {
                        submitCalculatorForm();
                    }
                }
            });
        }

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateStepDisplay();
                }
            });
        }

        function submitCalculatorForm() {
            const formData = new FormData(form);
            const selectedCheckboxes = document.querySelectorAll('input[name="serviceType"]:checked');
            const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value);
            const isMoving = selectedValues.includes('moving');
            
            const selectedLabels = Array.from(selectedCheckboxes).map(cb => {
                const textSpan = cb.closest('.stepper-radio-label').querySelector('.stepper-radio-card span');
                return textSpan ? textSpan.textContent : cb.value;
            });

            const pickup = formData.get('pickupZip');
            const delivery = formData.get('deliveryZip') || 'N/A';
            const dateValue = formData.get('moveDate');

            const summaryMoveType = document.getElementById('summaryMoveType');
            const summaryRoute = document.getElementById('summaryRoute');
            const summaryDate = document.getElementById('summaryDate');

            if (summaryMoveType) summaryMoveType.textContent = selectedLabels.join(', ');
            if (summaryRoute) {
                if (isMoving) {
                    summaryRoute.textContent = `${pickup} → ${delivery}`;
                } else {
                    summaryRoute.textContent = `Location Zip: ${pickup}`;
                }
            }
            if (summaryDate) {
                try {
                    const formattedDate = new Date(dateValue).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    });
                    summaryDate.textContent = formattedDate;
                } catch (e) {
                    summaryDate.textContent = dateValue;
                }
            }

            // Construct WhatsApp Message
            let waMessage = `*New Property Inquiry*\n`;
            waMessage += `------------------------\n`;
            waMessage += `*Name:* ${formData.get('fullName')}\n`;
            waMessage += `*Phone:* ${formData.get('phone')}\n`;
            waMessage += `*Email:* ${formData.get('email')}\n\n`;
            waMessage += `*Services:* ${selectedLabels.join(', ')}\n`;
            
            const spaceSizeVal = formData.get('spaceSize');
            if (spaceSizeVal) {
                const spaceSizeSelect = document.getElementById('spaceSize');
                const spaceSizeText = spaceSizeSelect ? spaceSizeSelect.options[spaceSizeSelect.selectedIndex].text : spaceSizeVal;
                waMessage += `*Property Size:* ${spaceSizeText}\n`;
            }
            
            waMessage += `*Pickup/Service Zip:* ${pickup}\n`;
            if (isMoving) {
                waMessage += `*Delivery Zip:* ${delivery}\n`;
            }
            
            if (dateValue) {
                waMessage += `*Preferred Date:* ${dateValue}\n`;
            }
            
            const flexibilityVal = formData.get('moveFlexibility');
            if (flexibilityVal) {
                const flexSelect = document.getElementById('moveFlexibility');
                const flexText = flexSelect ? flexSelect.options[flexSelect.selectedIndex].text : flexibilityVal;
                waMessage += `*Date Flexibility:* ${flexText}\n`;
            }
            
            const specialNeedsVal = formData.get('specialNeeds');
            if (specialNeedsVal && specialNeedsVal.trim() !== '') {
                waMessage += `\n*Notes/Special Needs:*\n${specialNeedsVal}\n`;
            }

            const whatsappUrl = `https://api.whatsapp.com/send?phone=15107553772&text=${encodeURIComponent(waMessage)}`;
            
            // Open WhatsApp click-to-chat link in a new tab
            window.open(whatsappUrl, '_blank');

            form.style.display = 'none';
            const stepHeader = document.querySelector('.form-header-block');
            if (stepHeader) stepHeader.style.display = 'none';
            if (successState) successState.classList.add('active');
        }

        function resetModalForm() {
            form.reset();
            currentStep = 1;
            form.style.display = 'block';
            const stepHeader = document.querySelector('.form-header-block');
            if (stepHeader) stepHeader.style.display = 'flex';
            if (successState) successState.classList.remove('active');
            updateStep2Fields();
            updateStepDisplay();
        }

        const modalCloseFinishBtn = document.getElementById('modalCloseFinishBtn');
        if (modalCloseFinishBtn) {
            modalCloseFinishBtn.addEventListener('click', () => {
                resetModalForm();
                if (lenis) lenis.scrollTo(0);
            });
        }
    }

    // Connect open quote buttons to scroll/redirect to the form
    const openQuoteButtons = document.querySelectorAll('.open-quote-btn');
    openQuoteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = document.querySelector('#quote-section');
            if (target) {
                e.preventDefault();
                if (lenis) {
                    lenis.scrollTo(target);
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ==========================================================================
    // 15. BEFORE-AND-AFTER IMAGE COMPARISON SLIDERS (AUTOMATED TEASER + MANUAL)
    // ==========================================================================
    const sliders = document.querySelectorAll('.transformation-slider-container');
    if (sliders.length > 0) {
        sliders.forEach(slider => {
            const input = slider.querySelector('.slider-range-input');
            const afterImg = slider.querySelector('.slider-image-after');
            const handle = slider.querySelector('.slider-handle');
            
            if (input && afterImg && handle) {
                // Teaser sweep GSAP animation on scroll entry
                gsap.fromTo(afterImg, 
                    { width: "100%" },
                    {
                        width: "50%",
                        duration: 1.8,
                        ease: "power3.inOut",
                        scrollTrigger: {
                            trigger: slider,
                            start: "top 75%",
                            toggleActions: "play none none none"
                        },
                        onUpdate: function() {
                            const w = parseFloat(afterImg.style.width);
                            input.value = w;
                            handle.style.left = `${w}%`;
                        }
                    }
                );

                // Manual range input listener overrides
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    afterImg.style.width = `${value}%`;
                    handle.style.left = `${value}%`;
                });
            }
        });
    }

    // ==========================================================================
    // 16. FAQ ACCORDION INTERACTIVITY
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            if (trigger) {
                trigger.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    faqItems.forEach(i => i.classList.remove('active'));
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
});
