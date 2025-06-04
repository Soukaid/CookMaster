// === SYSTÈME DE MENU COOKMASTER - VERSION FINALE ===

// Variables globales pour le système de menu
let menuData = []
let currentLanguage = "fr"
let currentCategory = "all"

// Catégories du menu
const categories = {
  all: { fr: "Tout", en: "All", icon: "fas fa-utensils" },
  salade: { fr: "Salades", en: "Salads", icon: "fas fa-leaf" },
  plat: { fr: "Plats", en: "Main Dishes", icon: "fas fa-utensils" },
  dessert: { fr: "Desserts", en: "Desserts", icon: "fas fa-birthday-cake" },
  jus: { fr: "Boissons", en: "Beverages", icon: "fas fa-glass-whiskey" },
}

// Initialisation du menu
document.addEventListener("DOMContentLoaded", () => {
  console.log("📋 Initialisation du système de menu final")
  currentLanguage = localStorage.getItem("cookmaster-language") || "fr"
  loadMenuData()
  createCategoryFilters()
  displayMenu()
  setupRealTimeUpdates()

  // Écouter les changements de langue
  document.addEventListener("languageChanged", (e) => {
    currentLanguage = e.detail.language
    updateMenuLanguage()
  })
})

// Charger les données du menu
function loadMenuData() {
  const adminData = localStorage.getItem("cookmaster-menu-data")

  if (adminData) {
    try {
      const newMenuData = JSON.parse(adminData)
      console.log("📋 Données trouvées dans localStorage:", newMenuData.length, "recettes")

      if (JSON.stringify(newMenuData) !== JSON.stringify(menuData)) {
        menuData = newMenuData
        console.log("📋 Données du menu mises à jour:", menuData.length, "recettes")
        if (document.getElementById("menu-content")) {
          displayMenu()
        }
      }
    } catch (e) {
      console.error("Erreur lors du chargement des données du menu:", e)
      loadDefaultMenuData()
    }
  } else {
    console.log("📋 Aucune donnée dans localStorage, chargement des données par défaut")
    loadDefaultMenuData()
  }
}

// Charger des données par défaut
function loadDefaultMenuData() {
  menuData = [
    {
      id: "1748910656822",
      nom: "Couscous Marocain",
      categorie: "plat",
      prix: 26.0,
      description: "Le couscous est un plat marocain à base de semoule, légumes et viande.",
      image: "/placeholder.svg?height=200&width=350",
      ingredients: ["semoule", "légumes", "viande", "épices"],
      duree: 60,
      note: 4.0,
    },
    {
      id: "default-1",
      nom: "Salade César Moderne",
      categorie: "salade",
      prix: 12.5,
      description: "Une salade César revisitée avec des ingrédients frais et une vinaigrette maison",
      image: "/placeholder.svg?height=200&width=350",
      ingredients: ["laitue romaine", "parmesan", "croûtons maison"],
      duree: 25,
      note: 4.5,
    },
    {
      id: "default-2",
      nom: "Risotto aux Champignons",
      categorie: "plat",
      prix: 18.9,
      description: "Un risotto crémeux aux champignons porcini, cuit à la perfection",
      image: "/placeholder.svg?height=200&width=350",
      ingredients: ["riz arborio", "champignons porcini", "bouillon"],
      duree: 45,
      note: 4.8,
    },
    {
      id: "default-3",
      nom: "Smoothie Tropical",
      categorie: "jus",
      prix: 6.5,
      description: "Un smoothie rafraîchissant aux saveurs tropicales",
      image: "/placeholder.svg?height=200&width=350",
      ingredients: ["mangue", "ananas", "lait de coco"],
      duree: 10,
      note: 4.2,
    },
    {
      id: "default-4",
      nom: "Tarte au Chocolat",
      categorie: "dessert",
      prix: 8.5,
      description: "Une tarte au chocolat riche et fondante",
      image: "/placeholder.svg?height=200&width=350",
      ingredients: ["chocolat noir", "beurre", "œufs"],
      duree: 90,
      note: 4.6,
    },
  ]

  console.log("📋 Données par défaut du menu chargées")
}

