/**
 * Transaction shape:
 * {
 *   id: string,        // crypto.randomUUID() or Date.now().toString()
 *   name: string,      // item name, non-empty
 *   amount: number,    // positive number (float allowed)
 *   category: string,  // "Food" | "Transport" | "Fun" | custom
 *   date: string       // "YYYY-MM-DD" — local date at time of addition
 * }
 */

const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};

const STORAGE_KEY = "expense-tracker-transactions";
const BUILT_IN_CATEGORIES = ["Food", "Transport", "Fun"];
const CUSTOM_CATEGORIES_KEY = "expense-tracker-custom-categories";

// Module-level state
let transactions = [];
let chartInstance = null;
let customCategories = [];
let sortState = { key: null, order: "asc" };

// ============================================================
// Storage
// ============================================================

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(raw ?? "[]");
  } catch {
    return [];
  }
}

function saveToStorage(txns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch {
    const warning = document.getElementById("storage-warning");
    if (warning) warning.classList.remove("hidden");
  }
}

function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return JSON.parse(raw ?? "[]");
  } catch {
    return [];
  }
}

function saveCustomCategories(cats) {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats));
  } catch {
    const warning = document.getElementById("storage-warning");
    if (warning) warning.classList.remove("hidden");
  }
}

// ============================================================
// Category validation & management
// ============================================================

/**
 * Validates a new category name against existing categories.
 * @param {string} name
 * @param {string[]} existing
 * @returns {string|null}
 */
function validateCategory(name, existing) {
  if (!name || !name.trim()) {
    return "Category name is required.";
  }
  const trimmed = name.trim().toLowerCase();
  if (existing.some(c => c.toLowerCase() === trimmed)) {
    return "Category already exists.";
  }
  return null;
}

/**
 * Rebuilds <select#category> with built-in + custom categories.
 * @param {string[]} customCats
 */
