    // Custom Cursor
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.cursor-dot');

if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    const hoverElements = document.querySelectorAll('a, button, .product-card, .service-card, .floating-device');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Header Scroll Effect
const header = document.querySelector('.main-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Navigation Active State
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Particles Animation
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    particlesContainer.appendChild(particle);
}

// Intersection Observer for Fade In Animations
const fadeElements = document.querySelectorAll('.fade-in-view');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

fadeElements.forEach(el => fadeObserver.observe(el));

// Animated Counters
const statNumbers = document.querySelectorAll('.stat-number');
let counted = false;

const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (target === 100 ? '%' : '+');
        }
    };

    updateCounter();
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
            statNumbers.forEach(stat => animateCounter(stat));
            counted = true;
        }
    });
});

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// Carousel Navigation
const carouselTrack = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let scrollAmount = 0;
const cardWidth = 400; // 400px + 20px gap

if (nextBtn && prevBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
        scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
        carouselTrack.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    prevBtn.addEventListener('click', () => {
        scrollAmount = Math.max(scrollAmount - cardWidth, 0);
        carouselTrack.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Drag to Scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        carouselTrack.style.cursor = 'grabbing';
        startX = e.pageX - carouselTrack.offsetLeft;
        scrollLeft = carouselTrack.scrollLeft;
    });

    carouselTrack.addEventListener('mouseleave', () => {
        isDown = false;
        carouselTrack.style.cursor = 'grab';
    });

    carouselTrack.addEventListener('mouseup', () => {
        isDown = false;
        carouselTrack.style.cursor = 'grab';
    });

    carouselTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselTrack.offsetLeft;
        const walk = (x - startX) * 2;
        carouselTrack.scrollLeft = scrollLeft - walk;
        scrollAmount = carouselTrack.scrollLeft;
    });

    // Touch Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next
            const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
            carouselTrack.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - prev
            scrollAmount = Math.max(scrollAmount - cardWidth, 0);
            carouselTrack.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }
}

// Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.submit-button');
        const originalHTML = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>Enviando...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<span>¡Mensaje Enviado!</span><i class="fas fa-check"></i>';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// Mobile Navigation
const mobileToggle = document.querySelector('.mobile-nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Parallax Effect for Hero Orbs
if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const orbs = document.querySelectorAll('.orb');
        orbs.forEach((orb, index) => {
            const speed = 0.3 + (index * 0.1);
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Product Card Tilt Effect (Desktop Only)
if (window.innerWidth > 768) {
    const productCards = document.querySelectorAll('.product-card, .floating-device');
    productCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Logo Animation Easter Egg
let logoClicks = 0;
const logo = document.querySelector('.logo-container');
if (logo) {
    logo.addEventListener('click', () => {
        logoClicks++;
        if (logoClicks === 5) {
            const symbols = document.querySelectorAll('.symbol-circle');
            symbols.forEach((symbol, i) => {
                setInterval(() => {
                    const colors = ['#0056b3', '#ffc107', '#dc3545'];
                    symbol.style.backgroundColor = colors[(i + 1) % 3];
                }, 500);
            });
            logoClicks = 0;
        }
    });
}

// Console Easter Egg
console.log('%c¡Bienvenido a Arglo Médica! ', 'background: linear-gradient(135deg, #1a4b8c 0%, #4a90e2 100%); color: #fff; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 8px;');
console.log('%cProtegiendo vidas desde 2010 🏥', 'color: #ffc107; font-size: 14px; font-weight: bold;');
console.log('%c¿Interesado en trabajar con nosotros? Visita nuestra sección de contacto!', 'color: #4a90e2; font-size: 12px;');

// Page Load Animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
        document.body.classList.add('animations-ready');
    }, 100);
});

// Performance optimization - Reduced motion support
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
    document.querySelectorAll('.orb, .particle, .floating-badge').forEach(el => {
        el.style.animation = 'none';
    });
}

// Intersection Observer for Service Cards Stagger Effect
const serviceCards = document.querySelectorAll('.service-card');
const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 150);
        }
    });
}, {
    threshold: 0.2
});

serviceCards.forEach(card => servicesObserver.observe(card));

// Form validation enhancement
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
formInputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.classList.add('error');
    });

    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Keyboard navigation for carousel
if (carouselTrack) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && prevBtn) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && nextBtn) {
            nextBtn.click();
        }
    });
}

// Enhanced scroll performance
let ticking = false;
let lastKnownScrollPosition = 0;

// const handleScroll = (scrollPos) => {
//     if (window.innerWidth > 768) {
//         const heroSection = document.querySelector('.hero-section');
//         if (heroSection) {
//             const opacity = Math.max(0, 1 - scrollPos / 600);
//             heroSection.style.opacity = opacity;
//         }
//     }
// };

window.addEventListener('scroll', () => {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll(lastKnownScrollPosition);
            ticking = false;
        });
        ticking = true;
    }
});

// Accessibility improvements
document.querySelectorAll('a, button').forEach(element => {
    if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
        element.setAttribute('aria-label', 'Navigation button');
    }
});

// Network status detection
window.addEventListener('online', () => {
    console.log('Back online');
});

window.addEventListener('offline', () => {
    console.log('No internet connection');
});

// Dynamic year in footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace('2025', currentYear);
}

// Optional: Scroll to top button
const createScrollToTop = () => {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--gradient);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    `;

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
};

// Uncomment to enable scroll to top button
// createScrollToTop();

// Analytics tracking placeholder
const trackEvent = (category, action, label) => {
    console.log('Event:', category, action, label);
    // Implement your analytics tracking here (Google Analytics, etc.)
};

// Track button clicks
document.querySelectorAll('.cta-button, .product-cta').forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('Button', 'Click', button.textContent.trim());
    });
});

// Track form submission
if (contactForm) {
    contactForm.addEventListener('submit', () => {
        trackEvent('Form', 'Submit', 'Contact Form');
    });
}

// Print styling adjustment
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// Initialize all features on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Arglo Médica - Website Loaded Successfully! 🎉');
});
