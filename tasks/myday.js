// -------------------- Firebase Imports --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBYkSH5ZbdWH3p6C4G2LJOw9J5KkEDzeig",
  authDomain: "todo-web-application-7b804.firebaseapp.com",
  projectId: "todo-web-application-7b804",
  storageBucket: "todo-web-application-7b804.firebasestorage.app",
  messagingSenderId: "304239157285",
  appId: "1:304239157285:web:169d1dde7634693ab5dfcc",
};

// -------------------- Firebase Init --------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// -------------------- DOM References --------------------
const addTaskInput = document.getElementById("addtask");
const taskList = document.querySelector(".task-list");
const taskCategory = document.querySelector(".task-category");
const calendarWrapper = document.getElementById("calendarWrapper");
const calendarDropdown = document.getElementById("calendarDropdown");
const taskDateInput = document.getElementById("taskDate");
const logoutBtn = document.getElementById("logoutBtn");
const sortBtn = document.getElementById("sortBtn");
const todayDisplayDate = document.getElementById("today-display-date")

let taskDueDate = null; // controlled state
let formattedDueDate = "";

// -------------------- Utility Functions --------------------
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

todayDisplayDate.innerHTML = `${getToday().formattedDisplayDate}`

function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayName = DAYS[today.getDay()];
  console.log(dayName);
  const displayDate = `${dayName}, ${ MONTHS[today.getMonth()]} ${today.getDate()}`;
  console.log(displayDate);

  return { iso: formatDate(today), label: "today", day: dayName, formattedDisplayDate: displayDate };
}

getToday();

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = DAYS[tomorrow.getDay()];
  console.log(dayName);
  const displayDate = `${dayName}, ${ MONTHS[tomorrow.getMonth()]} ${tomorrow.getDate()}`;
  console.log(displayDate);
  
  return { iso: formatDate(tomorrow), label: "tomorrow", day: dayName, formattedDisplayDate: displayDate };
}

getTomorrow();

function getNextMonday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const daysToMonday = (8 - day) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToMonday);

  const dayName = DAYS[nextMonday.getDay()];
  const monthName = MONTHS[nextMonday.getMonth()];
  const display = `${dayName}, ${monthName} ${nextMonday.getDate()}`;

  const displayDate = `${dayName}, ${monthName} ${nextMonday.getDate()}`;
  console.log(dayName)
  console.log(displayDate)

  return { iso: formatDate(nextMonday), label: `due ${display}`, day: dayName, formattedDisplayDate: displayDate };
}

getNextMonday();

