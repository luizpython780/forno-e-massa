
"use strict";

/* =========================================
   FORNO & MASSA
   SISTEMA DE DELIVERY DEMONSTRATIVO
========================================= */


/* =========================================
   CONFIGURAÇÕES
========================================= */

const CONFIG = Object.freeze({
    storageKey: "forno-massa:carrinho:v1",
    quantidadeMaxima: 99
});

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});


/* =========================================
   ELEMENTOS DO DOM
========================================= */

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

const botoesAdicionar = document.querySelectorAll(".add-button");

const resumo = document.getElementById("order-summary");
const contador = document.getElementById("order-count");
const total = document.getElementById("order-total");
const finalizar = document.getElementById("finish-order");
const listaItens = document.getElementById("order-items");

const avisoCheckout = document.getElementById("checkout-notice");


/* =========================================
   ESTADO DA APLICAÇÃO
========================================= */

const catalogo = new Map();

const carrinho = [];

let avisoStorageExibido = false;


/* =========================================
   FUNÇÕES UTILITÁRIAS
========================================= */

function formatarMoeda(centavos) {
    return formatadorMoeda.format(centavos / 100);
}

function calcularQuantidadeTotal() {
    return carrinho.reduce(
        (soma, produto) => soma + produto.quantidade,
        0
    );
}

function calcularValorTotal() {
    return carrinho.reduce((soma, item) => {
        const produto = catalogo.get(item.id);

        if (!produto) {
            return soma;
        }

        return soma + produto.precoCentavos * item.quantidade;
    }, 0);
}

function quantidadeValida(quantidade) {
    return (
        Number.isInteger(quantidade) &&
        quantidade > 0 &&
        quantidade <= CONFIG.quantidadeMaxima
    );
}


/* =========================================
   MENU MOBILE
========================================= */

