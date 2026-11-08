
const routes = {
"/": "/pages/home.html",
"/socials": "/pages/socials.html",
"/contact": "/pages/contact.html"
};

async function load_page(page, update_history = true) {
    const content = document.getElementById("content");

    if (routes[page] === undefined || routes[page] === null){
        
        const response = await fetch("/pages/err_msg_404.html");
        content.innerHTML = await response.text();

        console.log(`Error: ${page} doesn't exist in routes!`);
        return;
    }
    try {
        const response = await fetch(routes[page]);

        if (!response.ok) {
            throw new Error(`Error: couldn't fetch ${page}!`);
        }

        content.innerHTML = await response.text();

        if (update_history) {
        history.pushState({}, "", page);
        }

    
        // Update active navigation button
        document.querySelectorAll(".navbar-nav .nav-link").forEach(button => {

            const isActive = page === button.getAttribute("href");

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
            const page = link.getAttribute("href")
            load_page(page)
        });

    });
}

function setup_popstate(){

    window.addEventListener("popstate", () => {
    const page = window.location.pathname;
    load_page(page, false);

});

}

setup_nav();

const page = window.location.pathname;

load_page(page, false);

setup_popstate();
load_footer();
