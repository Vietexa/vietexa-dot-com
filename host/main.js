
async function loadPage(page) {
    const content = document.getElementById("content");

    try {
        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            throw new Error("Page not found");
        }

        content.innerHTML = await response.text();

        // Update active navigation button
        document.querySelectorAll(".navbar-nav .nav-link").forEach(button => {
            const isActive = button.getAttribute("onclick")?.includes(`'${page}'`);

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
footer.innerHTML = `vietexa.com 2026-${year} all rights reserved`;
}

loadPage("home");
load_footer();
