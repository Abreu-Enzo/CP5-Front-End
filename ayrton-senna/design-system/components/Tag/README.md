# Tag

Rótulo compacto em caixa alta para anos, circuitos e resultados; como `<button>` vira filtro alternável.

**Uso:** `<span class="sn-tag">` para rótulo, `<button class="sn-tag" aria-pressed>` para filtro. O consumidor fornece o texto e o estado.

- Padrão: borda `line-strong`, texto `ink`, `radius-sm`.
- `aria-pressed="true"` ou `sn-tag--brand`: fundo `brand`, texto `on-brand`.
- `sn-tag--soft`: `red-100` com texto `ink-700`, para metadados (circuito).
- `sn-tag--p1`: `accent-gold` com texto `ink-900`, só para vitórias. Sempre com a palavra "P1" — a cor nunca é a única pista.
- Hover de filtro: `shadow-offset-sm` e deslocamento de 2px.
