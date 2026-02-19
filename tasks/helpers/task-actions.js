import { db, updateDoc, doc, deleteDoc } from "../../src/firebase.js";

// Audio feedback for task completion
const completeSound = new Audio("../assets/ding-sound-effect_2.mp3");
completeSound.volume = 0.6;

async function toggleComplete(id, status) {
  try {
    if (!status) { completeSound.currentTime = 0; completeSound.play().catch(() => { }); }
    await updateDoc(doc(db, "tasks", id), { completed: !status });
  } catch (err) { console.error(err); }
}

async function toggleImportant(id, status) {
  try { await updateDoc(doc(db, "tasks", id), { important: !status }); }
  catch (err) { console.error(err); }
}

async function deleteTask(id) {
  try { await deleteDoc(doc(db, "tasks", id)); }
  catch (err) { console.error(err); }
}

window.toggleComplete = toggleComplete;
window.toggleImportant = toggleImportant;
window.deleteTask = deleteTask;

export { toggleComplete, toggleImportant, deleteTask };
