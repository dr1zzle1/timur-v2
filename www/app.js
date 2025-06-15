// app.js
// Регистрация Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("ServiceWorker registration successful"))
      .catch((err) => console.log("ServiceWorker registration failed: ", err));
  });
}

// ====== Пользователи ======
let users = JSON.parse(localStorage.getItem("users")) || [
  { login: "teacher", password: "1234" },
  { login: "admin", password: "admin" },
];

let currentUser = null;

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Проверка авторизации при загрузке
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    switchScreen("start-screen", "main-screen");
  }
});

// ====== Мок-данные ======
// let courses = [
//   { id: 1, title: "Машинное обучение", groupCount: 2 },
//   { id: 2, title: "Система хранения данных", groupCount: 3 },
// ];

let students = [
  { id: 1, name: "Иванов А.Б.", group: "гр. 3545472" },
  { id: 2, name: "Смирнова И.В.", group: "гр. 323137" },
];

let subjects = [
  { id: 1, title: "Машинное обучение", groupCount: 2 },
  { id: 2, title: "Система хранения данных", groupCount: 3 },
];
let groups = [
  { id: 1, title: "гр. 343243", studentCount: 3 },
  { id: 2, title: "гр. 13321454", studentCount: 4 },
];
let schedule = [
  {
    date: "2023-11-20",
    lessons: [
      { title: "Машинное обучение (ЛК)", group: "гр. 343243", time: "9:00-10:30" },
      { title: "Система хранения данных (ЛР)", group: "гр. 13321454", time: "10:45-12:15" },
    ],
  },
  {
    date: "2023-11-21",
    lessons: [
      { title: "Машинное обучение (ЛР)", group: "гр. 343243", time: "9:00-10:30" },
      { title: "Машинное обучение (ЛК)", group: "гр. 13321454", time: "10:45-12:15" },
    ],
  },
];

// ====== Авторизация ======
function login() {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;
  const user = users.find((u) => u.login === login && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    switchScreen("login-screen", "main-screen");
    updateNavButtons();
  } else {
    alert("Неверный логин или пароль");
  }
}

function register() {
  const login = document.getElementById("reg-login").value;
  const password = document.getElementById("reg-password").value;

  if (!login || !password) {
    alert("Заполните оба поля");
    return;
  }

  if (users.some((u) => u.login === login)) {
    alert("Пользователь с таким логином уже существует");
    return;
  }

  users.push({ login, password });
  saveUsers();
  alert("Регистрация успешна. Теперь войдите.");
  goToLogin();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  switchScreen("main-screen", "start-screen");
  document.getElementById("dynamic-content").classList.add("hidden");
  updateNavButtons();
}

// ====== Переходы между экранами ======
function switchScreen(from, to) {
  document.getElementById(from).classList.remove("active");
  document.getElementById(from).classList.add("hidden");
  document.getElementById(to).classList.remove("hidden");
  document.getElementById(to).classList.add("active");
}

function goToLogin() {
  switchScreen("start-screen", "login-screen");
}

function goToRegister() {
  switchScreen("start-screen", "register-screen");
}

function goToStart() {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.remove("active");
    el.classList.add("hidden");
  });
  document.getElementById("start-screen").classList.add("active");
  document.getElementById("start-screen").classList.remove("hidden");
  updateNavButtons();
}

// ====== Навигация ======
let currentSection = null;

function updateNavButtons() {
  const navButtons = document.querySelectorAll(".bottom-nav button");
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  if (currentSection && currentUser) {
    const activeBtn = document.querySelector(
      `.bottom-nav button[onclick="showSection('${currentSection}')"]`
    );
    if (activeBtn) activeBtn.classList.add("active");
  }
}

function showSection(section) {
  if (!currentUser) {
    alert("Пожалуйста, войдите в систему");
    return;
  }

  currentSection = section;
  updateNavButtons();

  let title = "",
    html = "";

  if (section === "main-screen") {
    switchScreen("dynamic-content", "main-screen");
    return;
  } else if (section === "students") {
    title = "Список студентов";
    html = students
      .map(
        (s) =>
          `<li class="student"> <img class="avatar" src="./assets/user.png"/> <div><span>${s.name}</span> <span>${s.group}</span> </div></li>`
      )
      .join("");
  } else if (section === "subjects") {
    title = "Предметы";
    html = subjects
      .map(
        (s, i) =>
          `<li class="group"><div>${i + 1}. ${s.title}</div> <span>Количество групп: ${
            s.groupCount
          }</span></li>`
      )
      .join("");
  } else if (section === "groups") {
    title = "Группы";
    html = groups
      .map(
        (g, i) =>
          `<li class="group"><div>${i + 1}. ${g.title}</div> <span>Количество студентов: ${
            g.studentCount
          }</span></li>`
      )
      .join("");
  } else if (section === "schedule") {
    title = "Расписание";
    html = `
      <div class="schedule">
        <h3>Выберите дату:</h3>
        <input type="date" id="schedule-date" onchange="showDailySchedule()">
        <div id="daily-schedule"></div>
      </div>
    `;
  }

  document.getElementById(
    "dynamic-content"
  ).innerHTML = `<h2>${title} <button onclick="showAddForm('${section}')">+ ДОБАВИТЬ</button></h2> <div class="content">${html}</div>`;
  switchScreen("main-screen", "dynamic-content");

  if (section === "schedule") {
    // Устанавливаем сегодняшнюю дату по умолчанию для расписания
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("schedule-date").value = today;
    showDailySchedule();
  }
}

