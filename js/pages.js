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

    const addExpense = async (name, amount, date, description, planningEntryId) => {
        try {

            await db.collection("Expenses").add({
                name: name,
                price: amount,
                status: "pennding",
                date: date,
                description: description,
                planningEntryId: planningEntryId
            });
            await subtractExpenseAmountFromPlanning(planningEntryId, amount);
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
    const subtractExpenseAmountFromPlanning = async (planningEntryId, expenseAmount) => {
        try {
            const planningEntryDoc = await db.collection("Planning").doc(planningEntryId).get();
            const planningEntryData = planningEntryDoc.data();
            const updatedAmount = planningEntryData.amount - parseFloat(expenseAmount);
            await db.collection("Planning").doc(planningEntryId).update({amount: updatedAmount});
            console.log("Expense amount subtracted from planning entry successfully");
        } catch (error) {
            console.error("Error subtracting expense amount from planning entry:", error);
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

    addExpenseButton.addEventListener("click", async () => {
        // Fetch planning entries from Firestore
        const querySnapshot = await db.collection("Planning").get();
        const planningEntries = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        // Create the <select> element
        const planningDropdown = document.createElement("select");
        planningDropdown.id = "planning-dropdown";

        // Add options for each planning entry to the dropdown
        planningEntries.forEach(entry => {
            const option = document.createElement("option");
            option.value = entry.id;
            option.textContent = `${entry.timeFrame} - ${entry.amount}`;
            planningDropdown.appendChild(option);
        });

        // Display Swal modal for adding a new expense
        Swal.fire({
            title: 'Add New Expense',
            html: `
            ${planningDropdown.outerHTML} <!-- Insert the <select> element HTML here -->
            <input class="" id="expenseName" placeholder="Expense Name">
            <input class="" id="expenseAmount" placeholder="Expense Amount">
            <input class="" id="expenseDate" placeholder="Expense Date" type="date">
            <textarea class="" id="expenseDescription" placeholder="Expense Description"></textarea>
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
                const planningEntryId = document.getElementById('planning-dropdown').value;

                // Add the new expense to Firestore
                return addExpense(name, amount, date, description, planningEntryId);
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
    // Function to add a new planning entry
    const planningRef = db.collection("Planning");
    const planningTable = document.getElementById("planning-table-body");

    const addPlanningEntry = async (timeFrame, amount) => {
        try {
            await planningRef.add({
                timeFrame: timeFrame,
                amount: amount
            });
            Swal.fire(
                'New record!',
                'Planning entry added successfully.',
                'success'
            );
            const entries = await fetchPlanningEntries();
            displayPlanningEntries(entries);
        } catch (error) {
            console.error("Error adding planning entry:", error);
        }
    };

    const editPlanningEntry = async (entryId, newData) => {
        try {
            await planningRef.doc(entryId).update(newData);
            console.log("Planning entry updated successfully");
            const entries = await fetchPlanningEntries();
            displayPlanningEntries(entries);
        } catch (error) {
            console.error("Error updating planning entry:", error);
        }
    };

    const deletePlanningEntry = async (entryId) => {
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
                await planningRef.doc(entryId).delete();
                const entries = await fetchPlanningEntries();
                displayPlanningEntries(entries);
                Swal.fire(
                    'Deleted!',
                    'Your expense has been deleted.',
                    'success'
                );
            }

        } catch (error) {
            console.error("Error deleting planning entry:", error);
        }
    };

    const fetchPlanningEntries = async () => {
        try {
            const querySnapshot = await planningRef.get();
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

    const displayPlanningEntries = (entries) => {
        planningTable.innerHTML = ""; // Clear existing entries

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
            planningTable.appendChild(row);
        });
    };

    const handleTableRowClick = (event) => {
        const row = event.target.closest('tr');
        if (row) {
            if (event.target.classList.contains("delete-btn")) {
                const entryId = event.target.dataset.id;
                deletePlanningEntry(entryId)

            } else {
                const cells = row.querySelectorAll('td');
                const rowData = {};
                cells.forEach(cell => {
                    const fieldName = cell.dataset.field;
                    rowData[fieldName] = cell.textContent.trim();
                });

                Swal.fire({
                    title: 'Edit Planning Entry',
                    html: `
                <form id="editForm">
                    <label for="timeFrame">Time Frame:</label>
                    <input type="text" id="timeFrame" value="${rowData.timeFrame}">
                    <label for="amount">Amount:</label>
                    <input type="text" id="amount" value="${rowData.amount}">
                </form>
            `,
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    cancelButtonText: 'Cancel',
                    preConfirm: async () => {
                        const entryId = event.target.dataset.id;
                        const timeFrame = document.getElementById('timeFrame').value;
                        const amount = document.getElementById('amount').value;
                        await editPlanningEntry(entryId, {timeFrame, amount});
                    }
                });
            }

        }
    };

// Add click event listener to the table rows
    planningTable.addEventListener('click', handleTableRowClick);

// Function to handle form submission
    document.getElementById("add-planning-btn").addEventListener("click", async () => {
        const timeFrame = document.getElementById("timeFrame").value;
        const amount = document.getElementById("amount").value;

        await addPlanningEntry(timeFrame, amount);
    });

// // Initial fetch and display of planning entries
//     window.addEventListener("DOMContentLoaded", async () => {
//         const entries = await fetchPlanningEntries();
//         displayPlanningEntries(entries);
//     });
    const displayPlanning = async () => {
        try {
            const entries = await fetchPlanningEntries();
            displayPlanningEntries(entries);
        } catch (error) {
            console.error("Error displaying Schedules:", error);
        }
    };
    await displayPlanning()

}

