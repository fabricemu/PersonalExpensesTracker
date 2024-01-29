const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginBtn = document.getElementsByClassName("login-btn");
const signupBtn = document.getElementsByClassName("signup-btn");
const closeBtns = document.getElementsByClassName("close");
for (const j of loginBtn) {
    j.onclick = () => {
        signupModal.style.display = "none";
        loginModal.style.display = "block";
    }
}
// loginBtn.onclick = () => {
//     loginModal.style.display = "block";
// }
for (const i of signupBtn) {
    i.onclick = () => {
        loginModal.style.display = "none";
        signupModal.style.display = "block";
    }
}
for (const closeBtn of closeBtns) {
    closeBtn.onclick = () => {
        loginModal.style.display = "none";
        signupModal.style.display = "none";
    }
}
window.onclick = (event) => {
    if (event.target === loginModal || event.target === signupModal) {
        loginModal.style.display = "none";
        signupModal.style.display = "none";
    }
}
