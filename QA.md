# Testes no FiveM — aplicativo de garagem

## Preparação
1. Carregue as versões atualizadas de PR Bridge, Forge Garage, Forge Police, aplicativo e Forge NPWD numa reinicialização planejada. Não é necessário executar migração SQL nova para esta melhoria.
2. Abra o telefone, entre em Forge Garage e atualize a lista. Não deve haver erros no F8 nem no console do servidor.

## Lista e detalhes
1. Pesquise uma placa com/sem espaços e em letras minúsculas. Pesquise também nome e spawn do modelo.
2. Use filtros de tipo e situação. Combine busca e filtro; uma busca sem resultados deve mostrar mensagem.
3. Abra pelo cartão ou por **Informações detalhadas**. Confira placa, modelo, combustível, motor, carroceria e origem dos dados.
4. Volte à lista: busca e filtros devem continuar selecionados. Atualize os detalhes quando a condição mudar.
5. Sem multas/foto/dados disponíveis, a tela deve continuar funcionando e informar o que falta.

## Fotos
1. Coloque uma imagem com o nome de spawn na pasta `images/vehicles`, carregue o recurso e confira a foto.
2. Use um modelo addon em Overrides; verifique a imagem personalizada.
3. Teste PreferCustom true e false, com URLs distintas. A primeira fonte válida deve aparecer.
4. Provoque 404 na primeira fonte: a segunda deve carregar. Com ambas inválidas deve aparecer o ícone.

## GPS
1. Veículo guardado em garagem comum: **Ir até a garagem** deve marcar a localização da garagem.
2. Veículo em IPL: marque e confira que o destino é a entrada externa, não a vaga interna.
3. Veículo fora e existente: **Localizar veículo** marca sua posição atual. Mova-o e clique novamente: a consulta deve buscar a nova posição.
4. Veículo fora e ausente: **Ir até o seguro** marca o depósito compatível. Repita com carro, barco e aeronave cadastrados.
5. Veículo apreendido: **Ir até o pátio** marca o pátio registrado na apreensão. Confira motivo, taxa e retenção.
6. Garagem removida/sem coordenada ou veículo em outra instância: não deve marcar um local falso; deve explicar a indisponibilidade.
7. Confirme que o resultado do botão aparece no app. A rota não paga multa, não libera apreensão e não move o veículo.

## Dano e perda total
1. Use um veículo de teste. Motor/carroceria saudáveis não devem aparecer como PT somente porque ele está ausente.
2. Dano confirmado com motor ou carroceria <= 0 deve mostrar **Perda total**, mantendo separadamente a situação (fora, seguro, apreendido etc.).
3. Confira a indicação **Atual** para saúde sincronizada e **Último registro** para valores salvos. Após remover a entidade, o resultado depende do que a garagem já persistiu.
4. Dados de saúde ausentes devem aparecer como não informados, não 0%.

## Multas e permissões
1. Emita uma multa policial no fluxo normal da base e consulte o veículo. Expanda a multa e confira infrações, valor, local e datas.
2. Confira uma multa de parquímetro: deve aparecer uma única vez, mesmo existindo no MDT.
3. Pague uma fatura pelo fluxo bancário existente e atualize os detalhes. Confira situação e data do pagamento.
4. Confira apreensão com taxa paga/pendente e retenção futura. A retirada continua seguindo a autorização do pátio.
5. Troque de personagem. A lista e os detalhes devem mostrar somente veículos do personagem atual. O servidor deve recusar uma placa de outro proprietário, mesmo enviada manualmente à NUI.
6. Teste um veículo com placa falsa: a identidade usada na consulta e nas multas deve ser a matrícula original.

## Validação automatizada executada
- Lua 5.4: sintaxe dos arquivos novos/alterados, rotas, saúde atual/salva, placas falsas, autorização, troca de personagem e projeção de multas.
- TypeScript: verificação sem emissão e build Vite de produção.
- Navegador: bundle de federação real, busca, filtros, imagens, detalhes/voltar, expansão de multas, apreensão, sucesso/erro no GPS, retry e tabelas Lua vazias.
- Regressão do Forge Garage/PR Bridge: SQL, dados de veículo, estacionamento, cobrança e limites das zonas.

Natives, banco e NUI foram simulados nos testes automatizados. A validação dentro do FiveM permanece necessária.
