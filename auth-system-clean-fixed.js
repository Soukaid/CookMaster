// Système d'authentification corrigé pour CookMaster
let currentUser = null
let isAuthenticated = false

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔐 Initialisation du système d'authentification")
  initializeAuth()
  setupEventListeners()
})

function initializeAuth() {
  // Vérifier la session existante
  checkExistingSession()

  // Mettre à jour l'interface
  updateAuthUI()

  console.log("✅ Système d'authentification initialisé")
}

function checkExistingSession() {
  // Vérifier dans localStorage et sessionStorage
  const localSession = localStorage.getItem("userSession")
  const sessionSession = sessionStorage.getItem("userSession")

  let userSession = null

  if (localSession) {
    try {
      userSession = JSON.parse(localSession)
      console.log("📱 Session trouvée dans localStorage:", userSession)
    } catch (error) {
      console.error("❌ Erreur parsing localStorage:", error)
      localStorage.removeItem("userSession")
    }
  } else if (sessionSession) {
    try {
      userSession = JSON.parse(sessionSession)
      console.log("🔄 Session trouvée dans sessionStorage:", userSession)
    } catch (error) {
      console.error("❌ Erreur parsing sessionStorage:", error)
      sessionStorage.removeItem("userSession")
    }
  }

  if (userSession && userSession.isAuthenticated) {
    currentUser = userSession
    isAuthenticated = true
    console.log("✅ Utilisateur connecté:", currentUser.username || currentUser.email)
  } else {
    currentUser = null
    isAuthenticated = false
    console.log("❌ Aucune session valide trouvée")
  }
}

function setupEventListeners() {
  // Gestion du dropdown utilisateur
  const userToggle = document.getElementById("userToggle")
  const userMenu = document.getElementById("userMenu")
  const userDropdown = document.querySelector(".user-dropdown")

  if (userToggle && userMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation()
      toggleUserMenu()
    })

    // Fermer le menu en cliquant ailleurs
    document.addEventListener("click", (e) => {
      if (!userDropdown?.contains(e.target)) {
        closeUserMenu()
      }
    })
  }

  // Gestion de la déconnexion
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleLogout()
    })
  }

  // Gestion du formulaire de connexion (si présent)
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Gestion du formulaire d'inscription (si présent)
  const signupForm = document.getElementById("signupForm")
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup)
  }
}

function toggleUserMenu() {
  const userMenu = document.getElementById("userMenu")
  const userDropdown = document.querySelector(".user-dropdown")

  if (userMenu && userDropdown) {
    const isActive = userDropdown.classList.contains("active")

    if (isActive) {
      closeUserMenu()
    } else {
      openUserMenu()
    }
  }
}

function openUserMenu() {
  const userMenu = document.getElementById("userMenu")
  const userDropdown = document.querySelector(".user-dropdown")

  if (userMenu && userDropdown) {
    userDropdown.classList.add("active")
    userMenu.classList.add("active")
  }
}

function closeUserMenu() {
  const userMenu = document.getElementById("userMenu")
  const userDropdown = document.querySelector(".user-dropdown")

  if (userMenu && userDropdown) {
    userDropdown.classList.remove("active")
    userMenu.classList.remove("active")
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const email = formData.get("email")?.trim()
  const password = formData.get("password")?.trim()
  const rememberMe = formData.get("rememberMe") === "on"

  console.log("🔑 Tentative de connexion pour:", email)

  if (!email || !password) {
    showNotification("Veuillez remplir tous les champs", "error")
    return
  }

  // Simuler une vérification d'authentification
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    // Connexion réussie
    const sessionData = {
      id: user.id || Date.now(),
      username: user.username || user.firstName || "Utilisateur",
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    }

    // Sauvegarder la session
    if (rememberMe) {
      localStorage.setItem("userSession", JSON.stringify(sessionData))
    } else {
      sessionStorage.setItem("userSession", JSON.stringify(sessionData))
    }

    // Mettre à jour les variables globales
    currentUser = sessionData
    isAuthenticated = true

    console.log("✅ Connexion réussie:", sessionData)
    showNotification(`Bienvenue ${sessionData.username} !`, "success")

    // Rediriger vers l'accueil après un délai
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  } else {
    console.log("❌ Échec de la connexion")
    showNotification("Email ou mot de passe incorrect", "error")
  }
}

