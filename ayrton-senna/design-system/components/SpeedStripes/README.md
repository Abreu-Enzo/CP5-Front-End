# SpeedStripes

Faixas diagonais em tons de vermelho que cruzam a tela no ângulo `angle-track` — a assinatura gráfica do site, inspirada nas listras dos cartazes de referência.

**Uso:** `.sn-stripes` (altura via `--sn-stripes-h`) com 3–5 `.sn-stripes__band`, cada uma com `--y` (posição), `--h` (espessura), `--c` (cor), `--x` (deslocamento) e `--d` (atraso). O consumidor dispara a entrada reiniciando a animação quando a seção entra na tela.

- Cores: sempre `brand`, `brand-deep`, `red-400` e um fio `ink`. Uma faixa grossa, as outras finas.
- Entram da esquerda em `dur-slow` / `ease-launch`, escalonadas em ~90ms.
- Uso: divisor entre hero e capítulo 1, fundo do bloco de títulos, rastro atrás da foto do carro.
- Use com scroll: ligar `--x` à rolagem dá a sensação de que o carro passou.
