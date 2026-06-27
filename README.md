# Crypto News Brasil

Sistema web simples para cadastro, login e leitura de notícias sobre criptomoedas, desenvolvido para funcionar diretamente no navegador sem depender de um servidor Node em execução.

## O que o projeto faz
- Permite cadastrar um usuário com nome, e-mail e senha.
- Permite fazer login e manter a sessão no navegador.
- Exibe notícias sobre criptomoedas em cards.
- Inclui botão para abrir notícias no Google Notícias.

## Tecnologias utilizadas
- HTML
- CSS
- JavaScript
- LocalStorage para salvar usuários e sessão

## Estrutura de arquivos
- Noticias.html: página principal da interface
- noticias.js: lógica do cadastro, login e carregamento das notícias
- style.css: estilização da aplicação
- data/users.json: arquivo de dados local (usado pela versão anterior com backend)

## Como usar
1. Abra o arquivo Noticias.html no navegador.
2. Faça o cadastro.
3. Entre com o e-mail e senha cadastrados.
4. Veja as notícias exibidas na página.

## Observações
- O sistema foi pensado para funcionar de forma prática em ambientes com limitações de execução.
- O cadastro e o login são salvos localmente no navegador.
- Se houver conexão com a internet, o sistema tenta carregar notícias externas; caso contrário, usa notícias locais de fallback.
