/* DEVWEB - Carrinho de pedidos */

import { formatarMoeda, focarSemRolar } from "./utils.js";
import { definirMenu } from "./navegacao.js";
import { criarArmazenamento } from "./armazenamento.js";

/* =========================================
   CONFIGURAÇÕES
========================================= */

const CONFIG = Object.freeze({
    storageKey: "forno-massa:carrinho:v1",
    quantidadeMaxima: 99
});

const armazenamento = criarArmazenamento(CONFIG);


/* =========================================
   ELEMENTOS DO DOM
========================================= */

// RESUMO DO PEDIDO

const resumo = document.getElementById("order-summary");
const contador = document.getElementById("order-count");
const total = document.getElementById("order-total");
const finalizar = document.getElementById("finish-order");
const listaItens = document.getElementById("order-items");

const avisoCheckout = document.getElementById("checkout-notice");


// CARRINHO LATERAL

const cartDialog = document.getElementById("cart-dialog");
const cartToggle = document.getElementById("cart-toggle");
const cartBadge = document.getElementById("cart-badge");
const cartClose = document.getElementById("cart-close");

const cartContent = document.getElementById("cart-content");
const cartEmpty = document.getElementById("cart-empty");

const cartContinue = document.getElementById("cart-continue");

const cartEmptyContinue = document.getElementById(
    "cart-empty-continue"
);

const cartOrderHost = document.getElementById(
    "cart-order-host"
);

const cartInlineHost = document.getElementById(
    "cart-inline-host"
);

const introducaoPedido = document.getElementById("pedido");


/* =========================================
   ESTADO DA APLICAÇÃO
========================================= */

const catalogo = new Map();

const carrinho = [];


let catalogoCompletoCarregado = false;

let carrinhoLateralDisponivel = false;

let elementoAnteriorAoCarrinho = null;

let posicaoAnteriorDaPagina = {
    x: 0,
    y: 0
};


/* =========================================
   FUNÇÕES UTILITÁRIAS
========================================= */

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

export function carrinhoEstaAberto() {
    return (
        carrinhoLateralDisponivel &&
        cartDialog.open
    );
}



/* =========================================
   ABRIR CARRINHO LATERAL
========================================= */

function abrirCarrinho(elementoOrigem = null) {
    if (
        !carrinhoLateralDisponivel ||
        cartDialog.open
    ) {
        return;
    }


    // GUARDAR A POSIÇÃO ATUAL DA PÁGINA

    posicaoAnteriorDaPagina = {
        x: window.scrollX,
        y: window.scrollY
    };


    // GUARDAR O ELEMENTO QUE ABRIU O CARRINHO

    elementoAnteriorAoCarrinho =
        elementoOrigem instanceof HTMLElement
            ? elementoOrigem
            : document.activeElement;


    // FECHAR O MENU MOBILE

    definirMenu(false);


    // ABRIR O DIÁLOGO NATIVO

    cartDialog.showModal();


    // INICIAR A ROLAGEM INTERNA NO TOPO

    cartContent.scrollTop = 0;


    // MANTER O FOCO DENTRO DO PAINEL

    focarSemRolar(cartClose);
}


/* =========================================
   FECHAR CARRINHO LATERAL
========================================= */

function fecharCarrinho() {
    if (!carrinhoEstaAberto()) {
        return;
    }

    cartDialog.close();
}


/* =========================================
   RESTAURAR POSIÇÃO APÓS FECHAMENTO
========================================= */

function restaurarPosicaoDaPagina() {

    if (cartDialog.open) {
        return;
    }

    const elementoOriginal = elementoAnteriorAoCarrinho;

    elementoAnteriorAoCarrinho = null;


    // RESTAURAR FOCO SEM DESLOCAR A PÁGINA

    const focoRestaurado = focarSemRolar(
        elementoOriginal
    );

    if (!focoRestaurado) {
        focarSemRolar(cartToggle);
    }


    // RESTAURAR A POSIÇÃO EXATA DA PÁGINA

    window.scrollTo({
        left: posicaoAnteriorDaPagina.x,
        top: posicaoAnteriorDaPagina.y,
        behavior: "instant"
    });
}


/* =========================================
   CONFIGURAR CARRINHO LATERAL
========================================= */

