const menus = [
  { id: "myday", label: "My Day", page: "./myday.html", icon: "sun-medium" },
  { id: "important", label: "Important", page: "./important.html", icon: "star" },
  { id: "tasks", label: "Tasks", page: "./inbox.html", icon: "clipboard-list" },
  { id: "dashboard", label: "Dashboard", page: "./dashboard.html", icon: "layout-dashboard" },
];

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  // Sidebar HTML
  sidebar.innerHTML = `
    <div class="logo-container logo-container-open" id="logo-container">
      <img src="../assets/svgviewer-output.svg" id="logo" alt="Logo">
      <div id="toggleBtn"><i data-lucide="ChevronLeft"></i></div>
    </div>
  `;

  const logoContainer = document.getElementById("logo-container");
  const logo = document.getElementById("logo");
  const toggleIcon = document.getElementById("toggleBtn").firstElementChild;

  // Menu container
  const menuContainer = document.createElement("div");
  menuContainer.id = "menuItems";
  sidebar.appendChild(menuContainer);

  // Create menu items
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

    // Menu click
    div.addEventListener("click", () => {
      document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
      div.classList.add("active");
      window.location.href = menu.page;
    });

    menuContainer.appendChild(div);
  });

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
    if(closed){
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
});


const sortBtn = document.getElementById("sortBtn");

// sortBtn.addEventListener("click", (e) => {
//   e.stopPropagation(); // bahar click se safe
//   sortBtn.classList.toggle("open");
// });

// /* Bahar click par band ho */
// document.addEventListener("click", () => {
//   sortBtn.classList.remove("open");
// });