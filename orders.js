document.addEventListener("DOMContentLoaded", () => {
  const userSession = JSON.parse(localStorage.getItem("userSession") || "{}")

  if (!userSession.isAuthenticated) {
    window.location.href = "login.html"
    return
  }

  displayOrders()
})

function displayOrders() {
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  const ordersContainer = document.getElementById("ordersContainer")

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
    <div class="empty-orders">
        <i class="fas fa-receipt"></i>
        <h3>Aucune commande</h3>
        <p>Vous n'avez pas encore passé de commande</p>
        <div class="empty-orders-actions">
            <a href="menu.html" class="browse-menu-btn">
                <i class="fas fa-utensils"></i>
                Voir le menu
            </a>
            <a href="index.html" class="home-btn">
                <i class="fas fa-home"></i>
                Retour à l'accueil
            </a>
        </div>
    </div>
`
    return
  }

  ordersContainer.innerHTML = orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (order, index) => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-number">Commande #${String(index + 1).padStart(4, "0")}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                    <div class="order-status status-${order.status}">
                        ${formatStatus(order.status)}
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">
                                    ${item.price.toFixed(2)} €
                                    <span class="item-quantity">x${item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                
                <div class="order-footer">
                    <div class="order-total">
                        Total: ${order.totalPrice.toFixed(2)} €
                    </div>
                    <div class="order-actions">
                        ${
                          order.status === "pending"
                            ? `
                            <button class="cancel-btn" onclick="cancelOrder(${index})">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                        `
                            : ""
                        }
                        <button class="reorder-btn" onclick="reorderItems(${index})">
                            <i class="fas fa-redo"></i> Commander à nouveau
                        </button>
                    </div>
                </div>
            </div>
        `,
    )
    .join("")
}

function cancelOrder(orderIndex) {
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  if (orders[orderIndex]) {
    // Supprimer la commande de la liste
    orders.splice(orderIndex, 1)
    localStorage.setItem("cookmaster-orders", JSON.stringify(orders))

    showNotification("Commande annulée et supprimée avec succès", "success")

    // Rafraîchir la page pour mettre à jour l'affichage
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}

function reorderItems(orderIndex) {
  const orders = JSON.parse(localStorage.getItem("cookmaster-orders") || "[]")
  const order = orders[orderIndex]

  if (order) {
    cookMasterCart = {
      items: [...order.items],
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: order.totalPrice,
    }

    localStorage.setItem("cookmaster-cart", JSON.stringify(cookMasterCart))
    showNotification("Articles ajoutés au panier", "success")
    setTimeout(() => {
      window.location.href = "menu.html"
    }, 1500)
  }
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `

  document.body.appendChild(notification)
  setTimeout(() => notification.classList.add("show"), 100)
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function formatDate(dateString) {
  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Date(dateString).toLocaleDateString("fr-FR", options)
}

function formatStatus(status) {
  const statusMap = {
    pending: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  }
  return statusMap[status] || status
}
