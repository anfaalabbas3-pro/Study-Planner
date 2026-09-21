/* =========================
   STUDENT STUDY PLANNER
========================= */


/* =========================
   VARIABLES
========================= */

let tasks =
    JSON.parse(localStorage.getItem("studyTasks")) || [];

let currentFilter = "all";


/* =========================
   DOM ELEMENTS
========================= */

const taskModal =
    document.getElementById("taskModal");

const openModalBtn =
    document.getElementById("openModalBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelModalBtn =
    document.getElementById("cancelModalBtn");

const taskForm =
    document.getElementById("taskForm");

const taskList =
    document.getElementById("taskList");

const searchInput =
    document.getElementById("searchInput");

const priorityFilter =
    document.getElementById("priorityFilter");

const sortTasks =
    document.getElementById("sortTasks");

const navItems =
    document.querySelectorAll(".nav-item");


/* =========================
   INITIALIZE APP
========================= */

document.addEventListener("DOMContentLoaded", () => {

    displayCurrentDate();

    renderTasks();

    setMinimumDate();

});


/* =========================
   CURRENT DATE
========================= */

function displayCurrentDate() {

    const currentDateElement =
        document.getElementById("currentDate");

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );
}


/* =========================
   GET TODAY
========================= */

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================
   MINIMUM DATE
========================= */

function setMinimumDate() {

    const dateInput =
        document.getElementById("taskDate");

    dateInput.min =
        getTodayDate();
}


/* =========================
   CHECK OVERDUE
========================= */

function isOverdue(task) {

    if (task.completed) {
        return false;
    }

    const today =
        getTodayDate();

    return task.date < today;
}


/* =========================
   MODAL
========================= */

function openModal() {

    taskModal.classList.add("active");

    document
        .getElementById("taskTitle")
        .focus();
}


function closeModal() {

    taskModal.classList.remove("active");

    taskForm.reset();

    setMinimumDate();
}


/* Open modal */

openModalBtn.addEventListener(
    "click",
    openModal
);


/* Close modal */

closeModalBtn.addEventListener(
    "click",
    closeModal
);


/* Cancel */

cancelModalBtn.addEventListener(
    "click",
    closeModal
);


/* Close when clicking outside */

taskModal.addEventListener(
    "click",
    (event) => {

        if (event.target === taskModal) {
            closeModal();
        }

    }
);


/* =========================
   ADD TASK
========================= */

taskForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const title =
            document
                .getElementById("taskTitle")
                .value
                .trim();

        const subject =
            document
                .getElementById("taskSubject")
                .value;

        const priority =
            document
                .getElementById("taskPriority")
                .value;

        const date =
            document
                .getElementById("taskDate")
                .value;


        if (
            title === "" ||
            subject === "" ||
            priority === "" ||
            date === ""
        ) {

            return;

        }


        const newTask = {

            id: Date.now(),

            title: title,

            subject: subject,

            priority: priority,

            date: date,

            completed: false

        };


        tasks.push(newTask);

        saveTasks();

        renderTasks();

        closeModal();

    }
);


