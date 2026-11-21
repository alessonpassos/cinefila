# Validação da entrega

Data: **9 de novembro de 2026**. Projeto: Cinefila, Ionic com Angular standalone.

## Resultados efetivamente obtidos

| Verificação | Resultado | Limite do resultado |
| --- | --- | --- |
| Instalação das dependências | Concluída; versões fixadas e `package-lock.json` gerado. | O laboratório precisa de internet na primeira instalação. |
| `npm run build` | **Passou**, com compilação Angular AOT, TypeScript estrito e templates estritos; dentro dos limites de tamanho configurados. | O ambiente de execução precisou de um ajuste externo apenas para a consulta de memória do Node, indisponível no contêiner. Esse ajuste não modifica nem acompanha o projeto. |
| `npm run test:unit` | **12 testes passaram**. | HttpTestingController e armazenamento em DOM simulado; não são chamadas reais à TMDB nem validação visual. |
| `npm run verificar:mapa` | **84 pares de arquivo/termo conferidos**, com todos os links relativos existentes e link do README para o mapa. | Alterações posteriores no código exigem nova execução e atualização do mapa. |
| Conferência com o PDF | Todos os itens oficiais têm cobertura no código e responsáveis no mapa. | Presença dos cinco, apresentação, publicação no GitHub e envio no Teams são ações do grupo. |
| Suíte de navegador | **18 cenários preparados e reconhecidos pelo Playwright**. A tentativa de execução foi bloqueada antes de abrir a página. | Chromium encerrou ao iniciar (`SIGTRAP`) no ambiente restrito. O navegador remoto também não alcançou o servidor local. Nenhum desses cenários é declarado aprovado. |
| API real e imagens | **Não validadas com credencial real**. | Nenhum token foi fornecido. Não foi verificado um filme específico na API. |
| ZIP | Gerado por lista de arquivos permitidos e inspecionado após a geração. | Não inclui `node_modules`, build, cache, `.env.local` ou `config.local.json`; instalar e configurar novamente ao extrair. |

## O que os 12 testes verificam

1. Os quatro endpoints GET, o ID, `language=pt-BR` quando exigido, o título com espaços/acentos e o cabeçalho de autenticação.
2. Ausência de token, sem enviar requisição à TMDB.
3. Tradução de erros de autenticação e rede em mensagens de interface.
4. Duração de 142 minutos, minutos isolados, horas exatas e dados ausentes.
5. Resumo de zero, um, dois e três gêneros.
6. Data e nota formatadas em pt-BR pelos pipes nativos.
7. Limiar de nota alta em 8 e tratamento de valor ausente.
8. Salvar, consultar, evitar duplicatas, persistir e remover.
9. Recuperação de dados salvos com remoção de entradas inválidas e duplicadas.
10. Recuperação após conteúdo JSON corrompido.
11. Falha de gravação sem falso aviso de sucesso nem mudança indevida de estado.
12. Atualização da lista em resposta ao evento de armazenamento entre abas.

## O que validar no laboratório

- Instalar com `npm ci`, configurar o token em `.env.local` e iniciar com `npm start`.
- Executar `npm run build`, `npm run test:unit` e `npm run verificar:mapa` no computador da apresentação.
- Instalar o navegador de testes com `npx playwright install chromium` e rodar `npm run test:e2e`, quando a política do laboratório permitir.
- Com a API **real**, verificar Home → Buscar → Detalhes → salvar → recarregar `/filmes/ID` → Minha lista → abrir detalhes → remover.
- Colar `/filmes/ID` numa aba nova e conferir que ficha e elenco são carregados sem visitar a Home antes.
- Confirmar os quatro GETs na aba Rede, os quatro resultados formatados, o destaque da nota, o estado salvo, a busca sem resultados e a repetição de atores/personagens.
- Testar leitura, cliques, foco de teclado, pôsteres e ausência de cortes em tela larga e em visualização móvel de aproximadamente 390 px.
- Escolher e anotar um filme real apropriado para o ensaio; “Interestelar” é apenas uma sugestão não verificada nesta entrega.
- Associar os nomes dos cinco integrantes às seções do mapa, confirmar a presença de todos e escolher quem publicará os fontes e enviará o ZIP.

Não confundir a existência dos testes de navegador com sua aprovação: a validação visual, a recarga no navegador e o fluxo completo com a TMDB continuam pendentes neste ambiente.
