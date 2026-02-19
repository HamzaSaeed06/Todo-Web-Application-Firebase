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
import { getToday, isTaskOverdue } from "./helpers/date-utils.js";
import { createTaskElement, renderTaskCategories, showTaskSkeletons, showEmptyState } from "./helpers/task-render.js";
import { setupCalendarDropdown, setupFlatpickr } from "./helpers/calendar-ui.js";
import { toggleComplete, toggleImportant, deleteTask } from "./helpers/task-actions.js";

export let taskDueDate = null;
export let formattedDueDate = "";

const addTaskInput = document.getElementById("addtask");
const taskList = document.querySelector(".task-list");
const taskCategory = document.querySelector(".task-category");
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

  try {
    const hasDue = taskDueDate !== null;
    const existing = calendarWrapper.querySelector("p");
    if (existing) existing.remove();
    calendarWrapper.style.border = "";
    addTaskInput.value = "";

    await addDoc(collection(db, "tasks"), {
      title,
      completed: false,
      important: true,
      isMyDay: true,
      dueDate: taskDueDate,
      hasDue: hasDue,
      isOverDue: false,
      formattedDueDate: formattedDueDate,
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
    taskCategory.innerHTML = "";
    return;
  }

  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
  );

  onSnapshot(tasksQuery, (snapshot) => {
    taskList.innerHTML = "";
    taskCategory.innerHTML = "";
    let hasTodayTasks = false;
    let animIndex = 0;
    let renderedCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const task = { id: docSnap.id, ...docSnap.data() };

      updateOverdueStatus(task);

      if (task.important && !task.completed) {
        hasTodayTasks = true;
        const el = createTaskElement(task);
        el.classList.add("task-anim");
        el.style.animationDelay = `${animIndex * 0.05}s`;
        taskList.appendChild(el);
        animIndex++;
        renderedCount++;
      }

    });

    if (renderedCount === 0) {
      showEmptyState(taskList, "Important");
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

sortBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sortBtn.classList.toggle("open");
});
document.addEventListener("click", () => sortBtn.classList.remove("open"));
