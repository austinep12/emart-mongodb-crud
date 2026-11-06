const form = document.getElementById("productForm");
const grid = document.getElementById("productGrid");
const notice = document.getElementById("notice");
const icons = { Smartphones: "📱", Laptops: "💻", Audio: "🎧", Wearables: "⌚", Cameras: "📷" };
let products = [];

function showNotice(msg, error = false) {
  notice.textContent = msg;
  notice.className = error ? "notice notice-error" : "notice";
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// READ: load all products from the API
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    products = data.products || [];
    renderProducts();
    showNotice(`${products.length} products in the E-MART catalogue.`);
  } catch (err) {
    showNotice(err.message, true);
  }
}

// Show products as cards
function renderProducts() {
  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="card-top">
        <div class="icon">${icons[p.category] || "🔌"}</div>
        <div>
          <h3>${escapeHTML(p.productName)}</h3>
          <p>${escapeHTML(p.brand)}</p>
        </div>
      </div>
      <div class="tags">
        <span>${escapeHTML(p.category)}</span>
        <strong>₹${Number(p.price).toLocaleString("en-IN")}</strong>
      </div>
      <div class="card-actions">
        <button data-action="edit" data-id="${p._id}">Edit</button>
        <button data-action="delete" data-id="${p._id}" class="delete-btn">Delete</button>
      </div>
    </article>`).join("");
  document.getElementById("emptyState").hidden = products.length > 0;
}

// CREATE / UPDATE: submit the form
form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const payload = {
    productName: document.getElementById("productName").value.trim(),
    brand: document.getElementById("brand").value.trim(),
    category: document.getElementById("category").value,
    price: document.getElementById("price").value
  };
  if (id) payload.id = id;

  try {
    const res = await fetch("/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    resetForm();
    await loadProducts();
    showNotice(data.message);
  } catch (err) {
    showNotice(err.message, true);
  }
});

// EDIT / DELETE: buttons on each card
grid.addEventListener("click", async e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const p = products.find(x => String(x._id) === btn.dataset.id);
  if (!p) return;

  if (btn.dataset.action === "edit") {
    document.getElementById("productId").value = p._id;
    document.getElementById("productName").value = p.productName;
    document.getElementById("brand").value = p.brand;
    document.getElementById("category").value = p.category;
    document.getElementById("price").value = p.price;
    document.getElementById("formTitle").textContent = "EDIT PRODUCT";
    document.getElementById("submitBtn").textContent = "Save Changes";
    document.getElementById("cancelEdit").hidden = false;
    form.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (confirm(`Delete ${p.productName}?`)) {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(p._id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await loadProducts();
      showNotice(data.message);
    } catch (err) {
      showNotice(err.message, true);
    }
  }
});

// Reset the form back to "Add" mode
function resetForm() {
  form.reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "ADD PRODUCT";
  document.getElementById("submitBtn").textContent = "Add Product →";
  document.getElementById("cancelEdit").hidden = true;
}

document.getElementById("cancelEdit").addEventListener("click", resetForm);
document.getElementById("refreshBtn").addEventListener("click", loadProducts);

loadProducts();
