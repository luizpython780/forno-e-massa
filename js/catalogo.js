
/* =========================================
   FORNO & MASSA
   CATÁLOGO OFICIAL DEMONSTRATIVO
========================================= */


/* =========================================
   CONFIGURAÇÕES DE IMAGENS
========================================= */

const PASTA_IMAGENS = "assets/images";


/* =========================================
   CATEGORIAS
========================================= */

export const CATEGORIAS = [
    { id: "tradicionais", nome: "Tradicionais" },
    { id: "especiais", nome: "Especiais" },
    { id: "doces", nome: "Doces" },
    { id: "bebidas", nome: "Bebidas" }
];


/* =========================================
   TAMANHOS DAS PIZZAS
========================================= */

export const TAMANHOS = [
    {
        id: "P",
        nome: "Pequena",
        diametro: 25,
        fatias: 4
    },
    {
        id: "M",
        nome: "Média",
        diametro: 30,
        fatias: 6
    },
    {
        id: "G",
        nome: "Grande",
        diametro: 35,
        fatias: 8
    },
    {
        id: "GG",
        nome: "Gigante",
        diametro: 40,
        fatias: 12
    }
];


/* =========================================
   BORDAS
   Valores em centavos
========================================= */

export const BORDAS = [
    {
        id: "tradicional",
        nome: "Tradicional",
        precoCentavos: 0,
        grupos: ["salgada", "doce"]
    },
    {
        id: "catupiry",
        nome: "Catupiry",
        precoCentavos: 1000,
        grupos: ["salgada"]
    },
    {
        id: "cheddar",
        nome: "Cheddar",
        precoCentavos: 1200,
        grupos: ["salgada"]
    },
    {
        id: "chocolate",
        nome: "Chocolate",
        precoCentavos: 1200,
        grupos: ["doce"]
    },
    {
        id: "doce-de-leite",
        nome: "Doce de leite",
        precoCentavos: 1000,
        grupos: ["doce"]
    }
];


/* =========================================
   INGREDIENTES ADICIONAIS
========================================= */

export const ADICIONAIS = [
    {
        id: "mucarela-extra",
        nome: "Muçarela extra",
        precoCentavos: 800,
        grupo: "salgada"
    },
    {
        id: "bacon",
        nome: "Bacon",
        precoCentavos: 800,
        grupo: "salgada"
    },
    {
        id: "pepperoni",
        nome: "Pepperoni",
        precoCentavos: 900,
        grupo: "salgada"
    },
    {
        id: "catupiry",
        nome: "Catupiry",
        precoCentavos: 700,
        grupo: "salgada"
    },
    {
        id: "cheddar",
        nome: "Cheddar",
        precoCentavos: 700,
        grupo: "salgada"
    },
    {
        id: "azeitona",
        nome: "Azeitona",
        precoCentavos: 400,
        grupo: "salgada"
    },
    {
        id: "cebola",
        nome: "Cebola",
        precoCentavos: 300,
        grupo: "salgada"
    },
    {
        id: "chocolate-extra",
        nome: "Chocolate extra",
        precoCentavos: 800,
        grupo: "doce"
    },
    {
        id: "morango",
        nome: "Morango",
        precoCentavos: 700,
        grupo: "doce"
    },
    {
        id: "banana",
        nome: "Banana",
        precoCentavos: 500,
        grupo: "doce"
    },
    {
        id: "leite-condensado",
        nome: "Leite condensado",
        precoCentavos: 500,
        grupo: "doce"
    },
    {
        id: "doce-de-leite",
        nome: "Doce de leite",
        precoCentavos: 700,
        grupo: "doce"
    }
];


/* =========================================
   CAMINHOS DAS IMAGENS
========================================= */

function obterImagemPizza(id, categoria) {

    return `${PASTA_IMAGENS}/pizzas/${categoria}/${id}.webp`;
}

function obterImagemBebida(id) {

    return `${PASTA_IMAGENS}/bebidas/${id}.webp`;
}


/* =========================================
   FUNÇÕES DE CONSTRUÇÃO DOS PRODUTOS
========================================= */

function criarPizza(
    id,
    nome,
    categoria,
    descricao,
    precos,
    imagem = obterImagemPizza(id, categoria)
) {

    return {
        id,
        nome,
        tipo: "pizza",
        categoria,
        grupo: categoria === "doces" ? "doce" : "salgada",
        descricao,
        precos,
        imagem,
        personalizavel: true,
        disponivel: true
    };
}

function criarBebida(
    id,
    nome,
    descricao,
    volume,
    precoCentavos,
    imagem = obterImagemBebida(id)
) {

    return {
        id,
        nome,
        tipo: "bebida",
        categoria: "bebidas",
        descricao,
        volume,
        precos: {
            UN: precoCentavos
        },
        imagem,
        personalizavel: false,
        disponivel: true
    };
}


/* =========================================
   CATÁLOGO DE PRODUTOS
========================================= */

