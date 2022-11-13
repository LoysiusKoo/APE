const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");

//function for sign in button in login page
form.addEventListener("submit", (e) => {
  e.preventDefault();
  validateInputs();
  redirect();
});

//function to add error class
const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = message;
  inputControl.classList.add("error");
  inputControl.classList.remove("success");
};

//function to add successs class
const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = "";
  inputControl.classList.add("success");
  inputControl.classList.remove("error");
};

//function for form validation
const validateInputs = () => {
  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  //set success if username is admin
  //set error is username is empty or incorrect
  if (usernameValue === "") {
    setError(username, "Username is required");
  } else if (usernameValue === "admin") {
    //Set username here
    setSuccess(username);
  } else {
    setError(username, "Username is incorrect.");
  }
  //set success if email is filled in
  //set error is email is empty
  if (emailValue === "") {
    setError(email, "Email is required");
  } else {
    setSuccess(email);
  }
  //set success if password is more than 8 characters
  //set error is password is empty or less than 8 characters
  if (passwordValue === "") {
    setError(password, "Password is required");
  } else if (passwordValue.length < 8) {
    setError(password, "Password must be at least 8 character.");
  } else {
    setSuccess(password);
  }
};

//redirect function for button
//if username, email and password has success class, redirect to dashboard.html
const redirect = () => {
  if (
    username.parentElement.classList.contains("success") &&
    email.parentElement.classList.contains("success") &&
    password.parentElement.classList.contains("success")
  ) {
    window.location.href = "dashboard.html";
  } else {
    //alert for if any of the login details are incorrect
    alert("Wrong login details");
  }
};
