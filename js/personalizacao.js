
/* =========================================
   FORNO & MASSA
   DEVWEB - PERSONALIZAÇÃO DE PIZZAS
========================================= */

import {
    CATEGORIAS,
    TAMANHOS,
    buscarProduto
} from "./catalogo.js";

import {
    focarSemRolar,
    formatarMoeda
} from "./utils.js";


/* =========================================
   CONFIGURAÇÕES
========================================= */

const TAMANHO_PADRAO = "M";


/* =========================================
   ESTADO DO MÓDULO
========================================= */

let elementos = null;

let produtoAtual = null;

let tamanhoAtual = null;

let elementoOrigem = null;

let pressionouFundo = false;

let posicaoAnterior = {
    x: 0,
    y: 0
};


/* =========================================
   IDENTIFICAR ELEMENTOS DO HTML
========================================= */

function obterElementos() {

    const dialogo = document.getElementById(
        "customization-dialog"
    );

    if (!dialogo) {
        return null;
    }

    return {
        dialogo,

        formulario: document.getElementById(
            "customization-form"
        ),

        fechar: document.getElementById(
            "customization-close"
        ),

        cancelar: document.getElementById(
            "customization-cancel"
        ),

        conteudo: document.getElementById(
            "customization-content"
        ),

        imagem: document.getElementById(
            "customization-image-host"
        ),

        categoria: document.getElementById(
            "customization-category"
        ),

        nome: document.getElementById(
            "customization-product-name"
        ),

        descricao: document.getElementById(
            "customization-description"
        ),

        tamanho: document.getElementById(
            "customization-size-section"
        ),

        opcoesTamanho: document.getElementById(
            "customization-size-options"
        ),

        borda: document.getElementById(
            "customization-border-section"
        ),

        adicionais: document.getElementById(
            "customization-extras-section"
        ),

        observacoes: document.getElementById(
            "customization-notes"
        ),

        diminuir: document.getElementById(
            "customization-decrease"
        ),

        aumentar: document.getElementById(
            "customization-increase"
        ),

        adicionar: document.getElementById(
            "customization-add"
        ),

        erro: document.getElementById(
            "customization-error"
        ),

        precoUnitario: document.getElementById(
            "customization-unit-price"
        ),

        precoTotal: document.getElementById(
            "customization-total"
        ),

        resumoPrecos: dialogo.querySelector(
            ".customization-price-summary"
        )
    };
}


/* =========================================
   VALIDAR ESTRUTURA
========================================= */

function estruturaValida(referencias) {

    if (!referencias) {
        return false;
    }

    const todosEncontrados = Object.values(
        referencias
    ).every(elemento => elemento !== null);

    return (
        todosEncontrados &&
        typeof referencias.dialogo.showModal === "function" &&
        typeof referencias.dialogo.close === "function"
    );
}


/* =========================================
   VERIFICAR SE A JANELA ESTÁ ABERTA
========================================= */

export function personalizacaoEstaAberta() {

    return Boolean(
        elementos?.dialogo.open
    );
}


/* =========================================
   LOCALIZAR BOTÃO DO PRODUTO
========================================= */

function localizarBotaoProduto(produtoId) {

    const cards = document.querySelectorAll(
        "#product-grid .pizza-card"
    );

    for (const card of cards) {

        if (card.dataset.productId === produtoId) {

            return card.querySelector(
                ".add-button"
            );
        }
    }

    return null;
}


/* =========================================
   OBTER NOME DA CATEGORIA
========================================= */

function obterNomeCategoria(categoriaId) {

    const categoria = CATEGORIAS.find(
        item => item.id === categoriaId
    );

    return categoria?.nome || "Pizza artesanal";
}


/* =========================================
   CARREGAR IMAGEM DO PRODUTO
========================================= */

function carregarImagem(produto) {

    const recipiente = elementos.imagem;

    recipiente.replaceChildren();

    if (!produto.imagem) {

        recipiente.textContent = "Foto em breve";

        return;
    }

    const imagem = document.createElement("img");

    imagem.alt = `Foto ilustrativa de ${produto.nome}`;

    imagem.width = 800;

    imagem.height = 600;

    imagem.decoding = "async";


    // TRATAR FALHAS DE CARREGAMENTO

    imagem.addEventListener("error", () => {

        if (imagem.parentElement === recipiente) {

            recipiente.textContent =
                "Foto indisponível";
        }

    }, {
        once: true
    });

    recipiente.appendChild(imagem);

    imagem.src = produto.imagem;
}


/* =========================================
   CARREGAR INFORMAÇÕES DA PIZZA
========================================= */

