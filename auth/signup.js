import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  doc,
  setDoc,
  getDoc
} from "../src/firebase.js";

import { showLoader, resetBtn } from "./ui.js";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleBtn");
const githubBtn = document.getElementById("githubBtn");

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

signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value.trim();

  if (!email || !password)
    return Swal.fire("Error", "All fields are required", "error");

  try {
    showLoader(signupBtn, "Creating account...");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      fullname: fullName,
      email: user.email,
      provider: "password",
      createdAt: Date.now(),
    });

    Swal.fire("Success", "Account created successfully!", "success").then(
      () => {
        window.location.href = "./login.html";
      },
    );
  } catch (err) {
    handleError(err);
  } finally {
    resetBtn(signupBtn, "Create Account");
  }
});

googleBtn.addEventListener("click", async () => {
  try {
    showLoader(googleBtn, "Signing in with Google...");

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

if (!snap.exists()) {

  await setDoc(ref, {
    fullname: user.displayName || "",
    email: user.email,
    provider: "google",
    createdAt: Date.now(),
  });
}
  

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
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

if (!snap.exists()) {

  await setDoc(ref, {
    fullname: user.displayName || "",
    email: user.email,
    provider: "google",
    createdAt: Date.now(),
  });
}

    Swal.fire("Success", "Signed in with GitHub!", "success").then(() => {
      window.location.href = "../tasks/myday.html";
    });
  } catch (err) {
    handleError(err);
  } finally {
    resetBtn(githubBtn, "Sign up with GitHub");
  }
});