function configurarCarrinhoLateral() {

    // PRESERVAR O CARRINHO ORIGINAL CASO O
    // NAVEGADOR NÃO SUPORTE DIÁLOGOS NATIVOS.

    if (
        !cartDialog ||
        typeof cartDialog.showModal !== "function" ||
        !cartToggle ||
        !cartBadge ||
        !cartClose ||
        !cartContent ||
        !cartEmpty ||
        !cartContinue ||
        !cartEmptyContinue ||
        !cartOrderHost ||
        !cartInlineHost
    ) {

        console.warn(
            "[Forno & Massa] Carrinho lateral indisponível. " +
            "O carrinho convencional será mantido."
        );

        return;
    }


    // MOVER O RESUMO EXISTENTE PARA O PAINEL

    cartOrderHost.appendChild(resumo);

    cartInlineHost.hidden = true;

    carrinhoLateralDisponivel = true;


    // EXIBIR O BOTÃO DO CABEÇALHO

    cartToggle.hidden = false;


    // ATUALIZAR A ORIENTAÇÃO ABAIXO DO CARDÁPIO

    if (introducaoPedido) {
        introducaoPedido.textContent =
            "Adicione seus produtos favoritos e " +
            "acompanhe seu pedido pelo carrinho.";
    }


    // ABERTURA PELO CABEÇALHO

    cartToggle.addEventListener("click", () => {
        abrirCarrinho(cartToggle);
    });


    // ABERTURA PELOS LINKS DE NAVEGAÇÃO

    document.querySelectorAll("[data-cart-open]")
        .forEach(link => {

            link.addEventListener("click", evento => {

                evento.preventDefault();

                abrirCarrinho(link);
            });
        });


    // FECHAR PELO BOTÃO X

    cartClose.addEventListener(
        "click",
        fecharCarrinho
    );


    // CONTINUAR COMPRANDO

    cartContinue.addEventListener(
        "click",
        fecharCarrinho
    );


    // BOTÃO DO CARRINHO VAZIO

    cartEmptyContinue.addEventListener("click", () => {

        fecharCarrinho();
    });


    // FECHAR PELA TECLA ESCAPE

    cartDialog.addEventListener("cancel", evento => {

        evento.preventDefault();

        fecharCarrinho();
    });


    // FECHAR AO CLICAR NO FUNDO ESCURECIDO

    let pressionouFundo = false;

    function eventoForaDoPainel(evento) {

        const limites = cartDialog.getBoundingClientRect();

        return (
            evento.target === cartDialog &&
            (
                evento.clientX < limites.left ||
                evento.clientX > limites.right ||
                evento.clientY < limites.top ||
                evento.clientY > limites.bottom
            )
        );
    }

    cartDialog.addEventListener("pointerdown", evento => {

        pressionouFundo = eventoForaDoPainel(evento);
    });

    cartDialog.addEventListener("pointercancel", () => {

        pressionouFundo = false;
    });

    cartDialog.addEventListener("click", evento => {

        const deveFechar =
            pressionouFundo &&
            eventoForaDoPainel(evento);

        pressionouFundo = false;

        if (deveFechar) {
            fecharCarrinho();
        }
    });


    // RESTAURAR A POSIÇÃO SEMPRE QUE FECHAR

    cartDialog.addEventListener("close", () => {

        pressionouFundo = false;

        restaurarPosicaoDaPagina();
    });
}


/* =========================================
   ATUALIZAR CONTADOR DO CABEÇALHO
========================================= */

function atualizarContadorCabecalho() {

    if (!carrinhoLateralDisponivel) {
        return;
    }

    const quantidade = calcularQuantidadeTotal();

    const descricao =
        quantidade === 1 ? "item" : "itens";

    cartBadge.textContent = String(quantidade);

    cartToggle.setAttribute(
        "aria-label",
        `Abrir carrinho, ${quantidade} ${descricao}`
    );
}


/* =========================================
   INICIALIZAR CATÁLOGO
========================================= */

function inicializarCatalogo() {

    const botoesAdicionar = document.querySelectorAll(
        "#product-grid .add-button"
    );

    catalogo.clear();

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

            adicionarProduto(id, botao);
        });
    });
}


/* =========================================
   ADICIONAR PRODUTO
========================================= */

function adicionarProduto(id, elementoOrigem = null) {

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


    // ATUALIZAR E SALVAR O PEDIDO

    atualizarCarrinho();


    // ABRIR AUTOMATICAMENTE O CARRINHO

    abrirCarrinho(elementoOrigem);
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

    if (!(evento.target instanceof Element)) {
        return;
    }

    const botao = evento.target.closest(
        "button[data-action][data-product-id]"
    );

    if (
        !botao ||
        !listaItens.contains(botao) ||
        botao.disabled
    ) {
        return;
    }

    const id = botao.dataset.productId;

    const acao = botao.dataset.action;

    if (!catalogo.has(id)) {
        return;
    }


    // GUARDAR O FOCO E A ROLAGEM INTERNA

    const elementoAtivo = document.activeElement;

    const tinhaFoco =
        elementoAtivo === botao ||
        listaItens.contains(elementoAtivo);

    const indiceOriginal = carrinho.findIndex(
        item => item.id === id
    );

    const posicaoInterna = carrinhoEstaAberto()
        ? cartContent.scrollTop
        : 0;


    // EXECUTAR A AÇÃO SOLICITADA

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


    // RESTAURAR FOCO DENTRO DO CARRINHO

    if (tinhaFoco) {

        restaurarFoco(
            id,
            acao,
            indiceOriginal
        );
    }


    // PRESERVAR A ROLAGEM INTERNA

    if (carrinhoEstaAberto()) {

        cartContent.scrollTop =
            carrinho.length > 0
                ? posicaoInterna
                : 0;
    }
});


