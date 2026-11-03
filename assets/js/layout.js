/* GBbooking shared layout loader.
   Edit components/site-header.html, components/mobile-bottom-nav.html and
   components/site-footer.html to update the site-wide layout once. */
(async function () {
  const components = [
    ["[data-shared-component='header']", "/components/site-header.html"],
    ["[data-shared-component='mobile-bottom-nav']", "/components/mobile-bottom-nav.html"],
    ["[data-shared-component='footer']", "/components/site-footer.html"]
  ];

  try {
    const loaded = await Promise.all(components.map(async ([selector, url]) => {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error("Could not load " + url + " (" + response.status + ")");
      return [selector, await response.text()];
    }));

    loaded.forEach(([selector, html]) => {
      const mount = document.querySelector(selector);
      if (mount) mount.outerHTML = html;
    });

    const menuButton = document.getElementById("mobileMenuBtn");
    const closeButton = document.getElementById("closeDrawerBtn");
    const drawer = document.getElementById("mobileDrawer");
    const drawerPanel = drawer?.firstElementChild;

    function closeDrawer(returnFocus = true) {
      if (!drawer) return;
      drawer.classList.add("hidden");
      document.body.style.overflow = "";
      menuButton?.setAttribute("aria-expanded", "false");
      if (returnFocus) menuButton?.focus();
    }

    menuButton?.setAttribute("aria-controls", "mobileDrawer");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.addEventListener("click", () => {
      drawer?.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      menuButton.setAttribute("aria-expanded", "true");
      closeButton?.focus();
    });
    closeButton?.addEventListener("click", () => closeDrawer());
    drawer?.addEventListener("click", event => {
      if (event.target === drawer) closeDrawer();
    });
    drawerPanel?.addEventListener("click", event => event.stopPropagation());
    drawer?.querySelectorAll(".drawer-link").forEach(link => {
      link.addEventListener("click", () => closeDrawer(false));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && drawer && !drawer.classList.contains("hidden")) closeDrawer();
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1024px)").matches && drawer && !drawer.classList.contains("hidden")) {
        closeDrawer(false);
      }
    });

    // Highlight the current destination across desktop, drawer, and bottom navigation.
    function markActiveNavigation() {
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const currentHash = window.location.hash;
      const isHome = currentPath === "/" || currentPath.endsWith("/index.html");
      const isDashboard = /(?:^|\/)dashboard(?:\.html)?$/.test(currentPath);

      document.querySelectorAll(".gb-master-header nav a, #mobileDrawer a.drawer-link, .gb-master-bottom-nav a").forEach(link => {
        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.startsWith("javascript:")) return;
        const target = new URL(rawHref, window.location.href);
        const targetPath = target.pathname.replace(/\/$/, "") || "/";
        const targetHash = target.hash;
        let active = targetPath === currentPath;

        if (isHome && (targetPath.endsWith("/index.html") || targetPath === "/")) {
          active = !targetHash || targetHash === "#home"
            ? (!currentHash || currentHash === "#home")
            : targetHash === currentHash;
        }
        if (isDashboard && targetPath.endsWith("/login.html")) active = true;
        if (targetHash && targetPath === currentPath && targetHash !== currentHash) active = false;

        if (active) {
          link.classList.add("gb-nav-active");
          link.setAttribute("aria-current", "page");
        } else {
          link.classList.remove("gb-nav-active");
          link.removeAttribute("aria-current");
        }
      });
    }
    markActiveNavigation();

    document.dispatchEvent(new CustomEvent("gbbooking:layout-ready"));
  } catch (error) {
    console.error("[GBbooking layout]", error);
    document.documentElement.classList.add("layout-load-error");
  }
})();