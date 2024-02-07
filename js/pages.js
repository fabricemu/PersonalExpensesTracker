export const expenses = () => {
    const add = document.getElementById("addExpenseButton")

    const addExpense = (name, amount) => {
        return db.collection("Expenses").add({
            name: name,
            amount: amount
        });
    };

    add.addEventListener("click", () => {
        const name = document.getElementById("expense-name").value;
        const amount = document.getElementById("expense-amount").value;
        addExpense(name, amount)
            .then(() => {
                displayExpenses();
            })
            .catch((error) => {
                console.error("Error adding expense:", error);
            });

    })
    const fetchExpenses = () => {
        return db.collection("Expenses").get()
            .then((querySnapshot) => {
                const expenses = [];
                querySnapshot.forEach((doc) => {
                    expenses.push({id: doc.id, ...doc.data()});
                });
                return expenses;
            })
            .catch((error) => {
                console.error("Error fetching expenses:", error);
                return [];
            });
    };

    const updateExpense = (id, name, amount) => {
        return db.collection("Expenses").doc(id).update({
            name: name,
            amount: amount
        });
    };
    const displayExpenses = () => {
        fetchExpenses().then((expenses) => {
            const expensesContainer = document.getElementById("expenses-container");
            expensesContainer.innerHTML = "";
            alert(JSON.stringify(expenses))
            expenses.forEach((expense) => {
                const expenseElement = document.createElement("div");
                alert(expense.name)
                expenseElement.textContent = `ID: ${expense.id}, Name: ${expense.name}, Amount: ${expense.amount}`;
                expensesContainer.appendChild(expenseElement);
            });
        });
    };
    const addOrUpdateExpense = () => {
        alert("test");
        const name = document.getElementById("expense-name").value;
        const amount = document.getElementById("expense-amount").value;
        const expenseId = document.getElementById("expense-id").value;
        if (expenseId) {
            updateExpense(expenseId, name, amount)
                .then(() => {
                    displayExpenses();
                })
                .catch((error) => {
                    console.error("Error updating expense:", error);
                });
        } else {
            addExpense(name, amount)
                .then(() => {
                    displayExpenses();
                })
                .catch((error) => {
                    console.error("Error adding expense:", error);
                });
        }
    };
    const deleteExpense = (id) => {
        return db.collection("Expenses").doc(id).delete()
            .then(() => {
                console.log("Expense deleted successfully");
            })
            .catch((error) => {
                console.error("Error deleting expense:", error);
            });
    };
    // Initial display of expenses
    displayExpenses();

    if (!sessionStorage.getItem('userEmail')) {
        // If not logged in, redirect to the login page
        window.location.href = '../index.html';
    }
}
