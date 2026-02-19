import { isTaskOverdue, isTaskDueTodayOrTomorrow } from "./date-utils.js";
import { toggleComplete, toggleImportant } from "./task-actions.js";

function createTaskElement(task) {
  const taskEl = document.createElement("div");
  taskEl.className = "task";
  taskEl.innerHTML = `
    <div class="task-check">
      <i data-lucide="${task.completed ? "circle-check" : "circle"}"
        onclick="toggleComplete('${task.id}',${task.completed})" stroke-width="1.5" style="color:#2563eb"></i>
    </div>
    <div class="task-info">
      <p class="task-title">${task.title}</p>
      <div class="task-description">
        <p class="task-type">Tasks</p>
        ${task.isMyDay ? metaItem("sun-medium", "My Day", task) : ""}
        ${task.hasDue ? metaItem("calendar-days", "Today", task) : ""}
        ${task.hasReminder ? metaItem("bell", "Reminder", task) : ""}
      </div>
    </div>
    <div class="task-important">
      <i data-lucide="star" class="${task.important ? "star-fill" : "star"}"
         stroke-width="1.5" onclick="toggleImportant('${task.id}',${task.important})"></i>
    </div>
  `;
  return taskEl;
}

/** 
 * Generates the metadata HTML for a task (My Day, Due Date, Reminder).
 * Handles overdue calculations and "Today/Tomorrow" formatting labels.
 */
function metaItem(icon, text, task) {
  const isCalendar = icon === "calendar-days";
  const isOverdue = isCalendar && task.isOverDue;
  let displayText = text;

  if (isCalendar) {
    const dueStatus = isTaskDueTodayOrTomorrow(task.dueDate);
    if (isOverdue) displayText = "Overdue " + task.formattedDueDate;
    else if (dueStatus === 0) displayText = "Today";
    else if (dueStatus === 1) displayText = "Tomorrow";
    else displayText = "Due " + task.formattedDueDate;
  }

  return `
    <span class="task-separator"></span>
    <div class="task-meta-item">
      <i data-lucide="${icon}" style="${isOverdue ? "color:red;" : `${displayText == "Today" ? "color:#2563eb;" : ""}`}" stroke-width="1.5"></i>
      <p style="${isOverdue ? "color:red;" : `${displayText == "Today" ? "color:#2563eb;" : ""}`}">${displayText}</p>
    </div>
  `;
}

function renderTaskCategories(tasks, taskCategory, taskCategoryTitle) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="task-category-header">
      <div class="task-category-arrow">
        <i data-lucide="chevron-right" stroke-width="1.5"></i>
      </div>
      <p class="task-category-title">${taskCategoryTitle}</p>
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
      tasks.forEach((t, i) => {
        const el = createTaskElement(t);
        el.classList.add("task-anim");
        el.style.animationDelay = `${i * 0.05}s`;
        body.appendChild(el);
      });
      requestAnimationFrame(() => lucide.createIcons());
    }
  });

  taskCategory.appendChild(wrapper);
}

function showTaskSkeletons(container, count = 4) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "task skeleton";
    skeleton.style.animationDelay = `${i * 0.1}s`;
    skeleton.innerHTML = `
      <div class="task-check"><i data-lucide="circle"></i></div>
      <div class="task-info">
        <p class="task-title skeleton-text" style="width: 60%"></p>
        <div class="task-description">
          <p class="task-type skeleton-text" style="width: 20%"></p>
        </div>
      </div>
      <div class="task-important"><i data-lucide="star"></i></div>
    `;
    container.appendChild(skeleton);
  }
}

function showEmptyState(container, categoryTitle) {
  const universalIcon = "clipboard-list";

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i data-lucide="${universalIcon}" stroke-width="1"></i>
      </div>
    </div>
  `;
  requestAnimationFrame(() => lucide.createIcons());
}

export { createTaskElement, renderTaskCategories, showTaskSkeletons, showEmptyState };
