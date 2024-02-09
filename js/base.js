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
        document.querySelector(".top_nav").style.width = "100%";
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

// const close = document.querySelector(".closeNav")
// close.addEventListener("click", () =>{})
const closeNav = () => {
    document.getElementById("mySidebar").style.width = "0";
    document.querySelector(".top_nav").style.marginLeft = "0";
    document.querySelector('main').style.marginLeft = "0";
    document.querySelector('.toggle-btn').style.display = "block";
    document.querySelector('.small_img').style.display = "block";
}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.closebtn').addEventListener('click', closeNav);
    document.querySelector('.toggle-btn').addEventListener('click', toggleNav);
});


if (!sessionStorage.getItem('userEmail')) {
    // If not logged in, redirect to the login page
    window.location.href = 'index.html';
}

const email = sessionStorage.getItem('userEmail')
const links = document.getElementsByClassName("link")
const out = document.getElementById("logout")


const pages = (path) => {
    fetch(`${path}`)
        .then(response => response.text())
        .then(html => {
            // Create a temporary container element to parse the HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            // Extract the JavaScript code from the HTML
            const scriptElements = tempContainer.querySelectorAll('script');
            scriptElements.forEach(script => {
                // Execute the JavaScript code
                eval(script.textContent);
            });

            // Insert the HTML content into the main element
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.innerHTML = tempContainer.innerHTML;
                const parts = path.split('/');
                const pageName = parts[1].split('.')[0];
                import(`./pages.js`).then((module) => {
                    const dynamicFunction = module[pageName];
                    if (typeof dynamicFunction === 'function') {
                        dynamicFunction();
                    } else {
                        console.error(`Function ${pageName} not found in module.`);
                    }

                })
            }
            else
                {
                    console.error('Main element not found in the document.');
                }
            }
        )
        .
            catch(error => console.error('Error fetching content:', error));
        };


    window.addEventListener("DOMContentLoaded", () => {
        const storedHref = sessionStorage.getItem("savedHref");
        const defaultHref = document.querySelector(".active").getAttribute("id");
        let href = '';
        if (storedHref !== null) {
            href = storedHref;
            document.getElementById(defaultHref).classList.remove("active");
            document.getElementById(storedHref).classList.add("active");
        } else {
            href = defaultHref;
        }
        pages(href);
    });

    [...links].forEach(link => {
        link.addEventListener("click", () => {
            [...links].map(link => link.classList.remove("active"));
            link.classList.add("active");
            const href = document.querySelector(".active").getAttribute("id");
            sessionStorage.setItem("savedHref", href);
            pages(href);
        });
    });


    out.addEventListener("click", () => {
        confirm("You are about to sign out!", "sign out")
        sessionStorage.removeItem("savedHref");
        sessionStorage.removeItem("userEmail");
        window.location.href = "index.html"
    })

    const confirm = (text, action) => {
        Swal.fire({
            title: "Are you sure?",
            text: `${text}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1d284d",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${action}!`,
            timer: 2000
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

    const fetchClientData = async (email) => {
        try {
            // Assuming your Firestore collection is named "Client"
            const querySnapshot = await db.collection("Users").where("email", "==", email).get();
            const clientData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                clientData.push(data);
            });

            return clientData;
        } catch (error) {
            throw error;
        }
    };
    fetchClientData(email)
        .then((clientData) => {
            const firstClient = clientData[0];
            // document.getElementById("names").textContent = `${firstClient.first_name}`
        })
        .catch((fetchError) => {
            console.error("Error fetching client data:", fetchError);
        });



