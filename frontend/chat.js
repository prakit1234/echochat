import { auth, provider, signInWithPopup, signInWithEmailAndPassword } from "./firebase-config.js";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Initialize Firestore
const db = getFirestore();

// API URL for NeonDB
const API_URL = "http://localhost:5000";

// Elements
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messages");
const userInfo = document.getElementById("userInfo");
const signOutBtn = document.getElementById("signOutBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");

// Check authentication state
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.replace("login.html");
} else {
    // Update UI for logged in user
    userInfo.textContent = user.name;
    messageForm.style.display = "flex";
    signOutBtn.style.display = "block";
    googleSignInBtn.style.display = "none";
}

// Load messages from NeonDB
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/messages`);
        if (!response.ok) throw new Error("Failed to load messages");
        
        const messages = await response.json();
        messagesContainer.innerHTML = "";
        
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        scrollToBottom();
    } catch (error) {
        console.error("Error loading messages:", error);
        showError("Failed to load messages. Please try again.");
    }
}

// Create message element
function createMessageElement(message) {
    const div = document.createElement("div");
    div.className = `message ${message.userId === user.uid ? "sent" : "received"}`;
    
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = message.avatar || "../public/default-avatar.png";
    avatar.alt = message.name;
    
    const content = document.createElement("div");
    content.className = "message-content";
    
    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = message.name;
    
    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = message.text;
    
    const time = document.createElement("div");
    time.className = "message-time";
    time.textContent = new Date(message.timestamp).toLocaleTimeString();
    
    content.appendChild(name);
    content.appendChild(text);
    content.appendChild(time);
    
    div.appendChild(avatar);
    div.appendChild(content);
    
    return div;
}

// Send message
messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    try {
        const message = {
            text: messageText,
            userId: user.uid,
            name: user.name,
            avatar: user.avatar,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(`${API_URL}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        });
        
        if (!response.ok) throw new Error("Failed to send message");
        
        messageInput.value = "";
        await loadMessages();
    } catch (error) {
        console.error("Error sending message:", error);
        showError("Failed to send message. Please try again.");
    }
});

// Sign out
signOutBtn.addEventListener("click", async () => {
    try {
        await auth.signOut();
        localStorage.removeItem("user");
        window.location.replace("login.html");
    } catch (error) {
        console.error("Error signing out:", error);
        showError("Failed to sign out. Please try again.");
    }
});

// Google sign in
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
        
        // Reload page to update UI
        window.location.reload();
    } catch (error) {
        console.error("Google sign in error:", error);
        showError(getErrorMessage(error.code));
    }
});

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

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
        case "auth/popup-closed-by-user":
            return "Sign in was cancelled. Please try again.";
        case "auth/popup-blocked":
            return "Sign in popup was blocked. Please allow popups for this site.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        default:
            return "An error occurred during sign in. Please try again.";
    }
}

// Load messages when page loads
loadMessages(); 