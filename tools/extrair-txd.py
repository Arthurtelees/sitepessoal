"""
Extrai as texturas dos TXD do San Andreas em models/ e gera os assets do site.

    pip install Pillow
    python tools/extrair-txd.py

Produz:
    public/sa-capa.webp   painel do logo que fica no canto do menu (fronten2.txd: back8)
    public/sa-mapa.webp   mapa do jogo (fronten2.txd: map)

Os .txd nao vao para o build; so os .webp gerados aqui.
"""
import io
import os
import struct
import sys

from PIL import Image

SEC_TEXNATIVE, SEC_TXD = 0x15, 0x16
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def dds_dxt(fourcc, largura, altura, dados):
    flags = 0x1 | 0x2 | 0x4 | 0x1000 | 0x80000
    return struct.pack(
        '<4sIIIIIII44sII4sIIIIIIIIII',
        b'DDS ', 124, flags, altura, largura, len(dados), 0, 0, b'\x00' * 44,
        32, 0x4, fourcc, 0, 0, 0, 0, 0,
        0x1000, 0, 0, 0, 0,
    ) + dados


def ler_txd(caminho):
    f = io.BytesIO(open(caminho, 'rb').read())
    ler = lambda: struct.unpack('<III', f.read(12))

    tipo, _, _ = ler()
    if tipo != SEC_TXD:
        raise SystemExit(f'{caminho} nao e um TXD')

    _, tam, _ = ler()
    total = struct.unpack('<H', f.read(2))[0]
    f.read(tam - 2)

    texturas = {}
    for _ in range(total):
        tipo, tam, _ = ler()
        fim = f.tell() + tam
        if tipo != SEC_TEXNATIVE:
            f.seek(fim)
            continue

        ler()
        plataforma = struct.unpack('<I', f.read(4))[0]
        f.read(4)
        nome = f.read(32).split(b'\x00')[0].decode('latin-1')
        f.read(32)
        f.read(4)
        campo = f.read(4)
        largura, altura = struct.unpack('<HH', f.read(4))
        _, _, _, compressao = struct.unpack('<BBBB', f.read(4))
        tamanho = struct.unpack('<I', f.read(4))[0]
        bruto = f.read(tamanho)

        fourcc = campo if plataforma == 9 else {1: b'DXT1', 3: b'DXT3', 5: b'DXT5'}.get(compressao)
        if fourcc in (b'DXT1', b'DXT3', b'DXT5'):
            texturas[nome] = Image.open(io.BytesIO(dds_dxt(fourcc, largura, altura, bruto))).convert('RGB')
        f.seek(fim)

    return texturas


def recortar(img, limite=16):
    """Os paineis vem com preenchimento preto em volta da arte."""
    from PIL import ImageChops

    dif = ImageChops.difference(img, Image.new('RGB', img.size)).convert('L')
    caixa = dif.point(lambda p: 255 if p > limite else 0).getbbox()
    return img.crop(caixa) if caixa else img


def main():
    fronten2 = os.path.join(RAIZ, 'models', 'fronten2.txd')
    if not os.path.exists(fronten2):
        sys.exit('models/fronten2.txd nao encontrado')

    destino = os.path.join(RAIZ, 'public')
    texturas = ler_txd(fronten2)

    capa = recortar(texturas['back8'])
    caminho_capa = os.path.join(destino, 'sa-capa.webp')
    capa.save(caminho_capa, 'WEBP', quality=84, method=6)
    print(f'sa-capa.webp   {capa.size[0]}x{capa.size[1]}  {os.path.getsize(caminho_capa) // 1024} KB')

    mapa = os.path.join(destino, 'sa-mapa.webp')
    texturas['map'].save(mapa, 'WEBP', quality=82, method=6)
    print(f'sa-mapa.webp   {texturas["map"].size[0]}x{texturas["map"].size[1]}  {os.path.getsize(mapa) // 1024} KB')


if __name__ == '__main__':
    main()