// Créer les filtres de catégories
function createCategoryFilters() {
  const menuContainer = document.getElementById("menu")
  if (!menuContainer) return

  const filtersSection = document.createElement("div")
  filtersSection.className = "menu-filters"
  filtersSection.innerHTML = `
    <h2>Nos Spécialités</h2>
    <div class="category-filters" id="category-filters"></div>
  `

  const menuSection = document.createElement("div")
  menuSection.className = "menu-content"
  menuSection.id = "menu-content"

  menuContainer.innerHTML = ""
  menuContainer.appendChild(filtersSection)
  menuContainer.appendChild(menuSection)

  generateCategoryFilters()
}

// Générer les boutons de filtres
function generateCategoryFilters() {
  const filtersContainer = document.getElementById("category-filters")
  if (!filtersContainer) return

  const filtersHTML = Object.entries(categories)
    .map(
      ([key, category]) => `
    <button class="category-filter ${key === "all" ? "active" : ""}" 
            data-category="${key}">
      <i class="${category.icon}"></i>
      <span>${category[currentLanguage]}</span>
    </button>
  `,
    )
    .join("")

  filtersContainer.innerHTML = filtersHTML

  document.querySelectorAll(".category-filter").forEach((button) => {
    button.addEventListener("click", (e) => {
      const category = e.currentTarget.getAttribute("data-category")
      filterByCategory(category)
    })
  })
}

// Filtrer par catégorie
function filterByCategory(category) {
  currentCategory = category

  document.querySelectorAll(".category-filter").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-category="${category}"]`).classList.add("active")

  displayMenu()
}

// Afficher le menu
function displayMenu() {
  const menuContent = document.getElementById("menu-content")
  if (!menuContent) return

  const filteredData =
    currentCategory === "all" ? menuData : menuData.filter((item) => item.categorie === currentCategory)

  if (filteredData.length === 0) {
    menuContent.innerHTML = `
      <div class="empty-menu">
        <i class="fas fa-utensils"></i>
        <h3>Aucun plat disponible</h3>
        <p>Cette catégorie sera bientôt disponible</p>
      </div>
    `
    return
  }

  if (currentCategory === "all") {
    displayAllCategories(filteredData)
  } else {
    displaySingleCategory(filteredData)
  }

  setTimeout(() => {
    initializeDishRatings()
    updateMenuLanguage()
  }, 100)
}

// Initialiser les notations pour tous les plats
function initializeDishRatings() {
  document.querySelectorAll(".dish-card").forEach((dishCard) => {
    const dishId = dishCard.getAttribute("data-dish-id")
    if (dishId && window.calculateAverageRating) {
      const averageRating = window.calculateAverageRating(dishId)
      const userRatings = JSON.parse(localStorage.getItem("cookmaster-user-ratings") || "{}")
      const ratingCount = Object.keys(userRatings[dishId] || {}).length

      if (ratingCount > 0 && window.updateAverageRatingDisplay) {
        window.updateAverageRatingDisplay(dishId, averageRating, ratingCount)
      }

      // Marquer les étoiles si l'utilisateur a déjà noté
      const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")
      if (userSession.isAuthenticated && userRatings[dishId] && userRatings[dishId][userSession.userId]) {
        if (window.updateStarDisplay) {
          window.updateStarDisplay(dishId, userRatings[dishId][userSession.userId])
        }
      }
    }
  })
}

// Afficher toutes les catégories
function displayAllCategories(data) {
  const menuContent = document.getElementById("menu-content")
  const categoriesWithData = {}

  data.forEach((item) => {
    if (!categoriesWithData[item.categorie]) {
      categoriesWithData[item.categorie] = []
    }
    categoriesWithData[item.categorie].push(item)
  })

  let html = ""
  Object.entries(categoriesWithData).forEach(([categoryKey, items]) => {
    const category = categories[categoryKey]
    if (category) {
      html += `
        <div class="menu-category" data-category="${categoryKey}">
          <div class="category-header">
            <h3 class="category-title">
              <i class="${category.icon}"></i>
              <span>${category[currentLanguage]}</span>
            </h3>
            <div class="category-count">${items.length} plat${items.length > 1 ? "s" : ""}</div>
          </div>
          <div class="dishes-grid">
            ${items.map((item) => generateDishCard(item)).join("")}
          </div>
        </div>
      `
    }
  })

  menuContent.innerHTML = html
}

// Afficher une seule catégorie
function displaySingleCategory(data) {
  const menuContent = document.getElementById("menu-content")
  const category = categories[currentCategory]

  const html = `
    <div class="menu-category" data-category="${currentCategory}">
      <div class="category-header">
        <h3 class="category-title">
          <i class="${category.icon}"></i>
          <span>${category[currentLanguage]}</span>
        </h3>
        <div class="category-count">${data.length} plat${data.length > 1 ? "s" : ""}</div>
      </div>
      <div class="dishes-grid">
        ${data.map((item) => generateDishCard(item)).join("")}
      </div>
    </div>
  `

  menuContent.innerHTML = html
}

// Générer une carte de plat
function generateDishCard(item) {
  const userRatings = JSON.parse(localStorage.getItem("cookmaster-user-ratings") || "{}")
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")
  const userRating = userSession.isAuthenticated && userRatings[item.id] ? userRatings[item.id][userSession.userId] : 0

  return `
    <div class="dish-card" id="${encodeURIComponent(item.nom)}" data-dish-id="${item.id}">

      <div class="dish-image">
        <img src="${item.image}" alt="${item.nom}" loading="lazy" onerror="this.src='/placeholder.svg?height=200&width=350'">
      </div>
      <div class="dish-content">
        <div class="dish-header">
          <h4 class="dish-name">${item.nom}</h4>
          <span class="dish-price">${item.prix.toFixed(2)} €</span>
        </div>
        <p class="dish-description">${item.description}</p>
        
        <!-- Système de notation utilisateur -->
        <div class="dish-rating-system" style="margin: 15px 0;">
          <div class="user-rating" style="display: flex; align-items: center; gap: 10px;">
            <span class="rating-label" style="font-weight: 600;">Votre note :</span>
            <div class="rating-stars" data-dish-id="${item.id}" style="display: flex; gap: 5px;">
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `
                <span class="star ${star <= userRating ? "user-rated" : ""}" 
                      data-value="${star}" 
                      title="${star} étoile${star > 1 ? "s" : ""}"
                      style="cursor: pointer; color: ${star <= userRating ? "#ffd700" : "#ddd"}; font-size: 1.2rem; transition: color 0.2s ease;">★</span>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
        
        <!-- Section commentaires -->
        <div class="dish-comments" style="margin: 15px 0;">
          <button class="comment-btn" onclick="showCommentModal('${item.id}')" style="
            background: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          ">
            <i class="fas fa-comment"></i> 
            <span>Ajouter un avis</span>
          </button>
        </div>
        
        <button class="cookmaster-cart-btn" onclick="addDishToCart('${item.id}')">
          <i class="fas fa-shopping-bag"></i>
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  `
}

