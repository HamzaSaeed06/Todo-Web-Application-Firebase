import { auth, signOut, onAuthStateChanged, db, doc, onSnapshot } from "../src/firebase.js";

const menus = [
  { id: "myday", label: "My Day", page: "./myday.html", icon: "sun-medium" },
  { id: "important", label: "Important", page: "./important.html", icon: "star" },
  { id: "planned", label: "Planned", page: "./planned.html", icon: "calendar-days" },
  { id: "tasks", label: "Tasks", page: "./inbox.html", icon: "clipboard-list" },
];

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const updateLogos = (theme) => {
    const isDark = theme === "dark";
    const logoSrc = isDark ? "../assets/tick-light.svg" : "../assets/tick-black.svg";

    const sidebarLogo = document.getElementById("logo");
    const topBarLogo = document.querySelector(".top-bar-logo");

    if (sidebarLogo) sidebarLogo.src = logoSrc;
    if (topBarLogo) topBarLogo.src = logoSrc;
  };


  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
        const newTheme = document.documentElement.getAttribute("data-theme");
        updateLogos(newTheme);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="logo-container logo-container-open" id="logo-container">
      <img src="../assets/tick-black.svg" id="logo" alt="Logo">
      <div id="toggleBtn"><i data-lucide="ChevronLeft"></i></div>
    </div>
  `;

  // Update logos initially (AFTER sidebar injection)
  updateLogos(savedTheme);

  const logoContainer = document.getElementById("logo-container");
  const logo = document.getElementById("logo");
  const toggleIcon = document.getElementById("toggleBtn").firstElementChild;

  // Menu container
  const menuContainer = document.createElement("div");
  menuContainer.id = "menuItems";
  sidebar.appendChild(menuContainer);

  menus.forEach(menu => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.id = menu.id;

    div.innerHTML = `
      <div class="menu-bg">
        <i data-lucide="${menu.icon}" class="menu-icon"></i>
      </div>
      <span class="menu-text">${menu.label}</span>
      <span class="tooltip">${menu.label}</span>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
      div.classList.add("active");

      let targetPage = menu.page;
      if (window.location.pathname.includes("/profile/")) {
        targetPage = "../tasks/" + menu.page.substring(2);
      }

      window.location.href = targetPage;
    });

    menuContainer.appendChild(div);
  });

  // ===== Profile Section at Bottom (Desktop Only) =====
  const profileSection = document.createElement("div");
  profileSection.className = "sidebar-profile-section";

  // Layout Priority: Text First, then Image (to appear right)
  profileSection.innerHTML = `
    <div class="sidebar-profile" id="sidebarProfile">
      <div class="user-details">
        <span class="user-name skeleton skeleton-text" style="width: 130px; height: 1.2rem;"></span>
      </div>
      <div class="user-avatar-wrapper skeleton skeleton-circle" style="width: 30px; height: 30px;">
        <img src="" alt="Profile" class="user-avatar" style="visibility: hidden;">
      </div>
    </div>
  `;
  sidebar.appendChild(profileSection);

  // ===== Profile Menu (Appended to BODY to avoid hiding) =====
  // Remove existing if any (to prevent duplicates on reload if SPA-like)
  const existingMenu = document.getElementById("profileMenu");
  if (existingMenu) existingMenu.remove();

  const menuDiv = document.createElement("div");
  menuDiv.className = "profile-menu";
  menuDiv.id = "profileMenu";
  menuDiv.innerHTML = `
        <div class="profile-menu-item" id="menuProfileOption">
            <i data-lucide="user"  class="profile-icon" stroke-width="1.5"></i>
            <span>Profile</span>
        </div>
        <div class="profile-menu-item" id="menuLogoutOption">
            <i data-lucide="log-out" class="profile-icon" stroke-width="1.5"></i>
            <span>Logout</span>
        </div>
  `;
  document.body.appendChild(menuDiv);

  // Render icons
  lucide.createIcons();

  // ===== Persistent sidebar state =====
  const savedState = localStorage.getItem("sideBarToggle") || "open";
  const isClosed = savedState === "close";

  sidebar.classList.toggle("closed", isClosed);
  logoContainer.classList.toggle("logo-container-open", !isClosed);
  logoContainer.classList.toggle("logo-container-close", isClosed);
  logo.style.display = isClosed ? "none" : "block";
  toggleIcon.setAttribute("data-lucide", isClosed ? "ChevronRight" : "ChevronLeft");
  lucide.createIcons();

  // ===== Toggle sidebar =====
  document.getElementById("toggleBtn").addEventListener("click", () => {
    const closed = sidebar.classList.contains("closed");
    if (closed) {
      sidebar.classList.remove("closed");
      logoContainer.classList.add("logo-container-open");
      logoContainer.classList.remove("logo-container-close");
      logo.style.display = "block";
      toggleIcon.setAttribute("data-lucide", "ChevronLeft");
      localStorage.setItem("sideBarToggle", "open");
    } else {
      sidebar.classList.add("closed");
      logoContainer.classList.remove("logo-container-open");
      logoContainer.classList.add("logo-container-close");
      logo.style.display = "none";
      toggleIcon.setAttribute("data-lucide", "ChevronRight");
      localStorage.setItem("sideBarToggle", "close");

      // Close profile menu if sidebar closes
      document.getElementById("profileMenu").classList.remove("open");
    }
    lucide.createIcons();
  });

  // ===== Highlight active menu based on current page =====
  const currentPage = window.location.pathname.split("/").pop();
  menus.forEach(menu => {
    if (menu.page === `./${currentPage}`) {
      const activeItem = document.getElementById(menu.id);
      if (activeItem) activeItem.classList.add("active");
    }
  });

  // ===== Profile Menu Logic =====
  document.addEventListener("click", (e) => {
    const profileMenu = document.getElementById("profileMenu");
    if (!profileMenu) return;

    const target = e.target;
    // Check if clicked element is part of sidebar profile
    const sidebarProfileClicked = target.closest("#sidebarProfile");

    // Check if clicked element is part of top bar profile (Mobile)
    const topBarProfileClicked = target.closest(".nav-bar .profile");

    if (sidebarProfileClicked) {
      e.stopPropagation();
      profileMenu.classList.toggle("open");
      profileMenu.classList.remove("mobile-menu"); // Ensure standard positioning

      // -----------------------------------------------------------------------
      //  DESKTOP MENU POSITIONING
      // -----------------------------------------------------------------------
      // Uses fixed positioning to ensure the menu appears correctly above the profile
      const rect = sidebarProfileClicked.getBoundingClientRect();
      profileMenu.style.position = 'fixed';
      profileMenu.style.left = '10px';
      profileMenu.style.bottom = '70px';
      profileMenu.style.top = 'auto';
      profileMenu.style.right = 'auto';

      return;
    }

    if (topBarProfileClicked) {
      e.stopPropagation();
      profileMenu.classList.toggle("open");

      if (window.innerWidth <= 768) {
        profileMenu.classList.add("mobile-menu");
        // Reset inline styles if any
        profileMenu.style = "";
      }
      return;
    }

    // Click inside menu? Do nothing (or handle item clicks)
    if (profileMenu.contains(target)) return;

    // Click outside -> Close
    profileMenu.classList.remove("open");
  });

  // Logout Logic
  const logoutBtn = document.getElementById("menuLogoutOption");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "../auth/login.html";
      } catch (err) {
        console.error(err);
      }
    });
  }

  const profileOption = document.getElementById("menuProfileOption");
  if (profileOption) {
    profileOption.addEventListener("click", () => {
      window.location.href = "../profile/profile.html";
    });
  }

  // Update user info
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Real-time sync with Firestore for name and avatar
      onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const userNameEl = document.querySelector(".user-name");
          const userAvatarEl = document.querySelector(".user-avatar");
          const topBarAvatarEl = document.querySelector(".profile img");

          if (userNameEl) {
            userNameEl.textContent = data.fullname || user.displayName || "User";
            userNameEl.classList.remove("skeleton", "skeleton-text");
            userNameEl.style.width = "";
            userNameEl.style.height = "";
          }

          const avatarUrl = data.avatarUrl || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-transparent-600nw-2534623321.jpg";

          if (userAvatarEl) {
            userAvatarEl.src = avatarUrl;
            userAvatarEl.style.visibility = "visible";
            const wrapper = userAvatarEl.closest(".user-avatar-wrapper");
            if (wrapper) wrapper.classList.remove("skeleton", "skeleton-circle");
          }
          if (topBarAvatarEl) {
            topBarAvatarEl.src = avatarUrl;
            topBarAvatarEl.style.visibility = "visible";
            const topWrapper = topBarAvatarEl.closest(".profile");
            if (topWrapper) topWrapper.classList.remove("skeleton", "skeleton-circle");
          }
        }
      });
    }
  });

});