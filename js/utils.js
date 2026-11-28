/* DEVWEB - Funcoes utilitarias */

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

export function formatarMoeda(centavos) {
    return formatadorMoeda.format(centavos / 100);
}

export function elementoPodeReceberFoco(elemento) {
    return (
        elemento instanceof HTMLElement &&
        elemento.isConnected &&
        !elemento.disabled &&
        elemento.getClientRects().length > 0 &&
        !elemento.closest("[hidden], [inert]") &&
        getComputedStyle(elemento).visibility === "visible"
    );
}

export function focarSemRolar(elemento) {
    if (!elementoPodeReceberFoco(elemento)) {
        return false;
    }

    elemento.focus({
        preventScroll: true
    });

    return document.activeElement === elemento;
}