/* =========================================
   RESTAURAR FOCO DOS CONTROLES
========================================= */

function restaurarFoco(id, acao, indiceOriginal) {

    const controles = Array.from(
        listaItens.querySelectorAll(
            "button[data-product-id]"
        )
    ).filter(botao => !botao.disabled);


    // PROCURAR O MESMO PRODUTO

    const mesmoProduto = controles.filter(
        botao => botao.dataset.productId === id
    );

    const controleOriginal = mesmoProduto.find(
        botao => botao.dataset.action === acao
    );

    if (focarSemRolar(controleOriginal)) {
        return;
    }


    // PROCURAR OUTRO CONTROLE DO MESMO PRODUTO

    if (focarSemRolar(mesmoProduto[0])) {
        return;
    }


    // PROCURAR O PRÓXIMO PRODUTO OU O ANTERIOR

    if (carrinho.length > 0) {

        const indiceDestino = Math.max(
            0,
            Math.min(
                indiceOriginal,
                carrinho.length - 1
            )
        );

        const produtoDestino = carrinho[indiceDestino];

        const proximoControle = controles.find(
            botao =>
                botao.dataset.productId === produtoDestino.id &&
                botao.dataset.action === acao
        );

        const controleAlternativo = controles.find(
            botao =>
                botao.dataset.productId === produtoDestino.id
        );

        if (focarSemRolar(proximoControle)) {
            return;
        }

        if (focarSemRolar(controleAlternativo)) {
            return;
        }
    }


    // CARRINHO VAZIO OU AUSÊNCIA DE CONTROLES

    if (carrinhoEstaAberto()) {

        if (carrinho.length === 0) {

            if (focarSemRolar(cartEmptyContinue)) {
                return;
            }
        }

        focarSemRolar(cartClose);

        return;
    }


    // COMPATIBILIDADE COM O CARRINHO CONVENCIONAL

    focarSemRolar(
        catalogo.get(id)?.botao
    );
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

    const carrinhoVazio = carrinho.length === 0;


    // CONTADOR E TOTAL

    contador.textContent =
        `${quantidadeTotal} ${
            quantidadeTotal === 1 ? "item" : "itens"
        }`;

    total.textContent =
        `Total: ${formatarMoeda(valorTotal)}`;


    // RENDERIZAR PRODUTOS

    const fragmento = document.createDocumentFragment();

    carrinho.forEach(item => {

        const elemento = criarItemCarrinho(item);

        if (elemento) {
            fragmento.appendChild(elemento);
        }
    });

    listaItens.replaceChildren(fragmento);


    // VISIBILIDADE DO RESUMO

    resumo.hidden = carrinhoVazio;

    finalizar.disabled = carrinhoVazio;

    finalizar.textContent = "Simular finalização ↗";


    // ESTADO DO CARRINHO LATERAL

    if (carrinhoLateralDisponivel) {

        cartEmpty.hidden = !carrinhoVazio;

        cartOrderHost.hidden = carrinhoVazio;

        cartContinue.hidden = carrinhoVazio;
    }


    // ATUALIZAR CONTADOR DO CABEÇALHO

    atualizarContadorCabecalho();


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

        if (catalogoCompletoCarregado) {

            avisoCheckout.textContent =
                "Ambiente demonstrativo. " +
                "Nenhum pedido ou pagamento real será realizado.";

        } else {

            avisoCheckout.textContent =
                "Catálogo completo temporariamente indisponível. " +
                "Alterações no carrinho não serão salvas. " +
                "Nenhum pedido real será realizado.";
        }
    }


    // SALVAR ALTERAÇÕES

    if (salvar) {

        armazenamento.salvarCarrinho(carrinho, catalogoCompletoCarregado);
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


export function inicializarCarrinho(catalogoCarregado) {
    catalogoCompletoCarregado = catalogoCarregado;

    // REGISTRAR PRODUTOS E BOTÕES

    inicializarCatalogo();


    // RECUPERAR PEDIDOS ARMAZENADOS

    armazenamento.carregarCarrinho(catalogo, carrinho);


    // CONFIGURAR O CARRINHO LATERAL

    configurarCarrinhoLateral();


    // CONFIGURAR AVISOS ACESSÍVEIS

    if (avisoCheckout) {

        avisoCheckout.setAttribute(
            "role",
            "status"
        );

        avisoCheckout.setAttribute(
            "aria-live",
            "polite"
        );
    }


    // ATUALIZAR A INTERFACE INICIAL

    atualizarCarrinho(false);
}
