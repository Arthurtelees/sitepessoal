# Currículo em consoles — Arthur Teles

Currículo reinterpretado como a interface de cada geração de console.

A regra que organiza o projeto: **Atari, PS1 e PS2 não tinham dashboard**, então essas eras são
recriações de *jogos* que existiram de verdade. PS3, PS4 e PS5 seriam as *interfaces de sistema*
que o console realmente tinha.

| Era | Skin | Estado |
| --- | --- | --- |
| Canal 00 | A casa — a única TV ligada, com chamada, guia de canais e links | **pronto** |
| Atari 2600 | Breakout — jogo jogável onde cada fileira é uma vaga | **pronto** |
| PS1 | Resident Evil 2 — arquivos, mapa, máquina de escrever | **pronto** |
| PS2 | GTA San Andreas — stats, missões, territórios, casa segura | **pronto** |
| PS3 | XrossMediaBar — inicialização e o menu | **pronto** |

## O fluxo

```
liga a TV  →  canal 00  →  canal do console  →  a sala, TV apagada  →  clica no console  →  intro  →  a era

Atari: vídeo do console  →  menu  →  Breakout / currículo / trocar cartucho
PS1:  vídeo do console  →  aviso  →  título  →  porta  →  painel (FILE/MAP/SAVE/EXIT)
PS2:  vídeo do console  →  logo da Rockstar  →  títulos do jogo  →  menu
```

A corrente completa do PS2 leva cerca de **2 minutos** se ninguém pular nada: 17 s de console,
15 s de logo e 89 s de títulos.

### Os números com a cara de cada era

A faixa 00–04 flutua sobre toda sala, e cada número **carrega a identidade da sua própria era, não
da era em que você está agora** — o `00` é sempre a pílula ciano arredondada do canal 00, o `01` é
sempre o quadrado laranja de borda grossa em Silkscreen do Atari, o `02` o verde de fósforo do PS1,
o `03` o dourado itálico do PS2, o `04` o branco fino do PS3. Só a cor de preenchimento muda,
indicando qual está ativo.

Isso exigiu uma correção de especificidade CSS: o seletor genérico `.canais-faixa button` (uma
classe + um elemento) tem mais peso que `.num-atari` (uma classe só), então mesmo com a regra certa
escrita, o número não trocava de cara — ficava todo com o estilo genérico. A correção foi prefixar
cada regra com `.canais-faixa .num-atari` etc., duas classes, que pesa mais.

## Ligar o console

Sintonizar um canal não leva direto para a era: leva para **a sala com a televisão apagada**. O
vidro fica escuro, o quarto continua aceso, e o console daquela época tem um brilho pulsando por
cima. Clicar nele liga a TV e a abertura começa.

`salas.js` guarda, para cada sala, a caixa do console em pixels da própria foto:

| era | console na foto | área clicável em 1920x1080 |
| --- | --- | --- |
| Atari | x 513, y 500, 380x110 | 769x193 |
| PS1 | x 999, y 492, 278x82 | 420x144 |
| PS2 | x 452, y 392, 192x45 | 346x81 |
| PS3 | x 356, y 490, 252x77 | 495x132 |

A área clicável é a **interseção da caixa com o que a janela mostra da foto**, calculada em tempo
real — em tela pequena o recorte come parte do móvel, e uma caixa fixa cairia fora da vista. Se
sobrar menos de 40x24 px, entra um botão de reserva no rodapé.

**Liga só o clique de mouse ou toque no console — nenhuma tecla, nenhum gamepad.** Isso foi decisão
explícita: teclado e controle continuam trocando de canal e navegando o resto da interface, mas o
gesto de ligar é físico de propósito, e abrir uma exceção por Enter esvaziava a ideia. O elemento
do console é um `<div role="button" tabIndex={-1}>`, não um `<button>` — um `<button>` real dispara
com Enter/Espaço sempre que ganha foco, então bastava alguém tabular até ele para ligar sem clicar.
Sem `tabIndex`, ele nunca entra na ordem de tab e nunca recebe esse foco. O único jeito de ligar é
um clique de verdade.

### A TV apagada de verdade

Enquanto o console não é ligado, **nada é desenhado sobre o vidro**: sem varredura, sem cintilação,
sem conteúdo. O `App` não monta a camada `.crt` nessa fase — era ela que fazia a televisão parecer
ligada e piscando com a tela em branco.

E o vidro recebe um **escuro de vidro morto** em vez de transparência. Deixar transparente seria
mais bonito (apareceria o vidro real da foto), mas a foto do Atari tem a televisão **ligada, com um
jogo na tela** — a transparência deixava o Combat à mostra. Nas outras três o vidro da foto é preto
de verdade, então o escuro por cima é indistinguível.

### A dica só aparece se precisar

O brilho pulsando no console é o único convite no começo. A frase entra **depois de 10 segundos de
espera** ou **assim que a pessoa clica em qualquer lugar que não seja o console** — uma camada
invisível cobre o resto da cena só para captar esse clique.

Quando entra, ela fica ancorada **acima do console**, com uma seta apontando para ele, e também é
clicável. O eixo horizontal é limitado a 170 px das bordas, senão nas salas em que o console fica
no canto (PS2 e PS3, ambos à esquerda) a caixa sairia da tela.

**E isso conserta a coisa mais feia que o projeto tinha.** O navegador não deixa vídeo com som
tocar sem um gesto do usuário, então antes aparecia um cartaz solto no preto dizendo "CLIQUE PARA
LIGAR O CONSOLE" — a única tela que admitia ser um site. Agora o gesto obrigatório **é** o ato de
ligar o console: o navegador ganha o clique que exige e o visitante ganha um gesto que existe
dentro da ficção. Um clique só, e a intro já entra com som.

