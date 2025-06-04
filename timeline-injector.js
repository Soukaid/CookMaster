// ===== SCRIPT D'INJECTION POUR REMPLIR LA TIMELINE =====

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔧 Injection du contenu de la timeline...")

  // Attendre que la page soit complètement chargée
  setTimeout(() => {
    injectTimelineContent()
    initializeAllFeatures()
  }, 500)
})

function injectTimelineContent() {
  const timelineContainer = document.querySelector(".timeline-container")

  if (!timelineContainer) {
    console.error("❌ Container timeline non trouvé")
    return
  }

  // Vider le contenu existant sauf la ligne
  const timelineLine = timelineContainer.querySelector(".timeline-line")
  timelineContainer.innerHTML = ""
  if (timelineLine) {
    timelineContainer.appendChild(timelineLine)
  } else {
    // Créer la ligne si elle n'existe pas
    const line = document.createElement("div")
    line.className = "timeline-line"
    timelineContainer.appendChild(line)
  }

  // Données de la timeline
  const timelineData = [
    {
      year: "1985",
      icon: "fas fa-star",
      title: "Les Débuts Modestes",
      description:
        "Ouverture du premier restaurant CookMaster à Genève par le chef Antoine Dubois et sa femme Marie. Avec seulement 20 places et une équipe de 4 personnes, ils créent une cuisine fusion innovante mélangeant traditions françaises et saveurs du monde.",
      image: "images/debut modeste.webp",
    },
    {
      year: "1992",
      icon: "fas fa-award",
      title: "Première Étoile Michelin",
      description:
        "Reconnaissance internationale avec notre première étoile Michelin, récompensant 7 années d'innovation culinaire. Le restaurant s'agrandit et accueille désormais 50 convives dans un cadre entièrement rénové.",
      image: "images/michelin.png",
    },
    {
      year: "1998",
      icon: "fas fa-utensils",
      title: "École Culinaire CookMaster",
      description:
        "Création de notre école culinaire pour transmettre notre savoir-faire. Plus de 500 chefs ont été formés dans nos techniques de fusion culinaire, propageant notre philosophie à travers le monde.",
      image: "images/ecole culinaire.jfif",
    },
    {
      year: "2001",
      icon: "fas fa-globe",
      title: "Expansion Internationale",
      description:
        "Ouverture de nos restaurants à Paris, Londres et New York. Chaque établissement adapte notre concept aux goûts locaux tout en conservant notre identité unique de cuisine mondiale raffinée.",
      image: "images/expansion.webp",
    },
    {
      year: "2008",
      icon: "fas fa-trophy",
      title: "Deuxième Étoile Michelin",
      description:
        "Notre restaurant de Genève obtient sa deuxième étoile Michelin, confirmant notre position parmi les meilleurs restaurants du monde. Introduction de notre menu dégustation signature de 12 services.",
      image: "images/michelin 2.jpeg",
    },
    {
      year: "2015",
      icon: "fas fa-leaf",
      title: "Révolution Durable",
      description:
        "Lancement de notre programme 'Terre & Mer Responsable' avec 100% d'ingrédients biologiques et locaux. Création de notre propre ferme urbaine et partenariats avec 50 producteurs locaux.",
      image: "images/durable.webp",
    },
    {
      year: "2020",
      icon: "fas fa-laptop",
      title: "Innovation Digitale",
      description:
        "Adaptation rapide pendant la pandémie avec notre service 'CookMaster à Domicile', cours de cuisine virtuels et kits gastronomiques. Plus de 10,000 familles ont découvert notre cuisine chez elles.",
      image: "images/inovation digital.jpg",
    },
    {
      year: "2023",
      icon: "fas fa-rocket",
      title: "Troisième Étoile & IA Culinaire",
      description:
        "Obtention de notre troisième étoile Michelin et intégration de l'intelligence artificielle pour personnaliser l'expérience culinaire. Notre système analyse les préférences de chaque client pour créer des menus sur mesure.",
      image: "images/michelin 3.jpeg",
    },
  ]

  // Créer les éléments de timeline
  timelineData.forEach((item, index) => {
    const timelineItem = document.createElement("div")
    timelineItem.className = "timeline-item"
    timelineItem.setAttribute("data-year", item.year)

    timelineItem.innerHTML = `
            <div class="timeline-marker" data-year="${item.year}">
                <i class="${item.icon}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-card">
                    <div class="timeline-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="timeline-text">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            </div>
        `

    timelineContainer.appendChild(timelineItem)
  })

  console.log("✅ Timeline injectée avec succès!")

  // Animer l'apparition des éléments
  setTimeout(() => {
    const items = document.querySelectorAll(".timeline-item")
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = "1"
        item.style.transform = "translateY(0)"
      }, index * 200)
    })
  }, 100)
}

