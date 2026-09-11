# Meu Fluxo Financeiro

Crie um sistema web responsivo de Controle Financeiro Pessoal, com interface moderna, limpa, intuitiva e em português do Brasil.

O sistema deve permitir controlar contas fixas, gastos variáveis, cartões de crédito, contas bancárias, pagamentos via Pix/débito/dinheiro e viagens ou projetos.

Objetivo principal

Quero centralizar todos os meus gastos em um único sistema, permitindo selecionar o mês de referência, cadastrar somente o que realmente gastei, acompanhar contas pagas e pendentes, controlar faturas de cartão e visualizar o fechamento financeiro mensal sem duplicar lançamentos.

Estrutura do menu

Criar os seguintes menus:

Dashboard

Contas Fixas

Gastos Variáveis

Cartões de Crédito

Contas e Formas de Pagamento

Viagens e Projetos

Receitas

Relatórios

Categorias

Configurações

1. Dashboard

Criar uma tela inicial com filtro de mês e ano.

Exibir cards com:

Receitas do mês

Total de despesas do mês

Total de contas fixas

Total de gastos variáveis

Total de faturas em aberto

Total de contas pendentes

Total pago no mês

Saldo disponível, considerando receitas e despesas

Exibir também:

Gráfico de despesas por categoria

Gráfico de gastos por forma de pagamento

Evolução dos gastos mensais

Lista de contas próximas do vencimento

Últimos lançamentos

Faturas em aberto

Resumo de viagens e projetos em andamento

Permitir clicar nos cards e acessar os lançamentos correspondentes.

2. Contas Fixas

Criar um cadastro de contas recorrentes.

Campos:

Nome da conta

Categoria

Valor previsto

Dia do vencimento

Frequência: mensal, anual, parcelada ou personalizada

Mês de início

Mês de término, quando aplicável

Forma de pagamento padrão

Conta ou cartão padrão

Observações

Status ativo/inativo

Contas iniciais que quero cadastrar:

Água

Luz

IPTU

DAS-MEI

Claro

Vero

Regras:

Gerar automaticamente os lançamentos recorrentes para os meses configurados.

Permitir editar o valor de apenas um mês sem alterar o valor padrão dos próximos meses.

Permitir marcar a conta como paga, pendente ou atrasada.

Permitir informar a data real de pagamento.

Permitir pausar ou desativar uma conta recorrente.

Contas anuais, como IPTU, devem permitir cadastrar o valor total ou parcelas.

3. Gastos Variáveis

Criar um menu específico para cadastrar gastos que não acontecem necessariamente todos os meses.

Deve existir um botão “Adicionar gasto” e um campo obrigatório de mês de referência.

Campos:

Descrição

Categoria

Subcategoria

Valor

Data do gasto

Mês de referência

Forma de pagamento

Conta ou cartão utilizado

Status

Observações

Anexo opcional de comprovante

Categorias iniciais:

Moradia

Alimentação

Saúde

Pets

Transporte

Pessoal

Lazer

Viagens

Educação

Impostos

Outros

Subcategorias iniciais de exemplo:

Compras de casa

Verduras

Frutas

Carne

Supermercado

Médico do Pietro

Exames

Farmácia

Unha

Cabelo

Manutenção de gel

Ração

Veterinário

Combustível

Aplicativos

Manutenção

Outros

Importante:

Não gerar gastos automaticamente para categorias variáveis.

Eu devo cadastrar somente o que realmente gastar em cada mês.

Permitir editar, excluir e duplicar lançamentos.

Permitir filtrar por mês, categoria, forma de pagamento e conta/cartão.

4. Cartões de Crédito

Criar um módulo completo de cartões.

Cadastro do cartão:

Nome do cartão

Banco/emissor

Limite total

Dia de fechamento

Dia de vencimento

Cor do cartão

Status ativo/inativo

Criar uma tela para visualizar:

Fatura atual

Próxima fatura

Faturas anteriores

Limite total

Limite utilizado

Limite disponível

Total de compras parceladas futuras

Data de fechamento

Data de vencimento

Cadastro de compras:

Descrição

Data da compra

Valor total

Número de parcelas

Valor da parcela

Parcela atual

Cartão utilizado

Categoria

Fatura de referência

Status da compra

Regras importantes:

Compras parceladas devem gerar automaticamente uma parcela para cada fatura futura.

O valor total da compra não deve ser somado integralmente em todos os meses.

O sistema deve registrar apenas o valor da parcela no fechamento mensal.

