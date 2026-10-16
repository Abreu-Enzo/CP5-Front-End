# NavBar

Barra superior fixa com os capítulos da página e uma linha `brand` que mede quanto da história já foi lida.

**Uso:** `<nav class="sn-nav">` com `.sn-nav__brand`, uma `<ul>` de `.sn-nav__link`, um botão e `.sn-nav__progress`. O consumidor fornece os links (âncoras das seções), marca o capítulo visível com `aria-current="true"` e atualiza `--sn-progress` (0–100%) no scroll.

- Fundo `surface-raised`, fio `line` embaixo.
- Link ativo/hover: sublinhado `brand` que corre da esquerda em `dur-base` / `ease-launch`.
- Abaixo de 720px os links somem; use um menu em tela cheia com fundo `brand`.
- Pode começar transparente sobre o hero e ganhar `surface-raised` após 80px de scroll.
