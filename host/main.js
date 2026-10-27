
 function change_footer(){
    
 const year = new Date().getFullYear();

 const footer = document.getElementById("footer_year");
 footer.textContent = `© Vietexa.com 2024-${year} all rights reserved.`;
 }

change_footer();