function initializeAllFeatures() {
  console.log("🎯 Initialisation des fonctionnalités...")

  // ===== BOUTONS DU HEADER =====

  // Sélecteur de langue
  const langBtn = document.getElementById("langBtn")
  const langDropdown = document.getElementById("langDropdown")
  const currentLang = document.getElementById("currentLang")

  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      langDropdown.classList.toggle("show")
    })

    document.querySelectorAll(".lang-option").forEach((option) => {
      option.addEventListener("click", function () {
        const lang = this.getAttribute("data-lang")
        if (currentLang) {
          currentLang.textContent = lang.toUpperCase()
        }
        langDropdown.classList.remove("show")
        showNotification(`Langue changée en ${lang === "fr" ? "Français" : "English"}`, "success")
      })
    })

    document.addEventListener("click", () => {
      langDropdown.classList.remove("show")
    })
  }

  // Bouton thème
  const themeToggle = document.getElementById("themeToggle")
  const themeIcon = document.getElementById("themeIcon")

  if (themeToggle && themeIcon) {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.body.setAttribute("data-theme", savedTheme)

    if (savedTheme === "dark") {
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    }

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme") || "light"
      const newTheme = currentTheme === "light" ? "dark" : "light"

      document.body.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)

      if (newTheme === "dark") {
        themeIcon.classList.remove("fa-sun")
        themeIcon.classList.add("fa-moon")
      } else {
        themeIcon.classList.remove("fa-moon")
        themeIcon.classList.add("fa-sun")
      }

      showNotification(`Mode ${newTheme === "dark" ? "sombre" : "clair"} activé`, "info")
    })
  }

  // Menu mobile
  const mobileToggle = document.getElementById("mobileMenuToggle")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      this.classList.toggle("active")
      navMenu.classList.toggle("show")
    })
  }

  // ===== CAROUSEL D'ÉQUIPE =====
  initializeTeamCarousel()

  // ===== TÉMOIGNAGES =====
  initializeTestimonials()

  // ===== ANIMATIONS =====
  initializeAnimations()

  // ===== FILTRES RÉCOMPENSES =====
  initializeAwardsFilter()

  console.log("🎉 Toutes les fonctionnalités initialisées!")
}

function initializeTeamCarousel() {
  // Vérifier si jQuery et Owl Carousel sont disponibles
  if (typeof $ !== "undefined" && typeof $.fn.owlCarousel !== "undefined") {
    jQuery(".team-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      dots: true,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
      responsive: {
        0: { items: 1 },
        768: { items: 2 },
        1024: { items: 3 },
      },
    })
    console.log("✅ Carousel Owl initialisé")
  } else {
    // Fallback simple
    const carousel = document.querySelector(".team-carousel")
    if (carousel) {
      const members = carousel.querySelectorAll(".team-member")
      let currentIndex = 0

      if (members.length > 0) {
        // Masquer tous sauf le premier
        members.forEach((member, index) => {
          member.style.display = index === 0 ? "block" : "none"
        })

        // Créer les boutons de navigation
        const navContainer = document.createElement("div")
        navContainer.style.cssText = `
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                `

        const prevBtn = document.createElement("button")
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'
        prevBtn.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #c8815f;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                `

        const nextBtn = document.createElement("button")
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'
        nextBtn.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #c8815f;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                `

        function showSlide(index) {
          if (index < 0) index = members.length - 1
          if (index >= members.length) index = 0

          members.forEach((member) => (member.style.display = "none"))
          members[index].style.display = "block"
          currentIndex = index
        }

        prevBtn.addEventListener("click", () => showSlide(currentIndex - 1))
        nextBtn.addEventListener("click", () => showSlide(currentIndex + 1))

        navContainer.appendChild(prevBtn)
        navContainer.appendChild(nextBtn)
        carousel.parentNode.appendChild(navContainer)

        // Auto-rotation
        setInterval(() => showSlide(currentIndex + 1), 5000)

        console.log("✅ Carousel simple initialisé")
      }
    }
  }
}

