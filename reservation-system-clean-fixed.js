// Système de réservation corrigé pour CookMaster
let isSubmitting = false

// Declare the variables before using them
function isUserLoggedIn() {
  // Implementation of isUserLoggedIn
  return true // Placeholder implementation
}

function getCurrentUser() {
  // Implementation of getCurrentUser
  return { firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "1234567890" } // Placeholder implementation
}

function showNotification(message, type) {
  // Implementation of showNotification
  console.log(`Notification (${type}): ${message}`) // Placeholder implementation
}

document.addEventListener("DOMContentLoaded", () => {
  // Attendre que le système d'auth soit initialisé
  setTimeout(() => {
    initializeReservationSystem()
  }, 100)
})

function initializeReservationSystem() {
  console.log("📅 Initialisation du système de réservation")

  // Vérifier l'authentification
  if (!isUserLoggedIn()) {
    console.log("❌ Utilisateur non connecté, redirection vers login")
    redirectToLogin()
    return
  }

  console.log("✅ Utilisateur connecté, initialisation du formulaire")

  // Initialiser le formulaire
  initializeForm()
  prefillUserData()
  setMinDate()

  console.log("✅ Système de réservation prêt")
}

function initializeForm() {
  const form = document.getElementById("reservationForm")
  if (form) {
    form.addEventListener("submit", handleSubmit)
  }

  // Validation en temps réel
  const inputs = document.querySelectorAll("input[required], select[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input))
    input.addEventListener("input", () => clearFieldError(input))
  })
}

function prefillUserData() {
  const user = getCurrentUser()
  if (!user) {
    console.log("❌ Aucun utilisateur trouvé pour le pré-remplissage")
    return
  }

  console.log("📝 Pré-remplissage avec les données de:", user)

  const fullNameInput = document.getElementById("fullName")
  const emailInput = document.getElementById("email")
  const phoneInput = document.getElementById("phone")

  if (fullNameInput && !fullNameInput.value) {
    if (user.firstName && user.lastName) {
      fullNameInput.value = `${user.firstName} ${user.lastName}`
    } else if (user.username) {
      fullNameInput.value = user.username
    }
  }

  if (emailInput && !emailInput.value) {
    emailInput.value = user.email || ""
  }

  if (phoneInput && !phoneInput.value) {
    phoneInput.value = user.phone || ""
  }

  console.log("📝 Données utilisateur pré-remplies")
}

function setMinDate() {
  const dateInput = document.getElementById("date")
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0]
    dateInput.min = today
  }
}

async function handleSubmit(e) {
  e.preventDefault()

  if (isSubmitting) return

  // Double vérification de l'authentification
  if (!isUserLoggedIn()) {
    console.log("❌ Utilisateur non connecté lors de la soumission")
    redirectToLogin()
    return
  }

  const formData = getFormData()

  if (!validateForm(formData)) {
    showNotification("Veuillez corriger les erreurs dans le formulaire", "error")
    return
  }

  await submitReservation(formData)
}

function getFormData() {
  const user = getCurrentUser()

  return {
    id: Date.now(),
    userId: user?.id || Date.now(),
    date: document.getElementById("date")?.value || "",
    time: document.getElementById("time")?.value || "",
    guests: document.getElementById("guests")?.value || "",
    tableType: document.getElementById("tableType")?.value || "",
    fullName: document.getElementById("fullName")?.value || "",
    email: document.getElementById("email")?.value || "",
    phone: document.getElementById("phone")?.value || "",
    specialRequests: document.getElementById("specialRequests")?.value || "",
    status: "confirmed",
    timestamp: new Date().toISOString(),
    userEmail: user?.email || "",
  }
}

function validateForm(data) {
  let isValid = true
  const requiredFields = ["date", "time", "guests", "tableType", "fullName", "email", "phone"]

  requiredFields.forEach((field) => {
    const input = document.getElementById(field)
    if (!data[field] || data[field].trim() === "") {
      showFieldError(input, "Ce champ est requis")
      isValid = false
    } else {
      clearFieldError(input)
    }
  })

  if (data.email && !isValidEmail(data.email)) {
    showFieldError(document.getElementById("email"), "Email invalide")
    isValid = false
  }

  if (data.phone && !isValidPhone(data.phone)) {
    showFieldError(document.getElementById("phone"), "Téléphone invalide")
    isValid = false
  }

  if (data.date) {
    const selectedDate = new Date(data.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      showFieldError(document.getElementById("date"), "La date doit être dans le futur")
      isValid = false
    }
  }

  return isValid
}

