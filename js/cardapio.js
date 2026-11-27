
import {
    CATEGORIAS,
    listarProdutosDisponiveis
} from "./catalogo.js";


/* =========================================
   FORNO & MASSA
   CARDÁPIO DINÂMICO, FILTROS E PESQUISA
========================================= */


/* =========================================
   CONFIGURAÇÕES
========================================= */

const formatador = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});


/* =========================================
   ESTADO DOS FILTROS
========================================= */

const estadoFiltros = {
    categoria: "todos",
    pesquisa: ""
};


/* =========================================
   FUNÇÕES UTILITÁRIAS
========================================= */

function formatarPreco(centavos) {
    return formatador.format(centavos / 100);
}

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obterPrecoInicial(produto) {
    const preco = produto.tipo === "pizza"
        ? produto.precos.M
        : produto.precos.UN;

    if (!Number.isSafeInteger(preco) || preco <= 0) {
        throw new Error(
            `Preço inválido: ${produto.id}`
        );
    }

    return preco;
}


/* =========================================
   CRIAR IMAGEM DO PRODUTO
========================================= */

function criarImagem(produto, indice) {
    const container = document.createElement("div");

    container.className = "pizza-image";

    const identificacao = document.createElement("span");

    identificacao.className = "pizza-number";

    if (produto.imagem) {
        const imagem = document.createElement("img");

        imagem.src = produto.imagem;

        imagem.alt = `Foto ilustrativa de ${produto.nome}`;

        imagem.loading = "lazy";

        imagem.decoding = "async";

        identificacao.textContent = String(
            indice + 1
        ).padStart(2, "0");

        imagem.addEventListener("error", () => {
            imagem.remove();

            identificacao.textContent = "Foto indisponível";

        }, { once: true });

        container.appendChild(imagem);

    } else {
        identificacao.textContent = "Foto em breve";
    }

    container.appendChild(identificacao);

    return container;
}


/* =========================================
   CRIAR INFORMAÇÕES DO PRODUTO
========================================= */

function criarInformacoes(produto, precoCentavos) {
    const informacoes = document.createElement("div");

    informacoes.className = "pizza-info";


    // TÍTULO E PREÇO

    const titulo = document.createElement("div");

    titulo.className = "pizza-title";

    const nome = document.createElement("h3");

    nome.textContent = produto.nome;

    const preco = document.createElement("span");

    preco.textContent = formatarPreco(precoCentavos);

    titulo.append(nome, preco);


    // DESCRIÇÃO

    const descricao = document.createElement("p");

    const detalhe = produto.tipo === "pizza"
        ? "Tamanho M — 30 cm"
        : produto.volume;

    descricao.textContent =
        `${produto.descricao} • ${detalhe}.`;


    // BOTÃO DE ADICIONAR

    const botao = document.createElement("button");

    botao.type = "button";

    botao.className = "add-button";

    botao.dataset.name = produto.nome;

    botao.dataset.price =
        (precoCentavos / 100).toFixed(2);

    botao.setAttribute(
        "aria-label",
        `Adicionar ${produto.nome} ao pedido`
    );

    const texto = document.createTextNode(
        "Adicionar ao pedido "
    );

    const icone = document.createElement("span");

    icone.textContent = "+";

    icone.setAttribute("aria-hidden", "true");

    botao.append(texto, icone);


    // MONTAR INFORMAÇÕES

    informacoes.append(
        titulo,
        descricao,
        botao
    );

    return informacoes;
}


/* =========================================
   CRIAR CARD DO PRODUTO
========================================= */

function criarCard(produto, indice) {
    const precoCentavos = obterPrecoInicial(produto);

    const card = document.createElement("article");

    card.className = "pizza-card";

    card.dataset.productId = produto.id;

    card.dataset.category = produto.categoria;

    card.dataset.productType = produto.tipo;

    const imagem = criarImagem(produto, indice);

    const informacoes = criarInformacoes(
        produto,
        precoCentavos
    );

    card.append(imagem, informacoes);

    return card;
}


