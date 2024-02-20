const FirstNameInput = document.getElementById("f_name")
const LastNameInput = document.getElementById("l_name")
const EmailInput = document.getElementById("email")
const PhoneInput = document.getElementById("phone")
const PasswordInput = document.getElementById("password")
const Password2Input = document.getElementById("confirm_password")
const signup_Btn = document.getElementById("signup_form")
const sign_Btn = document.getElementById("login_form")
const usernameInput = document.getElementById("username");
const loginPassowordInput = document.getElementById("user_password");


const signup = () => {
    const first_name = FirstNameInput.value
    const last_name = LastNameInput.value
    const phone = PhoneInput.value
    const email = EmailInput.value
    const password = PasswordInput.value
    const password2 = Password2Input.value

    if (password === password2) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                db.collection("Users").doc().set({email, first_name, last_name, phone})
                    .then((response) => {
                        console.log(response)
                        fireAlert("success", "Congratulations !", "User Created Successfully")
                        // signupModal.style.display = "none";
                        // loginModal.style.display = "block";
                    })
                    .catch((err) => {
                        fireAlert("error", "Oops...", `${err.message}`);
                    })
            })
            .catch((err) => {
                fireAlert("error", "Oops...", `${err.message}`);
            })
    } else {
        fireAlert("error", "Oops...", "Password don't match");
        PasswordInput.classList.add("input-border")
        Password2Input.classList.add("input-border")
    }

}
const login = () => {
    const username = usernameInput.value
    const password = loginPassowordInput.value
        auth.signInWithEmailAndPassword(username, password)
        .then((userdata) => {
            fetchClientData(username)
                .then((currentUserArray) => {
                    const currentUser = currentUserArray[0];
                    const userDataString = JSON.stringify(currentUser);
                    sessionStorage.setItem('userData', userDataString);
                    sessionStorage.setItem('userEmail', userdata.user.email);
                    sessionStorage.setItem('userID', userdata.user.uid);
                    sessionStorage.setItem('userDocId', currentUser.userId);
                    window.location.href = `base.html`;
                })
                .catch((fetchError) => {
                    console.error("Error fetching client data:", fetchError);
                });
        })
        .catch((err) => {
            console.log(err)
            fireAlert("error", "Oops...", `${err.message}`);
        })
}
const fireAlert = (icon, title, txt) => {
    Swal.fire({
        icon: `${icon}`,
        title: `${title}`,
        text: `${txt}`,
    });
}
const fetchClientData = async (email) => {
    try {
        // Assuming your Firestore collection is named "Client"
        const querySnapshot = await db.collection("Users").where("email", "==", email).get();
        const clientData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.userId = doc.id;
            clientData.push(data);
        });

        return clientData;
    } catch (error) {
        alert("here")
        throw error;
    }
};
signup_Btn.addEventListener("click", (e) => {
    e.preventDefault()
    signup()
})
sign_Btn.addEventListener("click", (e) => {
    e.preventDefault()
    login()
})
const clear = () => {
    PasswordInput.classList.remove("input-border")
    Password2Input.classList.remove("input-border")
}
const addroom = document.getElementById("addroom")
addroom.addEventListener("click",() =>{

})
