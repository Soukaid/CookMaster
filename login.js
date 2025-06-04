// Variables globales pour l'authentification
let isLoginMode = true
let passwordStrength = 0

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  initializeAuthToggle()
  initializePasswordToggles()
  initializePasswordStrength()
  initializeForms()
  initializeValidation()

  console.log("🔐 Système d'authentification initialisé")
})

// Gestion du toggle connexion/inscription
function initializeAuthToggle() {
  const loginToggle = document.getElementById("loginToggle")
  const signupToggle = document.getElementById("signupToggle")
  const toggleIndicator = document.getElementById("toggleIndicator")
  const loginForm = document.getElementById("loginForm")
  const signupForm = document.getElementById("signupForm")

  if (!loginToggle || !signupToggle) return

  loginToggle.addEventListener("click", () => {
    if (!isLoginMode) {
      switchToLogin()
    }
  })

  signupToggle.addEventListener("click", () => {
    if (isLoginMode) {
      switchToSignup()
    }
  })

  function switchToLogin() {
    isLoginMode = true

    // Mettre à jour les boutons
    loginToggle.classList.add("active")
    signupToggle.classList.remove("active")

    // Animer l'indicateur
    toggleIndicator.classList.remove("signup")

    // Changer les formulaires avec animation
    signupForm.style.opacity = "0"
    signupForm.style.transform = "translateX(20px)"

    setTimeout(() => {
      signupForm.classList.add("hidden")
      loginForm.classList.remove("hidden")
      loginForm.style.opacity = "0"
      loginForm.style.transform = "translateX(-20px)"

      setTimeout(() => {
        loginForm.style.opacity = "1"
        loginForm.style.transform = "translateX(0)"
      }, 50)
    }, 200)
  }

  function switchToSignup() {
    isLoginMode = false

    // Mettre à jour les boutons
    signupToggle.classList.add("active")
    loginToggle.classList.remove("active")

    // Animer l'indicateur
    toggleIndicator.classList.add("signup")

    // Changer les formulaires avec animation
    loginForm.style.opacity = "0"
    loginForm.style.transform = "translateX(-20px)"

    setTimeout(() => {
      loginForm.classList.add("hidden")
      signupForm.classList.remove("hidden")
      signupForm.style.opacity = "0"
      signupForm.style.transform = "translateX(20px)"

      setTimeout(() => {
        signupForm.style.opacity = "1"
        signupForm.style.transform = "translateX(0)"
      }, 50)
    }, 200)
  }
}

// Gestion des boutons de visibilité du mot de passe
function initializePasswordToggles() {
  const passwordToggles = document.querySelectorAll(".password-toggle")

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input")
      const icon = this.querySelector("i")

      if (input.type === "password") {
        input.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        input.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }

      // Animation du bouton
      this.style.transform = "scale(0.9)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })
}

// Indicateur de force du mot de passe
function initializePasswordStrength() {
  const passwordInput = document.getElementById("signupPassword")
  const strengthBar = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")

  if (!passwordInput || !strengthBar) return

  passwordInput.addEventListener("input", function () {
    const password = this.value
    const strength = calculatePasswordStrength(password)
    updatePasswordStrength(strength, strengthBar, strengthText)
  })
}

function calculatePasswordStrength(password) {
  let score = 0

  // Longueur
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Caractères
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  return Math.min(score, 4)
}

function updatePasswordStrength(strength, strengthBar, strengthText) {
  const levels = ["", "weak", "fair", "good", "strong"]
  const texts = {
    fr: ["", "Faible", "Moyen", "Bon", "Fort"],
    en: ["", "Weak", "Fair", "Good", "Strong"],
  }

  strengthBar.className = "strength-fill"
  if (strength > 0) {
    strengthBar.classList.add(levels[strength])
  }

  const currentLang = localStorage.getItem("cookmaster-language") || "fr"
  strengthText.textContent = texts[currentLang][strength] || ""

  passwordStrength = strength
}

// Validation des formulaires
function initializeValidation() {
  const inputs = document.querySelectorAll("input[required]")

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input))
    input.addEventListener("input", () => clearFieldError(input))
  })

  // Validation de confirmation de mot de passe
  const confirmPassword = document.getElementById("confirmPassword")
  const signupPassword = document.getElementById("signupPassword")

  if (confirmPassword && signupPassword) {
    confirmPassword.addEventListener("input", () => {
      validatePasswordMatch(signupPassword, confirmPassword)
    })
  }
}

function validateField(input) {
  const container = input.closest(".input-container")
  const value = input.value.trim()

  // Supprimer les messages d'erreur existants
  clearFieldError(input)

  // Validation selon le type
  let isValid = true
  let errorMessage = ""

  if (input.type === "email") {
    isValid = isValidEmail(value)
    errorMessage = getCurrentLanguage() === "fr" ? "Adresse email invalide" : "Invalid email address"
  } else if (input.type === "tel") {
    isValid = isValidPhone(value)
    errorMessage = getCurrentLanguage() === "fr" ? "Numéro de téléphone invalide" : "Invalid phone number"
  } else if (input.id === "signupPassword") {
    isValid = passwordStrength >= 2
    errorMessage = getCurrentLanguage() === "fr" ? "Mot de passe trop faible" : "Password too weak"
  } else if (input.required && !value) {
    isValid = false
    errorMessage = getCurrentLanguage() === "fr" ? "Ce champ est requis" : "This field is required"
  }

  if (!isValid) {
    showFieldError(container, errorMessage)
  } else {
    showFieldSuccess(container)
  }

  return isValid
}

