# 📝 Gerenciador de Anotações Automático (Notion + Node.js)

Este projeto permite salvar anotações, links de react e marcações de tempo de live diretamente no Notion de forma automática, integrando-se perfeitamente com o bot da Twitch.

---

## 🚀 Como Configurar

### 1. Preparar o Notion
1. Crie as **Bases de Dados (Tabelas)** no seu Notion (uma para anotações gerais, uma para reacts e uma para marcações).
2. No canto superior direito de cada tabela, clique nos três pontinhos `...`, vá em **"Conectar a"** e selecione a sua Integração (API).
3. Copie o **ID de cada Base de Dados**: está na URL entre a última barra `/` e o ponto de interrogação `?`.
   * *Exemplo:* `notion.so/meu-projeto/`**`a8878d65426048d0a9202157a414e8a2`**`?v=...`

### 2. Obter o Token
1. Acesse [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Crie uma nova integração e copie o **Internal Integration Token** (`secret_...`).

### 3. Configurar o Ambiente (.env)
Crie um arquivo chamado `.env` na raiz do projeto e preencha com as suas chaves e as IDs das páginas que você criou:

```env
# Chave de Integração do Notion
NOTION_KEY=secret_seu_token_aqui

# IDs das Tabelas Específicas
NOTION_PAGE_ANOTACAOES_ID=seu_id_de_anotacoes
NOTION_PAGE_REACT_ID=seu_id_de_reacts
NOTION_PAGE_MARCADOS_ID=seu_id_de_marcacoes

# Configurações de Limite (Opcional)
LIMITE_REACT_DEFAULT=3