document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("senha").value;

        try {
            const response = await fetch("https://projeto-ecocomp-mqtt.onrender.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login realizado com sucesso!");
                const pagePrefix = window.location.pathname.includes("/frontend/") ? "" : "frontend/";
                window.location.href = `${pagePrefix}home.html`;
            } else {
                alert(data.erro || "Erro ao fazer login");
            }

        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão com o servidor");
        }
    });
});
