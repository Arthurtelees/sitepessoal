# Currículo em consoles — Arthur Teles

Um currículo que se joga. Em vez de um PDF, uma televisão: cada canal é uma geração de console
diferente, com a interface fiel daquela época, e o currículo inteiro mora dentro de cada uma.

**[arthur-teles.vercel.app](https://arthur-teles.vercel.app/)**

## A ideia

A tela abre em casa, hoje, com uma televisão ligada. Trocando de canal você viaja no tempo: cada
canal é um quarto diferente, de uma década diferente, com a mesma televisão — só que apagada. O
console daquela era está esperando ali, do lado dela. Clicar nele é o que liga tudo: a TV acende, a
abertura daquele console toca, e a interface aparece.

As eras sem interface de sistema própria viraram o **jogo** que marcou aquele console. As que
tinham interface de sistema, viraram a **própria interface**.

| Canal | Console | O que está lá |
| --- | --- | --- |
| 00 | Hoje | A entrada: quem eu sou, os links e o caminho pras outras eras |
| 01 | Atari 2600 (1977) | **Breakout**, jogável de verdade — cada fileira de tijolos é uma vaga ou uma formação |
| 02 | PlayStation (1994) | **Resident Evil 2** — o currículo como os arquivos, o mapa e a máquina de escrever do jogo |
| 03 | PlayStation 2 (2000) | **GTA San Andreas** — estatísticas, missões e territórios no lugar de skills, empregos e localização |
| 04 | PlayStation 3 (2006) | A **XrossMediaBar** — perfil, experiência, formação, competências e idiomas como categorias do menu |

## Como navegar

Teclado, mouse ou **controle** — os três funcionam em qualquer canal.

- **↑ / ↓** trocam de canal (ou de sala)
- **← / →** navegam dentro da tela atual
- **Enter** confirma, **Esc** volta
- O console de cada sala só liga com um **clique** — é o gesto que dá o play

## Conteúdo

Todo o currículo mora num único arquivo, `src/data/curriculo.json`: experiência, formação,
competências, idiomas e os dados de contato. Cada era lê dali — atualizar o JSON atualiza as
quatro ao mesmo tempo.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera a versão de produção em dist/
```

Stack: [Vite](https://vitejs.dev/) + [React](https://react.dev/), sem nenhuma outra dependência.
Todo o som é sintetizado em Web Audio, com duas exceções pontuais de amostras de trilha original.

## Aviso

Projeto autoral e sem fins comerciais, sem qualquer vínculo, patrocínio ou aprovação de Sony,
Atari, Capcom, Rockstar Games ou Take-Two. As eras recriadas aqui são homenagem aos jogos que
fizeram parte da minha infância — em nenhum momento houve intenção de copiar, redistribuir
comercialmente ou violar direito de ninguém. Marcas, obras e material original pertencem aos seus
respectivos titulares, e qualquer trecho apontado como indevido é retirado a pedido:
arthurnunesteles@gmail.com.

---

Arthur Teles · [LinkedIn](https://linkedin.com/in/arthur-teles-179145202) ·
[GitHub](https://github.com/Arthurtelees)
