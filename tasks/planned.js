import {
  db,
  auth,
  doc,
  updateDoc,
  addDoc,
  signOut,
  onAuthStateChanged,
  query,
  where,
  collection,
  orderBy,
  onSnapshot,
} from "../src/firebase.js";
import { getToday, isTaskOverdue, getTomorrow } from "./helpers/date-utils.js";
import { createTaskElement, renderTaskCategories, showTaskSkeletons, showEmptyState } from "./helpers/task-render.js";
import { setupCalendarDropdown, setupFlatpickr } from "./helpers/calendar-ui.js";
import { toggleComplete, toggleImportant, deleteTask } from "./helpers/task-actions.js";

export let taskDueDate = null;
export let formattedDueDate = "";


const addTaskInput = document.getElementById("addtask");
const taskList = document.querySelector(".task-list");
const taskEarlier = document.querySelector(".task-earlier");
const taskToday = document.querySelector(".task-today");
const taskTomorrow = document.querySelector(".task-tomorrow")
const taskLater = document.querySelector(".task-later");
const calendarWrapper = document.getElementById("calendarWrapper");
const logoutBtn = document.getElementById("logoutBtn");
const sortBtn = document.getElementById("sortBtn");

setupCalendarDropdown((iso, formatted) => {
  taskDueDate = iso;
  formattedDueDate = formatted;
});

setupFlatpickr((iso, formatted) => {
  taskDueDate = iso;
  formattedDueDate = formatted;
});

async function updateOverdueStatus(task) {
  if (!task.dueDate) return;
  const docRef = doc(db, "tasks", task.id);
  await updateDoc(docRef, { isOverDue: isTaskOverdue(task.dueDate) });
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

  const finalDueDate = taskDueDate ?? getToday().iso;
  const finalFormattedDate =
    formattedDueDate || getToday().formattedDisplayDate;

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
      dueDate: finalDueDate,
      hasDue: hasDue,
      isOverDue: false,
      formattedDueDate: finalFormattedDate,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      createdDate: getToday().iso,
    });

    taskDueDate = null;
  } catch (err) {
    console.error(err);
  }
});

onAuthStateChanged(auth, (user) => {
  showTaskSkeletons(taskList, 6);
  if (!user) {
    taskList.innerHTML = "<p>Please login</p>";
    taskEarlier.innerHTML = "";
    return;
  }


  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
  );

  console.log(user.uid)

  onSnapshot(tasksQuery, (snapshot) => {
    taskList.innerHTML = "";
    taskEarlier.innerHTML = "";
    taskToday.innerHTML = "";
    taskTomorrow.innerHTML = "";
    taskLater.innerHTML = "";

    const earlierTasks = [];
    const todayTasks = [];
    const tomorrowTasks = []
    const laterTasks = [];
    let renderedCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };
      const todayIso = getToday().iso;
      const tomorrowIso = getTomorrow().iso
      //   updateOverdueStatus(task);
      console.log(getTomorrow().iso)
      if (task.isOverDue && !task.completed) {
        earlierTasks.push(task);
      } else if (task.dueDate === todayIso && !task.completed) {
        todayTasks.push(task);
      } else if (task.dueDate === tomorrowIso && !task.completed) {
        tomorrowTasks.push(task);
      } else if ((task.dueDate > todayIso && task.dueDate > tomorrowIso) && (task.dueDate !== null && !task.completed)) {
        laterTasks.push(task);
      }
    });

    // loader.style.display = "none";

    // if (hasTodayTasks) {
    //   noTaskImage.style.display = "none";
    // } else {
    //   noTaskImage.style.display = "block";
    // }
    if (earlierTasks.length) {
      renderTaskCategories(earlierTasks, taskEarlier, "Earlier");
      renderedCount++;
    }

    if (todayTasks.length) {
      renderTaskCategories(todayTasks, taskToday, "Today");
      renderedCount++;
    }

    if (laterTasks.length) {
      renderTaskCategories(laterTasks, taskLater, "Later");
      renderedCount++;
    }

    if (tomorrowTasks.length) {
      renderTaskCategories(tomorrowTasks, taskTomorrow, "Tomorrow");
      renderedCount++;
    }

    if (renderedCount === 0) {
      showEmptyState(taskList, "Planned");
    }

    requestAnimationFrame(() => lucide.createIcons());
  });
});


// -------------------- Logout & Sort --------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "../auth/login.html";
    } catch (err) {
      console.error(err);
    }
  });
}

if (sortBtn) {
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sortBtn.classList.toggle("open");
  });
  document.addEventListener("click", () => sortBtn.classList.remove("open"));
}