async function handleSignup(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const firstName = formData.get("firstName")?.trim()
  const lastName = formData.get("lastName")?.trim()
  const email = formData.get("email")?.trim()
  const password = formData.get("password")?.trim()
  const confirmPassword = formData.get("confirmPassword")?.trim()

  console.log("📝 Tentative d'inscription pour:", email)

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showNotification("Veuillez remplir tous les champs", "error")
    return
  }

  if (password !== confirmPassword) {
    showNotification("Les mots de passe ne correspondent pas", "error")
    return
  }

  // Vérifier si l'utilisateur existe déjà
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const existingUser = users.find((u) => u.email === email)

  if (existingUser) {
    showNotification("Un compte avec cet email existe déjà", "error")
    return
  }

  // Créer le nouvel utilisateur
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    username: `${firstName} ${lastName}`,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  console.log("✅ Inscription réussie:", newUser)
  showNotification("Compte créé avec succès ! Vous pouvez maintenant vous connecter.", "success")

  // Rediriger vers la page de connexion
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000)
}

function handleLogout() {
  console.log("🚪 Déconnexion de l'utilisateur")

  // Supprimer les sessions
  localStorage.removeItem("userSession")
  sessionStorage.removeItem("userSession")

  // Réinitialiser les variables
  currentUser = null
  isAuthenticated = false

  // Fermer le menu utilisateur
  closeUserMenu()

  showNotification("Déconnexion réussie", "success")

  // Rediriger vers l'accueil
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

function updateAuthUI() {
  const authButton = document.getElementById("authButton")
  const userProfile = document.getElementById("userProfile")
  const userName = document.getElementById("userName")

  console.log("🔄 Mise à jour de l'interface d'authentification")
  console.log("Authentifié:", isAuthenticated)
  console.log("Utilisateur actuel:", currentUser)

  if (isAuthenticated && currentUser) {
    // Utilisateur connecté - afficher le profil
    if (authButton) {
      authButton.style.display = "none"
    }

    if (userProfile) {
      userProfile.style.display = "block"
    }

    if (userName) {
      userName.textContent = currentUser.username || currentUser.email || "Utilisateur"
    }

    console.log("✅ Interface mise à jour pour utilisateur connecté")
  } else {
    // Utilisateur non connecté - afficher le bouton de connexion
    if (authButton) {
      authButton.style.display = "flex"
    }

    if (userProfile) {
      userProfile.style.display = "none"
    }

    console.log("✅ Interface mise à jour pour utilisateur non connecté")
  }
}

// Fonctions utilitaires pour les autres scripts
function isUserLoggedIn() {
  checkExistingSession() // Vérifier à nouveau au cas où
  const result = isAuthenticated && currentUser !== null
  console.log("🔍 Vérification connexion:", result)
  return result
}

function getCurrentUser() {
  checkExistingSession() // Vérifier à nouveau au cas où
  console.log("👤 Utilisateur actuel:", currentUser)
  return currentUser
}

function requireAuth() {
  if (!isUserLoggedIn()) {
    showNotification("Vous devez être connecté pour accéder à cette page", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
    return false
  }
  return true
}

// Système de notifications
function showNotification(message, type = "info", duration = 4000) {
  console.log(`📢 Notification [${type}]:`, message)

  let container = document.getElementById("notifications")
  if (!container) {
    container = document.createElement("div")
    container.id = "notifications"
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `
    document.body.appendChild(container)
  }

  const notification = document.createElement("div")
  notification.style.cssText = `
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    font-weight: 500;
  `

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
  notification.innerHTML = `${icon} ${message}`

  container.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, duration)
}

// Vérifier périodiquement la session (toutes les 30 secondes)
setInterval(() => {
  const wasAuthenticated = isAuthenticated
  checkExistingSession()

  // Si l'état d'authentification a changé, mettre à jour l'UI
  if (wasAuthenticated !== isAuthenticated) {
    console.log("🔄 État d'authentification changé, mise à jour de l'UI")
    updateAuthUI()
  }
}, 30000)

// Exporter les fonctions pour les autres scripts
window.isUserLoggedIn = isUserLoggedIn
window.getCurrentUser = getCurrentUser
window.requireAuth = requireAuth
window.showNotification = showNotification
