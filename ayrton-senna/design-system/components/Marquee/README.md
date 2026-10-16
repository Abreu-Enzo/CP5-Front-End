# Marquee

Faixa de texto display rolando sem parar, levemente inclinada no ângulo da pista — separa capítulos com velocidade.

**Uso:** `.sn-marquee[.sn-marquee--brand] > .sn-marquee__track > .sn-marquee__item×N`. Repita o conjunto de itens duas vezes (a animação anda 50%). O consumidor fornece os itens e um `aria-label` com o texto, marcando o trilho como `aria-hidden`.

- Padrão em `surface-inverse` / `ink-inverse`; `--brand` em `brand` / `on-brand`.
- Duas faixas cruzadas (uma em sentido reverso) fazem a transição do hero.
- Pausa no hover; parado com movimento reduzido.
- Itens curtos: anos, números, palavras-valor. Conectores em serif itálico (`<i>e</i>`).
