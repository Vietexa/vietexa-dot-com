
const routes = {
"/": "/pages/home.html",
"/socials": "/pages/socials.html",
"/contact": "/pages/contact.html",
"/blog": "/pages/blog.html"
};

let blog_index = null;

async function show_404(content, page){

const response = await fetch("/pages/err_msg_404.html");
content.innerHTML = await response.text();

console.log(`Error: ${page} doesn't exist in routes!`);

}


async function load_chosen_blog(page, update_history, content){

        const blog = blog_index.blogs.find(
        blog => create_blog_path(blog) === page
        );

        if (!blog) {
            await show_404(content, page);
            return;
        }

        const blog_path = `${page}.html`;

        const response = await fetch(blog_path);

        if (!response.ok){
            console.error("Error: A problem appeared when attempting to load the blog!");
            await show_404(content, page);
            return;
        }

        const blog_title = `Title: ${blog.title}`;
        const blog_description = `Description: ${blog.description}`;
        const blog_date = `Date: ${blog.date}`;
        const blog_author = `Author: ${blog.author}`;

        content.innerHTML = await response.text();

        content.classList.add("d-flex", "flex-column", "flex-grow-1");

        let blog_info_element = document.createElement("p");

        blog_info_element.innerHTML = `
        ${blog_title}
        <br> 
        ${blog_date} 
        <br> 
        ${blog_author}
        <br>
        ${blog_description} 
        `;

        blog_info_element.classList.add("text-start","align-self-center", "mb-4");

        content.prepend(blog_info_element);

        const back_button = document.createElement("button");
        back_button.type = "button";
        back_button.classList.add("btn-solid", "theme-primary", "mt-auto", "align-self-start", "mb-3");
        back_button.textContent = "Go Back"

        back_button.addEventListener("click", event => {
            event.preventDefault();
            load_page("/blog", true);
        });

        content.appendChild(back_button);

        if (update_history){
            history.pushState({}, "", page); 
        }

}

async function load_page(page, update_history = true) {
    const content = document.getElementById("content");

    if (page.startsWith("/blog/")){
    await load_chosen_blog(page, update_history, content);
    return;
    }

    if (routes[page] === undefined || routes[page] === null){
        
        await show_404(content, page);
        
        return;
    }
    try {
        const response = await fetch(routes[page]);

        if (!response.ok) {
            throw new Error(`Error: couldn't fetch ${page}!`);
        }

        content.innerHTML = await response.text();

        if (page === "/blog"){
            await list_blogs();
        }

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

async function parse_index_json(){
    const index_json_res = await fetch("/blog/blog_index.json");
    blog_index = await index_json_res.json();
}

async function initialize_logic(){
await parse_index_json();
setup_nav();

const page = window.location.pathname;

await load_page(page, false);

setup_popstate();
load_footer();

}

initialize_logic();

