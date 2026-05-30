function togglePassword(button) {
    const wrapper = button.parentElement;
    const input = wrapper.querySelector("input");

    if (input.type === "password") {
        input.type = "text";
        button.classList.add("active");
    } else {
        input.type = "password";
        button.classList.remove("active");
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formForgot");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("emailForgot").value;

    window.location.href = `reset.html?email=${email}`;
  });
});
