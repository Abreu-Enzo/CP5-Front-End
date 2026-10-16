# RaceCard

Card de corrida marcante: foto 16:10, posição final, GP e ano em `data`, circuito em `display-s`, uma linha de contexto e CTA.

**Uso:** `<a class="sn-race">` com `.sn-race__media` (foto + `.sn-tag.sn-race__pos`) e `.sn-race__body` (`__meta`, `__title`, `__text`, `__cta`). O consumidor fornece foto, posição, GP, ano, circuito e uma frase.

- Fundo `surface-raised`, fio `line`. Hover: sobe 6px e ganha `shadow-offset` em `dur-base` / `ease-launch`; a foto dá zoom lento.
- Posição: `sn-tag--p1` para vitória, `sn-tag` comum para outros resultados ("P2", "DNF").
- Em grade de 3 no desktop, carrossel com scroll-snap no mobile.
