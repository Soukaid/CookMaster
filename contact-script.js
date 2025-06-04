// Variables globales
let currentLanguage = "fr"
let currentTheme = "light"

// Initialisation de la page de contact
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser les systèmes de base (réutilisés de carousel.js)
  initializeLanguageSelector()
  initializeThemeToggle()
  initializeAuthSystem()
  initializeMobileMenu()
  initializeScrollEffects()

  // Fonctionnalités spécifiques à la page de contact
  initializeContactForm()
  initializeFAQ()
  initializeCartCounter()

  // Charger les préférences
  loadUserPreferences()

  // Initialiser la carte si l'élément existe
  if (document.getElementById("map")) {
    initializeMap()
  }

  console.log("📞 Page de contact CookMaster initialisée")
})

// Système d'authentification (copié de carousel.js)
function initializeAuthSystem() {
  checkUserSession()

  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }
}

function checkUserSession() {
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")
  const authButton = document.getElementById("authButton")
  const userProfile = document.getElementById("userProfile")
  const userName = document.getElementById("userName")

  if (userSession.isAuthenticated && authButton && userProfile) {
    authButton.style.display = "none"
    userProfile.style.display = "flex"
    if (userName) {
      userName.textContent = userSession.userName || "Utilisateur"
    }
  } else {
    if (authButton) authButton.style.display = "flex"
    if (userProfile) userProfile.style.display = "none"
  }
}

function handleLogout() {
  localStorage.removeItem("userSession")
  showNotification(currentLanguage === "fr" ? "Déconnexion réussie" : "Successfully logged out", "success")
  checkUserSession()
}

// Gestion du sélecteur de langue (copié de carousel.js)
function initializeLanguageSelector() {
  const langBtn = document.getElementById("langBtn")
  const langDropdown = document.getElementById("langDropdown")
  const langOptions = document.querySelectorAll(".lang-option")

  if (!langBtn || !langDropdown) return

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    langDropdown.classList.toggle("active")
  })

  document.addEventListener("click", () => {
    langDropdown.classList.remove("active")
  })

  langOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation()
      const selectedLang = option.getAttribute("data-lang")
      changeLanguage(selectedLang)
      langDropdown.classList.remove("active")
    })
  })
}

function changeLanguage(lang) {
  currentLanguage = lang

  const currentLangSpan = document.getElementById("currentLang")
  if (currentLangSpan) {
    currentLangSpan.textContent = lang.toUpperCase()
  }

  // Mettre à jour tous les textes
  const elementsWithLang = document.querySelectorAll("[data-fr][data-en]")
  elementsWithLang.forEach((element) => {
    const text = element.getAttribute(`data-${lang}`)
    if (text) {
      if (element.tagName === "INPUT") {
        element.placeholder = text
      } else {
        element.innerHTML = text
      }
    }
  })

  // Mettre à jour les placeholders
  const inputsWithLang = document.querySelectorAll("[data-fr-placeholder][data-en-placeholder]")
  inputsWithLang.forEach((input) => {
    const placeholder = input.getAttribute(`data-${lang}-placeholder`)
    if (placeholder) {
      input.placeholder = placeholder
    }
  })

  // Mettre à jour les options de select
  const selectOptions = document.querySelectorAll("option[data-fr][data-en]")
  selectOptions.forEach((option) => {
    const text = option.getAttribute(`data-${lang}`)
    if (text) {
      option.textContent = text
    }
  })

  localStorage.setItem("cookmaster-language", lang)

  document.body.style.opacity = "0.8"
  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 200)
}

// Gestion du mode nuit/jour (copié de carousel.js)
function initializeThemeToggle() {
  const themeToggle = document.getElementById("themeToggle")
  const themeIcon = document.getElementById("themeIcon")

  if (!themeToggle || !themeIcon) return

  themeToggle.addEventListener("click", () => {
    toggleTheme()
  })
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", currentTheme)

  const themeIcon = document.getElementById("themeIcon")
  if (themeIcon) {
    themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun"
  }

  document.body.style.transition = "all 0.3s ease"
  localStorage.setItem("cookmaster-theme", currentTheme)
}

// Menu mobile (copié de carousel.js)
function initializeMobileMenu() {
  const mobileToggle = document.getElementById("mobileMenuToggle")
  const navMenu = document.querySelector(".nav-menu")

  if (!mobileToggle || !navMenu) return

  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")
    mobileToggle.classList.toggle("active")

    const spans = mobileToggle.querySelectorAll("span")
    spans.forEach((span, index) => {
      if (mobileToggle.classList.contains("active")) {
        if (index === 0) span.style.transform = "rotate(45deg) translate(5px, 5px)"
        if (index === 1) span.style.opacity = "0"
        if (index === 2) span.style.transform = "rotate(-45deg) translate(7px, -6px)"
      } else {
        span.style.transform = "none"
        span.style.opacity = "1"
      }
    })
  })

  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
      mobileToggle.classList.remove("active")
    })
  })
}

