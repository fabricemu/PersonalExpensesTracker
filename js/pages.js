export const expenses = async () => {
    const expensesRef = db.collection("Expenses");
    const expensesTable = document.getElementById("expenses-table");
    const fetchExpenses = async () => {
        try {
            const querySnapshot = await expensesRef.get();
            const expenses = [];
            querySnapshot.forEach((doc) => {
                expenses.push({id: doc.id, ...doc.data()});
            });
            return expenses;
        } catch (error) {
            console.error("Error fetching expenses:", error);
            return [];
        }
    };

    const addExpense = async (name, amount, date, description) => {
        try {
            // const initialMoneyDoc = await db.collection("Users").doc(user.uid).get();
            // const initialMoney = initialMoneyDoc.data().initialMoney;
            // const remainingMoney = initialMoney - parseFloat(amount);
            //
            // // Check if remaining money is sufficient
            // if (remainingMoney < 0) {
            //     // Show error message or prevent adding expense
            //     throw new Error("Insufficient funds");
            // }

            // Update the initial money in Firestore
            // await db.collection("Users").doc(user.uid).update({initialMoney: remainingMoney});

            await db.collection("Expenses").add({
                name: name,
                price: amount,
                status: "pennding",
                date: date,
                description: description
            });
            await displayExpenses();

            Swal.fire({
                title: 'Expense Added!',
                icon: 'success'
            });
        } catch (error) {
            console.error("Error adding expense:", error);
            // Display error message
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error'
            });
        }
    };


    const updateExpense = async (id, name, amount, date, description) => {
        try {
            await db.collection("Expenses").doc(id).update({
                name: name,
                price: amount,
                date: date,
                description: description
            });
            await displayExpenses();
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "Once deleted, you will not be able to recover this expense!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#1d284d',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                // User confirmed deletion
                await db.collection("Expenses").doc(id).delete();
                await displayExpenses();
                Swal.fire(
                    'Deleted!',
                    'Your expense has been deleted.',
                    'success'
                );
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const updateExpenseTable = (expenses) => {
        const expensesTable = document.querySelector('#expenses-table tbody');

        expenses.forEach((expense) => {
            // Check if a row already exists for this expense
            const existingRow = document.getElementById(`expense-row-${expense.id}`);
            if (existingRow) {
                // Update the existing row with new data
                existingRow.innerHTML = `
                <td>${expense.completed ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</td>
                <td>${expense.name}</td>
                <td>${expense.price}</td>
                <td>${expense.status}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}"><i class="ti ti-pencil-alt"></i>Change</button>
                    <button class="delete-btn" data-id="${expense.id}"><i class="ti ti-trash"></i>Delete</button>
                </td>
            `;
            } else {
                // If the row doesn't exist, create a new row
                const row = document.createElement("tr");
                row.id = `expense-row-${expense.id}`;
                row.innerHTML = `
                <td>${expense.completed ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</td>
                <td>${expense.name}</td>
                <td>${expense.price}</td>
                <td>${expense.status}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}"><i class="ti ti-pencil-alt"></i>Change</button>
                    <button class="delete-btn" data-id="${expense.id}"><i class="ti ti-trash"></i>Delete</button>
                </td>
            `;
                expensesTable.appendChild(row);
            }
        });
    };


    const displayExpenses = async () => {
        try {
            const expenses = await fetchExpenses();
            updateExpenseTable(expenses);
        } catch (error) {
            console.error("Error displaying expenses:", error);
        }
    };

    const listenForExpenseChanges = () => {
        expensesRef.onSnapshot((snapshot) => {
            const expenses = [];
            snapshot.docChanges().forEach((change) => {
                expenses.push({id: change.doc.id, ...change.doc.data()});
            });
            updateExpenseTable(expenses);
        });
    };

    listenForExpenseChanges();

    const addExpenseButton = document.getElementById("addExpenseButton");

    addExpenseButton.addEventListener("click", () => {
        Swal.fire({
            title: 'Add New Expense',
            html: `
            <input id="expenseName" class="" placeholder="Expense Name">
            <input id="expenseAmount" class="" placeholder="Expense Amount">
            <input id="expenseDate" type="date" class="" placeholder="Expense Date">
            <textarea id="expenseDescription" class="" placeholder="Expense Description"></textarea>
        `,
            showCancelButton: true,
            confirmButtonText: 'Add',
            confirmButtonColor: '#1d284d',
            preConfirm: () => {
                // Retrieve user input
                const name = document.getElementById('expenseName').value;
                const amount = document.getElementById('expenseAmount').value;
                const date = document.getElementById('expenseDate').value;
                const description = document.getElementById('expenseDescription').value;

                // Add the new expense to Firestore
                return addExpense(name, amount, date, description);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Expense Added!',
                    icon: 'success',
                    timer: 1800
                });
            }
        });
    });

    expensesTable.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            Swal.fire({
                title: 'Edit Expense',
                html: `
                <input id="swal-name" class="swal2-input" placeholder="Name">
                <input id="swal-amount" class="swal2-input" placeholder="Amount">
                <input id="swal-date" class="swal2-input" type="date">
            `,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const expenseId = event.target.dataset.id;
                    const name = document.getElementById('swal-name').value;
                    const amount = document.getElementById('swal-amount').value;
                    const date = document.getElementById('swal-date').value;
                    updateExpense(expenseId, name, amount, date);
                }
            });
        } else if (event.target.classList.contains("delete-btn")) {
            const expenseId = event.target.dataset.id;
            deleteExpense(expenseId)
        }
    });


    await displayExpenses();

    if (!sessionStorage.getItem('userEmail')) {
        window.location.href = '../index.html';
    }
};