/* =========================================
   VERIFICAR COMPATIBILIDADE COM OS FILTROS
========================================= */

function produtoCorrespondeAosFiltros(produto) {

    // VERIFICAR CATEGORIA

    const categoriaCorreta =
        estadoFiltros.categoria === "todos" ||
        produto.categoria === estadoFiltros.categoria;

    if (!categoriaCorreta) {
        return false;
    }


    // VERIFICAR PESQUISA

    const pesquisa = normalizarTexto(
        estadoFiltros.pesquisa
    );

    if (!pesquisa) {
        return true;
    }

    const textoProduto = normalizarTexto([
        produto.nome,
        produto.descricao,
        produto.volume
    ].filter(Boolean).join(" "));

    const termos = pesquisa.split(/\s+/);

    return termos.every(
        termo => textoProduto.includes(termo)
    );
}


/* =========================================
   CRIAR CAMPO DE PESQUISA
========================================= */

function criarPesquisa() {
    const container = document.createElement("div");

    container.className = "menu-search";

    const label = document.createElement("label");

    label.className = "search-label";

    label.htmlFor = "product-search";

    label.textContent = "Buscar no cardápio";

    const input = document.createElement("input");

    input.type = "search";

    input.id = "product-search";

    input.className = "search-input";

    input.placeholder =
        "Buscar pizzas, ingredientes ou bebidas...";

    input.autocomplete = "off";

    input.maxLength = 120;

    input.setAttribute(
        "aria-controls",
        "product-grid"
    );

    container.append(label, input);

    return {
        container,
        input
    };
}


/* =========================================
   CRIAR FILTROS DE CATEGORIA
========================================= */

function criarCategorias() {
    const container = document.createElement("div");

    container.className = "category-filters";

    container.setAttribute("role", "group");

    container.setAttribute(
        "aria-label",
        "Categorias do cardápio"
    );

    const categorias = [
        {
            id: "todos",
            nome: "Todos"
        },
        ...CATEGORIAS
    ];

    const botoes = [];

    categorias.forEach(categoria => {
        const botao = document.createElement("button");

        botao.type = "button";

        botao.className =
            "category-button button button-outline";

        botao.dataset.category = categoria.id;

        botao.textContent = categoria.nome;

        botao.setAttribute(
            "aria-controls",
            "product-grid"
        );

        botao.setAttribute(
            "aria-pressed",
            "false"
        );

        botoes.push(botao);

        container.appendChild(botao);
    });

    return {
        container,
        botoes
    };
}


/* =========================================
   CRIAR CONTADOR DE RESULTADOS
========================================= */

function criarContadorResultados() {
    const contador = document.createElement("p");

    contador.id = "product-results";

    contador.className = "product-results";

    contador.setAttribute("role", "status");

    contador.setAttribute("aria-live", "polite");

    contador.setAttribute("aria-atomic", "true");

    return contador;
}


/* =========================================
   CRIAR AVISO DE CARDÁPIO VAZIO
========================================= */

function criarAvisoVazio() {
    const container = document.createElement("div");

    container.id = "menu-empty";

    container.className = "menu-empty";

    container.hidden = true;

    const titulo = document.createElement("h3");

    titulo.textContent = "Nenhum produto encontrado.";

    const descricao = document.createElement("p");

    descricao.textContent =
        "Tente pesquisar outro termo ou selecionar uma categoria diferente.";

    const limpar = document.createElement("button");

    limpar.type = "button";

    limpar.className = "button button-primary";

    limpar.textContent = "Limpar filtros";

    container.append(
        titulo,
        descricao,
        limpar
    );

    return {
        container,
        limpar
    };
}


/* =========================================
   ATUALIZAR BOTÕES DE CATEGORIA
========================================= */