Efeito colateral: as telas de "pressione qualquer tecla para ligar" que cada era tinha por dentro
nunca mais aparecem, porque o áudio já está liberado quando a era monta. Ficaram no código como
rede, mas são inalcançáveis pelo fluxo normal.

## A porta de entrada: trocar de sala

A tela de seleção **não é uma tela**: é a própria sala. Trocar de canal troca o quarto — você
atravessa os anos 70 do Atari, o quarto de 90 do PS1, a tarde de 2000 do PS2 e a noite de 2008 do
PS3 — e em todos eles **a televisão está apagada**. A identificação do canal flutua sobre a cena,
não dentro do tubo, porque um tubo apagado não tem OSD.

O canal 00 é a exceção: ali a TV de 2026 está ligada, porque é a casa, é onde a página abre —
e é a primeira coisa que qualquer visitante vê. Por isso ela é a mais reescrita do projeto: no
formato final, a chamada inteira é uma frase ("Seu currículo, em quatro eras.") mais um subtítulo
de sete palavras, uma ação preenchida e quatro links soltos. O que ocupava a segunda metade da
tela — antes um guia de canais listando as eras — saiu de lá, porque os números já vivem em cima
da cena em todo canal (ver "Os números com a cara de cada era" abaixo) e repetir a lista dentro do
canal 00 era redundante.

No lugar entrou um **eixo do tempo**: os quatro anos das eras (1977, 1994, 2000, 2006) numa linha
horizontal terminando em "hoje — você está aqui". Ele mostra a mesma ideia da frase de abertura sem
precisar escrevê-la de novo, e cada marca é clicável — clicar em 1977 leva direto pro canal do
Atari.

Ligar acontece **uma vez só**, no console — e o console é a **única** porta de entrada. Não existe
atalho: o número do canal só troca de canal, o botão do canal 00 leva ao canal 01 em vez de entrar
na era, e trocar de era por dentro (pela lista de consoles de outra era) também passa pela sala.
Venha de onde vier, você liga o console.

Antes disso a sequência era ligada → desliga → liga: a prévia rodava, sintonizar colapsava o tubo
como se estivesse desligando, e só então você ligava o console. Agora é apagada → **acende** →
ligada.

### A televisão acendendo

Entre o clique no console e a abertura entra uma fase curta em que **o vidro ganha vida**. Nas eras
de tubo é o colapso clássico: uma linha de luz horizontal que abre em 1 s, com o *clunk* do flyback
e a chiadeira de degauss. No painel plano do PS3 é um fade com estouro de brilho em 0,7 s. Só
depois disso o vídeo entra.

Sem essa fase o clique no console cortava direto para o vídeo, e a televisão nunca parecia ligar.

O que isso custou: as **prévias animadas** de cada canal (o Breakout jogando sozinho num canvas, o
painel de Resident Evil com o EKG batendo, o menu do San Andreas, a onda da XMB) e todo o
tratamento de tubo da tela de seleção — o ligar em 1,15 s, a estática de troca de canal, a
re-varredura, o "SEM SINAL". Com a televisão apagada nada disso tem onde acontecer. Saíram
`Selecao.jsx`, `Estatica.jsx`, as quatro prévias e cinco sons.

## Ligar o console

Sintonizar um canal não leva direto para a era: leva para **a sala com a televisão apagada**. O
vidro fica escuro, o quarto continua aceso, e o console daquela época tem um brilho pulsando por
cima. Clicar nele liga a TV e a abertura começa.

`salas.js` guarda, para cada sala, a caixa do console em pixels da própria foto:

| era | console na foto | área clicável em 1920x1080 |
| --- | --- | --- |
| Atari | x 513, y 500, 380x110 | 769x193 |
| PS1 | x 999, y 492, 278x82 | 420x144 |
| PS2 | x 452, y 392, 192x45 | 346x81 |
| PS3 | x 356, y 490, 252x77 | 495x132 |

A área clicável é a **interseção da caixa com o que a janela mostra da foto**, calculada em tempo
real — em tela pequena o recorte come parte do móvel, e uma caixa fixa cairia fora da vista. Se
sobrar menos de 40x24 px, entra um botão de reserva no rodapé. Qualquer tecla ou botão de gamepad
também liga, senão quem joga de controle ficaria preso.

### A TV apagada de verdade

Enquanto o console não é ligado, **nada é desenhado sobre o vidro**: sem varredura, sem cintilação,
sem conteúdo. O `App` não monta a camada `.crt` nessa fase — era ela que fazia a televisão parecer
ligada e piscando com a tela em branco.

E o vidro recebe um **escuro de vidro morto** em vez de transparência. Deixar transparente seria
mais bonito (apareceria o vidro real da foto), mas a foto do Atari tem a televisão **ligada, com um
jogo na tela** — a transparência deixava o Combat à mostra. Nas outras três o vidro da foto é preto
de verdade, então o escuro por cima é indistinguível.

### A dica só aparece se precisar

O brilho pulsando no console é o único convite no começo. A frase entra **depois de 10 segundos de
espera** ou **assim que a pessoa clica em qualquer lugar que não seja o console** — uma camada
invisível cobre o resto da cena só para captar esse clique.

Quando entra, ela fica ancorada **acima do console**, com uma seta apontando para ele, e também é
clicável. O eixo horizontal é limitado a 170 px das bordas, senão nas salas em que o console fica
no canto (PS2 e PS3, ambos à esquerda) a caixa sairia da tela.

