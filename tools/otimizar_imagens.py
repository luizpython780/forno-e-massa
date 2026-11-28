
"""
FORNO & MASSA
Ferramenta de otimização de imagens
Desenvolvido para o portfólio DevWeb.
"""

import argparse

from pathlib import Path
from io import BytesIO

from PIL import Image, ImageOps, features


# =========================================
# CONFIGURAÇÕES
# =========================================

RAIZ_PROJETO = Path(__file__).resolve().parent.parent

PASTA_ORIGINAIS = (
    RAIZ_PROJETO.parent
    / "forno-e-massa-imagens-originais"
)

PASTA_IMAGENS = RAIZ_PROJETO / "assets" / "images"

LARGURA = 800
ALTURA = 600

QUALIDADE_INICIAL = 85
QUALIDADE_MINIMA = 60

LIMITE_BYTES = 100 * 1024

FUNDO_BEBIDAS = (255, 255, 255)


# =========================================
# CATÁLOGO DE IMAGENS ESPERADAS
# =========================================

CATALOGO = {
    "pizzas/tradicionais": [
        "margherita",
        "pepperoni",
        "calabresa",
        "mucarela",
        "portuguesa",
        "frango-catupiry"
    ],

    "pizzas/especiais": [
        "especial-da-casa",
        "quatro-queijos",
        "parma",
        "burrata",
        "bacon-cheddar",
        "costela-barbecue"
    ],

    "pizzas/doces": [
        "chocolate",
        "chocolate-morango",
        "banana-canela",
        "romeu-julieta"
    ],

    "bebidas": [
        "coca-cola",
        "coca-cola-zero",
        "guarana",
        "suco-laranja",
        "agua-mineral",
        "agua-com-gas"
    ]
}


# =========================================
# ARGUMENTOS DO TERMINAL
# =========================================

def obter_argumentos():

    parser = argparse.ArgumentParser(
        description=(
            "Ferramenta de otimização "
            "de imagens da DevWeb."
        )
    )

    parser.add_argument(
        "--origem",
        type=Path,
        default=PASTA_ORIGINAIS,
        help="Pasta contendo as imagens PNG originais."
    )

    return parser.parse_args()


# =========================================
# VERIFICAR ARQUIVOS ORIGINAIS
# =========================================

def verificar_arquivos(pasta_origem):

    arquivos = []
    ausentes = []

    if not pasta_origem.is_dir():

        print("\nERRO: pasta de origem não encontrada.")

        print(pasta_origem)

        raise SystemExit(1)

    for categoria, produtos in CATALOGO.items():

        for produto in produtos:

            origem = (
                pasta_origem
                / categoria
                / f"{produto}.png"
            )

            destino = (
                PASTA_IMAGENS
                / categoria
                / f"{produto}.webp"
            )

            if origem.is_file():

                arquivos.append(
                    (origem, destino)
                )

            else:

                ausentes.append(origem)

    if ausentes:

        print("\nERRO: arquivos ausentes:\n")

        for arquivo in ausentes:

            print(arquivo)

        raise SystemExit(1)

    return arquivos


# =========================================
# FORMATAR TAMANHO
# =========================================

def formatar_tamanho(bytes_arquivo):

    return f"{bytes_arquivo / 1024:.2f} KiB"


# =========================================
# PREPARAR IMAGEM
# =========================================

def preparar_imagem(caminho):

    with Image.open(caminho) as original:

        imagem = ImageOps.exif_transpose(original)

        imagem = imagem.convert("RGB")

        # BEBIDAS:
        # Preservar a garrafa inteira.

        if caminho.parent.name == "bebidas":

            imagem.thumbnail(
                (LARGURA - 64, ALTURA - 64),
                Image.Resampling.LANCZOS
            )

            fundo = Image.new(
                "RGB",
                (LARGURA, ALTURA),
                FUNDO_BEBIDAS
            )

            x = (LARGURA - imagem.width) // 2

            y = (ALTURA - imagem.height) // 2

            fundo.paste(imagem, (x, y))

            imagem.close()

            return fundo

        # PIZZAS:
        # Preencher o card proporcionalmente.

        resultado = ImageOps.fit(
            imagem,
            (LARGURA, ALTURA),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5)
        )

        imagem.close()

        return resultado


# =========================================
# COMPRIMIR PARA WEBP
# =========================================

def comprimir_imagem(imagem):

    qualidade = QUALIDADE_INICIAL

    while True:

        with BytesIO() as buffer:

            imagem.save(
                buffer,
                format="WEBP",
                quality=qualidade,
                method=6
            )

            dados = buffer.getvalue()

        if (
            len(dados) <= LIMITE_BYTES
            or qualidade <= QUALIDADE_MINIMA
        ):

            return dados, qualidade

        qualidade = max(
            QUALIDADE_MINIMA,
            qualidade - 5
        )


