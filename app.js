import { onAuthStateChanged, auth } from "./src/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./tasks/myday.html"
  } else {
    window.location.href = "./auth/login.html"
  }
});
