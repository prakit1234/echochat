import { auth, provider, createUserWithEmailAndPassword, signInWithPopup } from "./firebase-config.js";
import { getFirestore, doc, setDoc } from "/firebase/firestore";

// Initialize Firestore
const db = getFirestore();

// Elements
const signupForm = document.getElementById("signupForm");
const googleSignUpBtn = document.getElementById("googleSignUpBtn");

// Check if user is already logged in
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    window.location.replace("chat.html");
}

// Handle email/password signup
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Basic validation
    if (!email || !password || !confirmPassword) {
        showError("Please fill in all fields");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters long");
        return;
    }

    try {
        // Create user with email and password
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Create user data
        const userData = {
            uid: user.uid,
            name: email.split("@")[0],
            email: user.email,
            avatar: user.photoURL,
            theme: "dark",
            bio: "",
            notifications: true,
            createdAt: new Date().toISOString()
        };
        
        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Store minimal user data in localStorage for auth state
        localStorage.setItem("user", JSON.stringify({
            uid: user.uid,
            name: userData.name,
            email: user.email
        }));
        
        // Redirect to chat page
        window.location.replace("chat.html");
    } catch (error) {
        console.error("Signup error:", error);
        showError(getErrorMessage(error.code));
    }
});

// Handle Google sign up
googleSignUpBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Create user data
        const userData = {
            uid: user.uid,
            name: user.displayName || user.email.split("@")[0],
            email: user.email,
            avatar: user.photoURL,
            theme: "dark",
            bio: "",
            notifications: true,
            createdAt: new Date().toISOString()
        };
        
        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Store minimal user data in localStorage for auth state
        localStorage.setItem("user", JSON.stringify({
            uid: user.uid,
            name: userData.name,
            email: user.email
        }));
        
        // Redirect to chat page
        window.location.replace("chat.html");
    } catch (error) {
        console.error("Google sign up error:", error);
        showError(getErrorMessage(error.code));
    }
});

// Show error message
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Get user-friendly error message
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/invalid-email":
            return "Invalid email address.";
        case "auth/operation-not-allowed":
            return "Email/password accounts are not enabled. Please contact support.";
        case "auth/weak-password":
            return "Password is too weak. Please use at least 6 characters.";
        case "auth/popup-closed-by-user":
            return "Sign up was cancelled. Please try again.";
        case "auth/popup-blocked":
            return "Sign up popup was blocked. Please allow popups for this site.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        default:
            return "An error occurred during sign up. Please try again.";
    }
} 