# =========================================
# VALIDAR IMAGEM CONVERTIDA
# =========================================

def validar_imagem(dados):

    with Image.open(BytesIO(dados)) as imagem:

        if imagem.format != "WEBP":

            raise ValueError("Formato inválido.")

        if imagem.size != (LARGURA, ALTURA):

            raise ValueError("Dimensões inválidas.")

        imagem.load()


# =========================================
# SALVAR IMAGEM OTIMIZADA
# =========================================

def salvar_imagem(destino, dados):

    destino.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # Utilizar um arquivo temporário antes
    # de substituir a imagem definitiva.

    temporario = destino.with_suffix(".webp.tmp")

    try:

        temporario.write_bytes(dados)

        validar_imagem(
            temporario.read_bytes()
        )

        temporario.replace(destino)

    finally:

        if temporario.exists():

            temporario.unlink()


# =========================================
# PROCESSAMENTO PRINCIPAL
# =========================================

def main():

    argumentos = obter_argumentos()

    pasta_origem = argumentos.origem.resolve()

    print("=" * 65)
    print("DEVWEB - OTIMIZADOR DE IMAGENS")
    print("PROJETO: FORNO & MASSA")
    print("=" * 65)

    if not features.check("webp"):

        print("\nERRO: Pillow sem suporte ao WebP.")

        raise SystemExit(1)

    print(f"\nOrigem: {pasta_origem}")

    print(f"Destino: {PASTA_IMAGENS}")

    arquivos = verificar_arquivos(pasta_origem)

    print(f"\nImagens encontradas: {len(arquivos)}")
    print("Resolução final: 800 x 600")
    print("Formato final: WebP")
    print("Preservação dos arquivos PNG: SIM\n")

    total_original = 0
    total_otimizado = 0

    sucessos = 0
    falhas = 0
    acima_limite = 0

    for indice, arquivo in enumerate(
        arquivos,
        start=1
    ):

        origem, destino = arquivo

        try:

            tamanho_original = origem.stat().st_size

            imagem = preparar_imagem(origem)

            try:

                dados, qualidade = comprimir_imagem(imagem)

            finally:

                imagem.close()

            validar_imagem(dados)

            salvar_imagem(destino, dados)

            tamanho_otimizado = destino.stat().st_size

            total_original += tamanho_original

            total_otimizado += tamanho_otimizado

            sucessos += 1

            reducao = (
                1 - tamanho_otimizado / tamanho_original
            ) * 100

            print(
                f"[{indice:02d}/{len(arquivos)}] "
                f"{origem.stem}"
            )

            print(
                f"  Original: "
                f"{formatar_tamanho(tamanho_original)}"
            )

            print(
                f"  WebP: "
                f"{formatar_tamanho(tamanho_otimizado)}"
            )

            print(f"  Qualidade: {qualidade}")

            print(f"  Redução: {reducao:.2f}%")

            if tamanho_otimizado > LIMITE_BYTES:

                acima_limite += 1

                print(
                    "  AVISO: acima do tamanho desejado."
                )

            print()

        except Exception as erro:

            falhas += 1

            print(f"ERRO em {origem.name}: {erro}\n")

    print("=" * 65)
    print("RELATÓRIO FINAL")
    print("=" * 65)

    print(f"Imagens esperadas: {len(arquivos)}")

    print(f"Imagens convertidas: {sucessos}")

    print(f"Falhas: {falhas}")

    print(f"Imagens acima de 100 KiB: {acima_limite}")

    print(
        f"Tamanho original: "
        f"{formatar_tamanho(total_original)}"
    )

    print(
        f"Tamanho otimizado: "
        f"{formatar_tamanho(total_otimizado)}"
    )

    if total_original > 0:

        economia = total_original - total_otimizado

        percentual = (
            economia / total_original
        ) * 100

        print(
            f"Espaço economizado: "
            f"{formatar_tamanho(economia)}"
        )

        print(
            f"Redução total: {percentual:.2f}%"
        )

    print("\nArquivos PNG originais preservados.")

    if falhas == 0:

        print("PROCESSAMENTO CONCLUÍDO COM SUCESSO!")

    else:

        print("PROCESSAMENTO CONCLUÍDO COM FALHAS.")

    print("=" * 65)

    if falhas:

        raise SystemExit(1)


# =========================================
# EXECUÇÃO
# =========================================

if __name__ == "__main__":

    main()


# =========================================
# FIM DO ARQUIVO
# =========================================
