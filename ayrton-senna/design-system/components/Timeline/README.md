# Timeline

A carreira como trilho vertical: ano em `display-m` (`brand-text`), título `display-s`, texto `body`; o trilho se pinta de `brand` conforme a rolagem e o ano em foco ganha o ponto `accent-gold`.

**Uso:** `.sn-timeline` contendo `.sn-timeline__fill` e vários `article.sn-tl-item` (`.sn-tl-item__year` + `h3` + `p`). O consumidor fornece os marcos e controla `--sn-tl` (0–100%) e a classe `is-active` a partir do scroll.

- Trilho em `line`, ponto inativo com borda `line-strong`, ativo em `accent-gold` com borda `ink-900`.
- Um marco por ano relevante; texto ≤ 2 linhas — o detalhe vai para RaceCard.
- Abaixo de 640px o ano sobe para cima do título.
- Variação para desktop: trilho horizontal com scroll preso (sticky) e os anos passando como placas de quilometragem.