Permitir antecipar parcelas, editar compra e cancelar compra.

Permitir visualizar todas as compras de uma fatura.

Criar botão “Fechar fatura”.

Criar botão “Marcar fatura como paga”.

O fechamento da fatura deve ser diferente do pagamento da fatura.

Não duplicar a despesa quando a fatura for paga.

Permitir cadastrar inicialmente o cartão Mastercard.

5. Contas e Formas de Pagamento

Criar um cadastro de contas e meios de pagamento.

Tipos:

Conta bancária

Carteira/dinheiro

Pix

Débito

Crédito

Boleto

Transferência

Permitir cadastrar:

Nome da conta ou meio de pagamento

Tipo

Banco ou instituição

Saldo inicial opcional

Status ativo/inativo

Importante: “Forma de pagamento” e “Conta/cartão” devem ser campos separados.

Exemplo:

Forma de pagamento: Crédito
Cartão: Mastercard

Ou:

Forma de pagamento: Pix
Conta: Nubank

6. Viagens e Projetos

Criar um módulo para controlar viagens e projetos com orçamento próprio.

Cadastro:

Nome da viagem/projeto

Destino ou descrição

Data inicial

Data final

Orçamento planejado

Status: planejando, em andamento, concluído ou cancelado

Observações

Dentro de cada viagem/projeto, permitir cadastrar despesas:

Descrição

Categoria

Valor

Data

Forma de pagamento

Conta/cartão

Status

Comprovante opcional

Exibir:

Orçamento planejado

Total gasto

Saldo restante

Percentual do orçamento utilizado

Gastos por categoria

Lista de despesas

Evolução dos gastos

Importante: os gastos da viagem também devem aparecer no extrato financeiro geral, mas vinculados ao projeto, sem duplicar o lançamento.

Quero poder registrar viagens pagas por Pix, incluindo passagens, hospedagem, alimentação e passeios.

7. Receitas

Criar um módulo simples para cadastrar receitas.

Campos:

Descrição

Valor

Data de recebimento

Mês de referência

Categoria da receita

Conta de recebimento

Status recebido/pendente

Permitir visualizar o total de receitas por mês.

8. Relatórios

Criar relatórios com filtros por mês, ano, categoria, subcategoria, forma de pagamento, conta, cartão e status.

Relatórios desejados:

Total de gastos por categoria

Total de gastos por subcategoria

Total de gastos por forma de pagamento

Total de gastos por cartão

Total de contas fixas

Total de gastos variáveis

Total de receitas

Total pago

Total pendente

Total atrasado

Evolução mensal

Compras parceladas futuras

Gastos por viagem/projeto

Comparativo entre meses

Permitir exportar os dados para CSV ou Excel, se possível.

9. Regras financeiras e prevenção de duplicidade

Esta parte é essencial:

Cada despesa deve ser cadastrada uma única vez.

O sistema deve diferenciar gasto, obrigação, fatura e pagamento.

Uma compra no cartão deve aparecer na fatura correspondente.

O pagamento da fatura não deve gerar uma nova despesa.

Uma conta fixa deve gerar um lançamento mensal, mas não deve ser duplicada manualmente.

O sistema deve permitir alterar o valor real de uma conta em determinado mês.

O sistema deve diferenciar “data do gasto”, “data de vencimento” e “data de pagamento”.

O total de despesas do mês deve considerar o critério escolhido: gastos realizados ou pagamentos realizados. Exibir os dois indicadores separadamente quando necessário.

Não considerar uma fatura paga como uma nova despesa.

Permitir conciliação manual entre lançamentos e pagamentos.

10. Interface e experiência

Quero uma interface:

Moderna e profissional

Responsiva para computador e celular

Em português do Brasil

Com valores em R$

Com formatação brasileira de datas e moeda

Com filtros de mês e ano fáceis de usar

Com tabelas organizadas

Com busca por descrição

Com botões claros para adicionar, editar, excluir e marcar como pago

Com confirmação antes de excluir

Com alertas para contas vencidas ou próximas do vencimento

Com dashboard visual e fácil de entender

Priorize primeiro a estrutura funcional, o banco de dados e as regras de cálculo. Depois implemente o visual.

Crie o sistema de forma que eu consiga começar cadastrando minhas contas e gastos de setembro de 2026, mas também consiga consultar e lançar outros meses.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://caixa-central-br.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf2a0c5e-d0d5-4585-9cab-2f6444f02eb8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
