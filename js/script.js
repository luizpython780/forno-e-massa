/* DEVWEB - Inicializacao da aplicacao */

import { inicializarNavegacao } from "./navegacao.js";
import { inicializarCarrinho, carrinhoEstaAberto } from "./carrinho.js";

async function carregarCardapioDinamico() {
    try {
        const { renderizarCardapio } = await import("./cardapio.js");

        const quantidadeProdutos = renderizarCardapio();

        console.info(
            `[Forno & Massa] ${quantidadeProdutos} produtos carregados.`
        );

        return true;
    } catch (erro) {
        console.warn(
            "[Forno & Massa] Não foi possível carregar o catálogo completo.",
            erro
        );

        return false;
    }
}

async function inicializarAplicacao() {
    inicializarNavegacao(carrinhoEstaAberto);

    const catalogoCarregado = await carregarCardapioDinamico();

    inicializarCarrinho(catalogoCarregado);

    console.info("[Forno & Massa] Sistema inicializado.");
}

inicializarAplicacao();