**E isso conserta a coisa mais feia que o projeto tinha.** O navegador não deixa vídeo com som
tocar sem um gesto do usuário, então antes aparecia um cartaz solto no preto dizendo "CLIQUE PARA
LIGAR O CONSOLE" — a única tela que admitia ser um site. Agora o gesto obrigatório **é** o ato de
ligar o console: o navegador ganha o clique que exige e o visitante ganha um gesto que existe
dentro da ficção. Um clique só, e a intro já entra com som.

Efeito colateral: as telas de "pressione qualquer tecla para ligar" que cada era tinha por dentro
nunca mais aparecem, porque o áudio já está liberado quando a era monta. Ficaram no código como
rede, mas são inalcançáveis pelo fluxo normal.

## A porta de entrada: uma televisão

A tela de seleção não é uma lista de cards — é **uma TV onde você troca de canal**. Cada console
é um canal, e cada canal mostra uma **prévia ao vivo e animada** daquela era: o canal 1 tem o
Breakout jogando sozinho num canvas, o 2 tem o painel de Resident Evil com o EKG batendo, o
3 tem o menu do San Andreas. **As eras que ainda não existem são canais fora do ar**, com
chuvisco de verdade gerado quadro a quadro.

### Ligar o tubo

Abrir a página **liga a televisão**, em 1,15 s de sequência: um instante de preto, o estouro do
feixe numa linha horizontal incandescente, a linha abrindo em banda fina cheia de chuvisco, o
brilho de fósforo saturando a tela e a imagem estabilizando com um leve overshoot vertical, do
jeito que um CRT sacode antes de firmar. Vem com o *clunk* do flyback e a chiadeira de degauss
descendo — sintetizados, como todo o resto (`sfxLiga`). No primeiro acesso o som não toca, porque
o navegador só libera áudio depois de um clique; **voltando de uma era, aí sim tem som.** Qualquer
tecla ou clique corta a sequência.

### Canal 00: início de transmissão

O canal onde a TV liga não é um console — é a casa. Duas colunas assimétricas sobre um painel
widescreen de 890x480: à esquerda a **fala** (a chamada, um parágrafo e as ações), à direita o
**guia de canais**.

O guia é a peça que dá identidade de televisão à tela: número do canal, nome do console, o jogo
que está no ar e o ano, com um tique da cor daquela era na lateral. Ele sai direto de `CONSOLES`
em `src/lib/consoles.js` — acrescentar uma era aparece ali sozinho.

As ações têm **hierarquia de verdade**, e isso é deliberado: uma só é preenchida (começar pelo
canal 01) e as outras quatro são texto discreto com uma seta (PDF, LinkedIn, site, GitHub). A
versão anterior desta tela tinha cinco cartões idênticos em fileira, um rótulo em caixa alta
espaçada acima do título e gradientes radiais nos cantos — o vocabulário de landing page genérica.
Foi refeita justamente para sair dele.

Neste canal o teclado muda de papel: **←→ andam pelas ações** e **↑↓ trocam de canal**, como
canal+/canal− de controle remoto. Enter aciona a ação selecionada. Funciona igual no gamepad.

No pé da tela fica o **aviso legal**, de propósito no menor corpo da página: projeto autoral, sem
fins comerciais, sem vínculo com as detentoras das marcas, as eras são homenagem a jogos da
infância, e qualquer trecho apontado como indevido sai a pedido — com o e-mail de contato tirado
do JSON. Ele está lá para existir, não para ser lido.

Trocar de canal dá um estouro de estática com rolagem vertical e ruído sintetizado. Sintonizar
faz o tubo colapsar numa linha horizontal e apagar, como um CRT sendo desligado, antes de a era
carregar. O ligar da página faz o inverso.

O menu de seleção também é ele que captura o clique que o navegador exige
para liberar o áudio. Depois dele a intro toca sozinha, com som, e ao terminar (ou ao ser
pulada com Enter/Esc/clique) cai direto na era.

A abertura de console é responsabilidade **só do vídeo** — o que vem depois dele já é do jogo,
não do console.

Durante um vídeo, Enter, Esc ou clique **pausam e pedem confirmação** antes de pular, com
"continuar assistindo" como opção padrão. As telas que não são vídeo (aviso, disco, título)
continuam pulando direto.

## A sala em volta da TV

O palco é travado em 4:3, então num monitor 16:9 sobrava **25% da tela em preto** (44% num
ultrawide). A moldura resolve isso: o que era preto agora é a televisão e o quarto onde ela está.

Cada era tem a sua sala, em foto (`src/cena/`):

| ambiente | foto | o que aparece |
| --- | --- | --- |
| `anos70` (Atari) | `public/sala-atari.webp` | TV de tubo em madeira, knobs, antena, painel de madeira, cartuchos, poltrona |
| `anos90` (PS1) | `public/sala-ps1.webp` | TV cinza-bege, rack de melamina, fitas VHS, jewel cases, caixa de som |
| `anos2000` (PS2) | `public/sala-ps2.webp` | TV flat prateada, sol de tarde pela cortina fechada, console com LED azul, copo e prato |
| PS3 | `public/sala-ps3.webp` | LED de 2010 com moldura fina preta brilhante e LED azul, rack de vidro, console deitado com o controle em cima, receptor de relógio verde, persiana e luminária. Vidro em x 542, y 100, 532x371 |
| canal 00 | `public/sala-tv2026.webp` | painel gigante sem moldura de 2026, bias light na parede, rack de carvalho, soundbar |