function isTaskOverdue(taskDateIso) {
  if (!taskDateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log(today)
  const due = new Date(taskDateIso);
  due.setHours(0, 0, 0, 0);
  console.log(due)
  console.log(due < today)
  return due < today;
}

function isTaskDueTodayOrTomorrow(taskDateIso) {
  console.log(taskDateIso)
  if (!taskDateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(taskDateIso);
  due.setHours(0, 0, 0, 0);
  const diffDays = (due - today) / (1000 * 60 * 60 * 24);
  console.log(diffDays)
  return diffDays;
}

isTaskDueTodayOrTomorrow()

// -------------------- Firestore Operations --------------------
async function updateOverdueStatus(task) {
  if (!task.dueDate) return;
  console.log(task.dueDate)
  const docRef = doc(db, "tasks", task.id);
  await updateDoc(docRef, { isOverDue: isTaskOverdue(task.dueDate) });
}

// -------------------- Task Rendering --------------------
function createTaskElement(task) {
  console.log(task.createdDate === getToday().iso)
  
  const taskEl = document.createElement("div");
  taskEl.className = "task";

  taskEl.innerHTML = `
    <div class="task-check">
  <i 
    data-lucide="${task.completed ? "circle-check" : "circle"}" 
    onclick="toggleComplete('${task.id}', ${task.completed})"
    stroke-width="1.5"
    style="color:#2563eb">
  </i>
</div>


    <div class="task-info">
      <p class="task-title">${task.title}</p>

      <div class="task-description">
        <p class="task-type">tasks</p>
        ${task.isMyDay ? metaItem("sun-medium", "My Day", task) : ""}
        ${task.hasDueToday ? metaItem("calendar-days", "Today", task) : ""}
        ${task.hasReminder ? metaItem("bell", "Reminder", task) : ""}
      </div>
    </div>

    <div class="task-important">
      <i data-lucide="star"
         class="${task.important ? "star-fill" : "star"}"
         stroke-width="1.5"
         onclick="toggleImportant('${task.id}', ${task.important})"></i>
    </div>
  `;
  
  return taskEl || "";
  
}

function metaItem(icon, text, task) {
  const isCalendar = icon === "calendar-days";
  const isOverdue = isCalendar && task.isOverDue;

  let displayText = text;

  if (isCalendar) {
    const dueStatus = isTaskDueTodayOrTomorrow(task.dueDate);

    if (isOverdue) {
      displayText = "Overdue " + task.formattedDueDate;
    } else if (dueStatus === 0) {
      displayText = "Today";
    } else if (dueStatus === 1) {
      displayText = "Tomorrow";
    } else {
      displayText = "Due " + task.formattedDueDate;
    }
  }

  return `
    <span class="task-separator"></span>
    <div class="task-meta-item">
      <i data-lucide="${icon}" style="${isOverdue ? "color:red;" : ""}" stroke-width="1.5"></i>
      <p style="${isOverdue ? "color:red;" : ""}">${displayText}</p>
    </div>
  `;
}


function renderCompletedSection(tasks) {
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div class="task-category-header">
      <div class="task-category-arrow">
        <i data-lucide="chevron-right" stroke-width="1.5"></i>
      </div>
      <p class="task-category-title">Completed</p>
      <p class="task-category-count">${tasks.length}</p>
    </div>
    <div class="task-category-body" style="display:none"></div>
  `;
  const header = wrapper.querySelector(".task-category-header");
  const body = wrapper.querySelector(".task-category-body");

  header.addEventListener("click", () => {
    const isOpen = body.style.display === "block";
    body.style.display = isOpen ? "none" : "block";
    header.classList.toggle("active");
    if (!isOpen && body.children.length === 0) {
      tasks.forEach((task) => body.appendChild(createTaskElement(task)));
      requestAnimationFrame(() => lucide.createIcons());
    }
  });
  taskCategory.appendChild(wrapper);
}

// -------------------- Event Handlers --------------------
const completeSound = new Audio("../assets/ding-sound-effect_2.mp3");
completeSound.volume = 0.6;

window.toggleComplete = async (id, status) => {
  try {
    if (!status) {
      completeSound.currentTime = 0;
      completeSound.play().catch(() => {});
    }
    await updateDoc(doc(db, "tasks", id), { completed: !status });
  } catch (err) {
    console.error("Toggle complete error:", err);
  }
};

window.toggleImportant = async (id, status) => {
  try {
    await updateDoc(doc(db, "tasks", id), { important: !status });
  } catch (err) {
    console.error("Toggle important error:", err);
  }
};

window.deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, "tasks", id));
  } catch (err) {
    console.error("Delete error:", err);
  }
};

// -------------------- Calendar Dropdown --------------------
function setupCalendarDropdown() {
  const calendarItems = document.querySelectorAll(".calendarDropdownItem");
  const dayFunctions = [getToday, getTomorrow, getNextMonday];

  calendarWrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    calendarDropdown.classList.toggle("open");
    dayFunctions.forEach((fn, i) => {
      document.getElementById(
        ["today", "tomorrow", "nextWeekMon"][i],
      ).innerHTML = fn().day;
    });
  });

  calendarItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      const existing = calendarWrapper.querySelector("p");
      if (existing) existing.remove();
      const para = document.createElement("p");
      const { iso, label, day, formattedDisplayDate } = dayFunctions[i]();
      para.innerHTML = label;
      taskDueDate = iso;
      formattedDueDate = formattedDisplayDate;
      calendarWrapper.insertAdjacentElement("beforeend", para);
      calendarWrapper.style.border = "1px solid #e1dfdd";
    });
  });

  document.addEventListener("click", () =>
    calendarDropdown.classList.remove("open"),
  );
}

// -------------------- Flatpickr --------------------
function setupFlatpickr() {
  flatpickr(taskDateInput, {
    minDate: "today",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "D, F, d",
    allowInput: true,
    wrap: false,
    defaultDate: null,
    onReady: function (selectedDates, dateStr, instance) {
      instance.calendarContainer.classList.add("calendar-theme");
    },
    onChange: function (selectedDates, dateStr, instance) {
      taskDueDate = dateStr;
      const existing = calendarWrapper.querySelector("p");
      if (existing) existing.remove();
      const para = document.createElement("p");
      para.innerHTML = taskDueDate;
      calendarWrapper.insertAdjacentElement("beforeend", para);
      calendarWrapper.style.border = "1px solid #e1dfdd";
      if (selectedDates.length > 0)
        formattedDueDate = selectedDates[0].toLocaleDateString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
        });
        console.log(formattedDueDate)
    },
  });
}

// -------------------- Add Task --------------------
addTaskInput.addEventListener("keypress", async (e) => {
  if (e.key !== "Enter") return;
  const title = addTaskInput.value.trim();
  if (!title) return;
  if (!auth.currentUser) {
    alert("Login first");
    return;
  }

  try {
    const hasDue = taskDueDate !== null;
    const existing = calendarWrapper.querySelector("p");
    if (existing) existing.remove();
    calendarWrapper.style.border = "";
    addTaskInput.value = "";

    await addDoc(collection(db, "tasks"), {
      title,
      completed: false,
      important: false,
      isMyDay: true,
      dueDate: taskDueDate,
      hasDueToday: hasDue,
      isOverDue: false,
      formattedDueDate: formattedDueDate,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      createdDate: getToday().iso,
    });

    taskDueDate = null;
  } catch (err) {
    console.error("Add task error:", err);
  }
});

// -------------------- Auth & Task Snapshot --------------------
onAuthStateChanged(auth, (user) => {
  const loader = document.querySelector(".loader");
  const noTaskImage = document.querySelector(".no-tasks-image");

  if (!user) {
    taskList.innerHTML = "<p>Please login</p>";
    taskCategory.innerHTML = "";
    return;
  }

  loader.style.display = "block";

  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
  );
  console.log(tasksQuery)
  onSnapshot(tasksQuery, (snapshot) => {
    if(snapshot.docs.length == 0){
      loader.style.display = "none";
      console.log("Aaaa")
      noTaskImage.style.display = "block"
    }else{
      loader.style.display = "none";
      console.log("Aaaa")
      noTaskImage.style.display = "none"
    }
    taskList.innerHTML = "";
    taskCategory.innerHTML = "";
    const completedTasks = [];

  

    snapshot.docs.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };
      if (task.completed) {
        completedTasks.push(task);
      } else {
        updateOverdueStatus(task);
        console.log(task.createdDate == getToday().iso)
        if(task.createdDate === getToday().iso){
          console.log("hamza")
        taskList.appendChild(createTaskElement(task));
        }
      }
    });

    if (completedTasks.length > 0) renderCompletedSection(completedTasks);
    requestAnimationFrame(() => lucide.createIcons());
  });
});

// -------------------- Logout & Sort --------------------
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "../auth/login.html";
  } catch (err) {
    console.error("Logout error:", err);
  }
});

sortBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sortBtn.classList.toggle("open");
});
document.addEventListener("click", () => sortBtn.classList.remove("open"));

// -------------------- Initialize --------------------
setupCalendarDropdown();
setupFlatpickr();
