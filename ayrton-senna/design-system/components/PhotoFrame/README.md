# PhotoFrame

Moldura de foto com sombra dura `shadow-offset` e legenda com crédito — onde entram as fotografias licenciadas de Senna e do carro.

**Uso:** `<figure class="sn-photo [sn-photo--duotone|sn-photo--halftone]" style="--sn-ratio: 4/5"><div class="sn-photo__img"><img src alt></div><figcaption><b>Título</b><span>Crédito</span></figcaption></figure>`. O consumidor fornece a imagem, o `alt` descritivo, a proporção e o crédito do fotógrafo/arquivo — obrigatório.

- **Natural**: retratos coloridos (como os perfis de referência).
- **Duotone**: a foto em P&B multiplicada sobre `brand` — dá unidade a fotos de épocas diferentes.
- **Meio-tom**: retícula `red-950` por cima, para o tom de cartaz impresso (ref. pôster de capa vermelha).
- Hover: zoom lento de 4% em `dur-lap` / `ease-brake`.
- Proporções: 4:5 retrato, 16:10 corrida, 21:9 carro de perfil.
- `.sn-photo__placeholder` é só para protótipo.

Não faça: redesenhar em vetor o capacete, a pintura do carro ou logos de patrocinadores — use apenas fotos com direito de uso.