`FOTO_DO_AMBIENTE` em `salas.js` é quem decide qual foto cada canal usa, e é só ali que se muda.

**A foto não é papel de parede — ela é a moldura.** `src/cena/salas.js` guarda, para cada
imagem, o retângulo exato do tubo em pixels da própria foto, e `geometria()` calcula onde esse
retângulo cai na janela e encaixa o palco de 640x480 dentro dele. O tubo das duas fotos é um
pouco mais alto que 4:3, então o palco entra pela largura e sobra uma nesga de preto em cima e
embaixo — que é o *underscan* que CRT de verdade tinha.

O zoom é calculado para o **palco ocupar 50% da altura da janela** (`alvo` em `Cena.jsx`).
Repare que o alvo é a altura do *palco*, não a do tubo: os três tubos têm proporção diferente
(1,27 no Atari, 1,27 no PS1, 1,45 no PS2), então mirar o tubo fazia o palco mudar de tamanho a
cada canal. Mirando o palco, ele sai **720x540 idêntico em todos os canais** numa janela de
1920x1080.

Subir o alvo dá tela maior e sala menor; descer, o contrário. 0.50 é onde a mobília ainda se lê e
o texto do canal 00 ainda é legível. Em janela pequena o alvo sobe para 0.86 e a sala
praticamente desaparece, porque aí tela é o que importa.

O tubo do PS2 é mais largo que 4:3, então nesse canal o palco entra pela altura e sobra uma tarja
preta fina nos dois lados — o *pillarbox* que um CRT flat widescreen fazia com conteúdo 4:3. Nos
outros dois é o contrário: entra pela largura e sobra em cima e embaixo.

### Cada TV tem o seu palco

O palco **não é 640x480 em todos os canais**. Cada sala declara o seu em `salas.js`:

| canal | palco | por quê |
| --- | --- | --- |
| Atari, PS1, PS2 | 640x480 | as eras são feitas para 4:3 e o tubo daquelas TVs é 4:3 |
| canal 00 | 890x480 | a proporção exata do painel de 2026 |
| PS3 | 688x480 | a proporção exata do vidro do LED de 2010 daquela sala (1,434) |

O PS3 usar palco widescreen não é acidente: **a XMB é uma interface 16:9.** Numa caixa 4:3 ela
ficaria errada — e a época ajuda, porque 2006–2010 é exatamente quando o tubo virou tela plana.

**O palco de cada era tem que ter a proporção do vidro da TV daquela sala, não a proporção
"correta" da interface.** Se não tiver, sobra tarja preta dentro da tela. Nas eras de tubo isso
passa despercebido porque a interface é escura e a tarja preta se funde com ela — mas a XMB é
cinza, e ali qualquer sobra salta aos olhos. Foi o que aconteceu na primeira versão desta sala:
o palco era 890x480 (1,854), o vidro é 1,636, e ficava uma moldura preta em volta da XMba.

**Como medir a tela quando a moldura é preta brilhante.** Errei essa medida quatro vezes antes
de acertar, sempre pelo mesmo motivo: tentei achar a borda por limiar de brilho, e naquela TV
existem *três* regiões escuras encostadas — o chassi preto brilhante, o lábio interno da moldura e
o vidro. Nenhum limiar as separa, e ajustar o limiar só troca qual delas você mede.

O que resolve é **imprimir o perfil de brilho ao longo de uma linha e de uma coluna do centro** e
ler a estrutura inteira de uma vez. Aí ela fica óbvia:

```
coluna x=800          linha y=280
  70..82   114-116     500..512   164     <- moldura, claro
  86..98    14-21      516..540   13-58   <- lábio interno
 102..471    0-8       544..1044   0-2    <- VIDRO
 474..486   35-104    1048..1072   5-14   <- lábio interno
                      1076..       120    <- moldura, claro
```

O lábio interno tem **25 px de cada lado, simétrico** — é a mesma assinatura à esquerda e à
direita, e foi isso que confirmou a leitura. Vidro: `x 544, y 102, 501x370`.

**E a TV não está torta.** Cheguei a medir as quatro bordas por regressão, achei uma perspectiva de
15% de diferença de altura entre os lados, implementei uma homografia em `matrix3d`… e estava tudo
errado: o detector tinha agarrado o chassi, não o vidro. Desenhar o quadrilátero medido sobre a
foto foi o que revelou o engano. A homografia foi removida. **Se a estrutura parecer torta, é a
medição que está errada, não a foto.**

### O que finalmente resolveu: medir no render, não na foto

Depois de errar quatro vezes medindo a foto, o que fechou a questão foi medir o **resultado
renderizado**. O método: recortar uma faixa de 4 px cruzando cada borda da `.tela` na página e
imprimir o perfil de luminância. Aí a resposta é direta — ou o cinza da interface encosta no
gabinete, ou tem preto no meio, e o número diz quantos pixels.

Foi assim que apareceram as duas causas reais:

**1. A vinheta era minha.** A `.tela` tinha `box-shadow: inset 0 0 26px rgba(0,0,0,0.85)` e o
`.tela-brilho` mais `inset 0 0 38px`. Em tubo isso é certo — a tela escurece nas beiradas de
verdade. Em painel plano é errado, e era ela que pintava uma faixa preta de 17 px por dentro de
todas as bordas. Virou opcional: `plana: true` em `salas.js` desliga (o PS3 usa).