function goHome() {
  currentSection = "main-screen";
  switchScreen("dynamic-content", "main-screen");
  updateNavButtons();
}

// ====== Расписание ======
function showDailySchedule() {
  const date = document.getElementById("schedule-date").value;
  const dailySchedule = schedule.find((item) => item.date === date);

  const scheduleEl = document.getElementById("daily-schedule");
  if (dailySchedule) {
    scheduleEl.innerHTML = `
      <h4>Расписание на выбранную дату:</h4>
      <ul class="schedule-list">${dailySchedule.lessons
        .map(
          (lesson, i) =>
            `<li class="group"><div>${lesson.time} ${lesson.title}</div> <span>Группа: ${lesson.group}</span></li>`
        )
        .join("")}</ul>`;
  } else {
    scheduleEl.innerHTML = `<p>На выбранную дату занятий нет</p>`;
  }
}

function addSchedule() {
  const date = document.getElementById("lesson-date").value;
  const title = document.getElementById("lesson-title").value;
  const group = document.getElementById("lesson-group").value;
  const time = document.getElementById("lesson-time").value;

  if (date && title && group && time) {
    const lesson = { title, group, time };

    let dailySchedule = schedule.find((item) => item.date === date);
    if (dailySchedule) {
      dailySchedule.lessons.push(lesson);
    } else {
      schedule.push({ date, lessons: [lesson] });
    }

    document.querySelector(".modal").remove();
    showSection("schedule");

    // Обновляем расписание, если открыта та же дата
    if (
      document.getElementById("schedule-date") &&
      document.getElementById("schedule-date").value === date
    ) {
      showDailySchedule();
    }
  } else {
    alert("Заполните все поля!");
  }
}

// ====== Добавление сущностей ======
function addCourse() {
  const val = document.getElementById("new-course").value;
  if (val) {
    courses.push({ id: Date.now(), title: val });
    showSection("courses");
  }
}

function addStudent() {
  const name = document.getElementById("student-name").value;
  const group = document.getElementById("student-group").value;

  if (name && group) {
    students.push({ id: Date.now(), name, group });
    document.querySelector(".modal").remove();
    showSection("students");
  } else {
    alert("Заполните все поля!");
  }
}

function addSubject() {
  const title = document.getElementById("subject-title").value;
  const groupCount = document.getElementById("subject-group-count").value;

  if (title && groupCount) {
    subjects.push({ id: Date.now(), title, groupCount: parseInt(groupCount) });
    document.querySelector(".modal").remove();
    showSection("subjects");
  } else {
    alert("Заполните все поля!");
  }
}

function addGroup() {
  const title = document.getElementById("group-title").value;
  const studentCount = document.getElementById("group-student-count").value;

  if (title && studentCount) {
    groups.push({ id: Date.now(), title, studentCount: parseInt(studentCount) });
    document.querySelector(".modal").remove();
    showSection("groups");
  } else {
    alert("Заполните все поля!");
  }
}

// MODAL
// ====== Модальные окна ======
function showModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <span class="close-modal">&times;</span>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-modal").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showAddForm(section) {
  let title = "";
  let content = "";

  if (section === "students") {
    title = "Добавить студента";
    content = `
      <form id="add-student-form">
        <input type="text" id="student-name" placeholder="ФИО студента" required>
        <input type="text" id="student-group" placeholder="Группа" required>
        <button type="submit">Добавить</button>
      </form>
    `;
  } else if (section === "groups") {
    title = "Добавить группу";
    content = `
      <form id="add-group-form">
        <input type="text" id="group-title" placeholder="Название группы" required>
        <input type="number" id="group-student-count" placeholder="Количество студентов" required>
        <button type="submit">Добавить</button>
      </form>
    `;
  } else if (section === "subjects") {
    title = "Добавить предмет";
    content = `
      <form id="add-subject-form">
        <input type="text" id="subject-title" placeholder="Название предмета" required>
        <input type="number" id="subject-group-count" placeholder="Количество групп" required>
        <button type="submit">Добавить</button>
      </form>
    `;
  } else if (section === "schedule") {
    title = "Добавить занятие";
    content = `
      <form id="add-schedule-form">
        <input type="date" id="lesson-date" required>
        <input type="text" id="lesson-title" placeholder="Название занятия" required>
        <input type="text" id="lesson-group" placeholder="Группа" required>
        <input type="text" id="lesson-time" placeholder="Время (например, 9:00-10:30)" required>
        <button type="submit">Добавить</button>
      </form>
    `;
  }

  showModal(title, content);

  // Назначаем обработчики форм
  if (section === "students" && document.getElementById("add-student-form")) {
    document.getElementById("add-student-form").addEventListener("submit", (e) => {
      e.preventDefault();
      addStudent();
    });
  } else if (section === "groups" && document.getElementById("add-group-form")) {
    document.getElementById("add-group-form").addEventListener("submit", (e) => {
      e.preventDefault();
      addGroup();
    });
  } else if (section === "subjects" && document.getElementById("add-subject-form")) {
    document.getElementById("add-subject-form").addEventListener("submit", (e) => {
      e.preventDefault();
      addSubject();
    });
  } else if (section === "schedule" && document.getElementById("add-schedule-form")) {
    document.getElementById("add-schedule-form").addEventListener("submit", (e) => {
      e.preventDefault();
      addSchedule();
    });
  }
}
