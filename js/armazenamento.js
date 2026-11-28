/* DEVWEB - Armazenamento local do carrinho */

export function criarArmazenamento(CONFIG) {
    let avisoStorageExibido = false;

    function quantidadeValida(quantidade) {
        return (
            Number.isInteger(quantidade) &&
            quantidade > 0 &&
            quantidade <= CONFIG.quantidadeMaxima
        );
    }

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

    function salvarCarrinho(carrinho, catalogoCompletoCarregado) {

        // PRESERVAR OS DADOS CASO O CATÁLOGO
        // COMPLETO ESTEJA INDISPONÍVEL.

        if (!catalogoCompletoCarregado) {
            return;
        }

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

    function carregarCarrinho(catalogo, carrinho) {

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

    return Object.freeze({ salvarCarrinho, carregarCarrinho });
}
