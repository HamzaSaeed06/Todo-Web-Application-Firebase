import { onAuthStateChanged, auth } from "./src/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // user already login hai
    console.log("User login hai:", user.email);
    // yahan dashboard / home page dikhao
    window.location.href = "./tasks/myday.html"
  } else {
    // user login nahi hai
    console.log("User logout hai");
    window.location.href = "./auth/login.html"
  }
});
