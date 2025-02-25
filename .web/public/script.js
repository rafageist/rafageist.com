document.addEventListener("DOMContentLoaded", function () {
    let images = document.querySelectorAll("#slideshow img");
    let index = 0;
    let direction = -5; // Dirección inicial del movimiento

    function changeImage() {
        let current = document.querySelector("#slideshow img.active");
        if (current) {
            current.classList.remove("active");
            current.classList.add("exit"); // Se mueve hacia la izquierda
            setTimeout(() => current.classList.remove("exit"), 1500); // Reset después del fade
        }

        index = (index + 1) % images.length;
        let next = images[index];

        next.classList.add("active");
        next.style.left = "-10%"; // Reiniciar posición
        next.style.transform = `translateX(${direction}%)`; // Aplicar movimiento

        // Alternar dirección del movimiento
        direction = direction === -5 ? 5 : -5;
    }

    // Iniciar con la primera imagen
    changeImage();

    // Cambiar imagen cada 5 segundos
    setInterval(changeImage, 5000);
});
