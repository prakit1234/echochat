import { auth, provider, signInWithPopup, signInWithEmailAndPassword } from "./firebase-config.js";
import { getFirestore, doc, getDoc, setDoc } from "/firebase/firestore";

// Initialize Firestore
const db = getFirestore();

// Elements
const loginForm = document.getElementById("loginForm");
const googleSignInBtn = document.getElementById("googleSignInBtn");

// Check if user is already logged in
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    window.location.replace("chat.html");
}

// Handle email/password login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Basic validation
    if (!email || !password) {
        showError("Please fill in all fields");
        return;
    }

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            // If user doesn't exist in Firestore, create their profile
            const userData = {
                uid: user.uid,
                name: user.displayName || email.split("@")[0],
                email: user.email,
                avatar: user.photoURL,
                theme: "dark",
                bio: "",
                notifications: true,
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, "users", user.uid), userData);
        }
        
        // Store minimal user data in localStorage for auth state
        localStorage.setItem("user", JSON.stringify({
            uid: user.uid,
            name: userDoc.exists() ? userDoc.data().name : email.split("@")[0],
            email: user.email
        }));
        
        // Redirect to chat page
        window.location.replace("chat.html");
    } catch (error) {
        console.error("Login error:", error);
        showError(getErrorMessage(error.code));
    }
});

// Handle Google sign in
googleSignInBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            // If user doesn't exist in Firestore, create their profile
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
            await setDoc(doc(db, "users", user.uid), userData);
        }
        
        // Store minimal user data in localStorage for auth state
        localStorage.setItem("user", JSON.stringify({
            uid: user.uid,
            name: userDoc.exists() ? userDoc.data().name : (user.displayName || user.email.split("@")[0]),
            email: user.email
        }));
        
        // Redirect to chat page
        window.location.replace("chat.html");
    } catch (error) {
        console.error("Google sign in error:", error);
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
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password.";
        case "auth/invalid-email":
            return "Invalid email address.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Please try again later.";
        case "auth/popup-closed-by-user":
            return "Sign in was cancelled. Please try again.";
        case "auth/popup-blocked":
            return "Sign in popup was blocked. Please allow popups for this site.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        case "auth/account-exists-with-different-credential":
            return "An account already exists with the same email but different sign-in credentials.";
        default:
            return "An error occurred during sign in. Please try again.";
    }
} 