// Écouter les mises à jour en temps réel
function setupRealTimeUpdates() {
  window.addEventListener("storage", (e) => {
    if (e.key === "cookmaster-menu-data") {
      console.log("🔄 Détection de changement dans les données du menu")
      loadMenuData()
    }
  })

  window.addEventListener("cookmaster-menu-updated", (e) => {
    console.log("🔄 Événement de mise à jour du menu reçu")
    loadMenuData()
  })

  setInterval(() => {
    const lastUpdate = localStorage.getItem("cookmaster-last-update")
    const currentTime = Date.now()
    if (lastUpdate && currentTime - Number.parseInt(lastUpdate) < 5000) {
      loadMenuData()
    }
  }, 2000)
}

// Mettre à jour la langue du menu
function updateMenuLanguage() {
  const elementsWithLang = document.querySelectorAll("[data-fr][data-en]")
  elementsWithLang.forEach((element) => {
    const text = element.getAttribute(`data-${currentLanguage}`)
    if (text) {
      element.textContent = text
    }
  })
}

// Rafraîchir le menu
function refreshMenu() {
  loadMenuData()
  displayMenu()
  console.log("🔄 Menu eafraîchi")
}

// Exposer les fonctions globalement
window.menuSystem = {
  refresh: refreshMenu,
  loadData: loadMenuData,
}

console.log("📋 Système de menu final chargé")
