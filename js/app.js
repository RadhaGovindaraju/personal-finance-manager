   // select html elements
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const form = document.querySelector("form");
const descriptionInput = document.querySelector('input[type="text"]');
const amountInput = document.querySelector('input[type="number"]');
const typeSelect = document.querySelectorAll("select")[0];
const categorySelect = document.querySelectorAll("select")[1];
const transactionList = document.querySelector(".transaction-list ul");

const filterButtons = document.querySelectorAll(".filters button");

const foodTotalEl = document.getElementById("food-total");
const rentTotalEl = document.getElementById("rent-total");
const travelTotalEl = document.getElementById("travel-total");
const otherTotalEl = document.getElementById("other-total");

// data
let transactions = [];
let editId = null;

// save to localStorage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// load from localStorage
function loadTransactions() {
    const data = localStorage.getItem("transactions");
    if (data) {
        transactions = JSON.parse(data);
        transactions.forEach(addTransactionToUI);
        updateTotals();
        updateCategoryTotals();
    }
}

// form submit
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const description = descriptionInput.value;
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (!description || !amount || !type || !category) {
        alert("Please fill all fields");
        return;
    }

    const transaction = {
        id: editId || Date.now(),
        description,
        amount,
        type,
        category
    };

    if (editId) {
        transactions = transactions.map(t =>
            t.id === editId ? transaction : t
        );
        editId = null;
        transactionList.innerHTML = "";
        transactions.forEach(addTransactionToUI);
    } else {
        transactions.push(transaction);
        addTransactionToUI(transaction);
    }

    saveTransactions();
    updateTotals();
    updateCategoryTotals();

    form.reset();
    form.querySelector("button").innerText = "Add Transaction";
});

// add transaction to UI
function addTransactionToUI(transaction) {
    const li = document.createElement("li");
    li.classList.add(transaction.type);

    const sign = transaction.type === "income" ? "+" : "-";

    li.innerHTML = `
        ${transaction.description}
        <span>${sign}₹${transaction.amount}</span>
        (${transaction.category})
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    // edit
    li.querySelector(".edit-btn").addEventListener("click", () => {
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        typeSelect.value = transaction.type;
        categorySelect.value = transaction.category;

        editId = transaction.id;
        form.querySelector("button").innerText = "Update Transaction";
    });

    // delete
    li.querySelector(".delete-btn").addEventListener("click", () => {
        transactions = transactions.filter(t => t.id !== transaction.id);
        li.remove();
        saveTransactions();
        updateTotals();
        updateCategoryTotals();
    });

    transactionList.appendChild(li);
}

// update totals
function updateTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    incomeEl.innerText = `₹${income}`;
    expenseEl.innerText = `₹${expense}`;
    balanceEl.innerText = `₹${income - expense}`;
}

// category totals
function updateCategoryTotals() {
    let food = 0, rent = 0, travel = 0, other = 0;

    transactions.forEach(t => {
        if (t.type === "expense") {
            if (t.category === "Food") food += t.amount;
            else if (t.category === "Rent") rent += t.amount;
            else if (t.category === "Travel") travel += t.amount;
            else other += t.amount;
        }
    });

    foodTotalEl.innerText = food;
    rentTotalEl.innerText = rent;
    travelTotalEl.innerText = travel;
    otherTotalEl.innerText = other;
}

// filters
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
        transactionList.innerHTML = "";

        if (type === "all") {
            transactions.forEach(addTransactionToUI);
        } else {
            transactions
                .filter(t => t.type === type)
                .forEach(addTransactionToUI);
        }
    });
});

// init
loadTransactions();