function definirMenu(aberto) {
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
    if (
        evento.key === "Escape" &&
        nav.classList.contains("active")
    ) {
        definirMenu(false);

        menuToggle.focus();
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


/* =========================================
   INICIALIZAR CATÁLOGO
========================================= */

function inicializarCatalogo() {
    botoesAdicionar.forEach(botao => {
        const card = botao.closest(".pizza-card");

        if (!card) {
            botao.disabled = true;
            return;
        }

        const id = card.dataset.productId?.trim();

        const nome = botao.dataset.name?.trim();

        const preco = Number(botao.dataset.price);

        const precoCentavos = Math.round(preco * 100);

        if (
            !id ||
            !nome ||
            !Number.isFinite(preco) ||
            !Number.isSafeInteger(precoCentavos) ||
            precoCentavos <= 0 ||
            catalogo.has(id)
        ) {
            console.warn("Produto inválido no catálogo.");

            botao.disabled = true;

            return;
        }

        catalogo.set(id, Object.freeze({
            id,
            nome,
            precoCentavos,
            botao
        }));

        botao.addEventListener("click", () => {
            adicionarProduto(id);
        });
    });
}


/* =========================================
   ARMAZENAMENTO LOCAL
========================================= */

function avisarFalhaStorage() {
    if (avisoStorageExibido) {
        return;
    }

    avisoStorageExibido = true;

    console.warn(
        "O armazenamento local está indisponível. " +
        "O carrinho continuará funcionando nesta página."
    );
}

function salvarCarrinho() {
    try {
        const dados = carrinho.map(item => ({
            id: item.id,
            quantidade: item.quantidade
        }));

        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(dados)
        );

    } catch {
        avisarFalhaStorage();
    }
}

function carregarCarrinho() {
    let dadosSalvos;

    try {
        dadosSalvos = localStorage.getItem(
            CONFIG.storageKey
        );

    } catch {
        avisarFalhaStorage();
        return;
    }

    if (!dadosSalvos) {
        return;
    }

    let dados;

    try {
        dados = JSON.parse(dadosSalvos);

    } catch {
        console.warn("Dados inválidos no carrinho.");
        return;
    }

    if (!Array.isArray(dados)) {
        return;
    }

    const produtosRecuperados = new Map();

    dados.forEach(item => {
        if (
            !item ||
            typeof item !== "object" ||
            typeof item.id !== "string" ||
            !catalogo.has(item.id) ||
            !quantidadeValida(item.quantidade)
        ) {
            return;
        }

        const quantidadeAnterior =
            produtosRecuperados.get(item.id) || 0;

        const quantidadeAtualizada = Math.min(
            quantidadeAnterior + item.quantidade,
            CONFIG.quantidadeMaxima
        );

        produtosRecuperados.set(
            item.id,
            quantidadeAtualizada
        );
    });

    carrinho.length = 0;

    produtosRecuperados.forEach((quantidade, id) => {
        carrinho.push({
            id,
            quantidade
        });
    });
}


/* =========================================
   ADICIONAR PRODUTO
========================================= */

function adicionarProduto(id) {
    if (!catalogo.has(id)) {
        return;
    }

    const produtoExistente = carrinho.find(
        item => item.id === id
    );

    if (produtoExistente) {
        if (
            produtoExistente.quantidade >=
            CONFIG.quantidadeMaxima
        ) {
            return;
        }

        produtoExistente.quantidade++;

    } else {
        carrinho.push({
            id,
            quantidade: 1
        });
    }

    atualizarCarrinho();
}


/* =========================================
   AUMENTAR QUANTIDADE
========================================= */

function aumentarQuantidade(id) {
    const produto = carrinho.find(
        item => item.id === id
    );

    if (!produto) {
        return;
    }

    if (
        produto.quantidade >= CONFIG.quantidadeMaxima
    ) {
        return;
    }

    produto.quantidade++;

    atualizarCarrinho();
}


/* =========================================
   DIMINUIR QUANTIDADE
========================================= */

function diminuirQuantidade(id) {
    const indice = carrinho.findIndex(
        item => item.id === id
    );

    if (indice === -1) {
        return;
    }

    carrinho[indice].quantidade--;

    if (carrinho[indice].quantidade <= 0) {
        carrinho.splice(indice, 1);
    }

    atualizarCarrinho();
}


/* =========================================
   REMOVER PRODUTO
========================================= */

function removerProduto(id) {
    const indice = carrinho.findIndex(
        item => item.id === id
    );

    if (indice === -1) {
        return;
    }

    carrinho.splice(indice, 1);

    atualizarCarrinho();
}


/* =========================================
   EVENTOS DO CARRINHO
========================================= */

listaItens.addEventListener("click", evento => {
    const botao = evento.target.closest(
        "button[data-action][data-product-id]"
    );

    if (
        !botao ||
        !listaItens.contains(botao)
    ) {
        return;
    }

    const id = botao.dataset.productId;

    const acao = botao.dataset.action;

    if (!catalogo.has(id)) {
        return;
    }

    const tinhaFoco = document.activeElement === botao;

    switch (acao) {
        case "increase":
            aumentarQuantidade(id);
            break;

        case "decrease":
            diminuirQuantidade(id);
            break;

        case "remove":
            removerProduto(id);
            break;

        default:
            return;
    }

    if (tinhaFoco) {
        restaurarFoco(id, acao);
    }
});


/* =========================================
   RESTAURAR FOCO DOS CONTROLES
========================================= */

function restaurarFoco(id, acao) {
    const controles = Array.from(
        listaItens.querySelectorAll(
            "button[data-product-id]"
        )
    );

    const mesmoProduto = controles.filter(
        botao => botao.dataset.productId === id
    );

    const controleOriginal = mesmoProduto.find(
        botao =>
            botao.dataset.action === acao &&
            !botao.disabled
    );

    const controleAlternativo = mesmoProduto.find(
        botao => !botao.disabled
    );

    const destino =
        controleOriginal ||
        controleAlternativo ||
        catalogo.get(id)?.botao;

    if (destino) {
        destino.focus();
    }
}


/* =========================================
   CRIAR BOTÕES DO CARRINHO
========================================= */

function criarBotaoCarrinho(
    classe,
    texto,
    acao,
    id,
    descricao
) {
    const botao = document.createElement("button");

    botao.type = "button";

    botao.className = classe;

    botao.textContent = texto;

    botao.dataset.action = acao;

    botao.dataset.productId = id;

    botao.setAttribute("aria-label", descricao);

    return botao;
}


/* =========================================
   CRIAR ITEM DO CARRINHO
========================================= */

function criarItemCarrinho(item) {
    const produto = catalogo.get(item.id);

    if (!produto) {
        return null;
    }

    const elemento = document.createElement("div");

    elemento.className = "order-item";

    const informacoes = document.createElement("div");

    informacoes.className = "order-item-info";


    // NOME DO PRODUTO

    const nome = document.createElement("strong");

    nome.textContent = produto.nome;


    // PREÇO UNITÁRIO

    const preco = document.createElement("span");

    preco.textContent =
        `${formatarMoeda(produto.precoCentavos)} cada`;


    // CONTROLES DE QUANTIDADE

    const controles = document.createElement("div");

    controles.className = "quantity-controls";

    controles.setAttribute("role", "group");

    controles.setAttribute(
        "aria-label",
        `Quantidade de ${produto.nome}`
    );

    const diminuir = criarBotaoCarrinho(
        "decrease-button",
        "−",
        "decrease",
        produto.id,
        `Diminuir quantidade de ${produto.nome}`
    );

    const quantidade = document.createElement("strong");

    quantidade.textContent = String(item.quantidade);

    const aumentar = criarBotaoCarrinho(
        "increase-button",
        "+",
        "increase",
        produto.id,
        `Aumentar quantidade de ${produto.nome}`
    );

    aumentar.disabled =
        item.quantidade >= CONFIG.quantidadeMaxima;

    controles.append(
        diminuir,
        quantidade,
        aumentar
    );


    // SUBTOTAL

    const subtotal = document.createElement("span");

    subtotal.textContent = formatarMoeda(
        produto.precoCentavos * item.quantidade
    );


    // REMOVER PRODUTO

    const remover = criarBotaoCarrinho(
        "remove-button",
        "Remover",
        "remove",
        produto.id,
        `Remover ${produto.nome} do pedido`
    );


    // MONTAR ITEM

    informacoes.append(
        nome,
        preco,
        controles,
        subtotal
    );

    elemento.append(
        informacoes,
        remover
    );

    return elemento;
}


/* =========================================
   ATUALIZAR INTERFACE DO CARRINHO
========================================= */

function atualizarCarrinho(salvar = true) {
    const quantidadeTotal = calcularQuantidadeTotal();

    const valorTotal = calcularValorTotal();

    contador.textContent =
        `${quantidadeTotal} ${
            quantidadeTotal === 1 ? "item" : "itens"
        }`;

    total.textContent =
        `Total: ${formatarMoeda(valorTotal)}`;

    const fragmento = document.createDocumentFragment();

    carrinho.forEach(item => {
        const elemento = criarItemCarrinho(item);

        if (elemento) {
            fragmento.appendChild(elemento);
        }
    });

    listaItens.replaceChildren(fragmento);


    // VISIBILIDADE DO CARRINHO

    resumo.hidden = carrinho.length === 0;

    finalizar.disabled = carrinho.length === 0;

    finalizar.textContent = "Simular finalização ↗";


    // CONTROLE DOS LIMITES

    catalogo.forEach(produto => {
        const item = carrinho.find(
            registro => registro.id === produto.id
        );

        const limiteAtingido =
            (item?.quantidade || 0) >=
            CONFIG.quantidadeMaxima;

        produto.botao.disabled = limiteAtingido;

        produto.botao.setAttribute(
            "aria-label",
            limiteAtingido
                ? `Limite atingido para ${produto.nome}`
                : `Adicionar ${produto.nome} ao pedido`
        );
    });


    // AVISO DEMONSTRATIVO

    if (avisoCheckout) {
        avisoCheckout.textContent =
            "Ambiente demonstrativo. " +
            "Nenhum pedido ou pagamento real será realizado.";
    }


    // SALVAR ALTERAÇÕES

    if (salvar) {
        salvarCarrinho();
    }
}


/* =========================================
   FINALIZAÇÃO DEMONSTRATIVA
========================================= */

finalizar.addEventListener("click", () => {
    if (carrinho.length === 0) {
        return;
    }

    const quantidade = calcularQuantidadeTotal();

    const valor = formatarMoeda(
        calcularValorTotal()
    );

    if (avisoCheckout) {
        avisoCheckout.textContent =
            `Simulação concluída! ` +
            `Seu pedido possui ${quantidade} ` +
            `${quantidade === 1 ? "item" : "itens"}, ` +
            `no valor de ${valor}. ` +
            `Nenhum pedido foi enviado.`;
    }
});


/* =========================================
   INICIALIZAÇÃO DA APLICAÇÃO
========================================= */

function inicializarAplicacao() {
    definirMenu(false);

    inicializarCatalogo();

    carregarCarrinho();

    if (avisoCheckout) {
        avisoCheckout.setAttribute("role", "status");

        avisoCheckout.setAttribute(
            "aria-live",
            "polite"
        );
    }

    atualizarCarrinho(false);
}

inicializarAplicacao();


/* =========================================
   FIM DO ARQUIVO
========================================= */