function initializeTestimonials() {
  const slides = document.querySelectorAll(".testimonial-slide")
  const dots = document.querySelectorAll(".testimonial-dots .dot")
  const prevBtn = document.querySelector(".testimonial-prev")
  const nextBtn = document.querySelector(".testimonial-next")
  let currentSlide = 0
  let interval

  if (slides.length === 0) return

  function showSlide(index) {
    if (index < 0) index = slides.length - 1
    if (index >= slides.length) index = 0

    slides.forEach((slide) => slide.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    setTimeout(() => {
      currentSlide = index
      slides[currentSlide].classList.add("active")
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add("active")
      }
    }, 150)
  }

  function startRotation() {
    interval = setInterval(() => {
      showSlide(currentSlide + 1)
    }, 6000)
  }

  // Navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index))
  })

  if (prevBtn) {
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1))
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1))
  }

  // Pause au survol
  const carousel = document.querySelector(".testimonials-carousel")
  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(interval))
    carousel.addEventListener("mouseleave", startRotation)
  }

  startRotation()
  console.log("✅ Témoignages initialisés")
}

function initializeAnimations() {
  // Animation des compteurs
  const statNumbers = document.querySelectorAll(".stat-number")
  statNumbers.forEach((statNumber) => {
    const target = Number.parseInt(statNumber.getAttribute("data-count"))
    const duration = 3000
    let start = 0
    const increment = target / (duration / 16)

    function updateCounter() {
      start += increment
      if (start < target) {
        if (target > 1000) {
          statNumber.textContent = Math.floor(start).toLocaleString()
        } else {
          statNumber.textContent = Math.floor(start)
        }
        requestAnimationFrame(updateCounter)
      } else {
        if (target > 1000) {
          statNumber.textContent = target.toLocaleString()
        } else {
          statNumber.textContent = target
        }
      }
    }

    updateCounter()
  })

  // Animation des barres de progression
  const progressBars = document.querySelectorAll(".progress-bar")
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const progressBar = entry.target
          const progress = progressBar.getAttribute("data-progress")
          progressBar.style.width = `${progress}%`
          observer.unobserve(progressBar)
        }
      })
    },
    { threshold: 0.5 },
  )

  progressBars.forEach((bar) => observer.observe(bar))

  console.log("✅ Animations initialisées")
}

function initializeAwardsFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn")
  const awardItems = document.querySelectorAll(".award-item")

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      filterBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      awardItems.forEach((item) => {
        if (filter === "all" || item.classList.contains(filter)) {
          item.classList.remove("hidden")
        } else {
          item.classList.add("hidden")
        }
      })
    })
  })

  console.log("✅ Filtres récompenses initialisés")
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

  document.body.appendChild(notification)

  setTimeout(() => (notification.style.transform = "translateX(0)"), 100)
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => notification.remove(), 300)
  }, 4000)
}

// Exposer la fonction globalement
window.showNotification = showNotification

// CSS pour les animations de timeline
const timelineCSS = `
.timeline-item {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.6s ease;
}

.timeline-item.animate {
    opacity: 1;
    transform: translateY(0);
}
`

// Injecter le CSS
const style = document.createElement("style")
style.textContent = timelineCSS
document.head.appendChild(style)

console.log("🚀 Script d'injection chargé!")
