
async function load_page(page, update_history = true) {
    const content = document.getElementById("content");

    try {
        const response = await fetch(`/pages/${page}.html`);

        if (!response.ok) {
            throw new Error("Page not found");
        }

        content.innerHTML = await response.text();

        if (update_history) {
        const path = page === "home" ? "/" : `/${page}`;
        history.pushState({}, "", path);
        }

    
        // Update active navigation button
        document.querySelectorAll(".navbar-nav .nav-link").forEach(button => {

            const path = (page === "home") ? "/" : `/${page}`;
            const isActive = path === button.getAttribute("href");

            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

    } catch (error) {
        content.textContent = "Could not load the page.";
        console.error(error);
    }
}

function load_footer(){
    const year = new Date().getFullYear();
    const footer = document.getElementById("info_footer");
    footer.innerHTML = `vietexa.com 2024-${year} all rights reserved`;
}

function setup_nav(){
    document.querySelectorAll(".navbar-nav .nav-link, .navbar-brand").forEach(link => {

        link.addEventListener("click", event => {
            event.preventDefault();
            const path = link.getAttribute("href")
            const page = path.slice(1) || "home";
            load_page(page)
        });

    });
}

function setup_popstate(){

    window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    const page = path.slice(1) || "home";

    load_page(page, false);
});

}

setup_nav();

const path = window.location.pathname;
const page = path.slice(1) || "home";

load_page(page, false);

setup_popstate();
load_footer();