function carregarInformacoes(produto) {

    elementos.categoria.textContent =
        obterNomeCategoria(produto.categoria);

    elementos.nome.textContent =
        produto.nome;

    elementos.descricao.textContent =
        produto.descricao;

    carregarImagem(produto);
}


/* =========================================
   MENSAGENS DE VALIDAÇÃO
========================================= */

function limparMensagem() {

    elementos.erro.textContent = "";

    elementos.erro.hidden = true;
}

function exibirMensagem(mensagem) {

    elementos.erro.textContent = mensagem;

    elementos.erro.hidden = false;
}


/* =========================================
   VALIDAR PREÇO EM CENTAVOS
========================================= */

function precoValido(preco) {

    return (
        Number.isSafeInteger(preco) &&
        preco > 0
    );
}


/* =========================================
   OBTER TAMANHOS DISPONÍVEIS
========================================= */

function obterTamanhosDisponiveis(produto) {

    if (
        !produto ||
        !produto.precos ||
        !produto.personalizavel
    ) {

        return [];
    }

    return TAMANHOS.filter(tamanho => {

        const possuiPreco = Object.hasOwn(
            produto.precos,
            tamanho.id
        );

        return (
            possuiPreco &&
            precoValido(
                produto.precos[tamanho.id]
            )
        );
    });
}


/* =========================================
   OBTER PREÇO DO TAMANHO SELECIONADO
========================================= */

function obterPrecoTamanho() {

    if (!produtoAtual || !tamanhoAtual) {

        return null;
    }

    const tamanhoPermitido =
        obterTamanhosDisponiveis(produtoAtual)
            .some(tamanho => {

                return tamanho.id === tamanhoAtual;
            });

    if (!tamanhoPermitido) {

        return null;
    }

    const preco =
        produtoAtual.precos[tamanhoAtual];

    return precoValido(preco)
        ? preco
        : null;
}


/* =========================================
   ATUALIZAR PREÇOS
========================================= */

function atualizarPrecos() {

    const preco = obterPrecoTamanho();

    if (preco === null) {

        elementos.precoUnitario.textContent =
            "R$ 0,00";

        elementos.precoTotal.textContent =
            "R$ 0,00";

        return false;
    }


    // PREÇO UNITÁRIO

    elementos.precoUnitario.textContent =
        formatarMoeda(preco);


    // PREÇO TOTAL

    // Nesta etapa, a quantidade permanece
    // fixa em uma unidade.

    elementos.precoTotal.textContent =
        formatarMoeda(preco);

    return true;
}


/* =========================================
   CRIAR CARD DE TAMANHO
========================================= */

function criarOpcaoTamanho(tamanho, produto) {

    const opcao = document.createElement("label");

    opcao.className =
        "customization-size-option";


    // CAMPO DE SELEÇÃO

    const input = document.createElement("input");

    input.type = "radio";

    input.name = "tamanho";

    input.value = tamanho.id;

    input.required = true;

    input.checked =
        tamanho.id === tamanhoAtual;


    // CÓDIGO DO TAMANHO

    const codigo = document.createElement("span");

    codigo.className =
        "customization-size-code";

    codigo.textContent = tamanho.id;


    // NOME DO TAMANHO

    const nome = document.createElement("span");

    nome.className =
        "customization-size-name";

    nome.textContent = tamanho.nome;


    // DIÂMETRO

    const diametro = document.createElement("span");

    diametro.className =
        "customization-size-details";

    diametro.textContent =
        `${tamanho.diametro} cm`;


    // QUANTIDADE DE FATIAS

    const fatias = document.createElement("span");

    fatias.className =
        "customization-size-details";

    fatias.textContent =
        `${tamanho.fatias} fatias`;


    // PREÇO

    const preco = document.createElement("span");

    preco.className =
        "customization-size-price";

    preco.textContent = formatarMoeda(
        produto.precos[tamanho.id]
    );


    // MONTAR CARD

    opcao.append(
        input,
        codigo,
        nome,
        diametro,
        fatias,
        preco
    );

    return opcao;
}


/* =========================================
   CARREGAR TAMANHOS DA PIZZA
========================================= */

