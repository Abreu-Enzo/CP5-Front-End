Sistema visual da landing page em tributo a Ayrton Senna: um cartaz de corrida que se move. Vermelho dominante, papel e branco como respiro, tipografia condensada gigante, faixas diagonais e fotografia tratada como impressão. Tudo aqui foi derivado dos cartazes e retratos de referência — sem reproduzir logos, assinatura ou pinturas de terceiros.

## Princípios

1. **Cartaz antes de interface.** Cada seção é composta como um pôster: um elemento gigante (nome, ano ou número), uma foto, uma frase. Muito espaço vazio (`space-40` entre seções).
2. **Vermelho é a pista.** `brand` ocupa grandes áreas — hero, blocos de título, faixas — e não pequenos detalhes. Onde o vermelho não está, há papel (`surface`) ou branco (`surface-raised`).
3. **Tudo corre na mesma diagonal.** Faixas, cortes e o marquee usam `angle-track` (-12°). Nunca misture ângulos.
4. **Movimento com propósito.** A rolagem conta a história como uma volta: cada capítulo é um setor, os números aceleram e freiam (`ease-launch`, `ease-brake`).

## Conteúdo e voz

- Português do Brasil, terceira pessoa, tempo passado para a história e presente para o legado.
- Frases curtas e factuais. Os números falam ("41 vitórias", "65 poles") — sem adjetivos de torcida ("o maior de todos", "lendário").
- Caixa alta só em display (`hero-xl`, `display-m`, `display-s`), botões e eyebrows. Texto corrido em caixa normal.
- Sem emoji. Datas como "21 de março de 1960"; anos sozinhos em display.
- Citações sempre verificadas e com fonte (ver Quote). Frases em inglês com tradução abaixo.
- Todo número estatístico é conferido antes de publicar.

## Mapa sugerido da landing

| Seção | Componentes | Interação |
|---|---|---|
| Hero | Wordmark (200px), PhotoFrame recortada atravessando o nome, Button --lg | Foto em parallax; faixas entram da esquerda |
| Transição | Marquee ×2 cruzados | Rolagem contínua |
| 01 Origem (1960–1983) | SectionHeader, PhotoFrame duotone, `serif-body` | Revelação do título |
| 02 Carreira (1984–1994) | Timeline, RaceCard | Trilho que se pinta com o scroll; LapProgress |
| 03 Títulos (1988 · 1990 · 1991) | `display-l` em outline, SpeedStripes, foto do carro 21:9 | Carro atravessa a tela ligado ao scroll; Telemetry acelera |
| 04 Números | StatCounter em grade | Contagem ao entrar |
| 05 Legado | Quote --on-brand sobre `red-950`, Button ghost | Fade lento; tom mais contido |

O capítulo sobre 1º de maio de 1994 usa `surface-inverse` ou `red-950`, sem faixas nem animações de velocidade: respeito acima de espetáculo.

## Cor

