/* DEVWEB - Navegacao */

import { focarSemRolar } from "./utils.js";

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

export function definirMenu(aberto) {
    nav.classList.toggle("active", aberto);

    menuToggle.textContent = aberto ? "×" : "☰";

    menuToggle.setAttribute(
        "aria-expanded",
        String(aberto)
    );

    menuToggle.setAttribute(
        "aria-label",
        aberto ? "Fechar menu" : "Abrir menu"
    );
}

export function inicializarNavegacao(dialogoAberto) {
    definirMenu(false);

    menuToggle.addEventListener("click", () => {
        const aberto = nav.classList.contains("active");

        definirMenu(!aberto);
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            definirMenu(false);
        });
    });

    document.addEventListener("keydown", evento => {

        // O diálogo possui seu próprio controle da tecla Escape.

        if (dialogoAberto()) {
            return;
        }

        if (
            evento.key === "Escape" &&
            nav.classList.contains("active")
        ) {
            definirMenu(false);

            focarSemRolar(menuToggle);
        }
    });

    document.addEventListener("click", evento => {
        if (!nav.classList.contains("active")) {
            return;
        }

        const clicouNoMenu = nav.contains(evento.target);

        const clicouNoBotao = menuToggle.contains(evento.target);

        if (!clicouNoMenu && !clicouNoBotao) {
            definirMenu(false);
        }
    });

    const telaDesktop = window.matchMedia("(min-width: 851px)");

    telaDesktop.addEventListener("change", evento => {
        if (evento.matches) {
            definirMenu(false);
        }
    });
}
