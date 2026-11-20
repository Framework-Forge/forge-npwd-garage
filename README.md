# Forge NPWD Forge Garage

Aplicativo de veículos do personagem, integrado ao Forge Garage e PR Bridge.

- Busca por placa, nome e modelo, ignorando espaços e acentos; filtros por tipo e situação.
- Cartão com foto e tela de informações detalhadas.
- Combustível, motor, carroceria, situação, condição, parcelas restantes, apreensão e multas.
- Rotas para a entrada da garagem, posição do veículo, seguro compatível mais próximo ou pátio registrado.
- Consultas de detalhes e GPS autorizadas pelo proprietário no servidor. A NUI envia somente a placa; não escolhe coordenadas nem autoriza retirada.

## Fotos de veículos

Edite `config.lua`, seção `VehicleImages`:

```lua
VehicleImages = {
    PreferCustom = true,
    Template = 'https://cfx-nui-forge-npwd-garage/images/vehicles/{model}.webp',
    Overrides = {
        -- meu_addon = 'https://meu-cdn.exemplo/veiculos/meu_addon.png',
    },
}
```

Coloque as imagens em `images/vehicles/`, com o nome de spawn em minúsculas: `sultanrs.webp`, por exemplo. O manifest inclui webp, png, jpg e jpeg; ajuste a extensão no Template ou informe a URL em Overrides. Modelos replace usam o nome de spawn substituído.

- `PreferCustom = true`: imagem personalizada primeiro, PR Bridge depois.
- `PreferCustom = false`: PR Bridge primeiro, personalizada depois.
- `Overrides`: URL específica por modelo, substituindo o Template desse modelo.
- O fallback funciona tanto com URL ausente quanto com falha ao carregar a imagem. Se ambas falharem, aparece um ícone, sem imagem quebrada.
- O diretório pode ser de outro recurso por uma URL `https://cfx-nui-NOME_DO_RECURSO/...`; esse recurso precisa disponibilizar os arquivos no próprio manifest.
- As imagens do PR Bridge usam `pr_lib.fivem.blips.getVehicleImageUrl(model)`.

## Condição e localização

Condição e situação são independentes. Um veículo apreendido também pode estar danificado. Motor ou carroceria com valor <= 0 gera o indicador **Veículo com perda total**, sem modificar o veículo, o banco ou as regras de recuperação. Dados ausentes não viram 0%.

Motor/carroceria usam a leitura sincronizada do servidor quando a entidade existe e possui um dono de rede. Caso contrário, aparece o último registro salvo. O combustível nesta versão mostra o último registro salvo. A data da consulta não é apresentada como data em que esse registro foi salvo.

Veículo ausente não implica PT. Se foi removido antes de sua condição ser persistida, o app não inventa dano ou uma causa de desaparecimento.

As leituras de saúde no servidor usam as natives disponíveis no FiveM: [implementação oficial](https://github.com/citizenfx/fivem/blob/master/code/components/citizen-server-impl/src/state/ServerGameState_Scripting.cpp).

Para IPL, a rota usa a entrada externa; não utiliza vaga nem saída dentro do interior. Veículo em outra instância não gera GPS enganoso. No seguro, o destino respeita o tipo do veículo no catálogo do framework. Modelos addon devem ter o tipo correto cadastrado nesse catálogo.

## Multas

O Forge Police fornece uma projeção autorizada por proprietário, por `GetOwnedVehicleCitations(source, plate)`. São exibidos motivo/descrição, local, emissão, situação e os dados da fatura quando disponíveis (valor atualizado, vencimento, pagamento e artigos). Campos internos do MDT não são enviados.

Multas de parquímetro são lidas pelo Forge Garage no registro original, evitando duplicar o espelho do MDT. Cada recurso consulta suas faturas pelo export do Renewed Banking, respeitando o emissor. Sem o serviço policial/bancário, a interface informa a limitação e mantém os registros disponíveis. A consulta não emite, paga ou libera cobranças.

## Instalação e validação

Além deste aplicativo, foram atualizados `forge-garage` (novo `server/phone.lua` e manifest) e `forge-police` (export de consulta de multas do proprietário). Carregue as versões juntas numa reinicialização planejada da base. O bundle do aplicativo já foi compilado.

Siga [QA.md](QA.md) para testar no FiveM. Os testes automatizados de Lua e navegador ficam em `tests/`.
