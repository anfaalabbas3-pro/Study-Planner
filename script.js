// Student Study Planner

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let currentFilter = "all";

// DOM Elements

const taskModal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");
const sortTasks = document.getElementById("sortTasks");
const navItems = document.querySelectorAll(".nav-item");

// Page Initialization

document.addEventListener("DOMContentLoaded", () => {
    displayCurrentDate();
    renderTasks();
    setMinimumDate();
});

// Display Current Date

function displayCurrentDate() {
    const dateElement = document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    dateElement.textContent = today.toLocaleDateString(
        "en-US",
        options
    );
}

// Get Today's Date

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Set Minimum Date

function setMinimumDate() {
    const dateInput = document.getElementById("taskDate");

    if (dateInput) {
        dateInput.min = getTodayDate();
    }
}

// Check if Task is Overdue

function isOverdue(task) {
    if (task.completed) {
        return false;
    }

    const today = getTodayDate();

    return task.date < today;
}

// Open Modal

openModalBtn.addEventListener("click", () => {
    taskModal.classList.add("show");
});

// Close Modal

function closeModal() {
    taskModal.classList.remove("show");
    taskForm.reset();
}

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// Close Modal When Clicking Outside

taskModal.addEventListener("click", (event) => {
    if (event.target === taskModal) {
        closeModal();
    }
});

// Save Tasks to Local Storage

function saveTasks() {
    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}

// Add New Task

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title =
        document.getElementById("taskTitle").value.trim();

    const subject =
        document.getElementById("taskSubject").value;

    const priority =
        document.getElementById("taskPriority").value;

    const date =
        document.getElementById("taskDate").value;

    if (!title || !subject || !priority || !date) {
        alert("Please fill in all fields.");
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
});

// Render Tasks

function renderTasks() {
    let filteredTasks = [...tasks];

    if (currentFilter === "today") {
        const today = getTodayDate();

        filteredTasks = filteredTasks.filter(
            task => task.date === today
        );
    }

    else if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(
            task => !task.completed
        );
    }

    else if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(
            task => task.completed
        );
    }

    const selectedPriority =
        priorityFilter.value;

    if (selectedPriority !== "all") {
        filteredTasks = filteredTasks.filter(
            task => task.priority === selectedPriority
        );
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    if (searchText !== "") {
        filteredTasks = filteredTasks.filter(task => {
            const title = task.title.toLowerCase();
            const subject = task.subject.toLowerCase();

            return (
                title.includes(searchText) ||
                subject.includes(searchText)
            );
        });
    }

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
            (a, b) => b.id - a.id
        );
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No tasks found</h3>
                <p>Add a new study task to get started.</p>
            </div>
        `;
    }

    else {
        taskList.innerHTML =
            filteredTasks
                .map(task => createTaskHTML(task))
                .join("");
    }

    updateStatistics();
    updateSubjectProgress();
    updateSectionTitle();
}

// Create Task HTML

function createTaskHTML(task) {
    const overdueClass =
        isOverdue(task) ? "overdue" : "";

    const completedClass =
        task.completed ? "completed" : "";

    const overdueBadge =
        isOverdue(task)
            ? `<span class="overdue-badge">⚠️ Overdue</span>`
            : "";

    return `
        <div class="task-card ${completedClass} ${overdueClass}">

            <div class="task-content">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                <div class="task-meta">

                    <span class="subject">
                        📚 ${escapeHTML(task.subject)}
                    </span>

                    <span class="priority ${task.priority}">
                        ${capitalize(task.priority)}
                    </span>

                    <span class="${isOverdue(task) ? "overdue-date" : ""}">
                        📅 ${formatDate(task.date)}
                        ${overdueBadge}
                    </span>

                </div>

            </div>

            <div class="task-actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id})">

                    ${task.completed ? "↩ Undo" : "✓ Complete"}

                </button>

                <button
                    class="delete-task"
                    onclick="deleteTask(${task.id})">

                    🗑

                </button>

            </div>

        </div>
    `;
}

// Toggle Task Completion

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete Task

function deleteTask(id) {
    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();
    renderTasks();
}

// Update Statistics

function updateStatistics() {
    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const pending =
        tasks.filter(
            task => !task.completed
        ).length;

    const overdue =
        tasks.filter(
            task => isOverdue(task)
        ).length;

    document.getElementById(
        "totalTasks"
    ).textContent = total;

    document.getElementById(
        "completedTasks"
    ).textContent = completed;

    document.getElementById(
        "pendingTasks"
    ).textContent = pending;

    document.getElementById(
        "overdueTasks"
    ).textContent = overdue;

    let percentage = 0;

    if (total > 0) {
        percentage =
            Math.round(
                (completed / total) * 100
            );
    }

    document.getElementById(
        "progressPercent"
    ).textContent =
        `${percentage}%`;

    document.getElementById(
        "progressBar"
    ).style.width =
        `${percentage}%`;

    updateSubjectProgress();
}

// Subject Progress

function updateSubjectProgress() {
    const container =
        document.getElementById(
            "subjectProgressList"
        );

    const subjects = [
        "Database",
        "Data Structures",
        "Software Engineering",
        "Programming",
        "English",
        "Other"
    ];

    let html = "";

    subjects.forEach(subject => {
        const subjectTasks =
            tasks.filter(
                task => task.subject === subject
            );

        if (subjectTasks.length === 0) {
            return;
        }

        const completedTasks =
            subjectTasks.filter(
                task => task.completed
            ).length;

        const totalTasks =
            subjectTasks.length;

        const percentage =
            Math.round(
                (completedTasks / totalTasks) * 100
            );

        html += `
            <div class="subject-progress-item">

                <div class="subject-progress-header">

                    <span class="subject-name">
                        ${subject}
                    </span>

                    <span class="subject-percentage">
                        ${percentage}%
                    </span>

                </div>

                <div class="subject-progress-bar-container">

                    <div
                        class="subject-progress-bar"
                        style="width: ${percentage}%">
                    </div>

                </div>

                <div class="subject-task-count">
                    ${completedTasks} of ${totalTasks} tasks completed
                </div>

            </div>
        `;
    });

    if (html === "") {
        html = `
            <div class="empty-state">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No subject progress yet
                </h3>

                <p>
                    Add some study tasks to see your subject progress.
                </p>

            </div>
        `;
    }

    container.innerHTML = html;
}

// Update Section Title

function updateSectionTitle() {
    const sectionTitle =
        document.getElementById("sectionTitle");

    const titles = {
        all: "All Tasks",
        today: "Today's Tasks",
        pending: "Pending Tasks",
        completed: "Completed Tasks"
    };

    sectionTitle.textContent =
        titles[currentFilter];
}

// Navigation

navItems.forEach(item => {
    item.addEventListener("click", () => {

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        currentFilter =
            item.dataset.filter;

        renderTasks();
    });
});

// Search

searchInput.addEventListener(
    "input",
    renderTasks
);

// Priority Filter

priorityFilter.addEventListener(
    "change",
    renderTasks
);

// Sorting

sortTasks.addEventListener(
    "change",
    renderTasks
);

// Format Date

function formatDate(dateString) {
    const date =
        new Date(dateString);

    const options = {
        day: "numeric",
        month: "short",
        year: "numeric"
    };

    return date.toLocaleDateString(
        "en-US",
        options
    );
}

// Capitalize Text

function capitalize(text) {
    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

// Escape HTML

function escapeHTML(text) {
    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}