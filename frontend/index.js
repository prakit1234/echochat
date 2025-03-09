import { auth, provider, signInWithPopup } from "./firebase-config.js";

// Elements
const signInBtn = document.getElementById("signInBtn");
const getStartedBtn = document.getElementById("getStartedBtn");
const learnMoreBtn = document.getElementById("learnMoreBtn");

// Check if user is already logged in
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    window.location.href = "chat.html";
}

// Handle Google Sign-In
async function handleSignIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        localStorage.setItem(
            "user",
            JSON.stringify({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL,
            })
        );
        window.location.href = "chat.html";
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
    }
}

// Event Listeners
signInBtn?.addEventListener("click", handleSignIn);
getStartedBtn?.addEventListener("click", () => window.location.href = "signup.html");
learnMoreBtn?.addEventListener("click", () => {
    const featuresSection = document.getElementById("features");
    featuresSection.scrollIntoView({ behavior: "smooth" });
}); 