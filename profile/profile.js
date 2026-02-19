import { auth, onAuthStateChanged, doc, db, getDoc, updateDoc, onSnapshot } from "../src/firebase.js";

// -----------------------------------------------------------------------------
//  CONFIGURATION & CONSTANTS
// -----------------------------------------------------------------------------
const CONFIG = {
    CLOUDINARY: {
        CLOUD_NAME: "ds05q0lls",
        UPLOAD_PRESET: "todoprofilePreset",
        API_URL: (name) => `https://api.cloudinary.com/v1_1/${name}/image/upload`
    },
    DEFAULTS: {
        BANNER: "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop",
        AVATAR: "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-transparent-600nw-2534623321.jpg",
        FALLBACK_TEXT: "Not Provided"
    }
};

// -----------------------------------------------------------------------------
//  STATE MANAGEMENT
// -----------------------------------------------------------------------------
const state = {
    isEditMode: false,
    originalData: {},
    originalImages: {
        banner: "",
        avatar: ""
    }
};

// -----------------------------------------------------------------------------
//  DATA LAYER (API & STORAGE)
// -----------------------------------------------------------------------------
const API = {
    async uploadImage(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CONFIG.CLOUDINARY.UPLOAD_PRESET);

        const response = await fetch(CONFIG.CLOUDINARY.API_URL(CONFIG.CLOUDINARY.CLOUD_NAME), {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url;
    },

    async updateProfile(uid, data) {
        const userRef = doc(db, "users", uid);
        return updateDoc(userRef, data);
    }
};

// -----------------------------------------------------------------------------
//  UI COMPONENTS & RENDERING
// -----------------------------------------------------------------------------
const UI = {
    elements: {
        avatar: () => document.getElementById("profileAvatarImg"),
        banner: () => document.getElementById("profileBannerImg"),
        editBtn: () => document.getElementById("editProfileBtn"),
        cancelBtn: () => document.getElementById("cancelProfileBtn"),
        bannerInput: () => document.getElementById("bannerInput"),
        avatarInput: () => document.getElementById("avatarInput"),
        bannerEditBtn: () => document.getElementById("bannerEditBtn"),
        avatarEditBtn: () => document.getElementById("avatarEditBtn"),
        content: () => document.getElementById("content"),
        fields: () => document.querySelectorAll("[data-field]")
    },

    toggleSkeleton(isLoading) {
        const { fields, avatar, banner } = this.elements;
        const bannerImg = banner();
        const avatarImg = avatar();

        fields().forEach(field => {
            const fieldName = field.getAttribute("data-field");
            if (isLoading) {
                field.classList.add("skeleton");
                if (fieldName === "fullname") field.classList.add("skeleton-title");
                else field.classList.add("skeleton-text");
            } else {
                field.classList.remove("skeleton", "skeleton-title", "skeleton-text");
            }
        });

        if (avatarImg) {
            const wrapper = avatarImg.parentElement;
            if (isLoading) wrapper.classList.add("skeleton", "skeleton-circle");
            else wrapper.classList.remove("skeleton", "skeleton-circle");
        }
        if (bannerImg) {
            const wrapper = bannerImg.parentElement;
            if (isLoading) wrapper.classList.add("skeleton");
            else wrapper.classList.remove("skeleton");
        }
    },

    init() {
        const savedTheme = localStorage.getItem("theme") || "light";
        const isDark = savedTheme === "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        if (this.elements.themeToggle()) {
            this.elements.themeToggle().checked = isDark;
        }

        const logoSrc = isDark ? "../assets/tick-light.svg" : "../assets/tick-black.svg";
        const logoImg = document.querySelector(".top-bar-logo");
        if (logoImg) logoImg.src = logoSrc;

        this.setupEventListeners();
    },

    initTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        const themeSwitch = document.getElementById("darkModeSwitch");
        if (themeSwitch) {
            themeSwitch.checked = savedTheme === "dark";
        }
    },

    toggleTheme(isDark) {
        const theme = isDark ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        const logoSrc = isDark ? "../assets/tick-light.svg" : "../assets/tick-black.svg";
        const logoImg = document.querySelector(".top-bar-logo");
        if (logoImg) logoImg.src = logoSrc;
    },

    setLoading(isLoading, text = "Saving...") {
        const btn = this.elements.editBtn();
        if (!btn) return;

        btn.disabled = isLoading;
        if (isLoading) {
            btn.innerHTML = `
                <span class="m-0">${text}</span>
                <svg class="profile-btn-loader" viewBox="25 25 50 50" style="margin-left: 8px;">
                    <circle r="20" cy="50" cx="50"></circle>
                </svg>
            `;
        } else {
            const isEditing = state.isEditMode;
            btn.innerHTML = `<i data-lucide="${isEditing ? 'save' : 'edit-3'}"></i><span>${isEditing ? 'Save Changes' : 'Edit Profile'}</span>`;
            btn.className = isEditing ? "btn-primary" : "btn-outline";
        }
        if (window.lucide) window.lucide.createIcons();
    },

    showNotification(title, text, icon = "success") {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (window.Swal) {
            window.Swal.fire({
                title,
                text,
                icon,
                background: isDark ? "#0f172a" : "#ffffff",
                color: isDark ? "#f1f5f9" : "#1a1a1a",
                confirmButtonColor: "#2563eb",
                iconColor: icon === "success" ? "#22c55e" : "#ef4444"
            });
        } else {
            alert(`${title}: ${text}`);
        }
    },

    renderField(field, value, isEdit) {
        field.innerHTML = "";
        const fieldName = field.getAttribute("data-field");

        if (!isEdit) {
            field.textContent = value || CONFIG.DEFAULTS.FALLBACK_TEXT;
            return;
        }

        if (fieldName === "bio") {
            const el = document.createElement("textarea");
            el.className = "edit-mode-textarea";
            el.placeholder = "Write something about yourself...";
            el.value = value || "";
            el.addEventListener("input", checkIfChanged);
            field.appendChild(el);
        } else if (["gender", "language", "timezone"].includes(fieldName)) {
            const opts = getFieldOptions(fieldName);
            field.appendChild(createCustomSelect(fieldName, opts, value));
        } else if (fieldName === "dob") {
            field.appendChild(createDatePicker(fieldName, value));
        } else {
            const el = document.createElement("input");
            el.className = `edit-mode-input ${fieldName === 'email' ? 'is-protected' : ''} ${fieldName === 'fullname' ? 'edit-mode-name-input' : ''}`;
            el.value = value || "";
            el.readOnly = fieldName === "email";
            el.placeholder = getPlaceholder(fieldName);
            el.addEventListener("input", checkIfChanged);
            field.appendChild(el);
        }
    },

    updateImages(data) {
        const avatar = this.elements.avatar();
        const banner = this.elements.banner();

        if (avatar) {
            avatar.src = data.avatarUrl || CONFIG.DEFAULTS.AVATAR;
            avatar.onerror = () => { avatar.src = CONFIG.DEFAULTS.AVATAR; };
        }
        if (banner) {
            banner.src = data.bannerUrl || CONFIG.DEFAULTS.BANNER;
            banner.onerror = () => { banner.src = CONFIG.DEFAULTS.BANNER; };
        }
    }
};