**2. A borda direita do vidro ia mais longe do que eu media.** O perfil mostrou 59 px de preto
puro à direita antes do gabinete claro aparecer. Aquela faixa que eu tinha classificado como
"lábio interno" era vidro. Com a borda estendida de 1045 para 1074, o cinza passou a encostar
direto no gabinete: `-1:75  +1:22  +3:72  +4:112` — cinza, e logo o metal.

### Zoom por sala

`salas.js` aceita um `alvo` por sala, que sobrepõe o global. O PS3 usa **0,68** em vez de 0,50: o
vidro daquela TV é grande dentro do quadro, então com o alvo global a tela ficava longe e o texto
da XMB — que é interface de TV, projetada para ser lida de longe — ficava pequeno demais no
monitor. Com 0,68 o palco sai 1043x734 numa janela de 1920x1080.

Isso é o que faz a viagem no tempo funcionar de verdade: o próprio **formato da imagem** muda
quando você troca de canal. Sai de um painel widescreen de 2026 e cai numa caixa 4:3 dentro de um
tubo. Numa janela de 1920x1080 o canal 00 dá um palco de 1302x702 e as eras dão 720x540 — a TV de
hoje é enorme e o tubo é pequeno, que é exatamente a diferença real entre as duas épocas.

## A televisão inteira muda de época

Não é só a sala e o gabinete: a **cromagem da própria interface** troca junto com o canal. A
`Selecao` põe uma classe `epoca-*` na raiz e o CSS faz o resto.

| | canal 00 | Atari | PS1 | PS2 | PS3 |
| --- | --- | --- | --- | --- | --- |
| botões de canal | pílulas, ativo em ciano cheio | blocos quadrados, borda de 3px, laranja | quadrados, verde de fósforo, brilho interno | prata em gradiente, itálico, ativo em âmbar | translúcidos, ativo em branco sobre verde |
| tipografia | Saira | Silkscreen | Silkscreen | Saira itálico | Saira light |
| OSD do canal | escondido — a tela de hoje tem cabeçalho próprio | fonte de pixel | padrão | padrão | Saira, fundo verde |
| varredura de CRT | **nenhuma** | forte | forte | suave | **nenhuma** (era HDMI) |

As transições entre canais são as duas coisas de largura de banda que faltavam:

**Indo para um canal de tubo** (`troca-tubo`, 460 ms): o tubo colapsa numa faixa de estática
incandescente e reabre com um leve overshoot vertical — uma re-varredura. Vem com o *clunk* do
flyback e a chiadeira de degauss.

**Voltando para o canal 00** (`troca-hoje`, 320 ms): não tem colapso nenhum. É um corte limpo com
um estouro curto de brilho e um blip de dois tons, do jeito que painel digital troca de fonte.

O **ligar** segue a mesma regra: a página abre no canal 00, que é painel de 2026, então o ligar é
um fade com bloom frio de 0,82 s e um acorde de três notas subindo. O colapso de tubo de 1,15 s
só aparece se a página abrir num canal de era.

A foto entra em **duas camadas**: `.foto-fundo`, borrada, e `.foto-nitida`, nítida e recortada
por uma máscara elíptica em volta da TV (`tv` em `salas.js`). Assim o gabinete fica em foco e o
quarto desfocado, sem precisar de duas imagens. O borrão é proporcional ao zoom, então não muda
de aparência conforme a janela.

Se a foto que falta é a de um palco largo (canal 00), o gabinete desenhado não serve — o vidro
dele é 4:3. Nesse caso entra uma **moldura lisa** que preserva a proporção do palco, para o layout
da tela de hoje não amassar.

**Se uma foto de palco 4:3 faltar ou falhar em carregar, entra a sala desenhada em CSS** — parede, móvel,
gabinete e os objetos da época, tudo em gradiente. É o mesmo padrão do `retrato.png` e do
`sa-menu.wav`: nada quebra por falta de asset. As paletas de cada época estão no topo de
`cena.css` como custom properties, e a troca de canal faz crossfade entre elas.

A `.tela` é **um só elemento para os dois modos**, posicionado em pixels da janela. Isso não é
detalhe de estilo: enquanto a foto e o desenho eram componentes diferentes *em volta* do
`children`, trocar de canal desmontava a `Selecao` e o canal voltava para o zero.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Onde mexer

**Todo o conteúdo do currículo vive em `src/data/curriculo.json`.** É a fonte única: quando as
outras quatro eras existirem, todas vão ler desse mesmo arquivo. Editar o JSON atualiza tudo.

- `experiencia[].arquivo.paginas` — o texto de cada documento do PS1, quebrado em páginas
- `experiencia[].missao` — codinome, objetivos e recompensa que o PS2 mostra em BRIEF
- `itens` — as competências. Viram barras de STATS no PS2 e tecnologias flutuando no Atari. **A
  aba ITEM do PS1 foi removida**, então elas não aparecem mais naquela era; `itens[].icone` ficou
  sem uso, e `combinacoes` sobrou só como número no painel de STATS do PS2

**Tela de título do PS1:** a entrada é **coreografada em cima do envelope de
`public/re2-titulo.mp3`**. Medi a amostra: o impacto está em 0 s, o pico em 0,25 s, o decaimento
vai até 2,5 s e a cauda até 3,6 s. Então o som dispara no instante em que a tela monta (sem
compensação, porque o ataque não tem atraso), o logo entra estourado de brilho e escala 1,085 com
um clarão por cima, e vai assentando conforme o som decai — `title-entra` dura 2,4 s e
`title-clarao` 1,5 s. O `PRESSIONE START` só aparece em 1,5 s, quando o som já baixou.

