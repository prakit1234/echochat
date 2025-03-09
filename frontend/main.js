import { auth, provider, signInWithPopup, signOut } from "./firebase-config.js";

const API_URL = "http://127.0.0.1:5500/";

// Elements
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");
const profileBtn = document.getElementById("profileBtn");
const chatBtn = document.getElementById("chatBtn");
const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const getStartedBtn = document.getElementById("getStartedBtn");
const learnMoreBtn = document.getElementById("learnMoreBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");

// Check if user is logged in
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    showLoggedInState();
    // Redirect to chat if on home page
    if (window.location.pathname.endsWith("index.html")) {
        window.location.href = "chat.html";
    }
} else {
    showLoggedOutState();
    // Redirect to home if on protected pages
    if (window.location.pathname.includes("chat.html") || 
        window.location.pathname.includes("profile.html")) {
        window.location.href = "index.html";
    }
}

// Show logged in state
function showLoggedInState() {
    if (signInBtn) signInBtn.style.display = "none";
    if (signUpBtn) signUpBtn.style.display = "none";
    if (signOutBtn) signOutBtn.style.display = "block";
    if (profileBtn) profileBtn.style.display = "block";
    if (chatBtn) chatBtn.style.display = "block";
    if (getStartedBtn) getStartedBtn.style.display = "none";
}

// Show logged out state
function showLoggedOutState() {
    if (signInBtn) signInBtn.style.display = "block";
    if (signUpBtn) signUpBtn.style.display = "block";
    if (signOutBtn) signOutBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "none";
    if (chatBtn) chatBtn.style.display = "none";
    if (getStartedBtn) getStartedBtn.style.display = "block";
}

// Handle Google sign in
async function handleGoogleSignIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Store user data
        const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            theme: "dark",
            bio: "",
            notifications: true
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        window.location.href = "chat.html";
    } catch (error) {
        console.error("Google sign in error:", error);
        showError("Failed to sign in with Google. Please try again.");
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        await signOut(auth);
        // Clear all local storage data
        localStorage.clear();
        window.location.href = "index.html";
    } catch (error) {
        console.error("Sign out error:", error);
        showError("Failed to sign out. Please try again.");
    }
}

// Show user details in UI
function showUser(user) {
  userAvatar.src = user.avatar || "/public/default-avatar.png";
  userName.textContent = user.name || "User";
  userProfile.classList.remove("hidden");
  signInBtn?.classList.add("hidden");
  signOutBtn?.classList.remove("hidden");
}

// Send message function
async function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText) return;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    console.error("User not logged in");
    return;
  }

  try {
    messageInput.disabled = true;
    sendBtn.disabled = true;

    const message = {
      uid: user.uid,
      sender: user.name,
      avatar: user.avatar,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    // Add message to UI immediately for better UX
    appendMessage(message, true);
    messageInput.value = "";

    // Send to server
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

  } catch (error) {
    console.error("Error sending message:", error);
    showError("Failed to send message. Please try again.");
  } finally {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Append message to chat
function appendMessage(message, isSent = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isSent ? "sent" : "received"}`;
  messageDiv.setAttribute("data-message-id", message.id);

  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar";
  const avatar = document.createElement("img");
  avatar.src = message.avatar || "default-avatar.png";
  avatar.alt = message.sender;
  avatarDiv.appendChild(avatar);

  const content = document.createElement("div");
  content.className = "message-content";

  const sender = document.createElement("div");
  sender.className = "message-sender";
  sender.textContent = message.sender;

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = message.text;

  const time = document.createElement("div");
  time.className = "message-time";
  time.textContent = new Date(message.timestamp).toLocaleTimeString();

  content.appendChild(sender);
  content.appendChild(text);
  content.appendChild(time);
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(content);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Event listeners
sendBtn?.addEventListener("click", sendMessage);
messageInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Load messages periodically
let lastMessageTime = null;
async function loadMessages() {
  try {
    const query = lastMessageTime ? `?since=${lastMessageTime}` : "";
    const response = await fetch(`${API_URL}/messages${query}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to load messages");
    }

    const messages = await response.json();
    if (messages && messages.length > 0) {
      messages.forEach(msg => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!document.querySelector(`[data-message-id="${msg.id}"]`)) {
          appendMessage(msg, msg.uid === user?.uid);
        }
      });
      lastMessageTime = messages[messages.length - 1].timestamp;
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    showError("Connection error. Retrying...");
  }
}

// Initial load and periodic refresh
loadMessages();
setInterval(loadMessages, 3000);

// Event Listeners
signInBtn?.addEventListener("click", () => window.location.href = "login.html");
signUpBtn?.addEventListener("click", () => window.location.href = "signup.html");
signOutBtn?.addEventListener("click", handleSignOut);
profileBtn?.addEventListener("click", () => window.location.href = "profile.html");
chatBtn?.addEventListener("click", () => window.location.href = "chat.html");
getStartedBtn?.addEventListener("click", () => window.location.href = "signup.html");
googleSignInBtn?.addEventListener("click", handleGoogleSignIn);
learnMoreBtn?.addEventListener("click", () => {
    const featuresSection = document.getElementById("features");
    featuresSection.scrollIntoView({ behavior: "smooth" });
});
