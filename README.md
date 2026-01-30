[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Twitch Helix](https://img.shields.io/badge/Twitch_Helix_API-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://dev.twitch.tv/docs/api/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Notion API](https://img.shields.io/badge/Notion_API-000000?style=for-the-badge&logo=notion&logoColor=white)](https://developers.notion.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)](https://www.json.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

---

# 🤖 Omnidroids - Twitch Bot

O **Omnidroids** é um bot de interação para a Twitch, focado no engajamento da comunidade através de minigames, gerenciamento de sorteios, integrações com o Notion para salvar anotações e utilitários de moderação.

Esta versão (**Gratuita**, self-host) não inclui o sistema de sorteios, pois essa funcionalidade é de uso exclusivo do meu canal.  
Ela serve como uma base para que você crie e mantenha sua própria implementação de acordo com a sua live.

---

## ⚖️ Licença (GPL v3)

Este projeto está licenciado sob a **GNU GPL v3**. Isso significa que você pode usar, modificar e até comercializar, desde que:
1. **Mantenha os créditos** do autor original.
2. **Distribua sob a mesma licença** (o código deve permanecer aberto, mesmo em versões modificadas ou comerciais).

##### Autor: [Renan Murtha](https://www.twitch.tv/The_IoT_Crowd)
---

## 🚀 Funcionalidades

### 📡 Monitoramento

- O **Omnidroids** realiza uma checagem cíclica a cada **30 minutos**, independentemente do status da transmissão.
- Se a live estiver **online** e o bot em repouso, ele conecta-se ao chat.
- Se a live estiver **offline** e o bot ativo, ele se desconecta e retorna ao modo adormecido.

---

### 🎮 Jogos e Interação

- **!termo**: Jogo de adivinhação (Estilo Termo / Forca).
  - `!termo iniciar`: Inicia partida (Apenas Mods/Broadcaster).
  - `!termo parar`: Encerra a partida atual (Apenas Mods/Broadcaster).
  - `!termo letra <letra>`: Tenta adivinhar uma letra individual.
  - `!termo palavra <palavra>` ou `!termo chute <palavra>`: Tenta o palpite final.
- **!previsao**: Executa o comando Oraculum (Previsão baseada em usuários ativos).
- **!sorte**: Solicita um biscoito da sorte para o usuário.

---

### ⚙️ Termo Settings

Se alterar o tamanho da palavra, atualize o arquivo correspondente.  
No terminal, acesse a pasta `games` e execute:

    PS Omnidroid-v.X1_free\games node getDicionairo.js
    Valor de TEMRMO_TAMANHO_DA_PALAVRA: 5
    ✅ JSON gerado com 6026 palavras.

---

### 📝 Integração com Notion

- `!anotar <texto>`: Salva uma anotação geral (Possui cooldown de 1 min).
- `!react <link>`: Salva links validados para reacts (Valida URL, possui limite diário e cooldown).
- `!marcar <assunto>`: Salva o assunto junto com o **Uptime atual** da live (Apenas se a live estiver online).

---

### 🛠️ Utilitários e Moderação


`!clima <cidade>`: Retorna o link do Windy com a localização sanitizada.
`!aniversario <DD/MM>`: Gerencia a data de nascimento do usuário.
  - Usuários: definem o próprio aniversário `!aniversario 25/12`.
  - Dono do canal: pode inserir seu seu aniversário como usuário comum; e atualizar o aniversário de qualquer usuário (incluindo o seu) usando `!aniversario <DD/MM> <username>`.
  - Exemplo: `!aniversario 25/12 fulano` (apenas dono do canal pode atualizar de outro usuário).

**Aniversariantes do dia**: Identificação automática ao entrar no chat (Join).

`!streamer <add|del> @usuario`: Gerencia a lista de streamers parceiros para saudações automáticas (Apenas Mods/Broadcaster).

**Reconhecimento de Subs**: Mensagens personalizadas para novos subs, resubs e subgifts.

---

## 🧰 Tecnologias Utilizadas

- [tmi.js](https://tmijs.com/)
- [Twitch Helix](https://dev.twitch.tv/docs/api/reference)
- [Notion API](https://developers.notion.com/)
- [SQLite](https://www.sqlite.org/)
- [Node.js](https://nodejs.org/)

---

## ⚙️ Configuração

### 1. Pré-requisitos

- Criar um app no [Twitch Dev Console](https://dev.twitch.tv/console)
- Criar uma key no Notion conforme [Notion.md](Notion.md)

### 2. Variáveis de Ambiente

Renomeie `.env.exemple` para `.env` e configure:

    CLIENT_ID=seu_client_id_aqui
    CLIENT_SECRET=seu_client_secret_aqui
    CHANNEL_NAME=seu_canal_aqui
    BOT_NAME=Omnidroids

    REFRESH_TOKEN=auto
    OAUTH_TOKEN=oauth:auto
    BROADCASTER_ID=auto
    BOT_ID=auto

    REDIRECT_URI=http://localhost:8080

    TEMRMO_TAMANHO_DA_PALAVRA=5
    TEMRMO_MAX_ERROS=6

    DATABASE_NAME=omnidroids

    NOTION_KEY=NOTION_KEY
    NOTION_PAGE_REACT_ID=NOTION_PAGE_REACT_ID
    NOTION_PAGE_MARCADOS_ID=NOTION_PAGE_MARCADOS_ID
    NOTION_PAGE_ANOTACAOES_ID=NOTION_PAGE_ANOTACAOES_ID

    LIMITE_REACT_DEFAULT=3

---

## 📦 Instalação

- **Clone o repositório** e acesse a pasta do projeto:
  - `git clone https://github.com/renanmurtha/Omnidroid-free.git && cd Omnidroid-free`
- **Verifique a versão do Node** (recomenda-se Node 18+):
  - `node -v`
- **Instale as dependências** conforme o ambiente:
  - `npm install --production` (Produção/Servidor)
  - `npm install` (Desenvolvimento local)
- **Garanta o cross-env** em produção:
  - `npm install cross-env --save`
- **Scripts configurados** no `package.json`:
  - `npm run dev`: Inicia via nodemon (Ambiente de desenvolvimento).
  - `npm start`: Inicia via node (Ambiente de produção).
- **Alternativa via PM2** (Servidor):
  - `pm2 start index.js --name omnidroids --env production`

---

## 🐳 Deploy com Docker Compose

Para executar o Omnidroids usando Docker Compose:

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. Configure o arquivo `docker-compose.yml` conforme necessário para o seu ambiente (verifique variáveis).
3. Configure o arquivo `.env` conforme instruções anteriores.
4. Execute o comando abaixo na raiz do projeto:

```
  docker compose up -d
```
O serviço será iniciado em segundo plano. Para parar:
```
  docker compose down
```

Você pode customizar variáveis de ambiente no arquivo `.env` para ajustar o comportamento do bot.

> 💡 O arquivo `docker-compose.yml` também pode ser utilizado em ferramentas de gerenciamento de containers, como o Portainer, para facilitar o deploy e administração do serviço via interface gráfica.

---