Se a amostra ainda não tiver decodificado, a tela tenta de novo em 380 ms antes de cair no som
sintetizado de reserva. E `sfxTituloRe2` tem trava de 1,2 s: sem ela o StrictMode do React toca a
abertura duas vezes em desenvolvimento.

**Retrato do painel de status:** `public/retrato.png` (400x400), no vão do painel de status do
PS1 — onde antes ficava uma silhueta desenhada em SVG. A cabeça acompanha o mouse com um leve
deslocamento (±7 px na horizontal, ±5 px na vertical) e o recorte é `object-position: 50% 22%`,
que enquadra o rosto no vão de 150x201. Por cima passam as scanlines do painel e um tratamento
de dessaturação para casar com o verde da era. Pupila seguindo o cursor foi descartada de
propósito: o retrato aparece pequeno, então cada olho tem cerca de 2 px e o movimento seria
invisível. Se o arquivo sumir, volta a silhueta em SVG e nada quebra.
- `itens[].nivel` — **os números das barras do PS2 são um chute calibrado pelo currículo.**
  Ajuste como achar justo; o "PROGRESSO" do topo é a média deles
- `combinacoes` — os pares de itens que se combinam (Java + Spring Boot, React + Next.js…)
- `mapa.salas` — coordenadas da planta do PS1
- `territorios.zonas` — coordenadas do mapa do Plano Piloto no PS2

## Trocando de era

Cada era tem sua própria porta de saída: `TROCAR CARTUCHO` no Atari, aba `EXIT` no PS1 e
`QUIT` no PS2. A URL também aceita deep link: `#atari`, `#ps1` e `#ps2` abrem direto na era,
o que dá link compartilhável por geração.

As três listas terminam em **`VOLTAR PRA TELEVISÃO`**, que desliga a era e liga a TV de novo no
canal 00 — sem esse item a tela inicial só apareceria uma vez por visita. A entrada vem de
`VOLTAR_TV` em `src/lib/consoles.js` e a lista que as eras percorrem é `COM_TV`; `CONSOLES`
continua sendo só os consoles, que é o que alimenta os deep links e as contagens.

O `App.jsx` reduz o efeito de CRT conforme a geração avança: varredura forte no Atari e no PS1,
bem mais suave no PS2, que já era a era do cabo componente.

**Foto:** o painel de status do PS1 usa `public/retrato.png`. Trocar o arquivo (mantendo o nome)
é o suficiente; sem ele, aparece a silhueta.

**PDF:** `public/arthur_teles_curriculo.pdf` é o que a aba SAVE baixa. Substituir o arquivo
(mantendo o nome, ou mudando `pdf` no JSON) é o suficiente.

**Texturas do San Andreas:** `models/fronten2.txd` e `models/txd/LOADSCS.txd` são os arquivos
originais do jogo, em formato RenderWare. Não vão para o build — o script abaixo extrai o que
o site usa:

```bash
pip install Pillow
python tools/extrair-txd.py
```

Ele gera `public/sa-capa.webp` (o painel do logo que fica no canto superior direito do menu,
50 KB) e `public/sa-mapa.webp` (o mapa do jogo usado em Territórios, 78 KB). O `LOADSCS.txd`
tem as 14 artes sépia de tela de carregamento e o logo do jogo, extraíveis pelo mesmo parser
se um dia forem usadas.

O layout do menu segue o print de referência do jogo: fundo preto, título em letra gótica no
canto superior esquerdo, painel do logo no canto superior direito e lista vertical centralizada
com o cursor em cruz ao lado do item ativo. Entrar numa seção troca o título e o conteúdo
ocupa a tela; Esc volta para a lista.

**Intros:** ficam em `public/`, quatro vídeos:

| arquivo | o que é | duração |
| --- | --- | --- |
| `intro-atari.*` | abertura do Atari 2600 | 12 s |
| `intro-ps1.*` | abertura do PlayStation | 15 s |
| `intro-ps2.*` | abertura do PlayStation 2 | 17 s |
| `intro-ps3.*` | abertura do PlayStation 3 | 12 s · **não pode ser pulada** |
| `intro-sa-logo.*` | logo da Rockstar Games | 15 s |
| `intro-sa-titulos.*` | títulos de abertura do San Andreas | 89 s |

Quem monta a fila é o componente `Intro`, que recebe uma lista de nomes e toca um atrás do
outro. O `App` passa `[era]`; o `Ps2` passa `['sa-logo', 'sa-titulos']`.

Os originais em `.mkv` e `.mpg` foram apagados depois da conversão: um corte de duração pode
ser feito direto no `.webm`/`.mp4` com `-c copy`, sem perda, então os masters não fazem falta.
Cada intro existe em dois formatos, e o navegador escolhe o primeiro que consegue tocar:

- `.webm` (VP9 + Opus, 720p) — Chrome, Firefox, Edge e Safari novo
- `.mp4` (H.264 + AAC, 720p) — fallback para Safari antigo

Para trocar um vídeo, converta o novo para os dois formatos e mantenha os nomes. O comando
usado foi:

```bash
ffmpeg -i entrada.mkv -c:v libvpx-vp9 -crf 33 -b:v 0 -vf scale=1280:-2 \
  -row-mt 1 -deadline good -cpu-used 2 -c:a libopus -b:a 96k public/intro-psN.webm

ffmpeg -i entrada.mkv -c:v libx264 -crf 24 -preset medium -vf scale=1280:-2 \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart public/intro-psN.mp4
```

Se o vídeo falhar ou travar, o player entra na era mesmo assim — a intro nunca bloqueia o
acesso ao currículo.

## Estrutura