- Fundo da página: `surface` (papel). Cards e barras: `surface-raised` (branco).
- `brand` para áreas grandes; texto sobre ele sempre `on-brand`.
- Texto vermelho pequeno (links, eyebrows, anos da Timeline) usa `brand-text`, nunca `brand` — `brand` sobre papel só passa contraste a partir de 24px.
- `brand-deep` é a segunda camada: hover, faixa atrás de bloco vermelho, sombra dura.
- Escala de vermelhos para composição: `red-950` (seções sombrias) → `red-800` → `red-700` → `red-600` → `red-500` → `red-400` (ponta quente das faixas) → `red-200` (meio-tom) → `red-100` (alívio).
- `accent-gold` (amarelo de capacete) aparece no máximo uma vez por tela: P1 e ponto ativo. `green-600` só junto do amarelo em momentos Brasil.
- Tema escuro ("Noite de corrida"): mesma estrutura sobre `ink-900`; o vermelho de marca clareia (`brand` #e3262d) e o de texto vira `brand-text` #ff5a4e.

## Tipografia

- **Anton** (`display`): todo título, número e ano. Caixa alta, entrelinha 0.8–0.95. É a voz de cartaz.
- **Bodoni Moda** (`serif`): contraponto elegante — "Ayrton" sobre o SENNA, uma palavra em itálico por título, citações, abertura de capítulo.
- **Archivo** (`sans`): texto corrido, botões e eyebrows (espaçados 0.32em).
- **JetBrains Mono** (`mono`): dados — tempos de volta, telemetria, número do carro.
- Fontes via Google Fonts (o `bundle.css` já importa as quatro).
- Escala: `hero-xl` 200 · `numeral` 160 · `display-l` 120 · `serif-xl` 96 · `display-m` 72 · `display-s` 40 · `quote` 36 · `lead`/`serif-body` 20 · `body` 17 · `button` 15 · `small` 14 · `eyebrow` 12. No mobile, divida os display por ~1,8.

## Espaço, layout e forma

- Grade de 12 colunas, máx. 1440px, gutter `space-12` (desktop) / `space-4` (mobile).
- Seções com `space-40` de padding vertical (`space-24` no mobile).
- Cantos vivos (`radius-0`) em tudo. `radius-sm` só em tags; `radius-pill` só em pontos e indicadores.
- Sombras duras e deslocadas (`shadow-offset`, `shadow-offset-sm`), como impressão fora de registro. Nada de sombra borrada.
- Cortes de seção na diagonal `angle-track`; `angle-steep` só na saída do hero.
- Elementos gigantes podem sangrar pela borda da tela — o nome cortado é intencional.

## Imagem

- Só fotografia com direito de uso (arquivo oficial, agências, família). Crédito obrigatório na legenda.
- Três tratamentos (PhotoFrame): natural para retratos, duotone P&B × `brand` para unificar épocas, meio-tom `red-950` para o efeito de cartaz impresso.
- Recortes (fundo removido) de Senna e do carro podem sobrepor o Wordmark e as faixas, como nas referências.
- Não redesenhar em vetor: logotipos de equipe ou patrocinadores, a assinatura, a pintura do capacete ou a pintura do carro. Esses elementos só aparecem dentro das fotos, ou como assets licenciados fornecidos pelos detentores.
- Proporções: 4:5 retrato · 16:10 corrida · 21:9 carro de perfil · 9:16 stories.

## Movimento

- Entradas: `dur-slow` + `ease-launch` (títulos sobem por trás de máscara; faixas entram da esquerda).
- Hover: `dur-fast`/`dur-base` — varredura diagonal nos botões, sublinhado que corre, card que sobe com sombra dura.
- Contadores e passagem do carro: `dur-lap` + `ease-brake`.
- Ligadas ao scroll: progresso da NavBar, LapProgress, trilho da Timeline, posição do carro e da Telemetry. Use `IntersectionObserver` para disparos e scroll-driven animations (ou GSAP ScrollTrigger) para movimentos contínuos.
- `prefers-reduced-motion`: tudo aparece no estado final; o marquee para.

## Acessibilidade

- Contrastes: `ink`/`ink-muted` ≥ 6:1 nas superfícies, `on-brand` sobre `brand` ≥ 4,5:1 nos dois temas, `brand-text` ≥ 5,8:1.
- Foco: anel sólido de 3px em `focus` com 3px de afastamento, visível sobre papel e sobre vermelho.
- P1 sempre com a palavra, não só a cor amarela. Marquees com `aria-label` e trilho `aria-hidden`.

## Iconografia

Quase sem ícones: a seta tipográfica `→` nos CTAs e o losango ◆ como separador no marquee. Se precisar de ícones, use traço de 2px, quadrados, em `currentColor` — nenhum foi incluído ainda.

## Arquivos

- Tokens: `tokens.json` (cores em dois temas, tipografia, espaço, raio, sombra, `tempo`, `angle`).
- Estilos de componente: `components/bundle.css` (classes `sn-*`, só HTML + CSS; nenhum framework exigido).
- Cada componente tem guia e prévia em `components/<Nome>/`.
