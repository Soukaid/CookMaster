// === SYSTÈME DE PANIER COOKMASTER - VERSION FINALE ===

let cookMasterCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("🛒 Initialisation du système de panier final")
  initializeCart()
  setupCartEvents()
  updateCartDisplay()
})

// Initialiser le panier
function initializeCart() {
  const savedCart = localStorage.getItem("cookmaster-cart")
  if (savedCart) {
    try {
      cookMasterCart = JSON.parse(savedCart)
      console.log("📦 Panier chargé:", cookMasterCart)
    } catch (e) {
      console.error("Erreur lors du chargement du panier:", e)
      resetCart()
    }
  }
}

// Configurer les événements
function setupCartEvents() {
  const cartButton = document.getElementById("cookmaster-cart-button")
  const closeCart = document.getElementById("cookmaster-close-cart")
  const checkoutBtn = document.getElementById("cookmaster-checkout-btn")

  if (cartButton) {
    cartButton.addEventListener("click", toggleCart)
    console.log("✅ Bouton panier configuré")
  }

  if (closeCart) {
    closeCart.addEventListener("click", toggleCart)
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout)
  }
}

// Fonction GLOBALE pour ajouter au panier - CORRIGÉE
window.addDishToCart = (dishId) => {
  console.log("🛒 AJOUT AU PANIER - ID:", dishId)

  // Vérifier l'authentification
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")
  if (!userSession.isAuthenticated) {
    showCartNotification("Veuillez vous connecter pour commander", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  // Trouver le plat
  const dish = findDishById(dishId)
  if (!dish) {
    console.error("❌ Plat non trouvé:", dishId)
    showCartNotification("Erreur: Plat non trouvé", "error")
    return
  }

  console.log("🍽️ Plat trouvé:", dish)

  // Vérifier si l'article existe déjà
  const existingItem = cookMasterCart.items.find((item) => item.id === dish.id)

  if (existingItem) {
    existingItem.quantity++
    console.log("📦 Quantité augmentée pour:", dish.nom)
  } else {
    const newItem = {
      id: dish.id,
      name: dish.nom,
      price: Number.parseFloat(dish.prix),
      quantity: 1,
      image: dish.image || "/placeholder.svg?height=80&width=80",
    }
    cookMasterCart.items.push(newItem)
    console.log("📦 Nouvel article ajouté:", newItem)
  }

  // Recalculer les totaux
  recalculateCart()

  // Sauvegarder et mettre à jour l'affichage
  saveCart()
  updateCartDisplay()

  // Animation du bouton
  animateAddButton(dishId)

  // Ouvrir le panier
  setTimeout(() => {
    toggleCart()
  }, 100)

  // Notification de succès
  showCartNotification(`${dish.nom} ajouté au panier`, "success")
}

// Trouver un plat par ID
function findDishById(dishId) {
  // Chercher dans les données du menu
  const menuData = JSON.parse(localStorage.getItem("cookmaster-menu-data") || "[]")
  let dish = menuData.find((item) => item.id === dishId)

  // Si pas trouvé, chercher dans les données par défaut
  if (!dish) {
    const defaultData = [
      {
        id: "default-1",
        nom: "Salade César Moderne",
        categorie: "salade",
        prix: 12.5,
        description: "Une salade César revisitée avec des ingrédients frais et une vinaigrette maison",
        image: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "default-2",
        nom: "Risotto aux Champignons",
        categorie: "plat",
        prix: 18.9,
        description: "Un risotto crémeux aux champignons porcini, cuit à la perfection",
        image: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "default-3",
        nom: "Smoothie Tropical",
        categorie: "jus",
        prix: 6.5,
        description: "Un smoothie rafraîchissant aux saveurs tropicales",
        image: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "default-4",
        nom: "Tarte au Chocolat",
        categorie: "dessert",
        prix: 8.5,
        description: "Une tarte au chocolat riche et fondante, parfaite pour les amateurs de cacao",
        image: "/placeholder.svg?height=200&width=350",
      },
    ]
    dish = defaultData.find((item) => item.id === dishId)
  }

  return dish
}

// Recalculer les totaux du panier
function recalculateCart() {
  cookMasterCart.totalItems = cookMasterCart.items.reduce((total, item) => total + item.quantity, 0)
  cookMasterCart.totalPrice = cookMasterCart.items.reduce((total, item) => total + item.price * item.quantity, 0)
}

// Animer le bouton d'ajout
function animateAddButton(dishId) {
  const btn = document.querySelector(`.dish-card[data-dish-id="${dishId}"] .cookmaster-cart-btn`)
  if (btn) {
    const originalContent = btn.innerHTML
    btn.innerHTML = '<i class="fas fa-check"></i> <span>Ajouté !</span>'
    btn.style.background = "#10b981"

    setTimeout(() => {
      btn.innerHTML = originalContent
      btn.style.background = ""
    }, 2000)
  }
}

// Mettre à jour l'affichage du panier
function updateCartDisplay() {
  // Mettre à jour le badge
  const cartBadge = document.getElementById("cookmaster-cart-badge")
  if (cartBadge) {
    cartBadge.textContent = cookMasterCart.totalItems
    cartBadge.style.display = cookMasterCart.totalItems > 0 ? "flex" : "none"

    if (cookMasterCart.totalItems > 0) {
      cartBadge.classList.add("cookmaster-pulse")
      setTimeout(() => cartBadge.classList.remove("cookmaster-pulse"), 500)
    }
  }

  // Mettre à jour le compteur
  const cartCount = document.getElementById("cookmaster-cart-count")
  if (cartCount) {
    cartCount.textContent = `(${cookMasterCart.totalItems})`
  }

  // Mettre à jour le contenu
  const cartItems = document.getElementById("cookmaster-mini-cart-items")
  if (cartItems) {
    if (cookMasterCart.items.length === 0) {
      cartItems.innerHTML = `
        <div class="cookmaster-empty-cart">
          <i class="fas fa-shopping-bag"></i>
          <p>Votre panier est vide</p>
          <a href="#menu" class="cookmaster-browse-menu-btn" onclick="toggleCart()">
            <i class="fas fa-utensils"></i>
            Parcourir le menu
          </a>
        </div>
      `
    } else {
      cartItems.innerHTML = cookMasterCart.items
        .map(
          (item) => `
        <div class="cookmaster-cart-item">
          <div class="cookmaster-cart-item-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='/placeholder.svg?height=80&width=80'">
          </div>
          <div class="cookmaster-cart-item-details">
            <h4>${item.name}</h4>
            <div class="cookmaster-cart-item-price">${item.price.toFixed(2)} €</div>
          </div>
          <div class="cookmaster-cart-item-quantity">
            <button class="cookmaster-quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
            <span class="cookmaster-quantity">${item.quantity}</span>
            <button class="cookmaster-quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
          <button class="cookmaster-remove-item-btn" onclick="removeItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `,
        )
        .join("")
    }
  }

  // Mettre à jour le total
  const cartTotal = document.getElementById("cookmaster-cart-total")
  if (cartTotal) {
    cartTotal.textContent = `${cookMasterCart.totalPrice.toFixed(2)} €`
  }

  // Afficher/masquer le footer
  const cartFooter = document.getElementById("cookmaster-mini-cart-footer")
  if (cartFooter) {
    cartFooter.style.display = cookMasterCart.items.length > 0 ? "block" : "none"
  }

  console.log("🛒 Affichage mis à jour:", cookMasterCart)
}

// Basculer l'affichage du panier
function toggleCart() {
  const cartContent = document.getElementById("cookmaster-mini-cart-content")
  if (cartContent) {
    const isVisible = cartContent.style.display === "flex"

    if (isVisible) {
      cartContent.style.transform = "translateX(100%)"
      cartContent.style.opacity = "0"
      setTimeout(() => {
        cartContent.style.display = "none"
      }, 300)
    } else {
      cartContent.style.display = "flex"
      setTimeout(() => {
        cartContent.style.transform = "translateX(0)"
        cartContent.style.opacity = "1"
      }, 10)
    }
  }
}

// Mettre à jour la quantité
window.updateQuantity = (itemId, change) => {
  const item = cookMasterCart.items.find((item) => item.id === itemId)

  if (item) {
    item.quantity += change

    if (item.quantity <= 0) {
      cookMasterCart.items = cookMasterCart.items.filter((i) => i.id !== itemId)
      showCartNotification("Article retiré du panier", "success")
    }

    recalculateCart()
    saveCart()
    updateCartDisplay()
  }
}

// Supprimer un article
window.removeItem = (itemId) => {
  const item = cookMasterCart.items.find((item) => item.id === itemId)

  if (item) {
    cookMasterCart.items = cookMasterCart.items.filter((i) => i.id !== itemId)
    recalculateCart()
    saveCart()
    updateCartDisplay()
    showCartNotification("Article retiré du panier", "success")
  }
}

// Gérer le checkout
function handleCheckout() {
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")

  if (!userSession.isAuthenticated) {
    showCartNotification("Veuillez vous connecter pour commander", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  if (cookMasterCart.items.length === 0) {
    showCartNotification("Votre panier est vide", "error")
    return
  }

  // Créer la commande
  const order = {
    id: Date.now(),
    userId: userSession.userId,
    userName: userSession.userName,
    items: [...cookMasterCart.items],
    totalPrice: cookMasterCart.totalPrice,
    date: new Date().toISOString(),
    status: "pending",
  }

  // Sauvegarder la commande
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  orders.push(order)
  localStorage.setItem("cookmaster-orders", JSON.stringify(orders))

  console.log("📋 Commande sauvegardée:", order)

  // Vider le panier
  resetCart()

  showCartNotification("Commande validée ! Merci de votre confiance.", "success")

  // Fermer le panier
  setTimeout(() => {
    toggleCart()
  }, 1000)

  // Rediriger vers les commandes
  setTimeout(() => {
    window.location.href = "orders.html"
  }, 2000)
}

// Sauvegarder le panier
function saveCart() {
  localStorage.setItem("cookmaster-cart", JSON.stringify(cookMasterCart))
}

// Réinitialiser le panier
function resetCart() {
  cookMasterCart = { items: [], totalItems: 0, totalPrice: 0 }
  saveCart()
  updateCartDisplay()
}

// Fonction de notification
function showCartNotification(message, type) {
  // Supprimer les notifications existantes
  const existingNotifications = document.querySelectorAll(".cookmaster-notification")
  existingNotifications.forEach((n) => n.remove())

  const notification = document.createElement("div")
  notification.className = `cookmaster-notification ${type}`
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `

  // Styles inline
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 12px;
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    z-index: 10000;
    font-family: Inter, sans-serif;
    font-weight: 500;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(120%)"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Exposer les fonctions globalement
window.toggleCart = toggleCart
window.handleCheckout = handleCheckout

console.log("🛒 Système de panier final chargé")
