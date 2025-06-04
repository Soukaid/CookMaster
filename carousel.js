// Variables globales
let currentLanguage = "fr"
let currentTheme = "light"
let currentSlide = 0
const totalSlides = 5

// Initialisation de l'application
document.addEventListener("DOMContentLoaded", () => {
  initializeLanguageSelector()
  initializeThemeToggle()
  initializeCarousel()
  initializeMobileMenu()
  initializeScrollEffects()
  initializeNewsletterForm()
  initializeAuthSystem()

  // Charger les préférences sauvegardées
  loadUserPreferences()

  console.log("🍳 CookMaster initialisé avec succès !")
})

// Gestion du système d'authentification
function initializeAuthSystem() {
  checkUserSession()

  // Gestion de la déconnexion
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
    // Utilisateur connecté - afficher le profil
    authButton.style.display = "none"
    userProfile.style.display = "flex"

    if (userName) {
      userName.textContent = userSession.userName || "Utilisateur"
    }
  } else {
    // Utilisateur non connecté - afficher le bouton de connexion
    if (authButton) authButton.style.display = "flex"
    if (userProfile) userProfile.style.display = "none"
  }
}

function handleLogout() {
  // Supprimer la session
  localStorage.removeItem("userSession")

  // Afficher une notification
  showNotification(currentLanguage === "fr" ? "Déconnexion réussie" : "Successfully logged out", "success")

  // Mettre à jour l'interface
  checkUserSession()

  // Rediriger vers l'accueil si on est sur une page protégée
  if (window.location.pathname.includes("admin") || window.location.pathname.includes("profile")) {
    window.location.href = "index.html"
  }
}

// Gestion du sélecteur de langue
function initializeLanguageSelector() {
  const langBtn = document.getElementById("langBtn")
  const langDropdown = document.getElementById("langDropdown")
  const langOptions = document.querySelectorAll(".lang-option")

  if (!langBtn || !langDropdown) return

  // Toggle dropdown
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    langDropdown.classList.toggle("active")
  })

  // Fermer dropdown en cliquant ailleurs
  document.addEventListener("click", () => {
    langDropdown.classList.remove("active")
  })

  // Sélection de langue
  langOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation()
      const selectedLang = option.getAttribute("data-lang")
      changeLanguage(selectedLang)
      langDropdown.classList.remove("active")
    })
  })
}

// Changement de langue
function changeLanguage(lang) {
  currentLanguage = lang

  // Mettre à jour le bouton de langue
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

  // Sauvegarder la préférence
  localStorage.setItem("cookmaster-language", lang)

  // Déclencher un événement personnalisé
  const event = new CustomEvent("languageChanged", {
    detail: { language: lang },
  })
  document.dispatchEvent(event)

  // Animation de changement
  document.body.style.opacity = "0.8"
  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 200)
}

// Gestion du mode nuit/jour
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

  // Appliquer le thème
  document.documentElement.setAttribute("data-theme", currentTheme)

  // Mettre à jour l'icône
  const themeIcon = document.getElementById("themeIcon")
  if (themeIcon) {
    themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun"
  }

  // Animation de transition
  document.body.style.transition = "all 0.3s ease"

  // Sauvegarder la préférence
  localStorage.setItem("cookmaster-theme", currentTheme)
}

// Gestion du carousel
function initializeCarousel() {
  const carouselTrack = document.getElementById("carouselTrack")
  const prevBtn = document.getElementById("carouselPrev")
  const nextBtn = document.getElementById("carouselNext")
  const indicatorsContainer = document.getElementById("carouselIndicators")

  if (!carouselTrack) return

  // Créer les indicateurs
  createCarouselIndicators()

  // Événements des boutons
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      previousSlide()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide()
    })
  }

  // Auto-play du carousel
  setInterval(() => {
    nextSlide()
  }, 5000)

  // Gestion tactile pour mobile
  let startX = 0
  let endX = 0

  carouselTrack.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX
  })

  carouselTrack.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX
    handleSwipe()
  })

  function handleSwipe() {
    const threshold = 50
    const diff = startX - endX

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide()
      } else {
        previousSlide()
      }
    }
  }
}