function atualizarCategorias(botoes) {
    botoes.forEach(botao => {
        const ativo =
            botao.dataset.category === estadoFiltros.categoria;

        botao.classList.toggle("active", ativo);

        botao.classList.toggle(
            "button-primary",
            ativo
        );

        botao.classList.toggle(
            "button-outline",
            !ativo
        );

        botao.setAttribute(
            "aria-pressed",
            String(ativo)
        );
    });
}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros(
    registros,
    botoes,
    contador,
    avisoVazio
) {
    let quantidadeEncontrada = 0;

    registros.forEach(registro => {
        const visivel = produtoCorrespondeAosFiltros(
            registro.produto
        );

        registro.card.hidden = !visivel;

        if (visivel) {
            quantidadeEncontrada++;
        }
    });


    // ATUALIZAR CONTADOR

    contador.textContent =
        `${quantidadeEncontrada} ${
            quantidadeEncontrada === 1
                ? "produto encontrado"
                : "produtos encontrados"
        }`;


    // EXIBIR AVISO QUANDO NÃO HOUVER RESULTADOS

    avisoVazio.hidden = quantidadeEncontrada !== 0;


    // ATUALIZAR CATEGORIA SELECIONADA

    atualizarCategorias(botoes);
}


/* =========================================
   RENDERIZAR CARDÁPIO
========================================= */

export function renderizarCardapio() {
    const grade = document.getElementById(
        "product-grid"
    );

    if (!grade) {
        throw new Error(
            "Área do cardápio não encontrada."
        );
    }

    const produtos = listarProdutosDisponiveis();

    if (produtos.length === 0) {
        throw new Error(
            "Nenhum produto disponível."
        );
    }


    // REDEFINIR FILTROS

    estadoFiltros.categoria = "todos";

    estadoFiltros.pesquisa = "";


    // GERAR PRODUTOS

    const fragmento = document.createDocumentFragment();

    const registros = [];

    produtos.forEach((produto, indice) => {
        const card = criarCard(produto, indice);

        registros.push({
            produto,
            card
        });

        fragmento.appendChild(card);
    });


    // CRIAR CONTROLES DO CARDÁPIO

    const filtros = document.createElement("div");

    filtros.id = "menu-filters";

    filtros.className = "menu-filters";

    const pesquisa = criarPesquisa();

    const categorias = criarCategorias();

    const contador = criarContadorResultados();

    const avisoVazio = criarAvisoVazio();

    filtros.append(
        pesquisa.container,
        categorias.container,
        contador
    );


    // FUNÇÃO DE ATUALIZAÇÃO

    function atualizarFiltros() {
        aplicarFiltros(
            registros,
            categorias.botoes,
            contador,
            avisoVazio.container
        );
    }


    // EVENTO DA PESQUISA

    pesquisa.input.addEventListener("input", () => {
        estadoFiltros.pesquisa = pesquisa.input.value;

        atualizarFiltros();
    });


    // EVENTOS DAS CATEGORIAS

    categorias.botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            estadoFiltros.categoria =
                botao.dataset.category;

            atualizarFiltros();
        });
    });


    // LIMPAR FILTROS

    avisoVazio.limpar.addEventListener("click", () => {
        estadoFiltros.categoria = "todos";

        estadoFiltros.pesquisa = "";

        pesquisa.input.value = "";

        atualizarFiltros();

        pesquisa.input.focus();
    });


    // REMOVER CONTROLES ANTERIORES, SE EXISTIREM

    document.getElementById(
        "menu-filters"
    )?.remove();

    document.getElementById(
        "menu-empty"
    )?.remove();


    // INSERIR ELEMENTOS NA PÁGINA

    grade.before(filtros);

    grade.replaceChildren(fragmento);

    grade.after(avisoVazio.container);


    // APLICAR ESTADO INICIAL

    atualizarFiltros();

    return produtos.length;
}


/* =========================================
   FIM DO ARQUIVO
========================================= */