function populateCategorySelect(customCats) {
  const select = document.getElementById("category");
  if (!select) return;
  select.innerHTML = '<option value="">-- Select --</option>';
  BUILT_IN_CATEGORIES.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  customCats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/**
 * Renders the custom category list inside #category-manager.
 * @param {string[]} customCats
 */
function renderCategoryManager(customCats) {
  const ul = document.getElementById("custom-category-list");
  if (!ul) return;
  ul.innerHTML = "";
  if (customCats.length === 0) {
    const li = document.createElement("li");
    li.className = "category-placeholder";
    li.textContent = "No custom categories yet.";
    ul.appendChild(li);
    return;
  }
  customCats.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    const span = document.createElement("span");
    span.className = "category-name";
    span.textContent = cat;
    const btn = document.createElement("button");
    btn.className = "delete-category-btn";
    btn.dataset.category = cat;
    btn.setAttribute("aria-label", "Delete " + cat);
    btn.textContent = "Delete";
    li.appendChild(span);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

/**
 * Adds a new custom category: validates, saves, re-renders.
 * @param {string} name
 * @returns {string|null} error or null
 */
function addCustomCategory(name) {
  const allCategories = [...BUILT_IN_CATEGORIES, ...customCategories];
  const error = validateCategory(name, allCategories);
  if (error) return error;
  customCategories.push(name.trim());
  saveCustomCategories(customCategories);
  renderCategoryManager(customCategories);
  populateCategorySelect(customCategories);
  return null;
}

/**
 * Deletes a custom category by name: saves, re-renders. Does not touch transactions.
 * @param {string} name
 */
function deleteCustomCategory(name) {
  customCategories = customCategories.filter(c => c !== name);
  saveCustomCategories(customCategories);
  renderCategoryManager(customCategories);
  populateCategorySelect(customCategories);
}

function handleCategoryFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("category-input");
  const errorEl = document.getElementById("category-error");
  const name = input ? input.value : "";
  const error = addCustomCategory(name);
  if (error) {
    if (errorEl) { errorEl.textContent = error; errorEl.classList.remove("hidden"); }
    return;
  }
  if (errorEl) { errorEl.textContent = ""; errorEl.classList.add("hidden"); }
  if (input) input.value = "";
}

function handleCategoryDeleteClick(event) {
  const btn = event.target.closest(".delete-category-btn");
  if (!btn) return;
  const cat = btn.dataset.category;
  if (cat) deleteCustomCategory(cat);
}

// ============================================================
// Form validation
// ============================================================

const VALID_CATEGORIES = Object.keys(CATEGORY_COLORS);

/**
 * Validates transaction form inputs.
 * @param {string} name
 * @param {string} amount
 * @param {string} category
 * @returns {string|null}
 */
function validateForm(name, amount, category) {
  if (!name || !name.trim()) return "Item name is required.";
  const parsed = parseFloat(amount);
  if (amount === "" || amount === null || amount === undefined || isNaN(parsed) || parsed <= 0) {
    return "Amount must be a positive number.";
  }
  const allCategories = [...BUILT_IN_CATEGORIES, ...customCategories];
  if (!allCategories.includes(category)) return "Please select a valid category.";
  return null;
}

// ============================================================
// Sort
// ============================================================

/**
 * Returns a sorted copy of transactions. Does not mutate the original.
 * @param {Array} txns
 * @param {{ key: string|null, order: string }} state
 * @returns {Array}
 */
function getSortedTransactions(txns, state) {
  if (!state.key) return [...txns];
  return [...txns].sort((a, b) => {
    let cmp;
    if (state.key === "amount") {
      cmp = a.amount - b.amount;
    } else {
      cmp = a.category.localeCompare(b.category);
    }
    return state.order === "desc" ? -cmp : cmp;
  });
}

function handleSortChange() {
  const keyEl = document.getElementById("sort-key");
  const orderEl = document.getElementById("sort-order");
  sortState.key = keyEl ? (keyEl.value || null) : null;
  sortState.order = orderEl ? orderEl.value : "asc";
  renderList(transactions);
}

// ============================================================
// Monthly Summary
// ============================================================

/**
 * Groups transactions by YYYY-MM, sums amounts, returns [{key, total}] descending.
 * Skips transactions without a date field.
 * @param {Array} txns
 * @returns {Array<{key: string, total: number}>}
 */
function computeMonthlySummary(txns) {
  const map = {};
  txns.forEach(t => {
    if (!t.date) return;
    const key = t.date.slice(0, 7);
    map[key] = (map[key] || 0) + t.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, total]) => ({ key, total }));
}

/**
 * Renders the monthly summary section.
 * @param {Array} txns
 */
