
let state = {
  salary: 0,
  expenses: []
};

let chart = null;

const salaryInput = document.getElementById("salary");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const addBtn = document.getElementById("addExpense");

const salaryDisplay = document.getElementById("salaryDisplay");
const balanceDisplay = document.getElementById("balance");
const expenseList = document.getElementById("expenseList");

init();

function init() {
  loadFromLocalStorage();
  renderAll();
}


addBtn.addEventListener("click", handleAddExpense);

salaryInput.addEventListener("input", () => {
  state.salary = Number(salaryInput.value);
  saveToLocalStorage();
  renderAll();
});

// Business logic
function handleAddExpense() {
  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);
  const categoryInput = document.getElementById("expenseCategory");
  const category = categoryInput.value;

  if (!name || amount <= 0) {
    showModal("Please enter valid input.");
    return;
  }

  const currentBalance = getBalance();

  if (amount > currentBalance) {
    showModal("Not enough balance!");
    return;
  }

  const expense = {
    id: Date.now(),
    name,
    amount,
    category
  };

  state.expenses.push(expense);

  expenseNameInput.value = "";
  expenseAmountInput.value = "";

  saveToLocalStorage();
  renderAll();
}

function getCategoryTotals() {
  const totals = {};

  state.expenses.forEach(exp => {
    if (!totals[exp.category]) {
      totals[exp.category] = 0;
    }
    totals[exp.category] += exp.amount;
  });

  return totals;
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(exp => exp.id !== id);
  saveToLocalStorage();
  renderAll();
}

function getTotalExpenses() {
  return state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

function getBalance() {
  return state.salary - getTotalExpenses();
}


// Render all data
function renderAll() {
  renderSalary();
  renderExpenses();
  renderBalance();
  renderChart();
}
function formatCurrency(value) {
  return "₹" + value.toLocaleString();
}

function renderSalary() {
  salaryDisplay.textContent = formatCurrency(state.salary);
}

function renderExpenses() {
  expenseList.innerHTML = "";

  if (state.expenses.length === 0) {
    expenseList.innerHTML = `
      <p class="empty">No expenses added yet</p>
    `;
    return;
  }

  state.expenses.forEach(exp => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${exp.name} (${exp.category}) - ₹${exp.amount}</span>
      <button class="delete-btn" onclick="deleteExpense(${exp.id})">🗑</button>
    `;

    expenseList.appendChild(li);
  });
}

function renderBalance() {
  const balance = getBalance();
  balanceDisplay.textContent = formatCurrency(balance);

  // Reset classes
  balanceDisplay.classList.remove("positive", "low", "negative");

  if (balance < 0) {
    balanceDisplay.classList.add("negative");
  } else if (balance < state.salary * 0.1) {
    balanceDisplay.classList.add("low");
  } else {
    balanceDisplay.classList.add("positive");
  }
}

// Local Storage

function saveToLocalStorage() {
  localStorage.setItem("cashflow", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("cashflow"));
  if (data) state = data;
}

// Chart JS
function renderChart() {
  const ctx = document.getElementById("myChart");

  const categoryTotals = getCategoryTotals();
  const balance = getBalance();

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // Add remaining only if positive
  if (balance > 0) {
    labels.push("Remaining");
    data.push(balance);
  }

  if (balance < 0) {
    showModal("Warning: You have exceeded your salary!");
  }

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#6366f1",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#3b82f6",
          "#8b5cf6"
        ]
      }]
    }
  });
}

function showModal(message) {
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}