/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );

}


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    let filteredTasks =
        [...tasks];


    /* =====================
       NAVIGATION FILTER
    ====================== */

    if (currentFilter === "today") {

        const today =
            getTodayDate();

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.date === today
            );

    }


    else if (currentFilter === "pending") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    !task.completed
            );

    }


    else if (currentFilter === "completed") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.completed
            );

    }


    /* =====================
       PRIORITY FILTER
    ====================== */

    const selectedPriority =
        priorityFilter.value;


    if (selectedPriority !== "all") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.priority ===
                    selectedPriority
            );

    }


    /* =====================
       SEARCH
    ====================== */

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    if (searchText !== "") {

        filteredTasks =
            filteredTasks.filter(task => {

                const title =
                    task.title
                        .toLowerCase();

                const subject =
                    task.subject
                        .toLowerCase();

                return (
                    title.includes(searchText) ||
                    subject.includes(searchText)
                );

            });

    }


    /* =====================
       SORTING
    ====================== */

    const selectedSort =
        sortTasks.value;


    if (selectedSort === "dueDate") {

        filteredTasks.sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );

    }


    else if (selectedSort === "priority") {

        const priorityOrder = {

            high: 1,

            medium: 2,

            low: 3

        };


        filteredTasks.sort(
            (a, b) =>
                priorityOrder[a.priority] -
                priorityOrder[b.priority]
        );

    }


    else if (selectedSort === "newest") {

        filteredTasks.sort(
            (a, b) =>
                b.id - a.id
        );

    }


    /* =====================
       EMPTY STATE
    ====================== */

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No tasks found
                </h3>

                <p>
                    Try adding a new task
                    or changing your filters.
                </p>

            </div>

        `;

        updateStatistics();

        updateSectionTitle();

        return;

    }


    /* =====================
       TASK HTML
    ====================== */

    taskList.innerHTML =
        filteredTasks
            .map(task => {

                const overdue =
                    isOverdue(task);


                return `

                    <div
                        class="task-card
                        ${task.completed ? "completed" : ""}
                        ${overdue ? "overdue" : ""}"
                    >

                        <div class="task-content">

                            <div class="task-title">

                                ${escapeHTML(task.title)}

                            </div>


                            <div class="task-meta">

                                <span class="subject">

                                    ${escapeHTML(task.subject)}

                                </span>


                                <span
                                    class="priority ${task.priority}"
                                >

                                    ${capitalize(task.priority)}

                                </span>


                                <span
                                    class="${overdue ? "overdue-date" : ""}"
                                >

                                    📅
                                    ${formatDate(task.date)}

                                    ${
                                        overdue
                                        ? `
                                            <span class="overdue-badge">
                                                ⚠️ Overdue
                                            </span>
                                        `
                                        : ""
                                    }

                                </span>

                            </div>

                        </div>


                        <div class="task-actions">

                            <button
                                class="complete-btn
                                ${task.completed ? "completed-btn" : ""}"
                                onclick="toggleTask(${task.id})"
                                title="Mark as complete"
                            >

                                ${
                                    task.completed
                                    ? "✓"
                                    : "○"
                                }

                            </button>


                            <button
                                class="delete-task"
                                onclick="deleteTask(${task.id})"
                                title="Delete task"
                            >

                                🗑️

                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");


    updateStatistics();

    updateSectionTitle();

}


/* =========================
   TOGGLE TASK
========================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {

                    ...task,

                    completed:
                        !task.completed

                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveTasks();

    renderTasks();

}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        tasks.filter(
            task =>
                !task.completed
        ).length;


    const overdue =
        tasks.filter(
            task =>
                isOverdue(task)
        ).length;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    document
        .getElementById("totalTasks")
        .textContent = total;


    document
        .getElementById("pendingTasks")
        .textContent = pending;


    document
        .getElementById("completedTasks")
        .textContent = completed;


    document
        .getElementById("overdueTasks")
        .textContent = overdue;


    document
        .getElementById("progressPercent")
        .textContent =
            `${progress}%`;


    document
        .getElementById("progressBar")
        .style.width =
            `${progress}%`;

}


/* =========================
   SECTION TITLE
========================= */

function updateSectionTitle() {

    const title =
        document.getElementById(
            "sectionTitle"
        );


    const titles = {

        all: "All Tasks",

        today: "Today's Tasks",

        pending: "Pending Tasks",

        completed: "Completed Tasks"

    };


    title.textContent =
        titles[currentFilter];

}


/* =========================
   NAVIGATION
========================= */

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );


            currentFilter =
                item.dataset.filter;


            renderTasks();

        }
    );

});


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderTasks
);


/* =========================
   PRIORITY FILTER
========================= */

priorityFilter.addEventListener(
    "change",
    renderTasks
);


/* =========================
   SORT
========================= */

sortTasks.addEventListener(
    "change",
    renderTasks
);


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================
   CAPITALIZE
========================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}