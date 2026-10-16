# Projeto: landing page Ayrton Senna

## Design system (obrigatório)

Toda interface deste projeto segue o design system em `design-system/`.

- Antes de criar ou alterar qualquer tela, leia `design-system/README.md` (princípios, cor, tipografia, imagem, movimento, mapa da landing).
- Carregue nesta ordem: `design-system/tokens.css` e depois `design-system/components/bundle.css` (este já importa as fontes do Google Fonts).
- Use as variáveis CSS dos tokens (`var(--brand)`, `var(--space-12)`, `var(--ease-launch)`…) e as classes `sn-*`. Nunca escreva cores, tamanhos ou durações soltos no código.
- Para cada componente, siga `design-system/components/<Nome>/README.md` e use `preview.html` da mesma pasta como referência de marcação.
- `design-system/tokens.json` é a fonte dos valores; se mudar um token, recompile o `tokens.css`.
- Componente novo: prefixo `sn-`, cantos vivos, ângulo `--angle-track`, e respeite `prefers-reduced-motion`.
- Não desenhe em vetor logos de equipe ou patrocinadores, a assinatura de Senna nem as pinturas do capacete ou do carro: use só fotos licenciadas, com crédito, dentro de `.sn-photo`.