// Effets de scroll (copié de carousel.js)
function initializeScrollEffects() {
  const nav = document.querySelector(".main-nav")
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY

    if (nav) {
      if (currentScrollY > 100) {
        nav.classList.add("scrolled")
      } else {
        nav.classList.remove("scrolled")
      }

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        nav.style.transform = "translateY(-100%)"
      } else {
        nav.style.transform = "translateY(0)"
      }
    }

    lastScrollY = currentScrollY
  })
}

// Compteur de panier
function initializeCartCounter() {
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cookmaster-cart") || "[]")
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const cartCount = document.getElementById("cartCount")
    if (cartCount) {
      cartCount.textContent = totalItems
    }
  }

  updateCartCount()
  setInterval(updateCartCount, 1000)
}

// Formulaire de contact
function initializeContactForm() {
  const contactForm = document.getElementById("contactForm")

  if (!contactForm) return

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validation des champs
    let isValid = true
    const requiredFields = ["firstName", "lastName", "email", "subject", "message"]

    requiredFields.forEach((field) => {
      const fieldElement = document.getElementById(field)
      const value = fieldElement.value.trim()

      if (!value) {
        showFieldError(fieldElement, currentLanguage === "fr" ? "Ce champ est requis" : "This field is required")
        isValid = false
      } else {
        clearFieldError(fieldElement)
      }
    })

    // Validation email
    const email = document.getElementById("email").value.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      showFieldError(
        document.getElementById("email"),
        currentLanguage === "fr" ? "Veuillez entrer un email valide" : "Please enter a valid email",
      )
      isValid = false
    }

    // Validation téléphone (optionnel mais format)
    const phone = document.getElementById("phone").value.trim()
    const phoneRegex = /^[\d\s\-+()]+$/
    if (phone && !phoneRegex.test(phone)) {
      showFieldError(
        document.getElementById("phone"),
        currentLanguage === "fr" ? "Format de téléphone invalide" : "Invalid phone format",
      )
      isValid = false
    }

    if (isValid) {
      submitForm()
    }
  })

  // Compteur de caractères pour le message
  const messageField = document.getElementById("message")
  if (messageField) {
    messageField.addEventListener("input", function () {
      const maxLength = 1000
      const currentLength = this.value.length

      let counter = this.parentNode.querySelector(".char-counter")
      if (!counter) {
        counter = document.createElement("div")
        counter.className = "char-counter"
        this.parentNode.appendChild(counter)
      }

      counter.textContent = `${currentLength}/${maxLength} ${currentLanguage === "fr" ? "caractères" : "characters"}`

      if (currentLength > maxLength * 0.9) {
        counter.style.color = "#e74c3c"
      } else {
        counter.style.color = "var(--text-color)"
      }
    })

    // Auto-resize du textarea
    messageField.addEventListener("input", function () {
      this.style.height = "auto"
      this.style.height = this.scrollHeight + "px"
    })
  }
}

// Initialisation de la carte Leaflet (à ajouter dans initializeContactForm)
function initializeMap() {
  // Coordonnées de Casablanca, Maârif
  const lat = 33.5731
  const lng = -7.6177

  // Créer la carte
  const map = L.map("map").setView([lat, lng], 15)

  // Ajouter les tuiles OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map)

  // Ajouter un marqueur
  const marker = L.marker([lat, lng]).addTo(map)

  // Popup avec informations
  marker
    .bindPopup(`
        <div style="text-align: center;">
            <strong>CookMaster</strong><br>
            65, Rue Ibnou Nafii<br>
            Maârif, Casablanca 20330<br>
            Maroc
        </div>
    `)
    .openPopup()

  // Style personnalisé pour le popup
  const popupOptions = {
    maxWidth: 200,
    className: "custom-popup",
  }

  marker.bindPopup(marker.getPopup().getContent(), popupOptions)
}

function showFieldError(field, message) {
  field.classList.add("error")
  field.parentNode.querySelector(".error-message")?.remove()

  const errorElement = document.createElement("span")
  errorElement.className = "error-message"
  errorElement.textContent = message
  field.parentNode.appendChild(errorElement)
}

function clearFieldError(field) {
  field.classList.remove("error")
  field.parentNode.querySelector(".error-message")?.remove()
}