// -----------------------------------------------------------------------------
//  CORE LOGIC (Edit/Save Flow)
// -----------------------------------------------------------------------------
const toggleEditMode = (edit, shouldRevert = false) => {
    if (state.isEditMode === edit && !shouldRevert) return;
    state.isEditMode = edit;

    const { content, editBtn, cancelBtn, fields } = UI.elements;

    if (content()) edit ? content().classList.add("is-editing") : content().classList.remove("is-editing");
    if (cancelBtn()) cancelBtn().style.display = edit ? "flex" : "none";

    if (edit) {
        state.originalImages.banner = UI.elements.banner()?.src || CONFIG.DEFAULTS.BANNER;
        state.originalImages.avatar = UI.elements.avatar()?.src || CONFIG.DEFAULTS.AVATAR;
    }

    fields().forEach(field => {
        const fieldName = field.getAttribute("data-field");
        let value = "";

        if (edit) {
            const text = field.textContent.trim();
            value = (text === CONFIG.DEFAULTS.FALLBACK_TEXT) ? "" : text;
            state.originalData[fieldName] = value;
        } else {
            value = shouldRevert ? state.originalData[fieldName] : getCurrentFieldValue(field);
        }

        if (!edit && shouldRevert) {
            const bannerImg = UI.elements.banner();
            const avatarImg = UI.elements.avatar();
            if (bannerImg) bannerImg.src = state.originalImages.banner;
            if (avatarImg) avatarImg.src = state.originalImages.avatar;
        }

        UI.renderField(field, value, edit);
    });

    UI.setLoading(false);
    checkIfChanged();
};

