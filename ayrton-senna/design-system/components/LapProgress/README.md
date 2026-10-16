# LapProgress

Indicador de progresso em forma de volta de corrida: a rolagem da página vira um cronômetro e cada capítulo é um setor.

**Uso:** `.sn-lap` com `.sn-lap__head`, `.sn-lap__track > .sn-lap__fill` e `.sn-lap__marks`. O consumidor atualiza `--sn-lap` (0–100%) a partir do scroll e escreve o setor atual e o "tempo" no cabeçalho.

- Trilho `surface-sunken`; preenchimento listrado `brand` / `brand-deep` em diagonal.
- Texto em `data` (mono), setor atual em `ink`, resto em `ink-muted`.
- Use no rodapé fixo do desktop ou acima da linha do tempo; não junto com o progresso da NavBar.
