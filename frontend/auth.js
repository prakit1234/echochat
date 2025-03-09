import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "./firebase-config.js";

// Sign Up
document.getElementById("signUpBtn")?.addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    localStorage.setItem(
      "user",
      JSON.stringify({ uid: user.uid, name, email })
    );
    window.location.href = "index.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    localStorage.setItem("user", JSON.stringify({ uid: user.uid, email }));
    window.location.href = "chat.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});
