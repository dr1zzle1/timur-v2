// Регистрация Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

const mockUser = { login: "teacher", password: "1234" };

let courses = [
  { id: 1, title: "Информатика" },
  { id: 2, title: "Математика" },
];

let students = [
  { id: 1, name: "Иван Иванов", group: "10А" },
  { id: 2, name: "Мария Смирнова", group: "10А" },
];

let subjects = ["Русский язык", "Литература", "Физика"];
let groups = ["10А", "10Б"];
let schedule = [
  {
    date: "2023-11-20", // Формат YYYY-MM-DD
    lessons: ["Математика 10А", "Физика 10Б"],
  },
  {
    date: "2023-11-21",
    lessons: ["Литература 10А", "Информатика 10Б"],
  },
];

function login() {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;
  if (login === mockUser.login && password === mockUser.password) {
    switchScreen("login-screen", "main-screen");
  } else {
    alert("Неверный логин или пароль");
  }
}

function logout() {
  switchScreen("main-screen", "login-screen");
  document.getElementById("dynamic-content").classList.add("hidden");
}

function switchScreen(from, to) {
  document.getElementById(from).classList.remove("active");
  document.getElementById(from).classList.add("hidden");
  document.getElementById(to).classList.remove("hidden");
  document.getElementById(to).classList.add("active");
}

function showSection(section) {
  let title = "",
    html = "";
  if (section === "courses") {
    title = "Курсы";
    html =
      courses.map((c) => `<li>${c.title}</li>`).join("") +
      `<input type="text" id="new-course" placeholder="Новый курс"/>
      <button onclick="addCourse()">Добавить</button>`;
  } else if (section === "students") {
    title = "Ученики";
    html =
      students.map((s) => `<li>${s.name} — ${s.group}</li>`).join("") +
      `<input type="text" id="student-name" placeholder="Имя ученика"/>
       <input type="text" id="student-group" placeholder="Группа"/>
       <button onclick="addStudent()">Добавить ученика</button>`;
  } else if (section === "subjects") {
    title = "Предметы";
    html =
      subjects.map((s) => `<li>${s}</li>`).join("") +
      `<input type="text" id="new-subject" placeholder="Новый предмет"/>
      <button onclick="addSubject()">Добавить</button>`;
  } else if (section === "groups") {
    title = "Группы";
    html =
      groups.map((g) => `<li>${g}</li>`).join("") +
      `<input type="text" id="new-group" placeholder="Новая группа"/>
      <button onclick="addGroup()">Добавить</button>`;
  } else if (section === "schedule") {
    title = "Расписание";
    html = `
      <div>
        <h3>Выберите дату</h3>
        <input type="date" id="schedule-date" onchange="showDailySchedule()">
        <div id="daily-schedule"></div>
      </div>
      <div>
        <h3>Добавить занятие</h3>
        <input type="date" id="new-lesson-date" placeholder="Дата">
        <input type="text" id="new-lesson-info" placeholder="Занятие (Предмет Группа)">
        <button onclick="addSchedule()">Добавить</button>
      </div>
    `;
  }

  document.getElementById(
    "dynamic-content"
  ).innerHTML = `<h2>${title}</h2>${html}<br/><button onclick="goHome()">Назад</button>`;
  switchScreen("main-screen", "dynamic-content");

  // Инициализируем календарь если это раздел расписания
  if (section === "schedule") {
    initCalendar();
  }
}

function showDailySchedule() {
  const date = document.getElementById("schedule-date").value;
  const dailySchedule = schedule.find((item) => item.date === date);

  const scheduleEl = document.getElementById("daily-schedule");
  if (dailySchedule) {
    scheduleEl.innerHTML = `
      <h4>Расписание на ${date}</h4>
      <ul>${dailySchedule.lessons.map((lesson) => `<li>${lesson}</li>`).join("")}</ul>
    `;
  } else {
    scheduleEl.innerHTML = `<p>На выбранную дату занятий нет</p>`;
  }
}

function initCalendar() {
  // Добавляем скрипт FullCalendar динамически
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js";
  script.onload = function () {
    // Инициализация календаря после загрузки библиотеки
    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "ru",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      events: schedule.map((lesson) => {
        // Предполагаем, что schedule теперь содержит объекты с датами
        if (typeof lesson === "object") {
          return {
            title: lesson.title,
            start: lesson.start,
            end: lesson.end,
            extendedProps: {
              group: lesson.group,
            },
          };
        }
        return {
          title: lesson,
          start: new Date(),
        };
      }),
      eventClick: function (info) {
        alert(
          `Занятие: ${info.event.title}\nГруппа: ${
            info.event.extendedProps.group
          }\nВремя: ${info.event.start.toLocaleString()}`
        );
      },
    });
    calendar.render();
  };
  document.head.appendChild(script);
}

function goHome() {
  switchScreen("dynamic-content", "main-screen");
}

// Добавление сущностей
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
    showSection("students");
  }
}

function addSubject() {
  const val = document.getElementById("new-subject").value;
  if (val) {
    subjects.push(val);
    showSection("subjects");
  }
}

function addGroup() {
  const val = document.getElementById("new-group").value;
  if (val) {
    groups.push(val);
    showSection("groups");
  }
}

function addSchedule() {
  const date = document.getElementById("new-lesson-date").value;
  const lesson = document.getElementById("new-lesson-info").value;

  if (!date || !lesson) {
    alert("Заполните все поля!");
    return;
  }

  // Ищем расписание на эту дату
  let dailySchedule = schedule.find((item) => item.date === date);

  if (dailySchedule) {
    // Если на эту дату уже есть расписание - добавляем занятие
    dailySchedule.lessons.push(lesson);
  } else {
    // Если нет - создаем новую запись
    schedule.push({
      date: date,
      lessons: [lesson],
    });
  }

  // Обновляем отображение если выбрана эта же дата
  if (document.getElementById("schedule-date").value === date) {
    showDailySchedule();
  }

  // Очищаем поля ввода
  document.getElementById("new-lesson-date").value = "";
  document.getElementById("new-lesson-info").value = "";
}
function addLesson() {
  const title = document.getElementById("lesson-title").value;
  const group = document.getElementById("lesson-group").value;
  const start = document.getElementById("lesson-start").value;
  const end = document.getElementById("lesson-end").value;

  if (title && group && start && end) {
    const lesson = {
      title,
      group,
      start,
      end,
    };

    schedule.push(lesson);

    // Добавляем в список
    const li = document.createElement("li");
    li.textContent = `${title} (${group}) - ${new Date(start).toLocaleString()}`;
    document.getElementById("lessons-ul").appendChild(li);

    // Очищаем поля
    document.getElementById("lesson-title").value = "";
    document.getElementById("lesson-start").value = "";
    document.getElementById("lesson-end").value = "";

    // Обновляем календарь
    initCalendar();
  } else {
    alert("Заполните все поля!");
  }
}
