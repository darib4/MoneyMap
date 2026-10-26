const transactions = [
    {
        id: 1,
        date: "2026-10-22",
        description: "Example: salary",
        category: "salary",
        type: "income",
        amountCents: 250000
    },
    {
        id: 2,
        date: "2026-10-22",
        description: "Example: groceries",
        category: "groceries",
        type: "expense",
        amountCents: 2550
    }
];

const tableBody = document.getElementById("transactions-table-body");

function formatAmount(amountCents) {
    return new Intl.NumberFormat("bg-BG", {
        style: "currency",
        currency: "EUR"
    }).format(amountCents / 100);
}

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

function renderTransactions(items) {
    tableBody.replaceChildren();

    items.forEach(function(transaction){
        const row = document.createElement("tr");
        const typeLabel = transaction.type === "income" ? "Income" : "Expense";
        const sign = transaction.type === "income" ? "+" : "-";

        addCell(row, transaction.date);
        addCell(row, transaction.description);
        addCell(row, transaction.category);
        addCell(row, typeLabel);
        addCell(row, sign + formatAmount(transaction.amountCents));
        addCell(row, "-");

        tableBody.appendChild(row);
    });
}

renderTransactions(transactions);

function updateSummary(items) {
    let totalIncome = 0;
    let totalExpenses = 0;
    let mothlyBalance = 0;

    const now = new Date();

    const currentMoth =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0");

    items.forEach(function(transaction){
        if(transaction.type === "income"){
            totalIncome+= transaction.amountCents;
        } else if (transaction.type === "expense") {
            totalExpenses += transaction.amountCents;
        }
    })
}
