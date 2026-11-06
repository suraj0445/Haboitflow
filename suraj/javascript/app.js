
const KEY = "habitflow_habits";
const USER = "habitflow_user";

function getHabits() {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
}

function saveHabits(habits) {
    localStorage.setItem(KEY, JSON.stringify(habits));
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !password) return;

        localStorage.setItem(USER, name);
        window.location.href = "index.html";
    });
}

// LOGIN CHECK
if (!loginForm && !localStorage.getItem(USER)) {
    window.location.href = "login.html";
}

// LOGOUT
document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", function() {
        localStorage.removeItem(USER);
        window.location.href = "login.html";
    });
});

// ADD HABIT
const habitForm = document.getElementById("habitForm");

if (habitForm) {
    habitForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("habitName").value.trim();
        const category = document.getElementById("habitCategory").value;
        const schedule = document.getElementById("habitTime").value;

        if (!name) return;

        const habits = getHabits();

        habits.push({
            id: Date.now().toString(),
            name: name,
            category: category,
            schedule: schedule,
            completedDates: []
        });

        saveHabits(habits);
        habitForm.reset();
        renderAll();
    });
}

// DELETE HABIT
function deleteHabit(id) {
    if (!confirm("Delete this habit?")) return;

    const habits = getHabits().filter(h => h.id !== id);
    saveHabits(habits);
    renderAll();
}

// COMPLETE / UNCOMPLETE HABIT
function toggleHabit(id) {
    const habits = getHabits();
    const habit = habits.find(h => h.id === id);

    if (!habit) return;

    const dates = habit.completedDates;
    const index = dates.indexOf(today());

    if (index >= 0) {
        dates.splice(index, 1);
    } else {
        dates.push(today());
    }

    saveHabits(habits);
    renderAll();
}

// CURRENT STREAK
function getStreak(habit) {
    let count = 0;
    let date = new Date();

    while (habit.completedDates.includes(date.toISOString().slice(0, 10))) {
        count++;
        date.setDate(date.getDate() - 1);
    }

    return count;
}

// CREATE HABIT ROW
function createRow(habit, dashboard = false) {
    const row = document.createElement("div");
    row.className = "habit-row";

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = habit.name;

    const detail = document.createElement("p");
    detail.textContent =
        habit.category + " | " + getStreak(habit) + " day streak";

    info.append(name, detail);

    row.appendChild(info);

    if (dashboard) {
        const done = habit.completedDates.includes(today());

        const check = document.createElement("button");
        check.textContent = done ? "Completed ✓" : "Mark Done";
        if (done) check.classList.add("done");

        check.addEventListener("click", () => toggleHabit(habit.id));
        row.appendChild(check);
    } else {
        const del = document.createElement("button");
        del.textContent = "Delete";
        del.addEventListener("click", () => deleteHabit(habit.id));
        row.appendChild(del);
    }

    return row;
}

// DASHBOARD
function renderDashboard() {
    const list = document.getElementById("todayList");
    if (!list) return;

    const habits = getHabits();

    const completed = habits.filter(h =>
        h.completedDates.includes(today())
    ).length;

    document.getElementById("totalHabits").textContent = habits.length;
    document.getElementById("completedToday").textContent = completed;

    const best = habits.reduce(
        (max, h) => Math.max(max, getStreak(h)), 0
    );

    document.getElementById("bestStreak").textContent = best + " days";

    list.innerHTML = "";

    habits.forEach(h => {
        list.appendChild(createRow(h, true));
    });
}

// HABITS PAGE
function renderHabits() {
    const list = document.getElementById("allHabits");
    if (!list) return;

    list.innerHTML = "";

    getHabits().forEach(h => {
        list.appendChild(createRow(h));
    });
}

// PROGRESS PAGE
function renderProgress() {
    const list = document.getElementById("progressList");
    if (!list) return;

    const habits = getHabits();

    const completed = habits.filter(h =>
        h.completedDates.includes(today())
    ).length;

    const totalChecks = habits.reduce(
        (sum, h) => sum + h.completedDates.length, 0
    );

    const percent = habits.length
        ? Math.round(completed / habits.length * 100)
        : 0;

    document.getElementById("progressTotal").textContent = habits.length;
    document.getElementById("progressDone").textContent = completed;
    document.getElementById("allChecks").textContent = totalChecks;

    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressBar").style.width = percent + "%";

    document.getElementById("progressMessage").textContent =
        completed + " out of " + habits.length + " habits completed today.";

    list.innerHTML = "";

    habits.forEach(h => {
        const row = document.createElement("div");
        row.className = "habit-row";

        const info = document.createElement("div");
        info.innerHTML = "";

        const name = document.createElement("strong");
        name.textContent = h.name;

        const detail = document.createElement("p");
        detail.textContent =
            h.completedDates.length + " total check-ins";

        info.append(name, detail);
        row.appendChild(info);
        list.appendChild(row);
    });
}

// REFRESH ALL PAGES
function renderAll() {
    renderDashboard();
    renderHabits();
    renderProgress();
}

renderAll();
