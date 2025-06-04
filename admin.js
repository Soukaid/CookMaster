// === SYSTÈME D'ADMINISTRATION COOKMASTER ===

// Classe Recette étendue pour l'administration
class RecetteAdmin {
  constructor(
    id,
    nom,
    categorie,
    ingredients,
    duree,
    preparation,
    photos = [],
    notes = [],
    prix = 0,
    description = "",
    isPublished = false,
  ) {
    this.id = id
    this.nom = nom
    this.categorie = categorie
    this.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split(",").map((i) => i.trim())
    this.duree = Number.parseInt(duree)
    this.preparation = Array.isArray(preparation) ? preparation : preparation.split("\n").filter((p) => p.trim())
    this.photos = photos
    this.notes = notes || []
    this.prix = Number.parseFloat(prix) || 0
    this.description = description || ""
    this.isPublished = isPublished || false
    this.dateCreation = new Date()
    this.dateModification = new Date()
  }

  getNoteMoyenne() {
    if (this.notes.length === 0) return 0
    const somme = this.notes.reduce((acc, note) => acc + note, 0)
    return Math.round((somme / this.notes.length) * 10) / 10
  }

  getNombreNotes() {
    return this.notes.length
  }

  ajouterNote(note) {
    if (note >= 1 && note <= 5) {
      this.notes.push(note)
      this.dateModification = new Date()
    }
  }

  getCategorieIcon() {
    const icons = {
      salade: "fas fa-leaf",
      plat: "fas fa-utensils",
      dessert: "fas fa-birthday-cake",
      jus: "fas fa-glass-whiskey",
    }
    return icons[this.categorie] || "fas fa-utensils"
  }

  getCategorieColor() {
    const colors = {
      salade: "#10b981",
      plat: "#f59e0b",
      dessert: "#8b5cf6",
      jus: "#06b6d4",
    }
    return colors[this.categorie] || "#64748b"
  }

  genererCarteHTML() {
    const photoUrl = this.photos.length > 0 ? this.photos[0] : "/placeholder.svg?height=200&width=300"
    const note = this.getNoteMoyenne()
    const etoiles = this.genererEtoiles(note)
    const statusClass = this.isPublished ? "published" : "unpublished"
    const statusText = this.isPublished ? "Publié" : "Brouillon"

    return `
      <div class="recipe-card category-${this.categorie} ${statusClass}" data-id="${this.id}">
        <div class="recipe-status ${statusClass}">${statusText}</div>
        <input type="checkbox" class="recipe-checkbox" data-id="${this.id}">
        <img src="${photoUrl}" alt="${this.nom}" class="recipe-image">
        <div class="recipe-content">
          <div class="recipe-header">
            <div>
              <h3 class="recipe-title">${this.nom}</h3>
              <span class="recipe-category">
                <i class="${this.getCategorieIcon()}"></i>
                ${this.categorie.charAt(0).toUpperCase() + this.categorie.slice(1)}
              </span>
            </div>
          </div>
          <div class="recipe-meta">
            <div class="recipe-time">
              <i class="fas fa-clock"></i>
              ${this.duree} min
            </div>
            <div class="recipe-price">
              <i class="fas fa-euro-sign"></i>
              ${this.prix.toFixed(2)} €
            </div>
            <div class="recipe-rating">
              <div class="stars">${etoiles}</div>
              <span>(${this.getNombreNotes()})</span>
            </div>
          </div>
          <div class="recipe-actions">
            <button class="btn-primary btn-small view-recipe" data-id="${this.id}">
              <i class="fas fa-eye"></i>
              Voir
            </button>
            <button class="btn-secondary btn-small edit-recipe" data-id="${this.id}">
              <i class="fas fa-edit"></i>
              Modifier
            </button>
            <button class="btn-secondary btn-small ${this.isPublished ? "unpublish-recipe" : "publish-recipe"}" data-id="${this.id}">
              <i class="fas fa-${this.isPublished ? "download" : "upload"}"></i>
              ${this.isPublished ? "Retirer" : "Publier"}
            </button>
            <button class="btn-secondary btn-small delete-recipe" data-id="${this.id}">
              <i class="fas fa-trash"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    `
  }

  genererEtoiles(note) {
    let html = ""
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(note)) {
        html += '<span class="star">★</span>'
      } else if (i === Math.ceil(note) && note % 1 !== 0) {
        html += '<span class="star">★</span>'
      } else {
        html += '<span class="star empty">★</span>'
      }
    }
    return html
  }

  // Convertir en format pour le menu public
  toMenuFormat() {
    return {
      id: this.id,
      nom: this.nom,
      categorie: this.categorie,
      prix: this.prix,
      description: this.description,
      image: this.photos[0] || "/placeholder.svg?height=200&width=300",
      ingredients: this.ingredients,
      duree: this.duree,
      note: this.getNoteMoyenne(),
    }
  }
}

// Gestionnaire principal de l'administration
class CookMasterAdmin {
  constructor() {
    this.recettes = []
    this.currentPage = "dashboard"
    this.currentRecipe = null
    this.ingredients = []
    this.steps = []
    this.searchFilters = {
      minRating: 0,
      maxTime: 180,
    }
    this.isAuthenticated = false
    this.selectedRecipes = new Set()
    this.isEditMode = false
    this.reservations = this.chargerReservations()

    this.init()
  }

  init() {
    this.verifierAuthentification()
    this.initialiserEvenements()
    this.ecouterNotationsMenu() 
  }

  // Authentification
  verifierAuthentification() {
    const isLoggedIn = sessionStorage.getItem("cookmaster-admin-auth")
    if (isLoggedIn === "true") {
      this.isAuthenticated = true
      this.afficherInterface()
      this.chargerRecettes()
      this.afficherPage("dashboard")
      this.mettreAJourStatistiques()
    } else {
      this.afficherEcranConnexion()
    }
  }

