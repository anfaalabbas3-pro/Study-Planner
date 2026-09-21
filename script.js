let tasks = JSON.parse(
localStorage.getItem("studyTasks")
) || [];

let currentFilter = "all";

/* =====================================
DOM ELEMENTS
===================================== */

const taskModal =
document.getElementById("taskModal");

const openTaskModal =
document.getElementById("openTaskModal");

const closeTaskModal =
document.getElementById("closeTaskModal");

const cancelTask =
document.getElementById("cancelTask");

const emptyAddTask =
document.getElementById("emptyAddTask");

const taskForm =
document.getElementById("taskForm");

const taskList =
document.getElementById("taskList");

const emptyState =
document.getElementById("emptyState");

const priorityFilter =
document.getElementById("priorityFilter");

const searchInput =
document.getElementById("searchInput");

const sortTasks =
document.getElementById("sortTasks");

const taskSectionTitle =
document.getElementById("taskSectionTitle");

const currentDate =
document.getElementById("currentDate");

/* =====================================
STATISTICS ELEMENTS
===================================== */

const totalTasks =
document.getElementById("totalTasks");

const pendingTasks =
document.getElementById("pendingTasks");

const completedTasks =
document.getElementById("completedTasks");

const progressPercentage =
document.getElementById("progressPercentage");

const progressText =
document.getElementById("progressText");

const progressFill =
document.getElementById("progressFill");

/* =====================================
DISPLAY CURRENT DATE
===================================== */

function displayCurrentDate() {
const today = new Date();

const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

currentDate.textContent =
    today.toLocaleDateString(
        "en-US",
        options
    );


}

/* =====================================
OPEN MODAL
===================================== */

function openModal() {
taskModal.classList.add("show");
}

/* =====================================
CLOSE MODAL
===================================== */

function closeModal() {


taskModal.classList.remove("show");

taskForm.reset();


}

/* =====================================
ADD NEW TASK
===================================== */