function carregarTamanhos(produto) {

    const tamanhosDisponiveis =
        obterTamanhosDisponiveis(produto);

    elementos.opcoesTamanho.replaceChildren();

    tamanhoAtual = null;


    // VERIFICAR DISPONIBILIDADE

    if (tamanhosDisponiveis.length === 0) {

        elementos.tamanho.hidden = true;

        elementos.resumoPrecos.hidden = true;

        exibirMensagem(
            "Nenhum tamanho está disponível " +
            "para esta pizza."
        );

        return false;
    }


    // SELECIONAR O TAMANHO PADRÃO

    const tamanhoPadrao =
        tamanhosDisponiveis.find(
            tamanho => tamanho.id === TAMANHO_PADRAO
        );

    tamanhoAtual =
        tamanhoPadrao?.id ||
        tamanhosDisponiveis[0].id;


    // GERAR AS OPÇÕES

    const fragmento =
        document.createDocumentFragment();

    tamanhosDisponiveis.forEach(tamanho => {

        const opcao = criarOpcaoTamanho(
            tamanho,
            produto
        );

        fragmento.appendChild(opcao);
    });

    elementos.opcoesTamanho.replaceChildren(
        fragmento
    );


    // EXIBIR TAMANHOS E PREÇOS

    elementos.tamanho.hidden = false;

    elementos.resumoPrecos.hidden = false;

    atualizarPrecos();

    return true;
}


/* =========================================
   ALTERAR TAMANHO SELECIONADO
========================================= */

function selecionarTamanho(tamanhoId) {

    if (!produtoAtual) {

        return false;
    }

    const tamanhoPermitido =
        obterTamanhosDisponiveis(produtoAtual)
            .some(tamanho => {

                return tamanho.id === tamanhoId;
            });

    if (!tamanhoPermitido) {

        return false;
    }

    tamanhoAtual = tamanhoId;

    limparMensagem();

    atualizarPrecos();

    return true;
}


/* =========================================
   SINCRONIZAR SELEÇÃO VISUAL
========================================= */

function sincronizarTamanhoSelecionado() {

    const opcoes =
        elementos.opcoesTamanho.querySelectorAll(
            'input[type="radio"][name="tamanho"]'
        );

    opcoes.forEach(input => {

        input.checked =
            input.value === tamanhoAtual;
    });
}


/* =========================================
   PREPARAR CONTROLES DA JANELA
========================================= */

function prepararControles() {

    elementos.formulario.reset();

    limparMensagem();

    tamanhoAtual = null;


    // TAMANHOS

    elementos.opcoesTamanho.replaceChildren();

    elementos.tamanho.hidden = true;


    // BORDAS E ADICIONAIS

    elementos.borda.hidden = true;

    elementos.adicionais.hidden = true;


    // OBSERVAÇÕES

    elementos.observacoes.disabled = true;

    const secaoObservacoes =
        elementos.observacoes.closest(
            ".customization-section"
        );

    if (secaoObservacoes) {

        secaoObservacoes.hidden = true;
    }


    // QUANTIDADE

    elementos.diminuir.disabled = true;

    elementos.aumentar.disabled = true;

    const secaoQuantidade =
        elementos.diminuir.closest(
            ".customization-quantity-section"
        );

    if (secaoQuantidade) {

        secaoQuantidade.hidden = true;
    }


    // PREÇOS

    elementos.precoUnitario.textContent =
        "R$ 0,00";

    elementos.precoTotal.textContent =
        "R$ 0,00";

    elementos.resumoPrecos.hidden = true;


    // CONFIRMAÇÃO

    // A adição de pizzas personalizadas
    // será habilitada após a integração
    // com o módulo do carrinho.

    elementos.adicionar.disabled = true;
}


/* =========================================
   ABRIR PERSONALIZAÇÃO
========================================= */

export function abrirPersonalizacao(
    produtoId,
    origem = null
) {

    const produto = buscarProduto(produtoId);


    // PERMITIR APENAS PIZZAS DISPONÍVEIS

    if (
        !produto ||
        !produto.disponivel ||
        produto.tipo !== "pizza" ||
        !produto.personalizavel
    ) {

        console.warn(
            "[Forno & Massa] Produto indisponível " +
            "para personalização."
        );

        return false;
    }


    // INICIALIZAR MÓDULO

    if (!inicializarPersonalizacao()) {

        return false;
    }


    // EVITAR DOIS DIÁLOGOS ABERTOS

    if (document.querySelector("dialog[open]")) {

        return false;
    }


    // GUARDAR POSIÇÃO DA PÁGINA

    posicaoAnterior = {
        x: window.scrollX,
        y: window.scrollY
    };


    // GUARDAR ELEMENTO DE ORIGEM

    elementoOrigem =
        origem instanceof HTMLElement
            ? origem
            : localizarBotaoProduto(produto.id);


    // DEFINIR PRODUTO ATUAL

    produtoAtual = produto;

    pressionouFundo = false;


    // PREPARAR A INTERFACE

    prepararControles();

    carregarInformacoes(produto);

    carregarTamanhos(produto);


    // ABRIR JANELA NATIVA

    try {

        elementos.dialogo.showModal();

    } catch (erro) {

        produtoAtual = null;

        tamanhoAtual = null;

        elementoOrigem = null;

        console.warn(
            "[Forno & Massa] Falha ao abrir personalização.",
            erro
        );

        return false;
    }


    // POSICIONAR CONTEÚDO E FOCO

    elementos.conteudo.scrollTop = 0;

    focarSemRolar(elementos.fechar);

    return true;
}


