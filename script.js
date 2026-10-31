
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

const botoesAdicionar = document.querySelectorAll(".add-button");
const resumo = document.getElementById("order-summary");
const contador = document.getElementById("order-count");
const total = document.getElementById("order-total");
const finalizar = document.getElementById("finish-order");
const listaItens = document.getElementById("order-items");

const carrinho = [];

const telefone = "5569999999999"; // Número fictício de demonstração

// MENU MOBILE

menuToggle.addEventListener("click", () => {
    const aberto = nav.classList.toggle("active");

    menuToggle.textContent = aberto ? "×" : "☰";
    menuToggle.setAttribute("aria-expanded", aberto);
    menuToggle.setAttribute(
        "aria-label",
        aberto ? "Fechar menu" : "Abrir menu"
    );
});

nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("active");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// ADICIONAR PIZZAS

botoesAdicionar.forEach(botao => {
    botao.addEventListener("click", () => {
        const nome = botao.dataset.name;
        const preco = Number(botao.dataset.price);

        const pizzaExistente = carrinho.find(
            pizza => pizza.nome === nome
        );

        if (pizzaExistente) {
            pizzaExistente.quantidade++;
        } else {
            carrinho.push({
                nome,
                preco,
                quantidade: 1
            });
        }

        atualizarCarrinho();
    });
});

// AUMENTAR E DIMINUIR QUANTIDADE / REMOVER

listaItens.addEventListener("click", evento => {
    const botao = evento.target.closest("button");

    if (!botao) return;

    const indice = Number(botao.dataset.index);

    if (!Number.isInteger(indice) || !carrinho[indice]) return;

    if (botao.classList.contains("increase-button")) {
        carrinho[indice].quantidade++;
    }

    if (botao.classList.contains("decrease-button")) {
        carrinho[indice].quantidade--;

        if (carrinho[indice].quantidade <= 0) {
            carrinho.splice(indice, 1);
        }
    }

    if (botao.classList.contains("remove-button")) {
        carrinho.splice(indice, 1);
    }

    atualizarCarrinho();
});

// ATUALIZAR CARRINHO

function atualizarCarrinho() {
    const quantidadeTotal = carrinho.reduce(
        (soma, pizza) => soma + pizza.quantidade,
        0
    );

    const valorTotal = carrinho.reduce(
        (soma, pizza) => soma + pizza.preco * pizza.quantidade,
        0
    );

    contador.textContent =
        `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`;

    total.textContent = `Total: ${valorTotal.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
    )}`;

    listaItens.replaceChildren();

    carrinho.forEach((pizza, indice) => {
        const item = document.createElement("div");
        item.className = "order-item";

        const informacoes = document.createElement("div");
        informacoes.className = "order-item-info";

        const nome = document.createElement("strong");
        nome.textContent = pizza.nome;

        const preco = document.createElement("span");
        preco.textContent =
            `${pizza.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })} cada`;

        const controles = document.createElement("div");
        controles.className = "quantity-controls";

        const diminuir = document.createElement("button");
        diminuir.type = "button";
        diminuir.className = "decrease-button";
        diminuir.dataset.index = indice;
        diminuir.textContent = "−";
        diminuir.setAttribute("aria-label", "Diminuir quantidade");

        const quantidade = document.createElement("strong");
        quantidade.textContent = pizza.quantidade;

        const aumentar = document.createElement("button");
        aumentar.type = "button";
        aumentar.className = "increase-button";
        aumentar.dataset.index = indice;
        aumentar.textContent = "+";
        aumentar.setAttribute("aria-label", "Aumentar quantidade");

        const subtotal = document.createElement("span");
        subtotal.textContent = (
            pizza.preco * pizza.quantidade
        ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const remover = document.createElement("button");
        remover.className = "remove-button";
        remover.type = "button";
        remover.dataset.index = indice;
        remover.textContent = "Remover";

        controles.append(diminuir, quantidade, aumentar);

        informacoes.append(nome, preco, controles, subtotal);
        item.append(informacoes, remover);

        listaItens.appendChild(item);
    });

    resumo.hidden = carrinho.length === 0;
}

// FINALIZAR PEDIDO

finalizar.addEventListener("click", () => {
    if (carrinho.length === 0) return;

    const itens = carrinho
        .map(pizza =>
            `- ${pizza.quantidade}x ${pizza.nome}: ${
                (pizza.preco * pizza.quantidade).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                )
            }`
        )
        .join("\n");

    const valorTotal = carrinho.reduce(
        (soma, pizza) => soma + pizza.preco * pizza.quantidade,
        0
    );

    const mensagem =
        `Olá! Gostaria de fazer um pedido:\n\n${itens}\n\nTotal: ${valorTotal.toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        )}`;

    const link =
        `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, "_blank");
});
