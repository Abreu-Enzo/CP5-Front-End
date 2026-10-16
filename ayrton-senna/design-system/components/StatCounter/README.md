# StatCounter

Número gigante em `numeral` sobre um fio `brand`, contando de zero até o valor quando entra na tela.

**Uso:** `<div class="sn-stat"><span class="sn-stat__num" data-to="41">0</span><span class="sn-stat__label">Vitórias</span></div>`. O consumidor fornece o valor verificado e o rótulo, e dispara a contagem com IntersectionObserver.

- Contagem em `dur-lap` com desaceleração tipo `ease-brake` (ease-out quártico). Com movimento reduzido, mostra o valor final.
- Em grade de 3–4 colunas; um único item pode ir em bloco `brand` com texto `on-brand` para destacar o número mais emblemático.
- Números da carreira usados no exemplo: 3 títulos (1988, 1990, 1991), 41 vitórias, 65 poles, 6 vitórias em Mônaco. Confira cada número antes de publicar.
