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
                <td>${expense.status === 'completed' ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</td>
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
                <td>${expense.status === 'completed' ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>'}</td>
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

    // Function to handle the click event on table rows
    const handleTableRowClick = (event) => {
        alert("test click")
        const row = event.target.closest('tr'); // Find the closest parent <tr> element
        if (row) {
            const cells = row.querySelectorAll('td'); // Get all <td> elements within the row
            const rowData = {};
            cells.forEach(cell => {
                const fieldName = cell.dataset.field; // Assuming each <td> has a data-field attribute
                // Get the text content of the <td>
                rowData[fieldName] = cell.textContent.trim(); // Add the field name and value to the rowData object
            });

            // Display the rowData in a SweetAlert modal
            Swal.fire({
                title: 'Edit Expense',
                html: `
                <form id="editForm">
                    <label for="name">Name:</label>
                    <input type="text" id="name" value="${rowData.name}">
                    <!-- Add similar input fields for other fields in the rowData object -->
                </form>
            `,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    // Handle saving the updated data
                    // Update the rowData object with the new values
                    rowData.name = document.getElementById('name').value;
                    // Here you can perform any additional logic to save the updated data
                    // For example, you can make a request to update the data in your database
                }
            });
        }
    };

// Add click event listener to the table rows
    const tableRows = document.querySelectorAll('#expenses-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', handleTableRowClick);
        alert("1234")
    });


    await displayExpenses();

    if (!sessionStorage.getItem('userEmail')) {
        window.location.href = '../index.html';
    }
};
export const dashboard = async () => {
    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    // console.log(userData.userId);
    const namesElement = document.getElementById('names');
    namesElement.textContent = `${userData.first_name} ${userData.last_name}`;


}

export const planning = async () => {
    const addPlanningEntry = async (timeFrame, amount) => {
        try {
            await db.collection("Planning").add({
                timeFrame: timeFrame,
                amount: amount
            });
            console.log("Planning entry added successfully");
        } catch (error) {
            console.error("Error adding planning entry:", error);
        }
    };

// Function to edit an existing planning entry
    const editPlanningEntry = async (entryId, newData) => {
        try {
            await db.collection("Planning").doc(entryId).update(newData);
            console.log("Planning entry updated successfully");
        } catch (error) {
            console.error("Error updating planning entry:", error);
        }
    };

// Function to delete a planning entry
    const deletePlanningEntry = async (entryId) => {
        try {
            await db.collection("Planning").doc(entryId).delete();
            console.log("Planning entry deleted successfully");
        } catch (error) {
            console.error("Error deleting planning entry:", error);
        }
    };

// Function to fetch all planning entries
    const fetchPlanningEntries = async () => {
        try {
            const querySnapshot = await db.collection("Planning").get();
            const planningEntries = [];
            querySnapshot.forEach((doc) => {
                planningEntries.push({id: doc.id, ...doc.data()});
            });
            return planningEntries;
        } catch (error) {
            console.error("Error fetching planning entries:", error);
            return [];
        }
    };

// Function to display planning entries in the table
    const displayPlanningEntries = (entries) => {
        const tableBody = document.getElementById("planning-table-body");
        tableBody.innerHTML = ""; // Clear existing entries

        entries.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${entry.timeFrame}</td>
            <td>${entry.amount}</td>
            <td>
                <button class="edit-btn" data-id="${entry.id}">Edit</button>
                <button class="delete-btn" data-id="${entry.id}">Delete</button>
            </td>
        `;
            tableBody.appendChild(row);
        });
    };

// Function to handle form submission
    document.getElementById("add-planning-btn").addEventListener("click", async () => {
        const timeFrame = document.getElementById("timeFrame").value;
        const amount = document.getElementById("amount").value;

        await addPlanningEntry(timeFrame, amount);
        const entries = await fetchPlanningEntries();
        displayPlanningEntries(entries);
    });

// Function to handle edit button click
    document.getElementById("planning-table-body").addEventListener("click", async (event) => {
        if (event.target.classList.contains("edit-btn")) {
            const entryId = event.target.dataset.id;
            const newData = prompt("Enter new data (timeFrame, amount) separated by comma:");
            if (newData) {
                const [timeFrame, amount] = newData.split(",");
                await editPlanningEntry(entryId, {timeFrame, amount});
                const entries = await fetchPlanningEntries();
                displayPlanningEntries(entries);
            }
        }
    });

// Function to handle delete button click
    document.getElementById("planning-table-body").addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const entryId = event.target.dataset.id;
            if (confirm("Are you sure you want to delete this entry?")) {
                await deletePlanningEntry(entryId);
                const entries = await fetchPlanningEntries();
                displayPlanningEntries(entries);
            }
        }
    });

// Initial fetch and display of planning entries
    window.addEventListener("DOMContentLoaded", async () => {
        const entries = await fetchPlanningEntries();
        displayPlanningEntries(entries);
    });
    const frame = document.getElementById("timeFrame")
    frame.addEventListener("change",  () =>{
        const customOptions = document.getElementById("customOptions");
        // If "Custom" is selected, display custom options; otherwise, hide them
        customOptions.style.display = frame.value === "custom" ? "block" : "none";
    });
}

