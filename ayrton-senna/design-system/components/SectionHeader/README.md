# SectionHeader

Abertura de cada capítulo: eyebrow numerada, título `display-m` em caixa alta com uma palavra em `serif` itálico, e uma linha `lead`.

**Uso:** `<header class="sn-section-head">` com `.sn-eyebrow`, `<h2>` e `<p>`. Para animar, envolva cada linha do título em `<span class="sn-reveal"><span>…</span></span>` e adicione `is-in` ao header quando entrar na tela (IntersectionObserver, threshold 0.3). A linha sobe por trás de uma máscara em `dur-slow` / `ease-launch`.

- Eyebrow em `brand-text`: "Capítulo NN · ano".
- No máximo uma palavra em `<em>` (serif itálico, `brand-text`) por título.
- `<p>` em `ink-muted`, até 56ch.
- Em `prefers-reduced-motion` o título aparece direto.
