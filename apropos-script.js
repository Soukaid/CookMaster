import { Chart } from "@/components/ui/chart"
// ===== SCRIPT FONCTIONNEL POUR LA PAGE À PROPOS =====

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎨 Initialisation de la page À propos...")

  // ===== 1. FONCTIONNALITÉS DU HEADER =====

  // Sélecteur de langue
  const langBtn = document.getElementById("langBtn")
  const langDropdown = document.getElementById("langDropdown")
  const currentLang = document.getElementById("currentLang")

  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      langDropdown.classList.toggle("show")
    })

    // Options de langue
    document.querySelectorAll(".lang-option").forEach((option) => {
      option.addEventListener("click", function () {
        const lang = this.getAttribute("data-lang")
        currentLang.textContent = lang.toUpperCase()
        langDropdown.classList.remove("show")
        showNotification(`Langue changée en ${lang === "fr" ? "Français" : "English"}`, "success")
      })
    })

    // Fermer au clic extérieur
    document.addEventListener("click", () => {
      langDropdown.classList.remove("show")
    })
  }

  // Bouton thème
  const themeToggle = document.getElementById("themeToggle")
  const themeIcon = document.getElementById("themeIcon")

  if (themeToggle && themeIcon) {
    // Charger le thème sauvegardé
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

  // ===== 2. CAROUSEL D'ÉQUIPE =====

  // Vérifier si jQuery et Owl Carousel sont disponibles
  if (typeof $ !== "undefined" && typeof $.fn.owlCarousel !== "undefined") {
    $(".team-carousel").owlCarousel({
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
    initSimpleCarousel()
  }

  function initSimpleCarousel() {
    const carousel = document.querySelector(".team-carousel")
    const members = carousel.querySelectorAll(".team-member")
    let currentIndex = 0

    // Masquer tous sauf le premier
    members.forEach((member, index) => {
      if (index !== 0) {
        member.style.display = "none"
      }
    })

    // Créer les boutons
    const prevBtn = document.createElement("button")
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'
    prevBtn.style.cssText = `
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            z-index: 10;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #c8815f;
            color: white;
            border: none;
            cursor: pointer;
        `

    const nextBtn = document.createElement("button")
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>'
    nextBtn.style.cssText = `
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            z-index: 10;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #c8815f;
            color: white;
            border: none;
            cursor: pointer;
        `

    carousel.style.position = "relative"
    carousel.appendChild(prevBtn)
    carousel.appendChild(nextBtn)

    function showSlide(index) {
      if (index < 0) index = members.length - 1
      if (index >= members.length) index = 0

      members.forEach((member) => (member.style.display = "none"))
      members[index].style.display = "block"
      currentIndex = index
    }

    prevBtn.addEventListener("click", () => showSlide(currentIndex - 1))
    nextBtn.addEventListener("click", () => showSlide(currentIndex + 1))

    // Auto-rotation
    setInterval(() => showSlide(currentIndex + 1), 5000)

    console.log("✅ Carousel simple initialisé")
  }

  // ===== 3. TÉMOIGNAGES ROTATIFS =====

  const testimonialSlides = document.querySelectorAll(".testimonial-slide")
  const dots = document.querySelectorAll(".testimonial-dots .dot")
  const prevTestimonial = document.querySelector(".testimonial-prev")
  const nextTestimonial = document.querySelector(".testimonial-next")
  let currentTestimonial = 0
  let testimonialInterval

  function showTestimonial(index) {
    if (index < 0) index = testimonialSlides.length - 1
    if (index >= testimonialSlides.length) index = 0

    testimonialSlides.forEach((slide) => slide.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    setTimeout(() => {
      currentTestimonial = index
      testimonialSlides[currentTestimonial].classList.add("active")
      dots[currentTestimonial].classList.add("active")
    }, 150)
  }

  function startTestimonialRotation() {
    testimonialInterval = setInterval(() => {
      showTestimonial(currentTestimonial + 1)
    }, 6000)
  }

  // Navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showTestimonial(index))
  })

  if (prevTestimonial) {
    prevTestimonial.addEventListener("click", () => showTestimonial(currentTestimonial - 1))
  }

  if (nextTestimonial) {
    nextTestimonial.addEventListener("click", () => showTestimonial(currentTestimonial + 1))
  }

  // Pause au survol
  const testimonialCarousel = document.querySelector(".testimonials-carousel")
  if (testimonialCarousel) {
    testimonialCarousel.addEventListener("mouseenter", () => clearInterval(testimonialInterval))
    testimonialCarousel.addEventListener("mouseleave", startTestimonialRotation)
  }

  startTestimonialRotation()
  console.log("✅ Témoignages initialisés")

  // ===== 4. ANIMATIONS =====

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

  // ===== 5. FILTRES DES RÉCOMPENSES =====

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

  // ===== 6. SYSTÈME DE NOTIFICATIONS =====

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

  window.showNotification = showNotification

  // ===== 7. GRAPHIQUE =====

  if (typeof Chart !== "undefined") {
    const ctx = document.getElementById("statsChart")
    if (ctx) {
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Satisfaction Client", "Innovation", "Qualité", "Service"],
          datasets: [
            {
              data: [98, 95, 97, 96],
              backgroundColor: ["#c8815f", "#1a2b4c", "#f4f1eb", "#666"],
              borderWidth: 0,
              hoverOffset: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
                font: { family: "Inter", size: 14 },
              },
            },
          },
          animation: {
            animateRotate: true,
            duration: 2000,
          },
        },
      })
      console.log("✅ Graphique initialisé")
    }
  }

  console.log("🎉 Page À propos entièrement initialisée !")
})
