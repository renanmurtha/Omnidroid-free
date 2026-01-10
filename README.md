[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Twitch Helix](https://img.shields.io/badge/Twitch_Helix_API-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://dev.twitch.tv/docs/api/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Notion API](https://img.shields.io/badge/Notion_API-000000?style=for-the-badge&logo=notion&logoColor=white)](https://developers.notion.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)](https://www.json.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

---

# 🤖 Omnidroids - Twitch Bot

O **Omnidroids** é um bot de interação para a Twitch, focado no engajamento da comunidade através de minigames, integrações com o Notion para salvar anotações e utilitários de moderação.

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

- **!termo**: Jogo de adivinhação de palavras (estilo Termo / Wordle / Forca).
  - `!termo iniciar`: Inicia uma nova partida (Mods/Broadcaster).
  - `!termo letra <letra>`: Tenta uma letra individual.
  - `!termo palavra <palavra>`: Tenta o palpite final.
- **!previsao**: Executa o comando Oraculum.
- **!sorte**: Solicita um biscoito da sorte.

---

### ⚙️ Termo Settings

Se alterar o tamanho da palavra, atualize o arquivo correspondente.  
No terminal, acesse a pasta `games` e execute:

    PS Omnidroid-v.X1_free\games node getDicionairo.js
    Valor de TEMRMO_TAMANHO_DA_PALAVRA: 5
    ✅ JSON gerado com 6026 palavras.

---

### 📝 Integração com Notion

- **!anotar**: Salva notas gerais.
- **!react**: Envia links validados para uma lista de reacts (com limite diário).
- **!marcar**: Salva um assunto com o tempo atual da live (Uptime).

---

### 🛠️ Utilitários e Moderação

- **!clima <cidade>**: Retorna um link do Windy com a previsão do tempo.
- **!aniversario**: Gerencia e parabeniza usuários por aniversários.
- **Feliz Aniversário automático**: envia uma mensagem automática para quem está de aniversário no dia.
- **!streamer <add|del>**: Gerencia streamers parceiros (Raid/Join).
- **Boas-vindas automáticas** para novos usuários e reconhecimento de subs.

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

## 🚀 Instalação

- **Clone o repositório** e acesse a pasta do projeto:
  - `git clone <repo-url> && cd Omnidroid-free`
- **Verifique a versão do Node** (recomenda-se Node 18+):
  - `node -v`
- **Instale as dependências** conforme o ambiente:
  - `npm install --production` (Produção/Servidor)
  - `npm install` (Desenvolvimento local)
- **Garanta o cross-env** em produção:
  - `npm install cross-env --save`
- **Scripts disponíveis** no `package.json`:
  - `npm run dev`: Inicia com nodemon em ambiente de desenvolvimento.
  - `npm start`: Inicia com node em ambiente de produção.
- **Alternativa via PM2** (Orquestrador):
  - `pm2 start index.js --name omnidroids --env production`

---