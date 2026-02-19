import { getToday, getTomorrow, getNextMonday } from "./date-utils.js";

const calendarDropdown = document.getElementById("calendarDropdown");
const taskDateInput = document.getElementById("taskDate");

// Calendar Dropdown Logic (UI)
function setupCalendarDropdown(onDateChange) {
  const calendarItems = document.querySelectorAll(".calendarDropdownItem");
  const dayFunctions = [getToday, getTomorrow, getNextMonday];

  const calendarWrapper = document.getElementById("calendarWrapper");

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
      const { iso, label, formattedDisplayDate } = dayFunctions[i]();
      para.innerHTML = label;

      calendarWrapper.insertAdjacentElement("beforeend", para);
      calendarWrapper.style.border = "1px solid #e1dfdd";

      // Update the main file through callback
      if (onDateChange) onDateChange(iso, formattedDisplayDate);
    });
  });

  document.addEventListener("click", () => {
    calendarDropdown.classList.remove("open");
  });
}

// Flatpickr Integration
function setupFlatpickr(onDateChange) {
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
    onChange: function (selectedDates, dateStr) {
      const formatted = selectedDates.length
        ? selectedDates[0].toLocaleDateString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
        })
        : "";

      // Callback to main file to update values
      if (onDateChange) onDateChange(dateStr, formatted);

      const calendarWrapper = document.getElementById("calendarWrapper");
      const existing = calendarWrapper.querySelector("p");
      if (existing) existing.remove();

      const para = document.createElement("p");
      para.innerHTML = dateStr;
      calendarWrapper.insertAdjacentElement("beforeend", para);
      calendarWrapper.style.border = "1px solid #e1dfdd";
    },
  });
}

export { setupCalendarDropdown, setupFlatpickr };
