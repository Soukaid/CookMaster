// Système de profil intégré - VERSION DE DIAGNOSTIC ET CORRECTION
let currentUser = null
let userReservations = []
let userOrders = []

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Chargement du système de profil...")

  // Diagnostic immédiat
  setTimeout(() => {
    runDiagnostics()
    initializeProfile()
  }, 500)
})

function runDiagnostics() {
  console.log("🔍 === DIAGNOSTIC COMPLET ===")

  // 1. Vérifier les éléments HTML
  const elements = {
    profileUserName: document.getElementById("profileUserName"),
    profileUserEmail: document.getElementById("profileUserEmail"),
    "user-reservations-container": document.getElementById("user-reservations-container"),
    "user-orders-container": document.getElementById("user-orders-container"),
    "reservations-section": document.getElementById("reservations-section"),
    "orders-section": document.getElementById("orders-section"),
  }

  console.log("📋 Éléments HTML trouvés:")
  Object.entries(elements).forEach(([name, element]) => {
    console.log(`  ${name}: ${element ? "✅ Trouvé" : "❌ Manquant"}`)
  })

  // 2. Vérifier les données de session
  const localSession = localStorage.getItem("userSession")
  const sessionSession = sessionStorage.getItem("userSession")

  console.log("🔐 Sessions:")
  console.log("  localStorage:", localSession ? "✅ Présent" : "❌ Absent")
  console.log("  sessionStorage:", sessionSession ? "✅ Présent" : "❌ Absent")

  if (localSession) {
    try {
      const parsed = JSON.parse(localSession)
      console.log("  Données localStorage:", parsed)
    } catch (e) {
      console.log("  ❌ Erreur parsing localStorage:", e)
    }
  }

  // 3. Vérifier les données stockées
  const reservations = localStorage.getItem("reservations")
  const orders = localStorage.getItem("cookmaster-orders")

  console.log("📊 Données stockées:")
  console.log("  Réservations:", reservations ? `✅ ${JSON.parse(reservations).length} trouvées` : "❌ Aucune")
  console.log("  Commandes:", orders ? `✅ ${JSON.parse(orders).length} trouvées` : "❌ Aucune")

  if (reservations) {
    console.log("  Détail réservations:", JSON.parse(reservations))
  }
  if (orders) {
    console.log("  Détail commandes:", JSON.parse(orders))
  }
}

function initializeProfile() {
  console.log("👤 Initialisation du système de profil intégré")

  // Vérifier l'authentification
  if (!checkAuthentication()) {
    console.log("❌ Utilisateur non authentifié")
    redirectToLogin()
    return
  }

  // Charger l'utilisateur actuel
  currentUser = getCurrentUser()
  console.log("👤 Utilisateur trouvé:", currentUser)

  // Créer des données de test si nécessaire
  createTestDataIfNeeded()

  // Mettre à jour les informations utilisateur
  updateUserInfo()

  // Initialiser la navigation
  initializeNavigation()

  // Charger les données immédiatement
  loadUserData()

  // Afficher la section par défaut
  showSection("reservations")

  console.log("✅ Profil initialisé pour:", currentUser)
}

