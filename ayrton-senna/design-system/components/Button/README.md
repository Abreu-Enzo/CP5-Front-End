# Button

Botão retangular de cantos vivos com varredura diagonal no hover — a ação principal de cada seção.

**Uso:** `<a|button class="sn-btn [sn-btn--outline|sn-btn--ghost] [sn-btn--lg]">Rótulo <span class="sn-arrow">→</span></a>`. O consumidor fornece o rótulo (verbo + objeto, caixa alta automática) e, se houver navegação, o `href`.

- **Primário** (`brand` + `on-brand`): no máximo um por viewport. No hover, uma faixa `brand-deep` atravessa o botão no ângulo `angle-track` em `dur-base` / `ease-launch`.
- **Outline** (`line-strong`): ações secundárias sobre `surface`.
- **Ghost**: só sobre `brand` ou fotos escurecidas; o hover preenche de branco e o texto vira `red-500`.
- `sn-btn--lg` no hero e no CTA final.

Faça: seta `→` só quando a ação leva a outro lugar. Rótulos curtos (≤ 3 palavras).
Não faça: cantos arredondados, ícones de patrocinador, dois primários lado a lado.
