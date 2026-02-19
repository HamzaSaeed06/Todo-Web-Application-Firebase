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
  const displayDate = `${dayName}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;
  return {
    iso: formatDate(today),
    label: "today",
    day: dayName,
    formattedDisplayDate: displayDate,
  };
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = DAYS[tomorrow.getDay()];
  const displayDate = `${dayName}, ${MONTHS[tomorrow.getMonth()]} ${tomorrow.getDate()}`;
  return {
    iso: formatDate(tomorrow),
    label: "tomorrow",
    day: dayName,
    formattedDisplayDate: displayDate,
  };
}

// Calculates the next Monday from today (handles wrapping)
function getNextMonday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const daysToMonday = (8 - day) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToMonday);
  const dayName = DAYS[nextMonday.getDay()];
  const monthName = MONTHS[nextMonday.getMonth()];
  const displayDate = `${dayName}, ${monthName} ${nextMonday.getDate()}`;
  return {
    iso: formatDate(nextMonday),
    label: `due ${displayDate}`,
    day: dayName,
    formattedDisplayDate: displayDate,
  };
}

function isTaskOverdue(taskDateIso) {
  if (!taskDateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(taskDateIso);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function isTaskDueTodayOrTomorrow(taskDateIso) {
  if (!taskDateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(taskDateIso);
  due.setHours(0, 0, 0, 0);
  return (due - today) / (1000 * 60 * 60 * 24);
}

export {
  formatDate,
  getToday,
  getTomorrow,
  getNextMonday,
  isTaskOverdue,
  isTaskDueTodayOrTomorrow,
};