/* =========================================
   FECHAR PERSONALIZAÇÃO
========================================= */

export function fecharPersonalizacao() {

    if (!personalizacaoEstaAberta()) {

        return false;
    }

    elementos.dialogo.close();

    return true;
}


/* =========================================
   RESTAURAR POSIÇÃO DA PÁGINA
========================================= */

function restaurarPagina() {

    if (personalizacaoEstaAberta()) {

        return;
    }

    const origem = elementoOrigem;

    const produtoId = produtoAtual?.id;

    const posicao = {
        ...posicaoAnterior
    };


    // LIMPAR ESTADO DA PERSONALIZAÇÃO

    produtoAtual = null;

    tamanhoAtual = null;

    elementoOrigem = null;

    pressionouFundo = false;


    // NÃO INTERFERIR COM OUTRO DIÁLOGO

    if (document.querySelector("dialog[open]")) {

        return;
    }


    // RESTAURAR FOCO

    const focoRestaurado = focarSemRolar(
        origem
    );

    if (!focoRestaurado && produtoId) {

        focarSemRolar(
            localizarBotaoProduto(produtoId)
        );
    }


    // RESTAURAR POSIÇÃO EXATA

    window.scrollTo({
        left: posicao.x,
        top: posicao.y,
        behavior: "instant"
    });
}


/* =========================================
   IDENTIFICAR CLIQUE FORA DA JANELA
========================================= */

function eventoForaDaJanela(evento) {

    if (evento.target !== elementos.dialogo) {

        return false;
    }

    const limites =
        elementos.dialogo.getBoundingClientRect();

    return (
        evento.clientX < limites.left ||
        evento.clientX > limites.right ||
        evento.clientY < limites.top ||
        evento.clientY > limites.bottom
    );
}


/* =========================================
   CONFIGURAR EVENTOS
========================================= */

function configurarEventos() {


    // ALTERAR TAMANHO

    elementos.opcoesTamanho.addEventListener(
        "change",
        evento => {

            const input = evento.target;

            if (
                !(input instanceof HTMLInputElement) ||
                input.type !== "radio" ||
                input.name !== "tamanho" ||
                !input.checked
            ) {

                return;
            }

            if (!selecionarTamanho(input.value)) {

                sincronizarTamanhoSelecionado();

                exibirMensagem(
                    "O tamanho selecionado " +
                    "não está disponível."
                );
            }
        }
    );


    // FECHAR PELO BOTÃO X

    elementos.fechar.addEventListener(
        "click",
        fecharPersonalizacao
    );


    // VOLTAR AO CARDÁPIO

    elementos.cancelar.addEventListener(
        "click",
        fecharPersonalizacao
    );


    // FECHAR PELA TECLA ESCAPE

    elementos.dialogo.addEventListener(
        "cancel",
        evento => {

            evento.preventDefault();

            fecharPersonalizacao();
        }
    );


    // IDENTIFICAR PRESSIONAMENTO DO FUNDO

    elementos.dialogo.addEventListener(
        "pointerdown",
        evento => {

            pressionouFundo =
                eventoForaDaJanela(evento);
        }
    );


    // CANCELAR PRESSIONAMENTO

    elementos.dialogo.addEventListener(
        "pointercancel",
        () => {

            pressionouFundo = false;
        }
    );


    // FECHAR AO CLICAR NO FUNDO

    elementos.dialogo.addEventListener(
        "click",
        evento => {

            const deveFechar =
                pressionouFundo &&
                eventoForaDaJanela(evento);

            pressionouFundo = false;

            if (deveFechar) {

                fecharPersonalizacao();
            }
        }
    );


    // RESTAURAR PÁGINA APÓS FECHAR

    elementos.dialogo.addEventListener(
        "close",
        restaurarPagina
    );


    // IMPEDIR ENVIO PREMATURO

    elementos.formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();
        }
    );
}


/* =========================================
   INICIALIZAR PERSONALIZAÇÃO
========================================= */

export function inicializarPersonalizacao() {

    // EVITAR EVENTOS DUPLICADOS

    if (elementos) {

        return true;
    }

    const referencias = obterElementos();

    if (!estruturaValida(referencias)) {

        console.warn(
            "[Forno & Massa] Personalização indisponível."
        );

        return false;
    }

    elementos = referencias;

    prepararControles();

    configurarEventos();

    console.info(
        "[Forno & Massa] Módulo de personalização inicializado."
    );

    return true;
}


/* =========================================
   FIM DO MÓDULO
========================================= */