export const PRODUTOS = [

    /* =====================================
       PIZZAS TRADICIONAIS
    ===================================== */

    criarPizza(
        "margherita",
        "Margherita",
        "tradicionais",
        "Molho artesanal de tomate, muçarela, manjericão e azeite.",
        {
            P: 3200,
            M: 4200,
            G: 5200,
            GG: 6500
        }
    ),

    criarPizza(
        "pepperoni",
        "Pepperoni",
        "tradicionais",
        "Muçarela, pepperoni e molho artesanal da casa.",
        {
            P: 3900,
            M: 4900,
            G: 5900,
            GG: 7200
        }
    ),

    criarPizza(
        "calabresa",
        "Calabresa",
        "tradicionais",
        "Molho de tomate, muçarela, calabresa, cebola e orégano.",
        {
            P: 3500,
            M: 4500,
            G: 5500,
            GG: 6800
        }
    ),

    criarPizza(
        "mucarela",
        "Muçarela",
        "tradicionais",
        "Molho artesanal, muçarela selecionada e orégano.",
        {
            P: 3000,
            M: 4000,
            G: 5000,
            GG: 6300
        }
    ),

    criarPizza(
        "portuguesa",
        "Portuguesa",
        "tradicionais",
        "Muçarela, presunto, ovos, cebola, azeitonas e molho artesanal.",
        {
            P: 3800,
            M: 4800,
            G: 5800,
            GG: 7100
        }
    ),

    criarPizza(
        "frango-catupiry",
        "Frango com Catupiry",
        "tradicionais",
        "Frango desfiado temperado, muçarela e Catupiry.",
        {
            P: 3900,
            M: 4900,
            G: 5900,
            GG: 7200
        }
    ),


    /* =====================================
       PIZZAS ESPECIAIS
    ===================================== */

    criarPizza(
        "especial-da-casa",
        "Especial da Casa",
        "especiais",
        "Muçarela, bacon, calabresa, tomate, cebola e molho especial.",
        {
            P: 4400,
            M: 5400,
            G: 6400,
            GG: 7900
        }
    ),

    criarPizza(
        "quatro-queijos",
        "Quatro Queijos",
        "especiais",
        "Muçarela, parmesão, provolone e gorgonzola.",
        {
            P: 4500,
            M: 5500,
            G: 6500,
            GG: 8000
        }
    ),

    criarPizza(
        "parma",
        "Parma",
        "especiais",
        "Presunto de Parma, muçarela, rúcula e parmesão.",
        {
            P: 4900,
            M: 5900,
            G: 6900,
            GG: 8400
        }
    ),

    criarPizza(
        "burrata",
        "Burrata",
        "especiais",
        "Burrata cremosa, tomates-cereja, manjericão e azeite.",
        {
            P: 5200,
            M: 6200,
            G: 7200,
            GG: 8700
        }
    ),

    criarPizza(
        "bacon-cheddar",
        "Bacon com Cheddar",
        "especiais",
        "Muçarela, bacon crocante e cheddar cremoso.",
        {
            P: 4400,
            M: 5400,
            G: 6400,
            GG: 7900
        }
    ),

    criarPizza(
        "costela-barbecue",
        "Costela Barbecue",
        "especiais",
        "Costela desfiada, muçarela, cebola e molho barbecue.",
        {
            P: 4900,
            M: 5900,
            G: 6900,
            GG: 8400
        }
    ),


    /* =====================================
       PIZZAS DOCES
    ===================================== */

    criarPizza(
        "chocolate",
        "Chocolate",
        "doces",
        "Chocolate cremoso sobre nossa massa artesanal.",
        {
            P: 3200,
            M: 4200,
            G: 5200,
            GG: 6500
        }
    ),

    criarPizza(
        "chocolate-morango",
        "Chocolate com Morango",
        "doces",
        "Chocolate cremoso e morangos frescos.",
        {
            P: 3800,
            M: 4800,
            G: 5800,
            GG: 7100
        }
    ),

    criarPizza(
        "banana-canela",
        "Banana com Canela",
        "doces",
        "Bananas selecionadas, canela e leite condensado.",
        {
            P: 3000,
            M: 4000,
            G: 5000,
            GG: 6300
        }
    ),

    criarPizza(
        "romeu-julieta",
        "Romeu e Julieta",
        "doces",
        "Uma combinação clássica de queijo e goiabada.",
        {
            P: 3400,
            M: 4400,
            G: 5400,
            GG: 6700
        }
    ),


    /* =====================================
       BEBIDAS
    ===================================== */

    criarBebida(
        "coca-cola",
        "Coca-Cola",
        "Refrigerante Coca-Cola tradicional.",
        "2 L",
        1400
    ),

    criarBebida(
        "coca-cola-zero",
        "Coca-Cola Zero",
        "Refrigerante Coca-Cola sem açúcar.",
        "2 L",
        1400
    ),

    criarBebida(
        "guarana",
        "Guaraná",
        "Refrigerante de guaraná.",
        "2 L",
        1200
    ),

    criarBebida(
        "suco-laranja",
        "Suco de Laranja",
        "Suco de laranja.",
        "500 ml",
        1000
    ),

    criarBebida(
        "agua-mineral",
        "Água Mineral",
        "Água mineral sem gás.",
        "500 ml",
        400
    ),

    criarBebida(
        "agua-com-gas",
        "Água com Gás",
        "Água mineral gaseificada.",
        "500 ml",
        500
    )
];


/* =========================================
   CONSULTAS AO CATÁLOGO
========================================= */

export function buscarProduto(id) {

    return PRODUTOS.find(
        produto => produto.id === id
    ) || null;
}

export function listarProdutosDisponiveis() {

    return PRODUTOS.filter(
        produto => produto.disponivel
    );
}

export function listarProdutosPorCategoria(categoria) {

    return listarProdutosDisponiveis().filter(
        produto => produto.categoria === categoria
    );
}

export function listarBordasPermitidas(produtoId) {

    const produto = buscarProduto(produtoId);

    if (!produto || !produto.personalizavel) {
        return [];
    }

    return BORDAS.filter(
        borda => borda.grupos.includes(produto.grupo)
    );
}

export function listarAdicionaisPermitidos(produtoId) {

    const produto = buscarProduto(produtoId);

    if (!produto || !produto.personalizavel) {
        return [];
    }

    return ADICIONAIS.filter(
        adicional => adicional.grupo === produto.grupo
    );
}


/* =========================================
   FIM DO CATÁLOGO
========================================= */