```
src/
  data/curriculo.json     fonte única de conteúdo
  lib/audio.js            todos os sons, sintetizados em Web Audio
  lib/useInput.js         teclado + gamepad na mesma interface de ações
  App.jsx                 mede a janela e escolhe o ambiente do canal
  cena/                   a sala: foto por época, com a versão em CSS como reserva
    Cena.jsx              monta as camadas e posiciona a tela
    Ligar.jsx             o console clicável da TV apagada
    salas.js              o retângulo do tubo, a caixa do console e a geometria
  selecao/                a troca de sala, o canal 00 e o player de intro
    Canais.jsx            a placa do canal e a faixa, flutuando sobre a cena
  cena/Ligar.jsx          o console clicável e a dica que só aparece se precisar
    Inicio.jsx            canal 00: a fala, o guia de canais e o aviso legal
  eras/atari/             Breakout jogável, leitor de currículo e troca de cartucho
  eras/ps1/               a era PS1 inteira (skin isolada)
  eras/ps2/               a era PS2 inteira
```

## A era PS3

Só duas telas, que é o que o console tinha de próprio: a **inicialização** e a **XMB**.

A inicialização é o **vídeo real do console** (`public/intro-ps3.*`, 14 s), que entra pela mesma
fila de intro das outras eras. Por isso a era não tem tela de boot própria: o vídeo *é* o boot, e
o que vem depois dele já é o sistema. Nas outras eras o vídeo é o console e o que segue é o jogo;
aqui o PS3 não tem jogo, ele tem a XMB.

### O corte do preto inicial

O `.mkv` original começava com **1 segundo de preto absoluto** (pico de brilho 0) e só ficava
visível de verdade em 2,4 s. Ao sintonizar o canal você olhava a tela preta achando que nada havia
carregado — e, como a transição de troca de canal também acaba em preto, os dois pretos se somavam.

O `public/intro-ps3.*` corta **1,8 s da frente**: agora o vídeo abre já com as fitas em movimento
(pico 31 no primeiro quadro) e fica claro em 1 s. Duração final: 12,2 s.

### Esta intro preenche o vidro

O vídeo é 16:9 e o vidro daquela TV é 1,42, então com `object-fit: contain` sobrava tarja preta
em cima e embaixo. O `Intro` recebe `preencher` e o `App` passa `preencher={era === 'ps3'}`, que
troca para `object-fit: cover`.

**E aí tem uma conta que não pode ser feita a olho.** O `cover` corta 24% da largura, e medindo o
quadro do vídeo o logo termina a **92,75%** da largura — com o recorte centralizado (`50%`) o "3"
fica cortado por um fio, invisível a olho nu. O `object-position: 78% center` abre a janela em
18,6%–94,8% e o logo cabe com folga. A parte cortada do lado esquerdo é fita vazia.

As outras eras seguem em `contain` de propósito — o palco delas é 4:3 e `cover` recortaria 25% da
largura do vídeo.

### Esta intro não pode ser pulada

No console de verdade não dava para pular o boot, então aqui também não dá. O componente `Intro`
recebe `pular` e o `App` passa `pular={era !== 'ps3'}`. Com `pular={false}`, Enter, Esc e clique
não fazem nada, o diálogo de confirmação não existe, e o rodapé diz **INICIANDO O SISTEMA** em vez
de "ENTER OU CLIQUE PARA PULAR".

As outras eras continuam puláveis — e precisam ser: a corrente do PS2 tem quase dois minutos.

### Cinza, não verde

Amostrei o vídeo canal por canal: ele é **inteiramente cinza**, R=G=B do primeiro ao último
quadro, num cinza médio entre `#6f6f6f` e `#7d7d7d`. A XMB era verde — o print de referência do
menu é verde e é o que o console mostra de verdade, porque a cor da XMB muda de mês em mês.

Mesmo assim **a XMB aqui é cinza**, por decisão do dono do projeto: ele quer o sistema na mesma
paleta do vídeo, e a coerência entre a abertura e o menu ganhou da fidelidade ao print. O cinza
escolhido puxa para o lado escuro da faixa do vídeo (`#6e6e6e` no topo, `#4b4b4b` no meio) porque
no cinza claro o texto branco da XMB perdia contraste e o currículo ficava difícil de ler.

Se um dia quiser o verde de volta, é a paleta no topo de `ps3.css`.

### O sistema subindo

A XMB não aparece de estalo quando o vídeo acaba: ela **monta**. Entra com `brightness(1.62)
contrast(0.84)` — a lavagem do último quadro do vídeo — e assenta em 1,65 s, com os elementos
chegando em ordem: a onda surge comprimida e relaxa, a barra de categorias em 0,42 s, a coluna em
0,66 s, o relógio em 1,05 s e a dica em 1,24 s. O teclado fica travado até a montagem acabar,
para não dar comando no meio. Vem com um acorde sintetizado de quatro notas subindo
(`sfxXmbLiga`).

**Sobre a intro pedir clique:** em carga direta da URL (`#ps3` recarregado, por exemplo) o
navegador não deixa vídeo com som tocar sem gesto do usuário, então aparece "CLIQUE PARA LIGAR O
CONSOLE". Isso **não é específico do PS3** — testei os dois lado a lado e o `#ps2` faz igual.
Chegando pela TV, pela lista de consoles de outra era ou pela própria XMB, os dois tocam sozinhos.