  afficherEcranConnexion() {
    document.getElementById("login-screen").style.display = "flex"
    document.getElementById("admin-interface").style.display = "none"
  }

  afficherInterface() {
    document.getElementById("login-screen").style.display = "none"
    document.getElementById("admin-interface").style.display = "block"
  }

  connecter(username, password) {
    if (username === "admin" && password === "cookmaster2024") {
      this.isAuthenticated = true
      sessionStorage.setItem("cookmaster-admin-auth", "true")
      this.afficherInterface()
      this.chargerRecettes()
      this.afficherPage("dashboard")
      this.mettreAJourStatistiques()
      this.afficherNotification("Connexion réussie !", "success")
      return true
    }
    return false
  }

  deconnecter() {
    this.isAuthenticated = false
    sessionStorage.removeItem("cookmaster-admin-auth")
    this.afficherEcranConnexion()
    this.afficherNotification("Déconnexion réussie", "success")
  }

  // Gestion des événements
  initialiserEvenements() {
    // Connexion
    document.getElementById("admin-login-form").addEventListener("submit", (e) => {
      e.preventDefault()
      const username = document.getElementById("admin-username").value
      const password = document.getElementById("admin-password").value

      if (!this.connecter(username, password)) {
        this.afficherNotification("Identifiants incorrects", "error")
      }
    })

    // Déconnexion
    document.getElementById("logout-btn").addEventListener("click", () => {
      this.deconnecter()
    })

    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const page = e.currentTarget.getAttribute("data-page")
        this.afficherPage(page)
      })
    })

    // Formulaire de recette
    document.getElementById("recipe-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.sauvegarderRecette()
    })

    // Gestion des ingrédients
    document.getElementById("add-ingredient").addEventListener("click", () => this.ajouterIngredient())
    document.getElementById("ingredient-input").addEventListener("keypress", (e) => {
      if (e.which === 13) {
        e.preventDefault()
        this.ajouterIngredient()
      }
    })

    // Gestion des étapes
    document.getElementById("add-step").addEventListener("click", () => this.ajouterEtape())
    document.getElementById("step-input").addEventListener("keypress", (e) => {
      if (e.which === 13 && e.ctrlKey) {
        e.preventDefault()
        this.ajouterEtape()
      }
    })

    // Actions sur les recettes
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-recipe")) {
        const id = e.target.getAttribute("data-id")
        this.afficherDetailsRecette(id)
      }

      if (e.target.classList.contains("edit-recipe")) {
        const id = e.target.getAttribute("data-id")
        this.modifierRecette(id)
      }

      if (e.target.classList.contains("delete-recipe")) {
        const id = e.target.getAttribute("data-id")
        this.supprimerRecette(id)
      }

      if (e.target.classList.contains("publish-recipe")) {
        const id = e.target.getAttribute("data-id")
        this.publierRecette(id)
      }

      if (e.target.classList.contains("unpublish-recipe")) {
        const id = e.target.getAttribute("data-id")
        this.retirerRecette(id)
      }

      // Gestion des commandes
      if (e.target.classList.contains("process-order")) {
        const id = e.target.getAttribute("data-id")
        this.traiterCommande(id)
      }

      if (e.target.classList.contains("complete-order")) {
        const id = e.target.getAttribute("data-id")
        this.terminerCommande(id)
      }

      if (e.target.classList.contains("cancel-order")) {
        const id = e.target.getAttribute("data-id")
        this.annulerCommande(id)
      }

      // Gestion des réservations
      if (e.target.classList.contains("confirm-reservation")) {
        const id = e.target.getAttribute("data-id")
        this.confirmerReservation(id)
      }

      if (e.target.classList.contains("cancel-reservation")) {
        const id = e.target.getAttribute("data-id")
        this.annulerReservation(id)
      }

      if (e.target.classList.contains("delete-reservation")) {
        const id = e.target.getAttribute("data-id")
        this.supprimerReservation(id)
      }
    })

    // Recherche
    document.getElementById("search-btn").addEventListener("click", () => this.effectuerRecherche())
    document.getElementById("search-time").addEventListener("input", (e) => {
      document.getElementById("time-display").textContent = e.target.value + " min"
      this.searchFilters.maxTime = Number.parseInt(e.target.value)
    })

    // Filtres de notation
    document.querySelectorAll(".rating-filter .star").forEach((star) => {
      star.addEventListener("click", (e) => {
        const rating = Number.parseInt(e.currentTarget.getAttribute("data-rating"))
        this.searchFilters.minRating = rating
        document.querySelectorAll(".rating-filter .star").forEach((s) => s.classList.remove("active"))
        for (let i = 1; i <= rating; i++) {
          document.querySelector(`.rating-filter .star[data-rating="${i}"]`).classList.add("active")
        }
      })
    })

    // Tri et filtres
    document.getElementById("sort-recipes").addEventListener("change", () => this.trierRecettes())
    document.getElementById("filter-category").addEventListener("change", () => this.filtrerRecettes())

    // Modal
    document.querySelectorAll(".modal-close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => this.fermerModal())
    })

    document.getElementById("recipe-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.fermerModal()
      }
    })

    // Boutons d'annulation
    document.getElementById("cancel-btn").addEventListener("click", () => {
      this.reinitialiserFormulaire()
      this.afficherPage("recipes")
    })

    // Actions de publication en masse
    document.getElementById("publish-selected").addEventListener("click", () => this.publierSelectionnes())
    document.getElementById("unpublish-selected").addEventListener("click", () => this.retirerSelectionnes())
    document.getElementById("sync-all").addEventListener("click", () => this.synchroniserMenu())

    // Sélection de recettes
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("recipe-checkbox")) {
        const id = e.target.getAttribute("data-id")
        if (e.target.checked) {
          this.selectedRecipes.add(id)
        } else {
          this.selectedRecipes.delete(id)
        }
      }
    })
  }

  // Navigation
  afficherPage(page) {
    if (!this.isAuthenticated) return

    // Mettre à jour la navigation
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"))
    document.querySelector(`.nav-link[data-page="${page}"]`).classList.add("active")

    // Afficher la page
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))
    document.getElementById(`${page}-page`).classList.add("active")

    this.currentPage = page

    // Charger le contenu spécifique à la page
    switch (page) {
      case "dashboard":
        this.chargerTableauDeBord()
        break
      case "recipes":
        this.chargerListeRecettes()
        break
      case "search":
        this.chargerPageRecherche()
        break
      case "add":
        this.chargerFormulaireAjout()
        break
      case "orders":
        this.chargerPageCommandes()
        break
      case "menu-sync":
        this.chargerPagePublication()
        break
      case "reservations":
        this.chargerPageReservations()
        break
    }
  }

  // Chargement des données
  chargerRecettes() {
    const recettesSauvegardees = localStorage.getItem("cookmaster-admin-recettes")
    if (recettesSauvegardees) {
      const donnees = JSON.parse(recettesSauvegardees)
      this.recettes = donnees.map(
        (data) =>
          new RecetteAdmin(
            data.id,
            data.nom,
            data.categorie,
            data.ingredients,
            data.duree,
            data.preparation,
            data.photos,
            data.notes,
            data.prix,
            data.description,
            data.isPublished,
          ),
      )
    } else {
      this.chargerRecettesExemple()
    }
  }

  chargerRecettesExemple() {
    const exemples = [
      new RecetteAdmin(
        "1",
        "Salade César Moderne",
        "salade",
        ["laitue romaine", "parmesan", "croûtons maison", "anchois", "huile d'olive extra vierge"],
        25,
        ["Laver et couper la laitue", "Préparer la vinaigrette", "Mélanger tous les ingrédients"],
        ["images/salad cesar.jpg"],
        [5, 4, 5, 4],
        12.5,
        "Une salade César revisitée avec des ingrédients frais et une vinaigrette maison",
        true,
      ),
      new RecetteAdmin(
        "2",
        "Risotto aux Champignons",
        "plat",
        ["riz arborio", "champignons porcini", "bouillon de légumes", "vin blanc", "parmesan"],
        45,
        [
          "Faire chauffer le bouillon",
          "Faire revenir les champignons",
          "Cuire le riz en ajoutant le bouillon progressivement",
        ],
        ["images/risotto-aux-champignons.jpeg"],
        [5, 5, 4, 5],
        18.9,
        "Un risotto crémeux aux champignons porcini, cuit à la perfection",
        true,
      ),
      new RecetteAdmin(
        "3",
        "Tarte au Chocolat",
        "dessert",
        ["chocolat noir", "beurre", "œufs", "sucre", "pâte brisée"],
        90,
        ["Préparer la pâte", "Faire fondre le chocolat", "Mélanger tous les ingrédients", "Cuire au four"],
        ["images/tarte aux chocolt.jpg"],
        [4, 5, 5, 4],
        8.5,
        "Une tarte au chocolat riche et fondante, parfaite pour les amateurs de cacao",
        true,
      ),
      new RecetteAdmin(
        "4",
        "Smoothie Tropical",
        "jus",
        ["mangue", "ananas", "lait de coco", "banane", "miel"],
        10,
        ["Éplucher les fruits", "Mixer tous les ingrédients", "Servir frais"],
        ["images/Smoothie Tropical.jpg"],
        [4, 4, 5],
        6.5,
        "Un smoothie rafraîchissant aux saveurs tropicales",
        true,
      ),
    ]

    this.recettes = exemples
    this.sauvegarderRecettes()
    this.notifierMiseAJourMenu()
    this.afficherNotification("Recettes d'exemple chargées et publiées !", "success")
  }

  sauvegarderRecettes() {
    localStorage.setItem("cookmaster-admin-recettes", JSON.stringify(this.recettes))
    this.synchroniserAvecMenu()

    // Déclencher un événement pour notifier le menu
    window.dispatchEvent(
      new CustomEvent("menuDataUpdated", {
        detail: { recettes: this.recettes.filter((r) => r.isPublished) },
      }),
    )

    // Forcer le rechargement du menu si la page est ouverte
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: "MENU_UPDATE" }, "*")
      } catch (e) {
        console.log("Impossible de communiquer avec la page menu")
      }
    }
  }

  // Synchronisation avec le menu public
  synchroniserAvecMenu() {
    const recettesPubliees = this.recettes.filter((r) => r.isPublished)
    const menuData = recettesPubliees.map((r) => r.toMenuFormat())
    localStorage.setItem("cookmaster-menu-data", JSON.stringify(menuData))
  }

  // Nouvelle méthode pour notifier les mises à jour
  notifierMiseAJourMenu() {
    // Déclencher un événement personnalisé
    const event = new CustomEvent("cookmaster-menu-updated", {
      detail: {
        timestamp: Date.now(),
        recettesPubliees: this.recettes.filter((r) => r.isPublished).length,
      },
    })
    window.dispatchEvent(event)

    // Essayer de communiquer avec d'autres onglets
    try {
      localStorage.setItem("cookmaster-last-update", Date.now().toString())
    } catch (e) {
      console.error("Erreur lors de la notification:", e)
    }
  }

  // Pages spécifiques
  chargerTableauDeBord() {
    this.mettreAJourStatistiques()
    this.afficherRecettesRecentes()
    this.afficherMieuxNotees()
  }

  mettreAJourStatistiques() {
    const total = this.recettes.length

    // Synchroniser les notations avant de calculer les statistiques
    this.synchroniserNotationsAvecMenu()

    // Calculer la note moyenne en utilisant les vraies notations
    let totalNotes = 0
    let nombreRecettesNotees = 0

    this.recettes.forEach((recette) => {
      const noteRecette = recette.getNoteMoyenne()
      if (noteRecette > 0) {
        totalNotes += noteRecette
        nombreRecettesNotees++
      }
    })

    const noteMoyenne = nombreRecettesNotees > 0 ? (totalNotes / nombreRecettesNotees).toFixed(1) : 0
    const tempsMoyen =
      this.recettes.length > 0 ? Math.round(this.recettes.reduce((acc, r) => acc + r.duree, 0) / total) : 0
    const publiees = this.recettes.filter((r) => r.isPublished).length

    document.getElementById("total-recipes").textContent = total
    document.getElementById("avg-rating").textContent = noteMoyenne
    document.getElementById("avg-time").textContent = tempsMoyen + " min"
    document.getElementById("published-recipes").textContent = publiees

    console.log("📊 Statistiques mises à jour - Note moyenne:", noteMoyenne)
  }

  afficherRecettesRecentes() {
    const recentes = this.recettes.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 3)

    const html = recentes.map((r) => r.genererCarteHTML()).join("")
    document.getElementById("recent-recipes-grid").innerHTML = html
  }

  afficherMieuxNotees() {
    const mieuxNotees = this.recettes
      .filter((r) => r.getNombreNotes() > 0)
      .sort((a, b) => b.getNoteMoyenne() - a.getNoteMoyenne())
      .slice(0, 3)

    const html = mieuxNotees.map((r) => r.genererCarteHTML()).join("")
    document.getElementById("top-rated-grid").innerHTML = html
  }

  chargerListeRecettes() {
    this.afficherRecettes(this.recettes)
  }

  afficherRecettes(recettes) {
    if (recettes.length === 0) {
      document.getElementById("recipes-container").innerHTML = `
        <div class="loading">
          <i class="fas fa-search"></i>
          Aucune recette trouvée
        </div>
      `
      return
    }

    const html = recettes.map((r) => r.genererCarteHTML()).join("")
    document.getElementById("recipes-container").innerHTML = html
  }

  chargerPageRecherche() {
    this.effectuerRecherche()
  }

  effectuerRecherche() {
    const nom = document.getElementById("search-name").value.toLowerCase()
    const ingredients = document.getElementById("search-ingredients").value.toLowerCase()
    const categorie = document.getElementById("search-category").value

    const resultats = this.recettes.filter((recette) => {
      const matchNom = !nom || recette.nom.toLowerCase().includes(nom)
      const matchIngredients =
        !ingredients || recette.ingredients.some((ing) => ing.toLowerCase().includes(ingredients))
      const matchCategorie = !categorie || recette.categorie === categorie
      const matchTemps = recette.duree <= this.searchFilters.maxTime
      const matchNote = recette.getNoteMoyenne() >= this.searchFilters.minRating

      return matchNom && matchIngredients && matchCategorie && matchTemps && matchNote
    })

    document.getElementById("results-count").textContent =
      `${resultats.length} résultat${resultats.length > 1 ? "s" : ""} trouvé${resultats.length > 1 ? "s" : ""}`

    if (resultats.length === 0) {
      document.getElementById("search-results-grid").innerHTML = `
        <div class="loading">
          <i class="fas fa-search"></i>
          Aucune recette ne correspond à vos critères
        </div>
      `
    } else {
      const html = resultats.map((r) => r.genererCarteHTML()).join("")
      document.getElementById("search-results-grid").innerHTML = html
    }
  }

  chargerFormulaireAjout() {
    if (!this.isEditMode) {
      this.reinitialiserFormulaire()
    }
  }

  chargerPagePublication() {
    const nonPubliees = this.recettes.filter((r) => !r.isPublished)
    const publiees = this.recettes.filter((r) => r.isPublished)

    const htmlNonPubliees =
      nonPubliees.length > 0
        ? nonPubliees.map((r) => r.genererCarteHTML()).join("")
        : '<div class="loading"><i class="fas fa-info-circle"></i>Toutes les recettes sont publiées</div>'

    const htmlPubliees =
      publiees.length > 0
        ? publiees.map((r) => r.genererCarteHTML()).join("")
        : '<div class="loading"><i class="fas fa-info-circle"></i>Aucune recette publiée</div>'

    document.getElementById("unpublished-recipes").innerHTML = htmlNonPubliees
    document.getElementById("published-recipes-grid").innerHTML = htmlPubliees
  }

  chargerPageCommandes() {
    this.afficherCommandes()
  }

  chargerReservations() {
    const reservationsData = localStorage.getItem("reservations")
    return reservationsData ? JSON.parse(reservationsData) : []
  }

  sauvegarderReservations() {
    localStorage.setItem("reservations", JSON.stringify(this.reservations))
  }

  chargerPageReservations() {
    this.afficherReservations()
  }

  afficherReservations() {
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const container = document.getElementById("reservations-container")

    if (!container) return

    if (reservations.length === 0) {
      container.innerHTML = `
      <div class="loading">
        <i class="fas fa-calendar-times"></i>
        Aucune réservation trouvée
      </div>
    `
      return
    }

    const html = reservations
      .map(
        (reservation) => `
    <div class="reservation-card" data-id="${reservation.id}">
      <div class="reservation-header">
        <div class="reservation-info">
          <h3>${reservation.fullName}</h3>
          <span class="reservation-status ${reservation.status || "confirmed"}">${this.getStatusLabel(
            reservation.status || "confirmed",
          )}</span>
        </div>
        <div class="reservation-actions">
          <button class="btn-secondary btn-small confirm-reservation" data-id="${reservation.id}">
            <i class="fas fa-check"></i>
            Confirmer
          </button>
          <button class="btn-secondary btn-small cancel-reservation" data-id="${reservation.id}">
            <i class="fas fa-times"></i>
            Annuler
          </button>
          <button class="btn-secondary btn-small delete-reservation" data-id="${reservation.id}">
            <i class="fas fa-trash"></i>
            Supprimer
          </button>
        </div>
      </div>
      <div class="reservation-details">
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>${new Date(reservation.date).toLocaleDateString("fr-FR")}</span>
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
          <span>${this.getTableTypeLabel(reservation.tableType)}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-envelope"></i>
          <span>${reservation.email}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-phone"></i>
          <span>${reservation.phone}</span>
        </div>
      </div>
      ${
        reservation.specialRequests
          ? `
        <div class="reservation-notes">
          <strong>Demandes spéciales:</strong>
          <p>${reservation.specialRequests}</p>
        </div>
      `
          : ""
      }
    </div>
  `,
      )
      .join("")

    container.innerHTML = html
  }

  afficherCommandes() {
    const commandes = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
    const container = document.getElementById("orders-container")

    if (!container) return

    if (commandes.length === 0) {
      container.innerHTML = `
      <div class="loading">
        <i class="fas fa-shopping-cart"></i>
        Aucune commande trouvée
      </div>
    `
      return
    }

    const html = commandes
      .map(
        (commande) => `
    <div class="order-card" data-id="${commande.id || Date.now()}">
      <div class="order-header">
        <div class="order-info">
          <h3>Commande #${commande.id || "N/A"}</h3>
          <span class="order-status ${commande.status || "pending"}">${this.getOrderStatusLabel(
            commande.status || "pending",
          )}</span>
        </div>
        <div class="order-actions">
          <button class="btn-secondary btn-small process-order" data-id="${commande.id}">
            <i class="fas fa-cog"></i>
            Traiter
          </button>
          <button class="btn-secondary btn-small complete-order" data-id="${commande.id}">
            <i class="fas fa-check"></i>
            Terminer
          </button>
          <button class="btn-secondary btn-small cancel-order" data-id="${commande.id}">
            <i class="fas fa-times"></i>
            Annuler
          </button>
        </div>
      </div>
      <div class="order-details">
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>${new Date(commande.date).toLocaleDateString("fr-FR")} à ${new Date(commande.date).toLocaleTimeString(
            "fr-FR",
          )}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-user"></i>
          <span>Client ID: ${commande.userId}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-euro-sign"></i>
          <span>${commande.totalPrice.toFixed(2)} €</span>
        </div>
      </div>
      <div class="order-items">
        <h4>Articles commandés:</h4>
        ${commande.items
          .map(
            (item) => `
          <div class="order-item">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            <div class="item-details">
              <span class="item-name">${item.name}</span>
              <span class="item-quantity">Quantité: ${item.quantity}</span>
              <span class="item-price">${(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `,
      )
      .join("")

    container.innerHTML = html
  }

  getStatusLabel(status) {
    const labels = {
      confirmed: "Confirmée",
      pending: "En attente",
      cancelled: "Annulée",
      completed: "Terminée",
    }
    return labels[status] || status
  }

  getOrderStatusLabel(status) {
    const labels = {
      pending: "En attente",
      processing: "En cours",
      completed: "Terminée",
      cancelled: "Annulée",
    }
    return labels[status] || status
  }

  getTableTypeLabel(tableType) {
    const labels = {
      standard: "Table Standard",
      window: "Table près de la fenêtre",
      private: "Salon Privé",
      terrace: "Terrasse",
    }
    return labels[tableType] || tableType
  }

  // Gestion du formulaire
  ajouterIngredient() {
    const ingredient = document.getElementById("ingredient-input").value.trim()
    if (ingredient && !this.ingredients.includes(ingredient)) {
      this.ingredients.push(ingredient)
      this.mettreAJourListeIngredients()
      document.getElementById("ingredient-input").value = ""
      document.getElementById("ingredient-input").focus()
    }
  }

  mettreAJourListeIngredients() {
    const html = this.ingredients
      .map(
        (ing, index) => `
      <div class="ingredient-item">
        <span>${ing}</span>
        <button type="button" class="remove-btn" onclick="adminApp.supprimerIngredient(${index})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `,
      )
      .join("")

    document.getElementById("ingredients-list").innerHTML = html
    document.getElementById("ingredients-hidden").value = this.ingredients.join(",")
  }

  supprimerIngredient(index) {
    this.ingredients.splice(index, 1)
    this.mettreAJourListeIngredients()
  }

  ajouterEtape() {
    const etape = document.getElementById("step-input").value.trim()
    if (etape) {
      this.steps.push(etape)
      this.mettreAJourListeEtapes()
      document.getElementById("step-input").value = ""
      document.getElementById("step-input").focus()
    }
  }

  mettreAJourListeEtapes() {
    const html = this.steps
      .map(
        (step, index) => `
      <div class="step-item">
        <div class="step-number">${index + 1}</div>
        <span>${step}</span>
        <button type="button" class="remove-btn" onclick="adminApp.supprimerEtape(${index})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `,
      )
      .join("")

    document.getElementById("steps-list").innerHTML = html
    document.getElementById("preparation-hidden").value = this.steps.join("\n")
  }

  supprimerEtape(index) {
    this.steps.splice(index, 1)
    this.mettreAJourListeEtapes()
  }

  sauvegarderRecette() {
    const formData = new FormData(document.getElementById("recipe-form"))

    const nom = formData.get("nom").trim()
    const categorie = formData.get("categorie")
    const duree = Number.parseInt(formData.get("duree"))
    const prix = Number.parseFloat(formData.get("prix"))
    const description = formData.get("description").trim()

    if (!nom || !categorie || !duree || !prix || this.ingredients.length === 0 || this.steps.length === 0) {
      this.afficherNotification("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    const photos = []
    const fichiers = document.getElementById("recipe-photo").files
    let loadedImages = 0

    const saveRecipeAfterImageLoad = () => {
      if (this.currentRecipe) {
        // Modification
        this.currentRecipe.nom = nom
        this.currentRecipe.categorie = categorie
        this.currentRecipe.duree = duree
        this.currentRecipe.prix = prix
        this.currentRecipe.description = description
        this.currentRecipe.ingredients = [...this.ingredients]
        this.currentRecipe.preparation = [...this.steps]
        this.currentRecipe.dateModification = new Date()
        if (photos.length > 0) {
          this.currentRecipe.photos = photos
        }

        this.afficherNotification("Recette modifiée avec succès !", "success")
      } else {
        // Ajout
        const nouvelleRecette = new RecetteAdmin(
          Date.now().toString(),
          nom,
          categorie,
          this.ingredients,
          duree,
          this.steps,
          photos,
          [],
          prix,
          description,
          false,
        )

        this.recettes.push(nouvelleRecette)
        this.afficherNotification("Recette ajoutée avec succès !", "success")
      }

      this.sauvegarderRecettes()
      this.reinitialiserFormulaire()
      this.afficherPage("recipes")
      // Notifier la mise à jour du menu
      this.notifierMiseAJourMenu()
    }

    if (fichiers.length > 0) {
      for (let i = 0; i < fichiers.length; i++) {
        const fichier = fichiers[i]
        if (fichier.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (e) => {
            photos.push(e.target.result)
            loadedImages++
            if (loadedImages === fichiers.length) {
              saveRecipeAfterImageLoad()
            }
          }
          reader.readAsDataURL(fichier)
        }
      }
    } else {
      saveRecipeAfterImageLoad()
    }
  }

  reinitialiserFormulaire() {
    document.getElementById("recipe-form").reset()
    this.ingredients = []
    this.steps = []
    this.currentRecipe = null
    this.isEditMode = false
    this.mettreAJourListeIngredients()
    this.mettreAJourListeEtapes()
    this.mettreAJourTitreFormulaire()
  }

  mettreAJourTitreFormulaire() {
    const titre = this.isEditMode ? "Modifier la recette" : "Ajouter une recette"
    const description = this.isEditMode ? "Modifiez les informations de votre recette" : "Créez votre nouvelle recette"

    document.getElementById("form-title").textContent = titre
    document.querySelector("#add-page .page-header p").textContent = description

    const submitBtn = document.getElementById("submit-btn")
    submitBtn.innerHTML = this.isEditMode
      ? '<i class="fas fa-save"></i> Mettre à jour'
      : '<i class="fas fa-save"></i> Enregistrer'
  }

  // Actions sur les recettes
  modifierRecette(id) {
    const recette = this.recettes.find((r) => r.id === id)
    if (recette) {
      this.currentRecipe = recette
      this.isEditMode = true
      this.ingredients = [...recette.ingredients]
      this.steps = [...recette.preparation]

      document.getElementById("recipe-name").value = recette.nom
      document.getElementById("recipe-category").value = recette.categorie
      document.getElementById("recipe-time").value = recette.duree
      document.getElementById("recipe-price").value = recette.prix
      document.getElementById("recipe-description").value = recette.description

      this.mettreAJourListeIngredients()
      this.mettreAJourListeEtapes()
      this.mettreAJourTitreFormulaire()

      this.afficherPage("add")

      this.afficherNotification(`Mode modification activé pour "${recette.nom}"`, "info")
    }
  }

  supprimerRecette(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      this.recettes = this.recettes.filter((r) => r.id !== id)
      this.sauvegarderRecettes()
      this.afficherNotification("Recette supprimée", "success")

      if (this.currentPage === "recipes") {
        this.chargerListeRecettes()
      } else if (this.currentPage === "dashboard") {
        this.chargerTableauDeBord()
      } else if (this.currentPage === "menu-sync") {
        this.chargerPagePublication()
      }
    }
  }

  publierRecette(id) {
    const recette = this.recettes.find((r) => r.id === id)
    if (recette) {
      recette.isPublished = true
      recette.dateModification = new Date()
      this.sauvegarderRecettes()

      // Notification spécifique pour la publication
      this.notifierMiseAJourMenu()
      this.afficherNotification(`${recette.nom} publié sur le menu !`, "success")
      this.rafraichirAffichage()
    }
  }

  retirerRecette(id) {
    const recette = this.recettes.find((r) => r.id === id)
    if (recette) {
      recette.isPublished = false
      recette.dateModification = new Date()
      this.sauvegarderRecettes()
      this.afficherNotification(`${recette.nom} retiré du menu`, "warning")
      this.rafraichirAffichage()
    }
  }

  publierSelectionnes() {
    if (this.selectedRecipes.size === 0) {
      this.afficherNotification("Aucune recette sélectionnée", "warning")
      return
    }

    let count = 0
    this.selectedRecipes.forEach((id) => {
      const recette = this.recettes.find((r) => r.id === id)
      if (recette && !recette.isPublished) {
        recette.isPublished = true
        recette.dateModification = new Date()
        count++
      }
    })

    if (count > 0) {
      this.sauvegarderRecettes()
      this.afficherNotification(`${count} recette(s) publiée(s) !`, "success")
      this.selectedRecipes.clear()
      this.rafraichirAffichage()
    }
  }

  retirerSelectionnes() {
    if (this.selectedRecipes.size === 0) {
      this.afficherNotification("Aucune recette sélectionnée", "warning")
      return
    }

    let count = 0
    this.selectedRecipes.forEach((id) => {
      const recette = this.recettes.find((r) => r.id === id)
      if (recette && recette.isPublished) {
        recette.isPublished = false
        recette.dateModification = new Date()
        count++
      }
    })

    if (count > 0) {
      this.sauvegarderRecettes()
      this.afficherNotification(`${count} recette(s) retirée(s) du menu`, "warning")
      this.selectedRecipes.clear()
      this.rafraichirAffichage()
    }
  }

  synchroniserMenu() {
    this.synchroniserAvecMenu()
    this.afficherNotification("Menu synchronisé avec succès !", "success")
  }

  rafraichirAffichage() {
    if (this.currentPage === "dashboard") {
      this.chargerTableauDeBord()
    } else if (this.currentPage === "recipes") {
      this.chargerListeRecettes()
    } else if (this.currentPage === "menu-sync") {
      this.chargerPagePublication()
    }
  }

  afficherDetailsRecette(id) {
    const recette = this.recettes.find((r) => r.id === id)
    if (recette) {
      const modalBody = `
        <div class="recipe-details">
          <div class="recipe-meta">
            <span class="recipe-category">
              <i class="${recette.getCategorieIcon()}"></i>
              ${recette.categorie.charAt(0).toUpperCase() + recette.categorie.slice(1)}
            </span>
            <span class="recipe-time">
              <i class="fas fa-clock"></i>
              ${recette.duree} minutes
            </span>
            <span class="recipe-price">
              <i class="fas fa-euro-sign"></i>
              ${recette.prix.toFixed(2)} €
            </span>
            <div class="recipe-rating">
              <div class="stars">${recette.genererEtoiles(recette.getNoteMoyenne())}</div>
              <span>${recette.getNoteMoyenne()}/5 (${recette.getNombreNotes()} avis)</span>
            </div>
          </div>
          
          ${recette.description ? `<p><strong>Description:</strong> ${recette.description}</p>` : ""}
          
          <h3>Ingrédients</h3>
          <ul class="ingredients-list">
            ${recette.ingredients.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>
          
          <h3>Préparation</h3>
          <ol class="steps-list">
            ${recette.preparation.map((step) => `<li>${step}</li>`).join("")}
          </ol>
          
          <div class="recipe-status-info">
            <p><strong>Statut:</strong> ${recette.isPublished ? "✅ Publié sur le menu" : "⏳ En brouillon"}</p>
            <p><strong>Créé le:</strong> ${new Date(recette.dateCreation).toLocaleDateString()}</p>
            <p><strong>Modifié le:</strong> ${new Date(recette.dateModification).toLocaleDateString()}</p>
          </div>
          
          <div class="rating-section">
            <h4>Noter cette recette</h4>
            <div class="rating-input">
              ${[1, 2, 3, 4, 5].map((i) => `<span class="star rating-star" data-rating="${i}" data-recipe-id="${id}">★</span>`).join("")}
            </div>
          </div>
        </div>
      `

      document.getElementById("modal-title").textContent = recette.nom
      document.getElementById("modal-body").innerHTML = modalBody
      document.getElementById("recipe-modal").style.display = "block"

      // Gestion de la notation
      document.querySelectorAll(".rating-star").forEach((star) => {
        star.addEventListener("click", (e) => {
          const rating = Number.parseInt(e.currentTarget.getAttribute("data-rating"))
          const recipeId = e.currentTarget.getAttribute("data-recipe-id")
          this.noterRecette(recipeId, rating)
        })
      })
    }
  }

  noterRecette(id, note) {
    const recette = this.recettes.find((r) => r.id === id)
    if (recette) {
      recette.ajouterNote(note)
      this.sauvegarderRecettes()
      this.afficherNotification(`Note de ${note} étoiles ajoutée !`, "success")
      this.fermerModal()
      this.rafraichirAffichage()
    }
  }

  fermerModal() {
    document.getElementById("recipe-modal").style.display = "none"
  }

  // Tri et filtrage
  trierRecettes() {
    const critere = document.getElementById("sort-recipes").value
    const recettesTries = [...this.recettes]

    switch (critere) {
      case "name":
        recettesTries.sort((a, b) => a.nom.localeCompare(b.nom))
        break
      case "rating":
        recettesTries.sort((a, b) => b.getNoteMoyenne() - a.getNoteMoyenne())
        break
      case "time":
        recettesTries.sort((a, b) => a.duree - b.duree)
        break
      case "category":
        recettesTries.sort((a, b) => a.categorie.localeCompare(b.categorie))
        break
      case "recent":
        recettesTries.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
        break
    }

    this.afficherRecettes(recettesTries)
  }

  filtrerRecettes() {
    const categorie = document.getElementById("filter-category").value
    let recettesFiltrees = this.recettes

    if (categorie) {
      recettesFiltrees = this.recettes.filter((r) => r.categorie === categorie)
    }

    this.afficherRecettes(recettesFiltrees)
  }

  // Notifications
  afficherNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.classList.add("notification", type)
    notification.innerHTML = `
      <i class="fas fa-${type === "success" ? "check" : type === "error" ? "exclamation-triangle" : type === "info" ? "info-circle" : "info"}"></i>
      ${message}
    `

    document.getElementById("notifications").appendChild(notification)

    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  // === NOUVELLES MÉTHODES POUR COMMANDES ET RÉSERVATIONS ===

  // Gestion des commandes
  traiterCommande(id) {
    const commandes = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
    const commande = commandes.find((c) => c.id == id)

    if (commande) {
      commande.status = "processing"
      commande.updatedAt = new Date().toISOString()
      localStorage.setItem("cookmaster-orders", JSON.stringify(commandes))
      this.afficherNotification(`Commande #${id} mise en cours de traitement`, "info")
      this.afficherCommandes()
    }
  }

  terminerCommande(id) {
    const commandes = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
    const commande = commandes.find((c) => c.id == id)

    if (commande) {
      commande.status = "completed"
      commande.completedAt = new Date().toISOString()
      localStorage.setItem("cookmaster-orders", JSON.stringify(commandes))
      this.afficherNotification(`Commande #${id} terminée avec succès !`, "success")
      this.afficherCommandes()
    }
  }

  annulerCommande(id) {
    if (confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      const commandes = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
      const commande = commandes.find((c) => c.id == id)

      if (commande) {
        commande.status = "cancelled"
        commande.cancelledAt = new Date().toISOString()
        localStorage.setItem("cookmaster-orders", JSON.stringify(commandes))
        this.afficherNotification(`Commande #${id} annulée`, "warning")
        this.afficherCommandes()
      }
    }
  }

  // Gestion des réservations
  confirmerReservation(id) {
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const reservation = reservations.find((r) => r.id == id)

    if (reservation) {
      reservation.status = "confirmed"
      reservation.confirmedAt = new Date().toISOString()
      localStorage.setItem("reservations", JSON.stringify(reservations))
      this.afficherNotification(`Réservation de ${reservation.fullName} confirmée`, "success")
      this.afficherReservations()
    }
  }

  annulerReservation(id) {
    if (confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
      const reservation = reservations.find((r) => r.id == id)

      if (reservation) {
        reservation.status = "cancelled"
        reservation.cancelledAt = new Date().toISOString()
        localStorage.setItem("reservations", JSON.stringify(reservations))
        this.afficherNotification(`Réservation de ${reservation.fullName} annulée`, "warning")
        this.afficherReservations()
      }
    }
  }

  supprimerReservation(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?")) {
      let reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
      reservations = reservations.filter((r) => r.id != id)
      localStorage.setItem("reservations", JSON.stringify(reservations))
      this.afficherNotification("Réservation supprimée", "success")
      this.afficherReservations()
    }
  }

  // Synchronisation des notations depuis le menu public
  synchroniserNotationsAvecMenu() {
    try {
      // Récupérer les notations depuis le système de notation du menu
      const notationsUtilisateurs = JSON.parse(localStorage.getItem("cookmaster-user-ratings") || "{}")
      let notationsModifiees = false

      console.log("📊 Synchronisation des notations:", notationsUtilisateurs)

      // Mettre à jour chaque recette avec les nouvelles notations
      this.recettes.forEach((recette) => {
        if (notationsUtilisateurs[recette.id]) {
          const notesUtilisateurs = Object.values(notationsUtilisateurs[recette.id])

          // Vérifier si les notes ont changé
          if (JSON.stringify(recette.notes.sort()) !== JSON.stringify(notesUtilisateurs.sort())) {
            recette.notes = [...notesUtilisateurs]
            recette.dateModification = new Date()
            notationsModifiees = true
            console.log(`✅ Notes mises à jour pour ${recette.nom}:`, recette.notes)
          }
        }
      })

      // Sauvegarder si des modifications ont été apportées
      if (notationsModifiees) {
        this.sauvegarderRecettes()
        console.log("💾 Recettes sauvegardées avec nouvelles notations")

        // Mettre à jour l'affichage si on est sur le dashboard
        if (this.currentPage === "dashboard") {
          this.mettreAJourStatistiques()
          this.afficherMieuxNotees()
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des notations:", error)
    }
  }

  // Calculer la note moyenne d'une recette depuis les notations utilisateurs
  calculerNoteMoyenneDepuisMenu(recetteId) {
    try {
      const notationsUtilisateurs = JSON.parse(localStorage.getItem("cookmaster-user-ratings") || "{}")

      if (notationsUtilisateurs[recetteId]) {
        const notes = Object.values(notationsUtilisateurs[recetteId])
        if (notes.length > 0) {
          const moyenne = notes.reduce((sum, note) => sum + note, 0) / notes.length
          return Math.round(moyenne * 10) / 10
        }
      }
      return 0
    } catch (error) {
      console.error("Erreur calcul note moyenne:", error)
      return 0
    }
  }

  // Écouter les changements de notations depuis le menu
  ecouterNotationsMenu() {
    // Synchroniser immédiatement au démarrage
    this.synchroniserNotationsAvecMenu()

    // Écouter les changements dans le localStorage
    window.addEventListener("storage", (e) => {
      if (e.key === "cookmaster-user-ratings") {
        console.log("🔄 Nouvelles notations détectées depuis le menu")
        this.synchroniserNotationsAvecMenu()
        this.rafraichirAffichage()
      }
    })

    // Vérifier périodiquement les nouvelles notations
    setInterval(() => {
      this.synchroniserNotationsAvecMenu()
    }, 10000) // Toutes les 10 secondes
  }
}

// Initialisation de l'application d'administration
let adminApp

document.addEventListener("DOMContentLoaded", () => {
  adminApp = new CookMasterAdmin()
  console.log("🔧 Administration CookMaster initialisée !")
})
