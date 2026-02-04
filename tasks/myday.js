// document.addEventListener("DOMContentLoaded", () => {
//   const calendarWrapper = document.getElementById("calendarWrapper");
//   const calendarDropdown = document.getElementById("calendarDropdown");
//   const taskDate = document.getElementById("taskDate");

//   // Toggle dropdown
//   calendarWrapper.addEventListener("click", (e) => {
//     e.stopPropagation();
//     console.log("Dropdown clicked");
//     calendarDropdown.classList.toggle("open");
//   });

//   document.addEventListener("click", () => {
//     calendarDropdown.classList.remove("open");
//   });

//   // flatpickr custom calendar
//   flatpickr(taskDate, {
//     minDate: "today",       // disable past dates
//     dateFormat: "Y-m-d",
//     allowInput: true,
//     wrap: false,
//     defaultDate: null,
//     // Styling using theme colors
//     onReady: function(selectedDates, dateStr, instance) {
//       instance.calendarContainer.classList.add("calendar-theme");
//     },
//     // ✅ Date select hone par console me print
//     onChange: function(selectedDates, dateStr, instance) {
//       console.log("Selected date:", dateStr);
//     }
//   });
// });


// const logoutBtn = document.getElementById("logoutBtn");

// logoutBtn.addEventListener("click", async () => {
//   try {
//     await signOut(auth);
//     console.log("User logged out successfully");
//     window.location.href = "../auth/login.html"
//   } catch (error) {
//     console.error("Logout error:", error);
//   }
// });




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
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// // -------------------- 1️⃣ Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBYkSH5ZbdWH3p6C4G2LJOw9J5KkEDzeig",
  authDomain: "todo-web-application-7b804.firebaseapp.com",
  projectId: "todo-web-application-7b804",
  storageBucket: "todo-web-application-7b804.firebasestorage.app",
  messagingSenderId: "304239157285",
  appId: "1:304239157285:web:169d1dde7634693ab5dfcc",
};

// -------------------- 🔥 Firebase Init --------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// -------------------- 🔥 DOM Elements --------------------
/* ===============================
   DOM REFERENCES
================================ */
const addTaskInput = document.getElementById("addtask");
const taskList = document.querySelector(".task-list");
const taskCategory = document.querySelector(".task-category");
let dueDate = null;
let overDue = false;
let formatted = "";
console.log(dueDate)

async function checkIsOverDue(task) {
  if (!task.dueDate) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // time ko ignore

  // dueDate ko ISO format me parse karo
  const dueDateObj = new Date(task.dueDate); // e.g., "2026-01-31"
  dueDateObj.setHours(0, 0, 0, 0);

  let overDue = false;

  if (dueDateObj < today) {
    overDue = true;
  }

// console.log(dueDateObj , " ", today)
// console.log(dueDateObj < today)

if (isDueTomorrow(task.dueDate)) {
  console.log("✅ Task due tomorrow");
} else {
  console.log("❌ Not tomorrow");
}

  // Firestore update
  const docRef = doc(db, "tasks", task.id);
  // console.log(task)
  await updateDoc(docRef, {
    isOverDue: overDue,
  });

  // console.log(`Task: ${task.title}, overDue: ${overDue}`);
}

function isDueTomorrow(dueDate) {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0,0,0,0);

  const due = new Date(dueDate);
  due.setHours(0,0,0,0);

  const diffInDays = (due - today) / (1000 * 60 * 60 * 24);

  return diffInDays === 1;
}





/* ===============================
   ADD TASK (LOGIN USER ONLY)
================================ */
addTaskInput.addEventListener("keypress", async (e) => {
  if (e.key !== "Enter") return;

  const title = addTaskInput.value.trim();
  if (!title) return;

  if (!auth.currentUser) {
    alert("Login first");
    return;
  }

  try {
    let checkHasDueDate = false

    if(dueDate !== null){
      checkHasDueDate = true
    }

    console.log(checkHasDueDate)
    await addDoc(collection(db, "tasks"), {
      title,
      completed: false,
      important: false,
      isMyDay: true,
      dueDate: dueDate,
      hasDueToday: checkHasDueDate,
      isOverDue: false,
      formattedDueDate: formatted,
      userId: auth.currentUser.uid,
      createdAt: new Date()
    });

    dueDate = null;

    addTaskInput.value = "";
  } catch (err) {
    console.error("Add task error:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const calendarWrapper = document.getElementById("calendarWrapper");
  const calendarDropdown = document.getElementById("calendarDropdown");
  const taskDate = document.getElementById("taskDate");

  // Toggle dropdown
  calendarWrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("Dropdown clicked");
    calendarDropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    calendarDropdown.classList.remove("open");
  });

  // flatpickr custom calendar
  flatpickr(taskDate, {
    minDate: "today",       // past dates disable
    dateFormat: "Y-m-d",    // backend/save ke liye
    altInput: true,         // visible input ko custom format ke liye
    altFormat: "D, F, d",   // frontend me "Sat, January, 31"
    allowInput: true,
    wrap: false,
    defaultDate: null,
    // Styling using theme colors
    onReady: function(selectedDates, dateStr, instance) {
      instance.calendarContainer.classList.add("calendar-theme");
    },
    // Date select hone par
    onChange: function(selectedDates, dateStr, instance) {
      dueDate = dateStr; // ISO format: "2026-01-31"
      console.log("Due date (ISO for save):", dueDate);

      // Optional: frontend formatted version
      if (selectedDates.length > 0) {
        console.log()
        const options = { weekday: 'short', month: 'long', day: 'numeric' };
        formatted = selectedDates[0].toLocaleDateString('en-US', options);
        console.log("Formatted date for display:", formatted); // "Sat, January, 31"
      }
    }
  });
});