function createCarouselIndicators() {
  const indicatorsContainer = document.getElementById("carouselIndicators")
  if (!indicatorsContainer) return

  indicatorsContainer.innerHTML = ""

  for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement("div")
    indicator.className = `indicator ${i === 0 ? "active" : ""}`
    indicator.addEventListener("click", () => goToSlide(i))
    indicatorsContainer.appendChild(indicator)
  }
}

function updateCarousel() {
  const carouselTrack = document.getElementById("carouselTrack")
  const indicators = document.querySelectorAll(".indicator")

  if (carouselTrack) {
    const slideWidth = 320 // 300px + 20px gap
    carouselTrack.style.transform = `translateX(-${currentSlide * slideWidth}px)`
  }

  // Mettre à jour les indicateurs
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentSlide)
  })
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides
  updateCarousel()
}

function previousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides
  updateCarousel()
}

function goToSlide(index) {
  currentSlide = index
  updateCarousel()
}

// Menu mobile
function initializeMobileMenu() {
  const mobileToggle = document.getElementById("mobileMenuToggle")
  const navMenu = document.querySelector(".nav-menu")

  if (!mobileToggle || !navMenu) return

  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")
    mobileToggle.classList.toggle("active")

    // Animation des barres du hamburger
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

  // Fermer le menu en cliquant sur un lien
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
      mobileToggle.classList.remove("active")
    })
  })
}

// Effets de scroll
function initializeScrollEffects() {
  // Navigation sticky
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

      // Masquer/afficher la navigation selon le sens du scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        nav.style.transform = "translateY(-100%)"
      } else {
        nav.style.transform = "translateY(0)"
      }
    }

    lastScrollY = currentScrollY
  })

  // Intersection Observer pour les animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observer les sections
  const sections = document.querySelectorAll(".cuisine-section, .special-dishes, .testimonials")
  sections.forEach((section) => {
    observer.observe(section)
  })
}

// Formulaire newsletter
function initializeNewsletterForm() {
  const newsletterForm = document.querySelector(".newsletter-form")

  if (!newsletterForm) return

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const emailInput = newsletterForm.querySelector('input[type="email"]')
    const email = emailInput.value.trim()

    if (email && isValidEmail(email)) {
      // Simulation d'envoi
      showNotification(
        currentLanguage === "fr" ? "Merci pour votre inscription !" : "Thank you for subscribing!",
        "success",
      )
      emailInput.value = ""
    } else {
      showNotification(
        currentLanguage === "fr" ? "Veuillez entrer une adresse email valide." : "Please enter a valid email address.",
        "error",
      )
    }
  })
}

// Validation email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Système de notifications
function showNotification(message, type = "info", duration = 4000) {
  // Créer le conteneur s'il n'existe pas
  let notificationContainer = document.getElementById("notifications")
  if (!notificationContainer) {
    notificationContainer = document.createElement("div")
    notificationContainer.id = "notifications"
    notificationContainer.className = "notifications-container"
    document.body.appendChild(notificationContainer)
  }

  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
        ? "exclamation-triangle"
        : type === "warning"
          ? "exclamation-circle"
          : "info-circle"

  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <div class="notification-text">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `

  notificationContainer.appendChild(notification)

  // Gestion de la fermeture
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => {
    removeNotification(notification)
  })

  // Animation d'entrée
  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  // Suppression automatique
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification)
    }, duration)
  }
}

function removeNotification(notification) {
  notification.classList.add("hide")
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 300)
}

// Charger les préférences utilisateur
function loadUserPreferences() {
  // Charger la langue
  const savedLanguage = localStorage.getItem("cookmaster-language")
  if (savedLanguage && savedLanguage !== currentLanguage) {
    changeLanguage(savedLanguage)
  }

  // Charger le thème
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

// Navigation fluide
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]')

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      const targetId = link.getAttribute("href")
      const targetSection = document.querySelector(targetId)

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80 // Compensation pour la nav fixe

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        })
      }
    })
  })
}

// Gestion des erreurs
window.addEventListener("error", (e) => {
  console.error("Erreur CookMaster:", e.error)
})

// Performance monitoring
window.addEventListener("load", () => {
  const loadTime = performance.now()
  console.log(`🚀 CookMaster chargé en ${Math.round(loadTime)}ms`)
})