function renderMonthlySummary(txns) {
  const ul = document.getElementById("monthly-list");
  const placeholder = document.getElementById("monthly-placeholder");
  if (!ul) return;

  const summary = computeMonthlySummary(txns);
  ul.innerHTML = "";

  if (summary.length === 0) {
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");
  summary.forEach(function(entry) {
    const label = new Date(entry.key + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const li = document.createElement("li");
    li.className = "monthly-entry";
    const labelSpan = document.createElement("span");
    labelSpan.className = "month-label";
    labelSpan.textContent = label;
    const totalSpan = document.createElement("span");
    totalSpan.className = "month-total";
    totalSpan.textContent = "$" + entry.total.toFixed(2);
    li.appendChild(labelSpan);
    li.appendChild(totalSpan);
    ul.appendChild(li);
  });
}

// ============================================================
// Render
// ============================================================

/**
 * Rebuilds the transaction list, applying current sortState.
 * @param {Array} txns
 */
function renderList(txns) {
  const ul = document.getElementById("transaction-list");
  if (!ul) return;
  const sorted = getSortedTransactions(txns, sortState);
  ul.innerHTML = "";
  sorted.forEach(t => {
    const li = document.createElement("li");
    li.dataset.category = t.category;
    const nameSpan = document.createElement("span");
    nameSpan.className = "transaction-name";
    nameSpan.textContent = t.name;
    const amountSpan = document.createElement("span");
    amountSpan.className = "transaction-amount";
    amountSpan.textContent = t.amount.toFixed(2);
    const catSpan = document.createElement("span");
    catSpan.className = "transaction-category";
    catSpan.textContent = t.category;
    const btn = document.createElement("button");
    btn.className = "delete-btn";
    btn.dataset.id = t.id;
    btn.setAttribute("aria-label", "Delete " + t.name);
    btn.textContent = "Delete";
    li.appendChild(nameSpan);
    li.appendChild(amountSpan);
    li.appendChild(catSpan);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function renderBalance(txns) {
  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  const el = document.getElementById("balance-amount");
  if (el) el.textContent = total.toFixed(2);
}

function renderChart(txns) {
  const canvas = document.getElementById("expense-chart");
  const placeholder = document.querySelector(".chart-placeholder");

  if (txns.length === 0) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (canvas) canvas.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");
  if (canvas) canvas.classList.remove("hidden");
  if (typeof Chart === "undefined") return;

  const sums = {};
  txns.forEach(t => { sums[t.category] = (sums[t.category] || 0) + t.amount; });
  const labels = Object.keys(sums);
  const data = labels.map(l => sums[l]);
  const colors = labels.map(l => CATEGORY_COLORS[l] || "#94a3b8");

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  } else {
    chartInstance = new Chart(canvas, {
      type: "pie",
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });
  }
}

// ============================================================
// Transactions
// ============================================================

function addTransaction(name, amount, category) {
  const transaction = {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
    date: new Date().toISOString().slice(0, 10)
  };
  transactions.push(transaction);
  saveToStorage(transactions);
  renderList(transactions);
  renderBalance(transactions);
  renderChart(transactions);
  renderMonthlySummary(transactions);
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(transactions);
  renderList(transactions);
  renderBalance(transactions);
  renderChart(transactions);
  renderMonthlySummary(transactions);
}

// ============================================================
// Event handlers
// ============================================================

function handleFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById("item-name");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const formError = document.getElementById("form-error");

  const name = nameInput ? nameInput.value : "";
  const amount = amountInput ? amountInput.value : "";
  const category = categoryInput ? categoryInput.value : "";

  const error = validateForm(name, amount, category);
  if (error) {
    if (formError) { formError.textContent = error; formError.classList.remove("hidden"); }
    return;
  }
  if (formError) { formError.textContent = ""; formError.classList.add("hidden"); }

  addTransaction(name, parseFloat(amount), category);
  if (nameInput) nameInput.value = "";
  if (amountInput) amountInput.value = "";
  if (categoryInput) categoryInput.value = "";
}

function handleDeleteClick(event) {
  const btn = event.target.closest(".delete-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  if (id) deleteTransaction(id);
}

// ============================================================
// Init
// ============================================================

function init() {
  transactions = loadFromStorage();
  customCategories = loadCustomCategories();

  renderList(transactions);
  renderBalance(transactions);
  renderChart(transactions);
  renderCategoryManager(customCategories);
  populateCategorySelect(customCategories);
  renderMonthlySummary(transactions);

  const form = document.getElementById("transaction-form");
  if (form) form.addEventListener("submit", handleFormSubmit);

  const list = document.getElementById("list");
  if (list) list.addEventListener("click", handleDeleteClick);

  const categoryForm = document.getElementById("category-form");
  if (categoryForm) categoryForm.addEventListener("submit", handleCategoryFormSubmit);

  const categoryManager = document.getElementById("category-manager");
  if (categoryManager) categoryManager.addEventListener("click", handleCategoryDeleteClick);

  const sortKey = document.getElementById("sort-key");
  if (sortKey) sortKey.addEventListener("change", handleSortChange);

  const sortOrder = document.getElementById("sort-order");
  if (sortOrder) sortOrder.addEventListener("change", handleSortChange);
}

document.addEventListener("DOMContentLoaded", init);
