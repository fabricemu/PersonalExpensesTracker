const sidebar = document.querySelector('.sidebar');
const top_nav = document.querySelector('.top_nav');
const mainContent = document.querySelector('main');
const toggleBtn = document.querySelector('.toggle-btn')
const small_icon = document.querySelector('.small_img')
window.addEventListener('resize', () => {
    if (window.innerWidth >= 769) {
        sidebar.style.width = '270px';
        top_nav.style.marginLeft = '270px';
        mainContent.style.marginLeft = '270px';
        toggleBtn.style.display = 'none';
        small_icon.style.display = 'none';
    } else {
        sidebar.style.width = '0';
        top_nav.style.marginLeft = 'auto';
        mainContent.style.marginLeft = '0';
        toggleBtn.style.display = 'block';
        small_icon.style.display = 'block';
    }
});
const toggleNav = () => {
    const sidebar = document.getElementById("mySidebar");
    if (sidebar.style.width === "270px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "270px";
        document.querySelector('.toggle-btn').style.display = "none";
        if (window.innerWidth > 768) {
            document.querySelector(".top_nav").style.marginLeft = "270px";
            document.querySelector('main').style.marginLeft = "270px";
            document.querySelector('.toggle-btn').style.display = "none";
            document.querySelector('.small_img').style.display = "none";
        }

    }
}

const closeNav = () => {
    document.getElementById("mySidebar").style.width = "0";
    document.querySelector(".top_nav").style.marginLeft = "0";
    document.querySelector('main').style.marginLeft = "0";
    document.querySelector('.toggle-btn').style.display = "block";
    document.querySelector('.small_img').style.display = "block";
}

if (!sessionStorage.getItem('userEmail')) {
    // If not logged in, redirect to the login page
    window.location.href = 'index.html';
}


const links = document.getElementsByClassName("link")
const out = document.getElementById("logout")



window.addEventListener("DOMContentLoaded", () => {
    const storedHref = sessionStorage.getItem("savedHref");
    const defaultHref = document.querySelector(".active").getAttribute("id")
    const href = storedHref !== null ? storedHref : defaultHref;
    document.getElementById(defaultHref).classList.remove("active")
    document.getElementById(storedHref).classList.add("active")

    // alert(href)
    // alert(defaultHref)
    pages(href)
});
[...links].forEach(link => {
    link.addEventListener("click", () => {
        [...links].map(link => link.classList.remove("active"))
        link.classList.add("active")
        // alert(JSON.stringify([...links].map(link => link.getAttribute("class"))))
        const href = document.querySelector(".active").getAttribute("id")
        sessionStorage.setItem("savedHref", href);
        pages(href)
    })
})

const pages = (path) => {
    fetch(`${path}`)
        .then(response => response.text())
        .then(html => {
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = html;
            } else {
                console.error('Main element not found in the document.');
            }
        })
        .catch(error => console.error('Error fetching content:', error));
}
out.addEventListener("click", () => {
    confirm("You are about to sign out!", "sign out")
    sessionStorage.removeItem("savedHref");
    sessionStorage.removeItem("userEmail");
    window.location.href = "index.html"
})

const fireAlert = (icon, title, txt) => {
    Swal.fire({
        icon: `${icon}`,
        title: `${title}`,
        text: `${txt}`,
    });
}
const confirm = (text,action) => {
    Swal.fire({
        title: "Are you sure?",
        text: `${text}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1d284d",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${action}!`
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            });
        }
    });
}
