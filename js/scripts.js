const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");
const closeBtns = document.getElementsByClassName("close");
loginBtn.onclick = () => {
  loginModal.style.display = "block";
}
signupBtn.onclick = () => {
  signupModal.style.display = "block";
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
