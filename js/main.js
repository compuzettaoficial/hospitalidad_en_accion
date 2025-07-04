// main.js - Lógica principal de la aplicación
// Hospitalidad en Acción - © Néstor Manrique

// Configuración global
const CONFIG = {
    colors: {
        primary: '#6b4b9a',
        secondary: '#e8e5f0',
        accent: '#7c3aed'
    },
    animations: {
        duration: 300,
        easing: 'ease-out'
    }
};

// Estado global de la aplicación
let appState = {
    currentUser: null,
    events: [],
    currentEvent: null,
    isLoading: false
};

// Utilidades generales
class Utils {
    static formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/Lima'
        };
        return new Date(date).toLocaleDateString('es-PE', options);
    }

    static formatDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start.getMonth() === end.getMonth()) {
            return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`;
        } else {
            return `${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}`;
        }
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    static showLoader(show = true) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
        appState.isLoading = show;
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '').trim();
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^(\+51|51)?[9]\d{8}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    static generateWhatsAppLink(phone, message) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }
}

// Gestión de modales
class ModalManager {
    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Agregar listener para cerrar con escape
            document.addEventListener('keydown', this.handleEscapeKey);
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Remover listener de escape
            document.removeEventListener('keydown', this.handleEscapeKey);
        }
    }

    static handleEscapeKey(event) {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }
    }

    static closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
}

// Animaciones y efectos visuales
class AnimationManager {
    static initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    static createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
            particlesContainer.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 10000);
        };

        // Crear partículas periódicamente
        setInterval(createParticle, 1000);
    }

    static initCardHoverEffects() {
        document.querySelectorAll('.event-card, .hotel-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
            });
        });
    }
}

// Gestión de navegación
class NavigationManager {
    static init() {
        // Smooth scrolling para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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

        // Actualizar estado del header al hacer scroll
        window.addEventListener('scroll', this.handleScroll);
    }

    static handleScroll() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    static goToPage(page) {
        window.location.href = page;
    }

    static goToEventDetail(eventId) {
        window.location.href = `event-detail.html?id=${eventId}`;
    }

    static goBack() {
        window.history.back();
    }
}

// Formularios y validación
class FormManager {
    static validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Este campo es obligatorio');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    static showFieldError(field, message) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'field-error';
            error.textContent = message;
            field.parentNode.appendChild(error);
        }
        field.classList.add('error');
    }

    static clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }

    static clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll('.field-error').forEach(error => error.remove());
            form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
        }
    }
}

// Gestión de estado del usuario
class UserManager {
    static setCurrentUser(user) {
        appState.currentUser = user;
        this.updateUI();
    }

    static getCurrentUser() {
        return appState.currentUser;
    }

    static updateUI() {
        const user = appState.currentUser;
        const userElements = document.querySelectorAll('.user-info');
        
        userElements.forEach(element => {
            if (user) {
                element.innerHTML = `
                    <span>Hola, ${user.nombre || user.email}</span>
                    <button onclick="UserManager.logout()">Cerrar Sesión</button>
                `;
            } else {
                element.innerHTML = `
                    <a href="login.html">Iniciar Sesión</a>
                    <a href="register.html">Registrarse</a>
                `;
            }
        });
    }

    static async logout() {
        try {
            await Auth.signOut();
            appState.currentUser = null;
            this.updateUI();
            Utils.showNotification('Sesión cerrada exitosamente', 'success');
            window.location.href = 'index.html';
        } catch (error) {
            Utils.showNotification('Error al cerrar sesión', 'error');
        }
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    NavigationManager.init();
    AnimationManager.initScrollAnimations();
    AnimationManager.createParticles();
    AnimationManager.initCardHoverEffects();

    // Verificar autenticación
    if (typeof Auth !== 'undefined') {
        Auth.onAuthStateChanged((user) => {
            UserManager.setCurrentUser(user);
        });
    }

    // Cargar eventos si estamos en la página principal
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (typeof EventsManager !== 'undefined') {
            EventsManager.loadEvents();
        }
    }

    // Cargar detalle de evento si estamos en event-detail.html
    if (window.location.pathname.includes('event-detail.html')) {
        if (typeof EventDetailManager !== 'undefined') {
            EventDetailManager.init();
        }
    }

    // Inicializar formularios si estamos en páginas de autenticación
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        if (typeof Auth !== 'undefined') {
            Auth.initForms();
        }
    }

    // Inicializar perfil si estamos en profile.html
    if (window.location.pathname.includes('profile.html')) {
        if (typeof ProfileManager !== 'undefined') {
            ProfileManager.init();
        }
    }

    // Event listeners globales
    document.addEventListener('click', function(e) {
        // Cerrar modales al hacer clic fuera
        if (e.target.classList.contains('modal')) {
            ModalManager.closeModal(e.target.id);
        }
        
        // Cerrar dropdowns al hacer clic fuera
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Listener para redimensionar ventana
    window.addEventListener('resize', function() {
        // Ajustar elementos responsivos si es necesario
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
    });

    // Agregar estilos CSS dinámicos
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .field-error {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .error {
            border-color: #ef4444 !important;
        }
        
        .scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(15px);
        }
        
        .mobile .nav-links {
            display: none;
        }
        
        .mobile .hero h1 {
            font-size: 2rem;
        }
        
        .mobile .events-grid {
            grid-template-columns: 1fr;
        }
    `;
    document.head.appendChild(style);

    console.log('Hospitalidad en Acción - Aplicación inicializada');
});

// Exponer funciones globales necesarias
window.Utils = Utils;
window.ModalManager = ModalManager;
window.NavigationManager = NavigationManager;
window.FormManager = FormManager;
window.UserManager = UserManager;
window.AnimationManager = AnimationManager;
window.appState = appState;