function createTestDataIfNeeded() {
  if (!currentUser) return

  // Créer des réservations de test
  const existingReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
  if (existingReservations.length === 0) {
    const testReservation = {
      id: Date.now(),
      userId: currentUser.userId || currentUser.id,
      userEmail: currentUser.email,
      email: currentUser.email,
      fullName: currentUser.userName || currentUser.username || "Utilisateur Test",
      date: "2025-01-10",
      time: "19:30",
      guests: "4",
      tableType: "window",
      phone: "+41 22 123 45 67",
      specialRequests: "Table près de la fenêtre pour un anniversaire",
      status: "confirmed",
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("reservations", JSON.stringify([testReservation]))
    console.log("🧪 Réservation de test créée:", testReservation)
  }

  // Créer des commandes de test
  const existingOrders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  if (existingOrders.length === 0) {
    const testOrder = {
      id: Date.now(),
      userId: currentUser.userId || currentUser.id,
      userEmail: currentUser.email,
      email: currentUser.email,
      username: currentUser.userName || currentUser.username,
      date: new Date().toISOString(),
      status: "completed",
      items: [
        {
          id: "test-1",
          name: "Salade César Moderne",
          price: 12.5,
          quantity: 1,
          image: "images/salade-cesar.jpeg",
        },
        {
          id: "test-2",
          name: "Risotto aux Champignons",
          price: 18.9,
          quantity: 2,
          image: "/images/risotto-aux-champignons.jpeg",
        },
      ],
      totalPrice: 50.3,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("cookmaster-orders", JSON.stringify([testOrder]))
    console.log("🧪 Commande de test créée:", testOrder)
  }
}

function checkAuthentication() {
  const localSession = localStorage.getItem("userSession")
  const sessionSession = sessionStorage.getItem("userSession")

  let userSession = null

  if (localSession) {
    try {
      userSession = JSON.parse(localSession)
    } catch (e) {
      console.error("Erreur localStorage:", e)
    }
  }

  if (!userSession && sessionSession) {
    try {
      userSession = JSON.parse(sessionSession)
    } catch (e) {
      console.error("Erreur sessionStorage:", e)
    }
  }

  const isAuth = userSession && userSession.isAuthenticated === true
  console.log("🔐 Authentification:", isAuth, userSession)

  return isAuth
}

function getCurrentUser() {
  const localSession = localStorage.getItem("userSession")
  const sessionSession = sessionStorage.getItem("userSession")

  let userSession = null

  if (localSession) {
    try {
      userSession = JSON.parse(localSession)
    } catch (e) {
      console.error("Erreur localStorage:", e)
    }
  }

  if (!userSession && sessionSession) {
    try {
      userSession = JSON.parse(sessionSession)
    } catch (e) {
      console.error("Erreur sessionStorage:", e)
    }
  }

  return userSession && userSession.isAuthenticated ? userSession : null
}

function updateUserInfo() {
  const profileUserName = document.getElementById("profileUserName")
  const profileUserEmail = document.getElementById("profileUserEmail")

  if (profileUserName && currentUser) {
    const displayName = currentUser.userName || currentUser.username || currentUser.firstName || "Mon Profil"
    profileUserName.textContent = displayName
    console.log("📝 Nom affiché:", displayName)
  }

  if (profileUserEmail && currentUser) {
    profileUserEmail.textContent = currentUser.email || "Bienvenue sur votre espace personnel"
    console.log("📧 Email affiché:", currentUser.email)
  }
}

function initializeNavigation() {
  console.log("🧭 Initialisation de la navigation")

  const navButtons = document.querySelectorAll(".profile-nav-btn")
  console.log("🔘 Boutons trouvés:", navButtons.length)

  navButtons.forEach((button, index) => {
    const section = button.getAttribute("data-section")
    console.log(`🔘 Bouton ${index}: ${section}`)

    // Supprimer les anciens événements
    button.removeEventListener("click", handleNavClick)
    // Ajouter le nouvel événement
    button.addEventListener("click", handleNavClick)
  })
}

function handleNavClick(event) {
  event.preventDefault()

  const button = event.currentTarget
  const section = button.getAttribute("data-section")

  console.log("🔘 Clic sur bouton:", section)

  if (section) {
    showSection(section)

    // Mettre à jour l'état actif des boutons
    document.querySelectorAll(".profile-nav-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    button.classList.add("active")
  }
}

function showSection(sectionName) {
  console.log("📄 Affichage de la section:", sectionName)

  // Masquer toutes les sections
  document.querySelectorAll(".profile-section").forEach((section) => {
    section.classList.remove("active")
    section.style.display = "none"
  })

  // Afficher la section demandée
  const targetSection = document.getElementById(`${sectionName}-section`)
  if (targetSection) {
    targetSection.classList.add("active")
    targetSection.style.display = "block"
    console.log("✅ Section affichée:", sectionName)
  } else {
    console.error("❌ Section non trouvée:", `${sectionName}-section`)
  }

  // Charger les données spécifiques à la section
  switch (sectionName) {
    case "reservations":
      loadUserReservations()
      break
    case "orders":
      loadUserOrders()
      break
  }
}

function loadUserData() {
  console.log("📊 Chargement des données utilisateur")
  loadUserReservations()
  loadUserOrders()
}

function loadUserReservations() {
  console.log("📅 Chargement des réservations pour:", currentUser)

  const allReservations = JSON.parse(localStorage.getItem("reservations") || "[]")
  console.log("📅 Toutes les réservations:", allReservations)

  if (!currentUser) {
    console.error("❌ Pas d'utilisateur connecté")
    return
  }

  // Filtrer avec critères multiples
  userReservations = allReservations.filter((reservation) => {
    const emailMatch = reservation.email === currentUser.email || reservation.userEmail === currentUser.email
    const userIdMatch = reservation.userId === currentUser.userId || reservation.userId === currentUser.id
    const nameMatch =
      reservation.fullName &&
      currentUser.userName &&
      reservation.fullName.toLowerCase().includes(currentUser.userName.toLowerCase())

    const matches = emailMatch || userIdMatch || nameMatch

    console.log("🔍 Réservation:", {
      id: reservation.id,
      email: reservation.email,
      userEmail: reservation.userEmail,
      userId: reservation.userId,
      fullName: reservation.fullName,
      currentUserEmail: currentUser.email,
      currentUserId: currentUser.userId || currentUser.id,
      currentUserName: currentUser.userName,
      matches: matches,
    })

    return matches
  })

  console.log("📅 Réservations filtrées:", userReservations.length, userReservations)
  displayUserReservations()
}

function displayUserReservations() {
  const container = document.getElementById("user-reservations-container")
  if (!container) {
    console.error("❌ Container réservations non trouvé")
    // Créer le container s'il n'existe pas
    const section = document.getElementById("reservations-section")
    if (section) {
      const newContainer = document.createElement("div")
      newContainer.id = "user-reservations-container"
      newContainer.className = "reservations-container"
      section.appendChild(newContainer)
      console.log("✅ Container réservations créé")
      displayUserReservations() // Rappeler la fonction
    }
    return
  }

  console.log("📅 Affichage de", userReservations.length, "réservations")

  if (userReservations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-alt"></i>
        <p>Aucune réservation pour le moment</p>
        <a href="reservation.html" class="btn-primary">Réserver une table</a>
      </div>
    `
    return
  }

  const html = userReservations
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .map(
      (reservation) => `
      <div class="reservation-card">
        <div class="reservation-header">
          <div class="reservation-info">
            <h3>${reservation.fullName || "Réservation"}</h3>
            <div class="order-date">Réservé le ${formatDate(reservation.timestamp || reservation.date)}</div>
          </div>
          <div class="reservation-status ${reservation.status || "confirmed"}">${getReservationStatusLabel(reservation.status || "confirmed")}</div>
        </div>
        <div class="reservation-details">
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${formatDate(reservation.date)}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${reservation.time}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-users"></i>
            <span>${reservation.guests} personne(s)</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-chair"></i>
            <span>${getTableTypeLabel(reservation.tableType)}</span>
          </div>
        </div>
        ${
          reservation.specialRequests
            ? `
          <div class="reservation-notes" style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <strong>Demandes spéciales:</strong>
            <p style="margin-top: 0.5rem; color: #64748b;">${reservation.specialRequests}</p>
          </div>
        `
            : ""
        }
      </div>
    `,
    )
    .join("")

  container.innerHTML = html
  console.log("✅ Réservations affichées")
}

function loadUserOrders() {
  console.log("🛒 Chargement des commandes pour:", currentUser)

  const allOrders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  console.log("🛒 Toutes les commandes:", allOrders)

  if (!currentUser) {
    console.error("❌ Pas d'utilisateur connecté")
    return
  }

  // Filtrer avec critères multiples
  userOrders = allOrders.filter((order) => {
    const userIdMatch = order.userId === currentUser.userId || order.userId === currentUser.id
    const emailMatch = order.userEmail === currentUser.email || order.email === currentUser.email
    const usernameMatch = order.username === currentUser.userName || order.username === currentUser.username

    const matches = userIdMatch || emailMatch || usernameMatch

    console.log("🔍 Commande:", {
      orderId: order.id,
      orderUserId: order.userId,
      orderUserEmail: order.userEmail,
      orderEmail: order.email,
      orderUsername: order.username,
      currentUserId: currentUser.userId || currentUser.id,
      currentUserEmail: currentUser.email,
      currentUsername: currentUser.userName || currentUser.username,
      matches: matches,
    })

    return matches
  })

  console.log("🛒 Commandes filtrées:", userOrders.length, userOrders)
  displayUserOrders()
}

function displayUserOrders() {
  const container = document.getElementById("user-orders-container")
  if (!container) {
    console.error("❌ Container commandes non trouvé")
    // Créer le container s'il n'existe pas
    const section = document.getElementById("orders-section")
    if (section) {
      const newContainer = document.createElement("div")
      newContainer.id = "user-orders-container"
      newContainer.className = "orders-container"
      section.appendChild(newContainer)
      console.log("✅ Container commandes créé")
      displayUserOrders() // Rappeler la fonction
    }
    return
  }

  console.log("🛒 Affichage de", userOrders.length, "commandes")

  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <p>Aucune commande pour le moment</p>
        <a href="menu.html" class="btn-primary">Commander maintenant</a>
      </div>
    `
    return
  }

  const html = userOrders
    .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))
    .map(
      (order, index) => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Commande #${String(order.id || index + 1)
              .toString()
              .padStart(4, "0")}</h3>
            <div class="order-date">${formatDate(order.date || order.timestamp)}</div>
          </div>
          <div class="order-status ${order.status || "confirmed"}">${getOrderStatusLabel(order.status || "confirmed")}</div>
        </div>
        <div class="order-items" style="margin-bottom: 1rem;">
          ${
            order.items && order.items.length > 0
              ? order.items
                  .map(
                    (item) => `
            <div class="order-item" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(200, 129, 95, 0.05); border-radius: 8px; margin-bottom: 0.5rem;">
              <img src="${item.image || "/placeholder.svg?height=50&width=50"}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${item.name}</div>
                <div style="font-size: 0.9rem; color: #64748b;">Quantité: ${item.quantity}</div>
              </div>
              <div style="font-weight: 600; color: #c8815f;">${(item.price * item.quantity).toFixed(2)} €</div>
            </div>
          `,
                  )
                  .join("")
              : "<p>Détails de la commande non disponibles</p>"
          }
        </div>
        <div class="order-total" style="text-align: right; font-size: 1.2rem; font-weight: 700; color: #c8815f; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
          Total: ${order.totalPrice ? order.totalPrice.toFixed(2) : "0.00"} €
        </div>
        <div class="order-actions" style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: flex-end;">
          ${
            order.status === "pending"
              ? `
            <button class="cancel-btn" onclick="cancelOrder('${order.id || index}')" style="padding: 0.5rem 1rem; background: #ffebee; color: #f44336; border: none; border-radius: 20px; cursor: pointer;">
              <i class="fas fa-times"></i> Annuler
            </button>
          `
              : ""
          }
          <button class="reorder-btn" onclick="reorderItems('${order.id || index}')" style="padding: 0.5rem 1rem; background: #c8815f; color: white; border: none; border-radius: 20px; cursor: pointer;">
            <i class="fas fa-redo"></i> Commander à nouveau
          </button>
        </div>
      </div>
    `,
    )
    .join("")

  container.innerHTML = html
  console.log("✅ Commandes affichées")
}

// Fonctions utilitaires
function formatDate(dateString) {
  if (!dateString) return "Date non disponible"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Date invalide"
  }
}

function getReservationStatusLabel(status) {
  const labels = {
    confirmed: "Confirmée",
    pending: "En attente",
    cancelled: "Annulée",
  }
  return labels[status] || "Confirmée"
}

function getOrderStatusLabel(status) {
  const labels = {
    confirmed: "Confirmée",
    pending: "En cours",
    processing: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  }
  return labels[status] || "Confirmée"
}

function getTableTypeLabel(tableType) {
  const labels = {
    standard: "Table Standard",
    window: "Table près de la fenêtre",
    private: "Salon Privé",
    terrace: "Terrasse",
  }
  return labels[tableType] || tableType
}

function cancelOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  const orderIndex = orders.findIndex((order) => order.id === orderId || orders.indexOf(order).toString() === orderId)

  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1)
    localStorage.setItem("cookmaster-orders", JSON.stringify(orders))
    showNotification("Commande annulée et supprimée avec succès", "success")
    setTimeout(() => {
      loadUserOrders()
    }, 1000)
  }
}

function reorderItems(orderId) {
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  const order = orders.find((order) => order.id === orderId) || orders[Number.parseInt(orderId)]

  if (order && order.items) {
    const currentCart = JSON.parse(
      localStorage.getItem("cookmaster-cart") || '{"items": [], "totalItems": 0, "totalPrice": 0}',
    )

    order.items.forEach((item) => {
      const existingItem = currentCart.items.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        currentCart.items.push({ ...item })
      }
    })

    currentCart.totalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0)
    currentCart.totalPrice = currentCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    localStorage.setItem("cookmaster-cart", JSON.stringify(currentCart))
    showNotification("Articles ajoutés au panier", "success")

    setTimeout(() => {
      window.location.href = "menu.html"
    }, 1500)
  }
}

function redirectToLogin() {
  showNotification("Vous devez être connecté pour accéder à votre profil", "error")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000)
}

function showNotification(message, type = "info") {
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
  `

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
  notification.innerHTML = `${icon} ${message}`

  container.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Exposer les fonctions globalement
window.cancelOrder = cancelOrder
window.reorderItems = reorderItems
window.runDiagnostics = runDiagnostics
window.createTestDataIfNeeded = createTestDataIfNeeded

// Fonction de test rapide
function quickTest() {
  console.log("🧪 === TEST RAPIDE ===")
  runDiagnostics()
  createTestDataIfNeeded()
  loadUserData()
  console.log("🧪 Test terminé - vérifiez votre profil")
}

window.quickTest = quickTest

console.log("📋 Système de profil chargé - tapez quickTest() dans la console pour tester")
