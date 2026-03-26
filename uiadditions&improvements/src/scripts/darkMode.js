(function () {
    function init() {
        const header = document.querySelector("#header");
        if (!header) return;
        if (header.querySelector(".darkmode")) return;
        const root = document.documentElement;
        const darkBtn = document.createElement("div");
        darkBtn.className = "darkmode";
        const img = document.createElement("img");
        img.className = "standard";
        darkBtn.appendChild(img);
        header.appendChild(darkBtn);
        if (localStorage.getItem("darkMode") === "1") {
            root.classList.add("dark");
        }
        function updateIcon() {
            const isDark = root.classList.contains("dark");
            if (isDark) {
                img.src = "https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/header/darkMode.png";
                img.srcset = "https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/header/darkMode@2x.png 2x";
            } else {
                img.src = "https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/header/lightMode.png";
                img.srcset = "https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/header/lightMode@2x.png 2x";
            }
        }
        updateIcon();
        darkBtn.addEventListener("click", () => {
            root.classList.toggle("dark");
            const enabled = root.classList.contains("dark");
            localStorage.setItem("darkMode", enabled ? "1" : "0");
            updateIcon();
        });
    }
    const interval = setInterval(() => {
        if (document.querySelector("#header")) {
            clearInterval(interval);
            init();
        }
    }, 100);
})();