
let sort_order = "new_first";
let switch_state = false;

function create_blog_path(blog){

    const blog_title = blog.title;
    let blog_path = "/blog/";

    for (let c of blog_title){

        if(c === " "){
            blog_path += "-";
        }
        else{
            blog_path += c.toLowerCase()
        }

    }

    return blog_path;

}

function sort_blogs(blogs, sort_order){

blogs.sort((a,b) => {
        
        let date_a = new Date(a.date);
        let date_b = new Date(b.date);

        if (sort_order === "old_first"){
            return date_a - date_b;
        }
        else {
            return date_b - date_a;
        }

    });

    return blogs;
}

function create_blog_links(sorted_blogs){

    let blog_parent_list = document.getElementById("blog_switch_p_list");

    for (let blog of sorted_blogs){

        let blog_list_entry = document.createElement("li");
        blog_parent_list.appendChild(blog_list_entry);

        let blog_link = document.createElement("a");
        blog_link.text = `${blog.title} - ${blog.date}`;

        const blog_path = create_blog_path(blog);

        blog_link.href = blog_path;

        blog_link.addEventListener("click", event => {
            event.preventDefault();
            load_page(blog_path, true);
        })

        blog_list_entry.appendChild(blog_link);
        
    }

}


async function list_blogs(){

    let blog_container = document.getElementById("blog-container");

    const json_data = await fetch("/blog/blog_index.json");
    const blog_index = await json_data.json();

    add_switch_event(blog_index);

    let switch_toggle = document.getElementById("switchMdLabel");
    switch_toggle.checked = switch_state;

    let switch_label = document.getElementById("blog_switch_label");

    switch_state ? switch_label.textContent = "Old Posts First" : switch_label.textContent = "New Posts First";
    

    let blog_parent_list = document.createElement("ul");
    blog_parent_list.id = "blog_switch_p_list"
    blog_container.appendChild(blog_parent_list);

    let sorted_blogs = sort_blogs(blog_index.blogs, sort_order);

    create_blog_links(sorted_blogs);


}

    function relist_blogs(blog_index){

        let blog_parent_list = document.getElementById("blog_switch_p_list");

        blog_parent_list.replaceChildren();
        const toggle_date_sort = document.getElementById("switchMdLabel");

        (toggle_date_sort.checked) ? switch_state = true : switch_state = false;

        let switch_label = document.getElementById("blog_switch_label");

        if (switch_state){
            sort_order = "old_first";
            switch_label.textContent = "Old Posts First";
        }
        else {
            sort_order = "new_first";
            switch_label.textContent = "New Posts First";
        }

        let sorted_blogs = sort_blogs(blog_index.blogs, sort_order);
        create_blog_links(sorted_blogs);


}

function add_switch_event(blog_index){

    const toggle_date_sort = document.getElementById("switchMdLabel");

    toggle_date_sort.addEventListener("change", () => {
        relist_blogs(blog_index);
     });

}