function submitForm() {
  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
    newsletter: document.getElementById("newsletter").checked,
    timestamp: new Date().toISOString(),
  }

  const submitBtn = document.querySelector(".submit-btn")
  const originalText = submitBtn.innerHTML

  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${currentLanguage === "fr" ? "Envoi en cours..." : "Sending..."}`
  submitBtn.disabled = true

  setTimeout(() => {
    saveMessage(formData)
    document.getElementById("contactForm").reset()

    submitBtn.innerHTML = originalText
    submitBtn.disabled = false

    showSuccessModal()
    notifyAdmin(formData)
  }, 2000)
}

function saveMessage(formData) {
  const messages = JSON.parse(localStorage.getItem("cookmaster-messages") || "[]")
  messages.unshift({
    id: Date.now(),
    ...formData,
    status: "nouveau",
    read: false,
  })
  localStorage.setItem("cookmaster-messages", JSON.stringify(messages))
}

function notifyAdmin(formData) {
  const notifications = JSON.parse(localStorage.getItem("cookmaster-admin-notifications") || "[]")
  notifications.unshift({
    id: Date.now(),
    type: "message",
    title: "Nouveau message de contact",
    message: `${formData.firstName} ${formData.lastName} a envoyé un message`,
    timestamp: new Date().toISOString(),
    read: false,
  })
  localStorage.setItem("cookmaster-admin-notifications", JSON.stringify(notifications))
}

function showSuccessModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.style.display = "block"
  }
}

window.closeModal = () => {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.style.display = "none"
  }
}

// FAQ Accordion
function initializeFAQ() {
  const faqQuestions = document.querySelectorAll(".faq-question")

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.parentNode
      const answer = faqItem.querySelector(".faq-answer")

      if (faqItem.classList.contains("active")) {
        faqItem.classList.remove("active")
      } else {
        // Fermer tous les autres FAQ
        document.querySelectorAll(".faq-item.active").forEach((item) => {
          item.classList.remove("active")
        })
        faqItem.classList.add("active")
      }
    })
  })
}

// Système de notifications (copié de carousel.js)
function showNotification(message, type = "info", duration = 4000) {
  let notificationContainer = document.getElementById("notifications")
  if (!notificationContainer) {
    notificationContainer = document.createElement("div")
    notificationContainer.id = "notifications"
    notificationContainer.className = "notifications-container"
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `
    document.body.appendChild(notificationContainer)
  }

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
    background: ${type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#3498db"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `

  const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-triangle" : "info-circle"

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    </div>
  `

  notificationContainer.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  if (duration > 0) {
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, duration)
  }
}

// Charger les préférences utilisateur (copié de carousel.js)
function loadUserPreferences() {
  const savedLanguage = localStorage.getItem("cookmaster-language")
  if (savedLanguage && savedLanguage !== currentLanguage) {
    changeLanguage(savedLanguage)
  }

  const savedTheme = localStorage.getItem("cookmaster-theme")
  if (savedTheme && savedTheme !== currentTheme) {
    currentTheme = savedTheme
    document.documentElement.setAttribute("data-theme", currentTheme)

    const themeIcon = document.getElementById("themeIcon")
    if (themeIcon) {
      themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun"
    }
  }
}

// Fermeture du modal en cliquant à l'extérieur
window.addEventListener("click", (e) => {
  const modal = document.getElementById("successModal")
  if (e.target === modal) {
    closeModal()
  }
})

// Gestion des touches clavier pour le modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("successModal")
    if (modal && modal.style.display === "block") {
      closeModal()
    }
  }
})

// Smooth scroll pour les ancres
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Gestion des erreurs
window.addEventListener("error", (e) => {
  console.error("Erreur page contact:", e.error)
})

// Performance monitoring
window.addEventListener("load", () => {
  const loadTime = performance.now()
  console.log(`📞 Page de contact chargée en ${Math.round(loadTime)}ms`)
})

// Styles CSS additionnels pour les erreurs et animations
const additionalStyles = `
<style>
.form-group.focused .form-icon {
    color: #e74c3c !important;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
    border-color: #e74c3c !important;
    background-color: #fdf2f2 !important;
}

.error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: block;
}

.char-counter {
    font-size: 0.8rem;
    color: #7f8c8d;
    text-align: right;
    margin-top: 0.25rem;
}

.animate-in {
    animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.map-placeholder {
    transition: transform 0.3s ease;
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.submit-btn:disabled:hover {
    transform: none;
    box-shadow: none;
}
</style>
`

document.querySelector("head").insertAdjacentHTML("beforeend", additionalStyles)
