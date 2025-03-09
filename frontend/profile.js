import { auth, storage } from "./firebase-config.js";

const API_URL = "http://localhost:5000";

// Elements
const currentAvatar = document.getElementById("currentAvatar");
const avatarInput = document.getElementById("avatarInput");
const displayName = document.getElementById("displayName");
const bio = document.getElementById("bio");
const themeOptions = document.querySelectorAll(".theme-option");
const notifications = document.getElementById("notifications");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const signOutBtn = document.getElementById("signOutBtn");

// Theme colors
const themes = {
    dark: {
        primary: "#007bff",
        background: "#1a1a2e",
        text: "#ffffff",
        card: "rgba(255, 255, 255, 0.05)"
    },
    light: {
        primary: "#0056b3",
        background: "#ffffff",
        text: "#333333",
        card: "rgba(0, 0, 0, 0.05)"
    },
    purple: {
        primary: "#9c27b0",
        background: "#2c1b3d",
        text: "#ffffff",
        card: "rgba(255, 255, 255, 0.05)"
    },
    green: {
        primary: "#4caf50",
        background: "#1b3d2c",
        text: "#ffffff",
        card: "rgba(255, 255, 255, 0.05)"
    }
};

// Load user profile
function loadProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        // Update UI with user data
        currentAvatar.src = user.avatar || "../public/default-avatar.png";
        displayName.value = user.name || "";
        bio.value = user.bio || "";
        notifications.checked = user.notifications !== false;
        
        // Set active theme
        const currentTheme = user.theme || "dark";
        applyTheme(currentTheme);
        themeOptions.forEach(option => {
            if (option.dataset.theme === currentTheme) {
                option.classList.add("active");
            } else {
                option.classList.remove("active");
            }
        });
        
    } catch (error) {
        console.error("Error loading profile:", error);
        showError("Failed to load profile");
    }
}

// Handle avatar change
avatarInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) throw new Error("Not logged in");

        // Show loading state
        currentAvatar.classList.add("loading");

        // Create a reference to the storage location
        const storageRef = storage.ref(`avatars/${user.uid}`);
        
        // Upload file
        const snapshot = await storageRef.put(file);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Update avatar in UI and localStorage
        currentAvatar.src = downloadURL;
        user.avatar = downloadURL;
        localStorage.setItem("user", JSON.stringify(user));
        
        showSuccess("Avatar updated successfully");
    } catch (error) {
        console.error("Error updating avatar:", error);
        showError("Failed to update avatar");
    } finally {
        currentAvatar.classList.remove("loading");
    }
});

// Handle theme change
themeOptions.forEach(option => {
    option.addEventListener("click", async () => {
        const theme = option.dataset.theme;
        
        // Update UI
        themeOptions.forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
        
        // Apply theme
        applyTheme(theme);
        
        // Update user data
        const user = JSON.parse(localStorage.getItem("user"));
        user.theme = theme;
        localStorage.setItem("user", JSON.stringify(user));
        
        showSuccess("Theme updated successfully");
    });
});

// Apply theme to the page
function applyTheme(theme) {
    const colors = themes[theme];
    document.documentElement.style.setProperty("--primary-color", colors.primary);
    document.documentElement.style.setProperty("--background-color", colors.background);
    document.documentElement.style.setProperty("--text-color", colors.text);
    document.documentElement.style.setProperty("--card-background", colors.card);
}

// Handle profile save
saveProfileBtn.addEventListener("click", async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) throw new Error("Not logged in");

        // Update user data
        user.name = displayName.value.trim();
        user.bio = bio.value.trim();
        user.notifications = notifications.checked;
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        
        showSuccess("Profile updated successfully");
    } catch (error) {
        console.error("Error saving profile:", error);
        showError("Failed to save profile");
    }
});

// Handle sign out
signOutBtn.addEventListener("click", async () => {
    try {
        await auth.signOut();
        localStorage.removeItem("user");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Sign out error:", error);
        showError("Failed to sign out. Please try again.");
    }
});

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Load profile on page load
loadProfile(); 