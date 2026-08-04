// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) {
        navMenu.classList.remove('active');
    }
});

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = {
            name: this.querySelector('input[type="text"]').value,
            email: this.querySelector('input[type="email"]').value,
            company: this.querySelectorAll('input[type="text"]')[1].value,
            service: this.querySelector('select').value,
            message: this.querySelector('textarea').value
        };
        
        // Log form data (in production, you'd send this to a server)
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thank you for reaching out! We will contact you soon.');
        
        // Reset form
        this.reset();
    });
}

// Smooth scroll for navigation links
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

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
const elements = document.querySelectorAll('.service-card, .portfolio-item, .guarantee-card, .process-step, .stat');
elements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Counter animation for stats
const stats = document.querySelectorAll('.stat h3');
const startCounter = () => {
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        if (!isNaN(target)) {
            let current = 0;
            const increment = Math.ceil(target / 50);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target + (stat.textContent.includes('+') ? '+' : stat.textContent.includes('%') ? '%' : '');
                    clearInterval(timer);
                } else {
                    stat.textContent = current + (stat.textContent.includes('+') ? '+' : stat.textContent.includes('%') ? '%' : '');
                }
            }, 30);
        }
    });
};

// Trigger counter when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
            startCounter();
            entry.target.dataset.counted = true;
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Carousel Functions
function showSlide(carouselId, index) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const images = carousel.querySelectorAll('.carousel-image');
    const indicators = carousel.querySelectorAll('.indicator');
    
    // Ensure index is within bounds
    if (index >= images.length) {
        index = 0;
    } else if (index < 0) {
        index = images.length - 1;
    }
    
    // Remove active class from all images and indicators
    images.forEach(img => img.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    // Add active class to current image and indicator
    images[index].classList.add('active');
    indicators[index].classList.add('active');
    
    // Store current index
    carousel.dataset.currentIndex = index;
}

function nextSlide(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const currentIndex = parseInt(carousel.dataset.currentIndex) || 0;
    showSlide(carouselId, currentIndex + 1);
}

function prevSlide(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const currentIndex = parseInt(carousel.dataset.currentIndex) || 0;
    showSlide(carouselId, currentIndex - 1);
}

function goToSlide(carouselId, index) {
    showSlide(carouselId, index);
}

// Initialize carousels
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-wrapper');
    carousels.forEach(carousel => {
        carousel.dataset.currentIndex = 0;
        showSlide(carousel.id, 0);
    });
});

console.log('Softwaresfast Website - Script loaded successfully');