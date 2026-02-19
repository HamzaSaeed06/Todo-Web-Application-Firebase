// Theme Initialization
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

// Updates auth logos based on active theme
function updateAuthLogo(theme) {
  const isDark = theme === "dark";
  const logoSrc = isDark ? "../assets/tick-light.svg" : "../assets/tick-black.svg";
  const logoImg = document.querySelector(".auth-logo img");
  if (logoImg) logoImg.src = logoSrc;
}
updateAuthLogo(savedTheme);

import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  setDoc,
  doc,
  db
} from "../src/firebase.js";

import { showLoader, resetBtn } from "./ui.js";

const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.getElementById("googleBtn");
const githubBtn = document.getElementById("githubBtn");

// -----------------------------------------------------------------------------
//  LOGIN HANDLER
// -----------------------------------------------------------------------------
/**
 * Handles the standard email/password login flow.
 */
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password)
    return Swal.fire("Error", "All fields required", "error");

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Swal.fire("Error", "Please enter a valid email address", "error");
  }

  try {
    showLoader(loginBtn, "Logging in");
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "../tasks/myday.html";
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  } finally {
    resetBtn(loginBtn, "Login");
  }
});



const errorMap = {
  "auth/email-already-in-use": {
    message: "This email is already registered",
    type: "error",
  },
  "auth/invalid-email": { message: "Invalid email address", type: "error" },
  "auth/weak-password": {
    message: "Password should be at least 6 characters",
    type: "error",
  },
  "auth/popup-closed-by-user": {
    message: "Popup closed before completing sign-in",
    type: "warning",
  },
  "auth/cancelled-popup-request": {
    message: "Another popup is already open",
    type: "warning",
  },
  "auth/account-exists-with-different-credential": {
    message: "This email exists. Login first using the original provider",
    type: "info",
  },
  "auth/too-many-requests": {
    message: "Too many attempts. Try again later",
    type: "warning",
  },
};

function handleError(err) {
  const code = err.code || "unknown";
  const { message, type } = errorMap[code] || {
    message: err.message || "Something went wrong",
    type: "error",
  };

  Swal.fire({ icon: type, title: "Oops!", text: message });
  return { code, message, type };
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();


googleBtn.addEventListener("click", async () => {
  try {
    showLoader(googleBtn, "Signing in with Google...");

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      provider: "google",
      createdAt: Date.now(),
    });

    Swal.fire("Success", "Signed in with Google!", "success").then(() => {
      window.location.href = "../tasks/myday.html";
    });
  } catch (err) {
    handleError(err);
  } finally {
    resetBtn(googleBtn, "Sign up with Google");
  }
});

githubBtn.addEventListener("click", async () => {
  try {
    showLoader(githubBtn, "Signing in with GitHub...");

    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      provider: "github",
      createdAt: Date.now(),
    });

    Swal.fire("Success", "Signed in with GitHub!", "success").then(() => {
      window.location.href = "../dashboard/dashboard.html";
    });
  } catch (err) {
    handleError(err);
  } finally {
    resetBtn(githubBtn, "Sign up with GitHub");
  }
});