// const loader = document.getElementById("loader");

/* ===============================
   AUTH STATE + REALTIME TASKS
================================ */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    taskList.innerHTML = "<p>Please login</p>";
    taskCategory.innerHTML = "";
    return;
  }

  // loader.style.display = "flex";

  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(tasksQuery, (snapshot) => {
    
    taskList.innerHTML = "";
    taskCategory.innerHTML = "";

    const completedTasks = [];

    snapshot.docs.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };

      if (task.completed) {
        completedTasks.push(task);
      } else {
        checkIsOverDue(task)
        taskList.appendChild(createTaskElement(task));
      }
      
    });

    if (completedTasks.length > 0) {
      renderCompletedSection(completedTasks);
    }

    requestAnimationFrame(() => lucide.createIcons());
    // loader.style.display = "none"; 
  });
});

/* ===============================
   CREATE TASK ELEMENT (REUSABLE)
================================ */
function createTaskElement(task) {
  const taskEl = document.createElement("div");
  taskEl.className = "task";

  taskEl.innerHTML = `
    <div class="task-check">
      <i data-lucide="${task.completed ? "circle-check" : "circle"}"
         onclick="toggleComplete('${task.id}', ${task.completed})"
         stroke-width="1.5"
         style="color:#2563eb"></i>
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

  return taskEl;
}

/* ===============================
   META ITEM (SMALL HELPER)
================================ */
function metaItem(icon, text, task) {
  // console.log(task.isOverDue, " ", icon === "calender-days", " " , text, " " , icon)
  return `
    <span class="task-separator"></span>
    <div class="task-meta-item">
      <i data-lucide="${icon}" style="${(icon === 'calendar-days' && task.isOverDue == true) ? 'color:red;' : ''}" stroke-width="1.5"></i>
      <p style="${(icon === 'calendar-days' && task.isOverDue == true) ? 'color:red;' : ''}">${(icon === 'calendar-days' && task.isOverDue == true) ? "Overdue" + " " + task.formattedDueDate : text} </p>
    </div>
  `;
}

/* ===============================
   COMPLETED SECTION
================================ */
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
      tasks.forEach(task => {
        body.appendChild(createTaskElement(task));
      });
      requestAnimationFrame(() => lucide.createIcons());
    }
  });

  taskCategory.appendChild(wrapper);
}

/* ===============================
   UPDATE FUNCTIONS
================================ */
const completeSound = new Audio("../assets/ding-sound-effect_2.mp3");
completeSound.volume = 0.6; 
window.toggleComplete = async (id, status) => {
  try {
    if (!status) {
      completeSound.currentTime = 0; // restart sound
      completeSound.play().catch(() => {});
    }
    await updateDoc(doc(db, "tasks", id), {
      completed: !status
    });
  } catch (err) {
    console.error("Toggle complete error:", err);
  }
};

window.toggleImportant = async (id, status) => {
  try {
    await updateDoc(doc(db, "tasks", id), {
      important: !status
    });
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


sortBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // bahar click se safe
  sortBtn.classList.toggle("open");
});

/* Bahar click par band ho */
document.addEventListener("click", () => {
  sortBtn.classList.remove("open");
});


// document.addEventListener("DOMContentLoaded", () => {
//   const calendarWrapper = document.getElementById("calendarWrapper");
//   const calendarDropdown = document.getElementById("calendarDropdown");
//   const taskDate = document.getElementById("taskDate");

//   // Toggle dropdown
//   calendarWrapper.addEventListener("click", (e) => {
//     e.stopPropagation();
//     console.log("Dropdown clicked");
//     calendarDropdown.classList.toggle("open");
//   });

//   document.addEventListener("click", () => {
//     calendarDropdown.classList.remove("open");
//   });

//   // flatpickr custom calendar
//   flatpickr(taskDate, {
//     minDate: "today",       // disable past dates
//     dateFormat: "Y-m-d",
//     allowInput: true,
//     wrap: false,
//     defaultDate: null,
//     // Styling using theme colors
//     onReady: function(selectedDates, dateStr, instance) {
//       instance.calendarContainer.classList.add("calendar-theme");
//     },
//     // ✅ Date select hone par console me print
//     onChange: function(selectedDates, dateStr, instance) {
//       console.log("Selected date:", dateStr);
//     }
//   });
// });




const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
    window.location.href = "../auth/login.html"
  } catch (error) {
    console.error("Logout error:", error);
  }
});



