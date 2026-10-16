# Telemetry

Painel de leitura estilo câmera onboard: rótulos em `eyebrow`, valores em `data-l` (mono, tabular) e barras finas em `brand`.

**Uso:** `.sn-tele > .sn-tele__cell×4` (`__k`, `__v`, `__bar > i` com `--v`). O consumidor fornece os valores — reais (dados de uma volta histórica) ou ligados ao scroll como efeito.

- Fundo `surface-inverse`, texto `ink-inverse`.
- Ideia de interação: na seção do carro, a rolagem "acelera" — velocidade, marcha e rotação sobem conforme a foto do carro atravessa a tela.
- 2 colunas abaixo de 640px.
- Valores simulados devem ser apresentados como ilustração, não como dado histórico.