const saveChanges = async () => {
    if (!checkIfChanged()) return toggleEditMode(false);

    try {
        UI.setLoading(true, "Uploading...");
        const updatedData = {};
        const bannerFile = UI.elements.bannerInput()?.files[0];
        const avatarFile = UI.elements.avatarInput()?.files[0];

        if (bannerFile) updatedData.bannerUrl = await API.uploadImage(bannerFile);
        if (avatarFile) updatedData.avatarUrl = await API.uploadImage(avatarFile);

        UI.setLoading(true, "Saving Info...");

        UI.elements.fields().forEach(field => {
            const fieldName = field.getAttribute("data-field");
            updatedData[fieldName] = getCurrentFieldValue(field) || CONFIG.DEFAULTS.FALLBACK_TEXT;
        });

        if (auth.currentUser) {
            await API.updateProfile(auth.currentUser.uid, updatedData);
            UI.showNotification("Success", "Profile updated successfully!", "success");
            toggleEditMode(false);
        }
    } catch (err) {
        console.error("Save error:", err);
        UI.showNotification("Error", "Action failed. Please try again.", "error");
        UI.setLoading(false);
    }
};

// -----------------------------------------------------------------------------
//  UTILITIES & HELPERS
// -----------------------------------------------------------------------------
function getCurrentFieldValue(field) {
    const customSelect = field.querySelector(".custom-select");
    if (customSelect) return customSelect.getAttribute("data-value");

    const input = field.querySelector("input, textarea");
    return input ? input.value.trim() : field.textContent.trim();
}

function checkIfChanged() {
    let hasChanges = false;
    UI.elements.fields().forEach(field => {
        const name = field.getAttribute("data-field");
        const current = getCurrentFieldValue(field);
        const original = state.originalData[name] || "";
        if (current !== original && current !== CONFIG.DEFAULTS.FALLBACK_TEXT) hasChanges = true;
    });

    if (UI.elements.banner()?.src !== state.originalImages.banner) hasChanges = true;
    if (UI.elements.avatar()?.src !== state.originalImages.avatar) hasChanges = true;

    const btn = UI.elements.editBtn();
    if (btn && state.isEditMode) btn.disabled = !hasChanges;

    return hasChanges;
}

function getFieldOptions(name) {
    if (name === "gender") return ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
    if (name === "language") return ["English", "Urdu", "Arabic", "Hindi", "Spanish", "French", "German"];
    if (name === "timezone") return ["GMT +5:00", "GMT +0:00", "GMT -5:00", "GMT +8:00", "GMT -8:00", "GMT +10:00"];
    return [];
}

function getPlaceholder(name) {
    const maps = { fullname: "Enter full name...", phone: "e.g., +923123456789", location: "City, Country..." };
    return maps[name] || `Enter ${name}...`;
}

