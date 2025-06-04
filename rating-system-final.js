// === SYSTÈME DE NOTATION COOKMASTER - VERSION FINALE ===

// Variables globales pour les notations
const userRatings = JSON.parse(localStorage.getItem("cookmaster-user-ratings") || "{}")
const userComments = JSON.parse(localStorage.getItem("cookmaster-user-comments") || "{}")

// Initialiser le système de notation
document.addEventListener("DOMContentLoaded", () => {
  initializeRatingSystem()
})

function initializeRatingSystem() {
  console.log("🌟 Initialisation du système de notation final")

  // Écouter les clics sur les étoiles
  document.addEventListener("click", handleRatingClick)

  // Charger les notations existantes
  loadExistingRatings()
}

// Gérer les clics sur les étoiles
function handleRatingClick(e) {
  if (e.target.classList.contains("star") && e.target.hasAttribute("data-value")) {
    const dishId = e.target.closest(".rating-stars").getAttribute("data-dish-id")
    const rating = Number.parseInt(e.target.getAttribute("data-value"))

    rateDish(dishId, rating)
  }
}

// Noter un plat
function rateDish(dishId, rating) {
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")

  if (!userSession.isAuthenticated) {
    showRatingNotification("Veuillez vous connecter pour noter ce plat", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  // Sauvegarder la notation
  if (!userRatings[dishId]) {
    userRatings[dishId] = {}
  }
  userRatings[dishId][userSession.userId] = rating

  // Mettre à jour l'affichage
  updateStarDisplay(dishId, rating)

  // Calculer la nouvelle moyenne
  const averageRating = calculateAverageRating(dishId)
  const ratingCount = Object.keys(userRatings[dishId]).length

  // Mettre à jour l'affichage de la moyenne
  updateAverageRatingDisplay(dishId, averageRating, ratingCount)

  // Sauvegarder
  localStorage.setItem("cookmaster-user-ratings", JSON.stringify(userRatings))

  showRatingNotification(`Merci pour votre note de ${rating} étoile${rating > 1 ? "s" : ""} !`, "success")
}

// Calculer la note moyenne
function calculateAverageRating(dishId) {
  const ratings = userRatings[dishId]
  if (!ratings || Object.keys(ratings).length === 0) return 0

  const values = Object.values(ratings)
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round((sum / values.length) * 10) / 10
}

// Mettre à jour l'affichage des étoiles
function updateStarDisplay(dishId, userRating) {
  const ratingStars = document.querySelector(`.rating-stars[data-dish-id="${dishId}"]`)
  if (!ratingStars) return

  const stars = ratingStars.querySelectorAll(".star")
  stars.forEach((star, index) => {
    const starValue = index + 1
    if (starValue <= userRating) {
      star.classList.add("user-rated")
      star.style.color = "#ffd700"
    } else {
      star.classList.remove("user-rated")
      star.style.color = "#ddd"
    }
  })
}

// Mettre à jour l'affichage de la moyenne
function updateAverageRatingDisplay(dishId, averageRating, ratingCount) {
  const dishCard = document.querySelector(`.dish-card[data-dish-id="${dishId}"]`)
  if (!dishCard) return

  let avgDisplay = dishCard.querySelector(".average-rating-display")
  if (!avgDisplay) {
    avgDisplay = document.createElement("div")
    avgDisplay.className = "average-rating-display"
    avgDisplay.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 10px 0;
      padding: 8px 12px;
      background: rgba(200, 129, 95, 0.1);
      border-radius: 8px;
    `

    const userRating = dishCard.querySelector(".dish-rating-system")
    if (userRating) {
      userRating.parentNode.insertBefore(avgDisplay, userRating.nextSibling)
    }
  }

  avgDisplay.innerHTML = `
    <div class="avg-rating-stars" style="display: flex; gap: 3px;">
      ${generateAverageStars(averageRating)}
    </div>
    <span class="avg-rating-text" style="font-weight: 600; color: var(--secondary-color);">
      <strong>${averageRating.toFixed(1)}/5</strong> (${ratingCount} avis)
    </span>
  `
}

// Générer les étoiles pour la moyenne
function generateAverageStars(rating) {
  let html = ""
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span class="avg-star filled" style="color: #ffd700; font-size: 1rem;">★</span>'
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      html += '<span class="avg-star half" style="color: #ffd700; font-size: 1rem;">★</span>'
    } else {
      html += '<span class="avg-star empty" style="color: #ddd; font-size: 1rem;">★</span>'
    }
  }
  return html
}

// Charger les notations existantes
function loadExistingRatings() {
  // Synchroniser avec les données admin si disponibles
  const adminData = localStorage.getItem("cookmaster-admin-recettes")
  if (adminData) {
    try {
      const adminRecipes = JSON.parse(adminData)
      adminRecipes.forEach((recipe) => {
        if (recipe.ratings) {
          Object.assign(userRatings, recipe.ratings)
        }
        if (recipe.comments) {
          Object.assign(userComments, recipe.comments)
        }
      })

      localStorage.setItem("cookmaster-user-ratings", JSON.stringify(userRatings))
      localStorage.setItem("cookmaster-user-comments", JSON.stringify(userComments))
    } catch (e) {
      console.error("Erreur lors du chargement des notations:", e)
    }
  }
}

// Afficher le modal de commentaire
window.showCommentModal = (dishId) => {
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")

  if (!userSession.isAuthenticated) {
    showRatingNotification("Veuillez vous connecter pour commenter", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  const modal = document.createElement("div")
  modal.className = "comment-modal"
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `

  modal.innerHTML = `
    <div class="comment-modal-content" style="
      background: white;
      padding: 2rem;
      border-radius: 15px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    ">
      <div class="comment-modal-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      ">
        <h3 style="margin: 0; color: var(--secondary-color);">Ajouter un commentaire</h3>
        <button class="close-modal" onclick="closeCommentModal()" style="
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        ">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="comment-modal-body">
        <textarea id="comment-text" placeholder="Partagez votre expérience avec ce plat..." rows="4" style="
          width: 100%;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-family: inherit;
          resize: vertical;
        "></textarea>
        <div class="comment-rating" style="
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        ">
          <span style="font-weight: 600;">Votre note :</span>
          <div class="comment-stars" data-dish-id="${dishId}" style="display: flex; gap: 5px;">
            ${[1, 2, 3, 4, 5]
              .map(
                (star) => `
              <span class="star comment-star" data-value="${star}" style="
                font-size: 1.5rem;
                color: #ddd;
                cursor: pointer;
                transition: color 0.2s ease;
              ">★</span>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
      <div class="comment-modal-footer" style="
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      ">
        <button class="btn-secondary" onclick="closeCommentModal()" style="
          padding: 0.75rem 1.5rem;
          border: 1px solid #ddd;
          background: white;
          color: #666;
          border-radius: 8px;
          cursor: pointer;
        ">Annuler</button>
        <button class="btn-primary" onclick="submitComment('${dishId}')" style="
          padding: 0.75rem 1.5rem;
          border: none;
          background: var(--primary-color);
          color: white;
          border-radius: 8px;
          cursor: pointer;
        ">Publier</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Événements pour les étoiles du modal
  modal.querySelectorAll(".comment-star").forEach((star) => {
    star.addEventListener("click", (e) => {
      const rating = Number.parseInt(e.target.getAttribute("data-value"))
      modal.querySelectorAll(".comment-star").forEach((s, index) => {
        if (index < rating) {
          s.style.color = "#ffd700"
          s.classList.add("selected")
        } else {
          s.style.color = "#ddd"
          s.classList.remove("selected")
        }
      })
      modal.setAttribute("data-rating", rating)
    })
  })
}

// Fermer le modal
window.closeCommentModal = () => {
  const modal = document.querySelector(".comment-modal")
  if (modal) {
    modal.remove()
  }
}

// Soumettre un commentaire
window.submitComment = (dishId) => {
  const commentText = document.getElementById("comment-text").value.trim()
  const modal = document.querySelector(".comment-modal")
  const rating = modal ? Number.parseInt(modal.getAttribute("data-rating") || "0") : 0

  if (!commentText) {
    showRatingNotification("Veuillez écrire un commentaire", "error")
    return
  }

  if (rating === 0) {
    showRatingNotification("Veuillez donner une note", "error")
    return
  }

  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")

  // Sauvegarder le commentaire
  if (!userComments[dishId]) {
    userComments[dishId] = {}
  }

  userComments[dishId][userSession.userId] = {
    text: commentText,
    rating: rating,
    userName: userSession.userName || "Utilisateur",
    date: new Date().toISOString(),
  }

  // Sauvegarder la notation
  if (!userRatings[dishId]) {
    userRatings[dishId] = {}
  }
  userRatings[dishId][userSession.userId] = rating

  // Sauvegarder dans localStorage
  localStorage.setItem("cookmaster-user-comments", JSON.stringify(userComments))
  localStorage.setItem("cookmaster-user-ratings", JSON.stringify(userRatings))

  // Mettre à jour l'affichage
  updateStarDisplay(dishId, rating)
  updateAverageRatingDisplay(dishId, calculateAverageRating(dishId), Object.keys(userRatings[dishId]).length)

  // Fermer le modal
  closeCommentModal()
  showRatingNotification("Merci pour votre commentaire et votre note !", "success")

  // Rafraîchir l'affichage du plat
  setTimeout(() => {
    if (window.menuSystem && window.menuSystem.refresh) {
      window.menuSystem.refresh()
    }
  }, 1000)
}

// Notification pour les notations
function showRatingNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `rating-notification ${type}`
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `

  notification.style.cssText = `
    position: fixed;
    top: 80px;
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
window.rateDish = rateDish
window.calculateAverageRating = calculateAverageRating

console.log("🌟 Système de notation final chargé")