**A onda e as partículas foram copiadas desse vídeo, não inventadas.** Extraí quadros do fim da
sequência e olhei de perto: as fitas não são brilhos difusos, são **planos chapados com aresta
nítida**, empilhados e translúcidos, alguns com um fio de luz de 1 px na borda de cima. E existe
uma camada de **poeira luminosa** — pontinhos redondos de raio e brilho variados, subindo devagar
para a direita e voltando pelo outro lado.

A XMB foi construída **em cima de um print de referência** do menu real (1032x577), medido pixel a
pixel: barra de categorias em y=126, item selecionado em y=223, passo de 36 px na lista, e a paleta
verde do fundo amostrada da imagem. Isso importa porque na primeira tentativa desta era, meses
atrás, eu inventei a XMB e o resultado foi descartado — a diferença entre as duas é ter referência.

O movimento é o da XMB de verdade: **o selecionado não se move, a lista se move.** A categoria
ativa fica sempre no mesmo x e a barra inteira desliza; o item ativo fica sempre no mesmo y e a
coluna inteira desliza. É isso que dá a sensação de cruz.

A onda (`Onda.jsx`) é canvas. Cada fita é o preenchimento **entre duas senoides
independentes** — uma para a aresta de cima, outra para a de baixo, com amplitude, frequência e
fase próprias. É isso que dá a espessura variando ao longo do x e as arestas se cruzando, em vez
de uma faixa de espessura constante. São seis fitas, 62 partículas, e tudo congela quando o painel
de conteúdo abre.

As sete categorias saem do JSON: Perfil, Experiência, Formação, **Competências**, Idiomas,
Currículo e Consoles. Vale notar que **é aqui que as competências voltaram a ter casa** — elas
tinham perdido o lugar quando a aba ITEM saiu do PS1. Cada uma abre com a barra de nível e a
descrição.

Um detalhe que ficou de fora de propósito: no console real a cor do fundo da XMB muda de mês em
mês. Aqui está fixa no verde do print. É uma linha de código se quiser o ciclo.

## A era Atari

O jogo é **Breakout** (Atari 2600, 1978), e a ligação com o currículo é direta: são cinco
fileiras de tijolos e **cada fileira é uma entrada do currículo** — as três vagas e as duas
formações, da mais recente no topo à mais antiga embaixo. Derrubar uma fileira inteira abre o
cartão daquela entrada, com cargo, período e resultado. Zerar o jogo é ler o currículo todo.

**Cada bloco quebrado solta uma tecnologia** de `itens` flutuando para cima até sumir, tiradas
de uma fila embaralhada que se recompõe quando acaba. Uma tela de aviso antes da partida explica
isso, para o jogador entender que o placar não é o único conteúdo da tela.

**Três blocos piscando dão poderes:** bola tripla (cada bola vira três, teto de nove), raquete
larga por 14 s e bola lenta por 11 s. A velocidade das bolas é normalizada a cada quadro contra
um alvo único, então o efeito de lentidão entra e sai sem acumular erro.

A fase tem 12 colunas com buracos no padrão, as duas fileiras de cima aguentam dois toques
(pintadas mais escuras depois do primeiro), a raquete é estreita e a bola acelera a cada bloco.

A simulação roda num canvas de 640x480 desenhado num espaço lógico de 160x120 (escala 4), que
é o que dá o pixel grosso. O laço usa `requestAnimationFrame` com passo variável limitado, e o
estado do jogo vive num `ref` — só placar, vidas e fase sobem para o React, para não re-renderizar
a 60 fps.

O `useInput` não serve aqui porque dispara uma vez por tecla; a raquete precisa de tecla
**segurada**. O jogo escuta `keydown`/`keyup` por conta própria e lê o gamepad dentro do laço,
aceitando d-pad e analógico. O botão de lançar usa uma trava de borda em vez de amostrar o
estado a cada quadro: um toque mais curto que 16 ms cairia entre dois frames e se perderia.

Quem não quiser jogar tem **LER O CURRÍCULO** no menu: oito páginas navegáveis com o mesmo
conteúdo, e a última baixa o PDF.

O palco é fixo em **640x480** e escalado por CSS. Isso mantém o enquadramento 4:3 correto em
qualquer tela e faz todo layout interno poder assumir medidas absolutas.

## Controles

Teclado (setas, Enter, Esc, Q/E para trocar de aba), mouse, e **gamepad** — se tiver um controle
plugado, ele funciona.

## Notas

- **Som:** quase tudo é gerado por osciladores e ruído em tempo de execução (`src/lib/audio.js`).
  As exceções são duas amostras reais: `public/sa-menu.wav`, o menu do San Andreas usado na
  navegação da era PS2, e `public/re2-titulo.mp3`, o tema de abertura do Resident Evil 2 que toca
  na tela de título do PS1. As duas entram pelo mesmo barramento dos sons sintetizados, então o
  mudo global vale para elas, e as duas têm um som sintetizado de reserva caso o arquivo não
  carregue.
- **Assets do jogo:** as intros em vídeo, as fotos de sala, as texturas do `models/` e as duas
  amostras de som são material original da Sony, da Capcom e da Rockstar, fornecido pelo dono do
  projeto. O resto (ícones, telas,
  tipografia) é feito à mão — a tela de boot diz "Arthur Computer Entertainment" e a tela SOBRE
  deixa explícito que é projeto autoral sem vínculo com as detentoras das marcas.
- **Recrutador com pressa:** existe link de PDF fixo no canto, a aba SAVE baixa o currículo, e o
  `<noscript>` do `index.html` carrega o currículo inteiro em texto puro — o que também resolve
  indexação e leitor de tela.
- Em celular no modo retrato aparece um pedido pra virar o aparelho, com link direto pro PDF.