function validatePasswordMatch(password, confirmPassword) {
  const container = confirmPassword.closest(".input-container")

  if (confirmPassword.value && password.value !== confirmPassword.value) {
    const errorMessage =
      getCurrentLanguage() === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match"
    showFieldError(container, errorMessage)
    return false
  } else if (confirmPassword.value) {
    showFieldSuccess(container)
    return true
  }

  return true
}

function showFieldError(container, message) {
  container.classList.remove("success")
  container.classList.add("error")

  // Supprimer le message existant
  const existingError = container.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }

  // Ajouter le nouveau message
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
  container.appendChild(errorDiv)
}

function showFieldSuccess(container) {
  container.classList.remove("error")
  container.classList.add("success")

  // Supprimer les messages d'erreur
  const existingError = container.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }
}

function clearFieldError(input) {
  const container = input.closest(".input-container")
  container.classList.remove("error", "success")

  const errorMessage = container.querySelector(".error-message")
  if (errorMessage) {
    errorMessage.remove()
  }
}

// Gestion des formulaires
function initializeForms() {
  const signupForm = document.getElementById("signupFormElement")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("signupEmail").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("signupPassword").value,
        newsletter: document.getElementById("newsletter").checked,
      }

      // Sauvegarder l'utilisateur
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Vérifier si l'email existe déjà
      if (users.some((user) => user.email === formData.email)) {
        showNotification("Cette adresse email est déjà utilisée", "error")
        return
      }

      // Ajouter le nouvel utilisateur
      users.push({
        ...formData,
        id: Date.now(),
        dateInscription: new Date().toISOString(),
        role: "client",
      })

      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(formData))

      showNotification("Inscription réussie !", "success")

      // Redirection après 1.5 secondes
      setTimeout(() => {
        window.location.href = "reservation.html"
      }, 1500)
    })
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value

      // Validation basique
      if (!email || !password) {
        showNotification("Veuillez remplir tous les champs", "error")
        return
      }

      // Vérifier les utilisateurs enregistrés
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        // Créer la session utilisateur avec le système d'authentification
        const sessionData = {
          isAuthenticated: true,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }

        // Utiliser le système d'authentification
        if (window.authSystem) {
          window.authSystem.login(sessionData)
        } else {
          localStorage.setItem("userSession", JSON.stringify(sessionData))
        }

        showNotification("Connexion réussie !", "success")

        setTimeout(() => {
          window.location.href = "index.html"
        }, 1500)
      } else {
        showNotification("Email ou mot de passe incorrect", "error")
      }
    })
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const userData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("registerEmail").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("registerPassword").value,
        confirmPassword: document.getElementById("confirmPassword").value,
      }

      // Validation
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        showNotification("Veuillez remplir tous les champs obligatoires", "error")
        return
      }

      if (userData.password !== userData.confirmPassword) {
        showNotification("Les mots de passe ne correspondent pas", "error")
        return
      }

      if (!isValidEmail(userData.email)) {
        showNotification("Adresse email invalide", "error")
        return
      }

      // Vérifier si l'email existe déjà
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      if (users.some((user) => user.email === userData.email)) {
        showNotification("Cet email est déjà utilisé", "error")
        return
      }

      // Ajouter l'utilisateur
      const newUser = {
        ...userData,
        id: Date.now(),
        dateInscription: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Connecter automatiquement l'utilisateur
      const sessionData = {
        isAuthenticated: true,
        userId: newUser.id,
        userName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      }

      if (window.authSystem) {
        window.authSystem.login(sessionData)
      } else {
        localStorage.setItem("userSession", JSON.stringify(sessionData))
      }

      showNotification("Inscription réussie !", "success")

      setTimeout(() => {
        window.location.href = "index.html"
      }, 1500)
    })
  }
}

// Fonction pour afficher les notifications
function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `

  const icon = type === "success" ? "✅" : "❌"
  notification.innerHTML = `<span>${icon}</span><span>${message}</span>`

  document.body.appendChild(notification)

  setTimeout(() => (notification.style.transform = "translateX(0)"), 100)
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Boutons sociaux
const socialButtons = document.querySelectorAll(".social-btn")
socialButtons.forEach((btn) => {
  btn.addEventListener("click", handleSocialLogin)
})

async function handleSocialLogin(e) {
  const provider = e.currentTarget.classList.contains("google-btn") ? "Google" : "Facebook"

  showNotification(
    getCurrentLanguage() === "fr" ? `Connexion avec ${provider} en cours...` : `Signing in with ${provider}...`,
    "info",
  )

  // Simulation de connexion sociale
  setTimeout(() => {
    showNotification(
      getCurrentLanguage() === "fr" ? "Fonctionnalité bientôt disponible" : "Feature coming soon",
      "info",
    )
  }, 1000)
}

// Utilitaires
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

function getCurrentLanguage() {
  return localStorage.getItem("cookmaster-language") || "fr"
}

function simulateApiCall(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulation d'un succès 90% du temps
      if (Math.random() > 0.1) {
        resolve()
      } else {
        reject(new Error("API Error"))
      }
    }, delay)
  })
}

// Gestion des erreurs globales
window.addEventListener("error", (e) => {
  console.error("Erreur d'authentification:", e.error)
})

// Auto-focus sur le premier champ
window.addEventListener("load", () => {
  const firstInput = document.querySelector(".auth-form input")
  if (firstInput) {
    setTimeout(() => {
      firstInput.focus()
    }, 500)
  }
})