function validateField(input) {
  const value = input.value.trim()

  if (input.required && !value) {
    showFieldError(input, "Ce champ est requis")
    return false
  }

  if (input.type === "email" && value && !isValidEmail(value)) {
    showFieldError(input, "Email invalide")
    return false
  }

  if (input.id === "phone" && value && !isValidPhone(value)) {
    showFieldError(input, "Téléphone invalide")
    return false
  }

  clearFieldError(input)
  return true
}

function showFieldError(input, message) {
  if (!input) return

  clearFieldError(input)
  input.classList.add("error")

  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
  errorDiv.style.cssText = "color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;"

  input.parentNode.appendChild(errorDiv)
}

function clearFieldError(input) {
  if (!input) return

  input.classList.remove("error")
  const errorMsg = input.parentNode.querySelector(".error-message")
  if (errorMsg) {
    errorMsg.remove()
  }
}

async function submitReservation(data) {
  isSubmitting = true
  const submitBtn = document.querySelector("button[type='submit']")

  if (submitBtn) {
    submitBtn.classList.add("loading")
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...'
    submitBtn.disabled = true
  }

  try {
    // Simulation d'appel API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Sauvegarder la réservation
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    reservations.push(data)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    console.log("✅ Réservation sauvegardée:", data)
    showSuccess(data)
  } catch (error) {
    console.error("❌ Erreur lors de la réservation:", error)
    showNotification("Erreur lors de la réservation. Veuillez réessayer.", "error")
  } finally {
    isSubmitting = false
    if (submitBtn) {
      submitBtn.classList.remove("loading")
      submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmer la réservation'
      submitBtn.disabled = false
    }
  }
}

function showSuccess(data) {
  const container =
    document.querySelector(".reservation-container, .reservation-form, form").parentElement || document.body
  const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  container.innerHTML = `
    <div class="success-container" style="text-align: center; padding: 3rem; background: #f0fdf4; border-radius: 12px; border: 2px solid #10b981; max-width: 600px; margin: 2rem auto;">
      <div class="success-icon" style="font-size: 4rem; color: #10b981; margin-bottom: 1rem;">
        <i class="fas fa-check-circle"></i>
      </div>
      <h1 style="color: #065f46; margin-bottom: 1rem;">Réservation confirmée !</h1>
      <p style="color: #059669; margin-bottom: 2rem;">Merci ${data.fullName}, votre table est réservée.</p>
      
      <div class="success-details" style="background: white; padding: 2rem; border-radius: 8px; margin: 2rem 0; text-align: left;">
        <h3 style="margin-bottom: 1rem; color: #065f46;">Détails de votre réservation</h3>
        <p style="margin-bottom: 0.5rem;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Heure:</strong> ${data.time}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Personnes:</strong> ${data.guests}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Table:</strong> ${getTableTypeLabel(data.tableType)}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${data.email}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Téléphone:</strong> ${data.phone}</p>
        <p style="margin-bottom: 0.5rem;"><strong>ID:</strong> #${data.id}</p>
      </div>

      <p style="margin-bottom: 2rem; color: #059669;">Un email de confirmation a été envoyé à <strong>${data.email}</strong></p>

      <div class="success-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
        <a href="index.html" style="background: #1b2541; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-home"></i>
          Retour à l'accueil
        </a>
        <button onclick="window.location.reload()" style="background: #c8815f; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-plus"></i>
          Nouvelle réservation
        </button>
      </div>
    </div>
  `

  // Redirection automatique après 8 secondes
  setTimeout(() => {
    window.location.href = "index.html"
  }, 8000)
}

function getTableTypeLabel(type) {
  const labels = {
    standard: "Table Standard",
    window: "Table près de la fenêtre",
    private: "Salon Privé",
    terrace: "Terrasse",
  }
  return labels[type] || type
}

function redirectToLogin() {
  showNotification("Vous devez être connecté pour faire une réservation", "error")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  return /^[+]?[0-9\s\-()]{8,}$/.test(phone)
}