function createCustomSelect(fieldName, options, currentValue) {
    const container = document.createElement("div");
    container.className = "custom-select";
    container.setAttribute("data-value", currentValue || "");

    const trigger = document.createElement("div");
    trigger.className = "select-trigger";
    trigger.innerHTML = `<span class="trigger-text">${currentValue || "Choose option"}</span><i data-lucide="chevron-down"></i>`;

    const menu = document.createElement("ul");
    menu.className = "options-menu";

    options.forEach(opt => {
        const item = document.createElement("li");
        item.className = `option-item ${opt === currentValue ? "is-selected" : ""}`;
        item.innerHTML = `<span>${opt}</span><i data-lucide="check"></i>`;
        item.onclick = (e) => {
            e.stopPropagation();
            container.querySelectorAll(".option-item").forEach(i => i.classList.remove("is-selected"));
            item.classList.add("is-selected");
            container.setAttribute("data-value", opt);
            trigger.querySelector(".trigger-text").textContent = opt;
            container.classList.remove("is-open");
            if (window.lucide) window.lucide.createIcons();
            checkIfChanged();
        };
        menu.appendChild(item);
    });

    trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = container.classList.contains("is-open");
        document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("is-open"));
        if (!isOpen) container.classList.add("is-open");
    };

    container.append(trigger, menu);
    return container;
}

function createDatePicker(name, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "edit-input-wrapper dob-input-wrapper";
    const input = document.createElement("input");
    input.className = "edit-mode-input";
    input.placeholder = "Select date of birth...";
    input.value = value;

    wrapper.append(input, Object.assign(document.createElement("i"), { className: "right-icon" }));
    wrapper.querySelector("i").setAttribute("data-lucide", "chevron-down");

    if (window.flatpickr) {
        window.flatpickr(input, { dateFormat: "F j, Y", defaultDate: value, onChange: checkIfChanged });
    }
    if (window.lucide) window.lucide.createIcons();
    return wrapper;
}

// -----------------------------------------------------------------------------
//  INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    UI.toggleSkeleton(true);
    UI.initTheme();

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            UI.toggleSkeleton(false); // Hide if not logged in
            return;
        }
        if (state.isEditMode) return;

        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists() && !state.isEditMode) {
                const data = snap.data();
                UI.elements.fields().forEach(f => {
                    const name = f.getAttribute("data-field");
                    f.textContent = data[name] || CONFIG.DEFAULTS.FALLBACK_TEXT;
                });
                UI.updateImages(data);

                const topBarAvatar = document.querySelector(".profile img");
                if (topBarAvatar) {
                    topBarAvatar.src = data.avatarUrl || CONFIG.DEFAULTS.AVATAR;
                    topBarAvatar.style.visibility = "visible";
                    const topWrapper = topBarAvatar.closest(".profile");
                    if (topWrapper) topWrapper.classList.remove("skeleton", "skeleton-circle");
                }

                UI.toggleSkeleton(false);
            } else {
                UI.toggleSkeleton(false);
            }
        });
    });

    UI.elements.editBtn()?.addEventListener("click", () => state.isEditMode ? saveChanges() : toggleEditMode(true));
    UI.elements.cancelBtn()?.addEventListener("click", () => toggleEditMode(false, true));

    UI.elements.bannerEditBtn()?.addEventListener("click", () => UI.elements.bannerInput()?.click());
    UI.elements.avatarEditBtn()?.addEventListener("click", () => UI.elements.avatarInput()?.click());

    const handleImageUI = (input, img) => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; checkIfChanged(); };
            reader.readAsDataURL(file);
        }
    };

    UI.elements.bannerInput()?.addEventListener("change", () => handleImageUI(UI.elements.bannerInput(), UI.elements.banner()));
    UI.elements.avatarInput()?.addEventListener("change", () => handleImageUI(UI.elements.avatarInput(), UI.elements.avatar()));

    // Theme toggle listener
    const themeSwitch = document.getElementById("darkModeSwitch");
    if (themeSwitch) {
        themeSwitch.addEventListener("change", (e) => UI.toggleTheme(e.target.checked));
    }

    document.addEventListener("click", () => document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("is-open")));
});
