
function change_footer(){
const year = new Date().getFullYear();

let footer = document.getElementById("footer_year");
footer.textContent = "© Vietexa.com 2024-" + year + " All rights reserved.";
}

change_footer();