taskForm.addEventListener(
"submit",
function(event) {
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


    if (!title || !subject || !date) {

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

/* =====================================
SAVE TASKS
===================================== */

function saveTasks() {
localStorage.setItem(
    "studyTasks",
    JSON.stringify(tasks)
);

}

/* =====================================
RENDER TASKS
===================================== */

function renderTasks() {

taskList.innerHTML = "";


let filteredTasks = [...tasks];


/* -----------------------------
   NAVIGATION FILTER
----------------------------- */

if (currentFilter === "today") {

    const today = getTodayDate();

    filteredTasks =
        filteredTasks.filter(
            task => task.date === today
        );

}


if (currentFilter === "pending") {

    filteredTasks =
        filteredTasks.filter(
            task => !task.completed
        );

}


if (currentFilter === "completed") {

    filteredTasks =
        filteredTasks.filter(
            task => task.completed
        );

}


/* -----------------------------
   PRIORITY FILTER
----------------------------- */

const selectedPriority =
    priorityFilter.value;


if (selectedPriority !== "all") {

    filteredTasks =
        filteredTasks.filter(
            task =>
                task.priority === selectedPriority
        );

}


/* -----------------------------
   SEARCH
----------------------------- */

const searchText =
    searchInput.value
        .toLowerCase()
        .trim();


if (searchText !== "") {

    filteredTasks =
        filteredTasks.filter(task => {

            const title =
                task.title.toLowerCase();

            const subject =
                task.subject.toLowerCase();

            return (
                title.includes(searchText) ||
                subject.includes(searchText)
            );

        });

}


/* -----------------------------
   SORT TASKS
----------------------------- */

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


/* -----------------------------
   EMPTY STATE
----------------------------- */

if (filteredTasks.length === 0) {

    emptyState.style.display = "block";

}

else {

    emptyState.style.display = "none";

}


/* -----------------------------
   CREATE TASK CARDS
----------------------------- */

filteredTasks.forEach(task => {

    const taskCard =
        document.createElement("div");


    taskCard.className =
        "task-card";


    if (task.completed) {

        taskCard.classList.add(
            "completed"
        );

    }


    taskCard.innerHTML = `

        <input
            type="checkbox"
            class="task-checkbox"
            ${task.completed ? "checked" : ""}
            onchange="toggleTask(${task.id})"
        >

        <div class="task-info">

            <div class="task-title">
                ${escapeHTML(task.title)}
            </div>

            <div class="task-meta">

                <span class="subject">
                    📚 ${escapeHTML(task.subject)}
                </span>

                <span>
                    📅 ${formatDate(task.date)}
                </span>

                <span class="priority ${task.priority}">
                    ${capitalize(task.priority)}
                </span>

            </div>

        </div>

        <button
            class="delete-task"
            onclick="deleteTask(${task.id})"
            title="Delete task"
        >
            🗑️
        </button>

    `;


    taskList.appendChild(taskCard);

});


updateStatistics();


}

/* =====================================
SEARCH EVENT
===================================== */

searchInput.addEventListener(
"input",
renderTasks
);

/* =====================================
SORT EVENT
===================================== */

sortTasks.addEventListener(
"change",
renderTasks
);

/* =====================================
PRIORITY FILTER
===================================== */

priorityFilter.addEventListener(
"change",
renderTasks
);

/* =====================================
TOGGLE TASK
===================================== */

function toggleTask(id) {

tasks = tasks.map(task => {

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

/* =====================================
DELETE TASK
===================================== */

function deleteTask(id) {
const confirmed =
    confirm(
        "Are you sure you want to delete this task?"
    );


if (!confirmed) {

    return;

}


tasks =
    tasks.filter(
        task => task.id !== id
    );


saveTasks();

renderTasks();

}

/* =====================================
UPDATE STATISTICS
===================================== */

function updateStatistics() {

const total =
    tasks.length;


const completed =
    tasks.filter(
        task => task.completed
    ).length;


const pending =
    total - completed;


let percentage = 0;


if (total > 0) {

    percentage =
        Math.round(
            (completed / total) * 100
        );

}


totalTasks.textContent =
    total;


pendingTasks.textContent =
    pending;


completedTasks.textContent =
    completed;


progressPercentage.textContent =
    percentage + "%";


progressText.textContent =
    percentage + "%";


progressFill.style.width =
    percentage + "%";

}

/* =====================================
NAVIGATION FILTER
===================================== */

document
.querySelectorAll(".nav-item")
.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            document
                .querySelectorAll(".nav-item")
                .forEach(item =>
                    item.classList.remove(
                        "active"
                    )
                );


            this.classList.add(
                "active"
            );


            currentFilter =
                this.dataset.filter;


            updateSectionTitle();

            renderTasks();

        }
    );

});

/* =====================================
UPDATE SECTION TITLE
===================================== */

function updateSectionTitle() {

const titles = {

    all: "All Tasks",

    today: "Today's Tasks",

    pending: "Pending Tasks",

    completed: "Completed Tasks"

};


taskSectionTitle.textContent =
    titles[currentFilter];
}

/* =====================================
MODAL EVENTS
===================================== */

openTaskModal.addEventListener(
"click",
openModal
);

closeTaskModal.addEventListener(
"click",
closeModal
);

cancelTask.addEventListener(
"click",
closeModal
);

emptyAddTask.addEventListener(
"click",
openModal
);

/* Close modal by clicking outside */

taskModal.addEventListener(
"click",
function(event) {

    if (
        event.target === taskModal
    ) {

        closeModal();

    }

}

);

/* =====================================
HELPER FUNCTIONS
===================================== */

function getTodayDate() {
const today =
    new Date();


const year =
    today.getFullYear();


const month =
    String(
        today.getMonth() + 1
    ).padStart(2, "0");


const day =
    String(
        today.getDate()
    ).padStart(2, "0");


return `${year}-${month}-${day}`;

}

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

function capitalize(text) {

return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
);

}

/* Prevent HTML injection */

function escapeHTML(text) {

const div =
    document.createElement("div");

div.textContent =
    text;

return div.innerHTML;


}

/* =====================================
INITIALIZE APPLICATION
===================================== */

displayCurrentDate();

renderTasks();
