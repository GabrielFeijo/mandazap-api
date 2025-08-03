# Manda Zap API

## 🚀 Funcionalidades

- **🔐 Autenticação JWT** - Autenticação e autorização seguras
- **📱 Integração com WhatsApp** - Gerenciamento de múltiplas instâncias via Baileys
- **💾 MongoDB com Prisma** - Persistência de dados robusta com ORM
- **🔄 Comunicação em Tempo Real** - Suporte a WebSocket para atualizações ao vivo
- **📊 Histórico de Mensagens** - Rastreamento completo de mensagens e contatos

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- Banco de dados MongoDB
- Gerenciador de pacotes npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/GabrielFeijo/mandazap-api
   cd manda-zap-api
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configuração do Ambiente**
   Crie um arquivo `.env` na raiz do projeto:

   ```env
   # Banco de Dados
   DATABASE_URL="mongodb://localhost:27017/manda-zap"

   # Segredo JWT
   JWT_SECRET="sua-chave-jwt-secreta"

   # Configurações do Servidor
   PORT=3333
   CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

   # Configurações do Swagger (Documentação da API) - OPCIONAL
   SWAGGER_USER="admin"
   SWAGGER_PASSWORD="sua-senha-swagger-segura"
   ```

4. **Configuração do Banco de Dados**

   ```bash
   # Gerar cliente Prisma
   npm run prisma:generate

   # Aplicar schema no banco
   npm run prisma:push
   ```

5. **Inicie a aplicação**

   ```bash
   # Modo de desenvolvimento
   npm run start:dev

   # Modo de produção
   npm run build
   npm run start:prod
   ```

## 📚 Documentação da API

### Acesso à Documentação Swagger

Com a aplicação em execução, acesse a documentação interativa da API em:

```
http://localhost:3333/docs
```

### 🔐 Autenticação da Documentação

A documentação possui proteção por autenticação básica:

| Ambiente               | Acesso    | Credenciais                 |
| ---------------------- | --------- | --------------------------- |
| **Development**        | Livre     | Sem autenticação            |
| **Production/Staging** | Protegido | Usuário e senha necessários |

**Credenciais padrão:**

- **Usuário**: `admin` (ou valor da variável `SWAGGER_USER`)
- **Senha**: `admin` (ou valor da variável `SWAGGER_PASSWORD`)

### 🔑 Autenticação JWT na Documentação

Para testar endpoints protegidos:

1. **Faça login** através do endpoint `/auth/login`
2. **Copie o token** JWT retornado
3. **Clique no botão "Authorize"** no topo da página
4. **Cole o token**
5. **Teste os endpoints** protegidos normalmente

## 🔧 Endpoints da API

### Autenticação

| Método | Endpoint         | Descrição                            |
| ------ | ---------------- | ------------------------------------ |
| POST   | `/auth/register` | Registrar um novo usuário            |
| POST   | `/auth/login`    | Autenticar usuário e obter JWT token |

### Usuários

| Método | Endpoint         | Descrição                      |
| ------ | ---------------- | ------------------------------ |
| GET    | `/users/profile` | Obter perfil do usuário logado |

### Instâncias do WhatsApp

| Método | Endpoint                             | Descrição                        |
| ------ | ------------------------------------ | -------------------------------- |
| POST   | `/whatsapp/instances`                | Criar nova instância de WhatsApp |
| GET    | `/whatsapp/instances`                | Listar instâncias do usuário     |
| GET    | `/whatsapp/instances/:id`            | Obter instância específica       |
| POST   | `/whatsapp/instances/:id/connect`    | Conectar instância ao WhatsApp   |
| POST   | `/whatsapp/instances/:id/disconnect` | Desconectar instância            |

### Mensagens

| Método | Endpoint                               | Descrição                |
| ------ | -------------------------------------- | ------------------------ |
| GET    | `/whatsapp/instances/:id/messages`     | Listar mensagens         |
| POST   | `/whatsapp/instances/:id/send-message` | Enviar mensagem de texto |

### Contatos

| Método | Endpoint                           | Descrição       |
| ------ | ---------------------------------- | --------------- |
| GET    | `/whatsapp/instances/:id/contacts` | Listar contatos |

## 🏗️ Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── dto/              # DTOs de autenticação
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                # Gerenciamento de usuários
│   ├── dto/              # DTOs de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── whatsapp/             # Integração com WhatsApp
│   ├── dto/              # DTOs de WhatsApp
│   ├── whatsapp.controller.ts
│   ├── whatsapp.service.ts
│   ├── baileys.service.ts
│   ├── whatsapp.gateway.ts
│   └── whatsapp.module.ts
├── prisma/               # Configuração do banco
│   └── schema.prisma
├── decorators/
├── main.ts               # Arquivo principal
└── app.module.ts         # Módulo raiz
```

## 🗄️ Esquema do Banco

A aplicação utiliza MongoDB com as seguintes entidades principais:

- **User** - Contas e autenticação de usuários
- **WhatsAppInstance** - Instâncias de WhatsApp por usuário
- **Contact** - Contatos do WhatsApp
- **Message** - Histórico de mensagens
- **Media** - Arquivos de mídia enviados/recebidos
- **AuthSession** - Sessões do WhatsApp

## 📦 Scripts

```bash
# Desenvolvimento
npm run start:dev       # Iniciar em modo desenvolvimento
npm run start:debug     # Iniciar com debug

# Produção
npm run build           # Build da aplicação
npm run start:prod      # Iniciar em modo produção

# Banco de dados
npm run prisma:generate # Gerar cliente Prisma
npm run prisma:push     # Aplicar schema no banco
npm run prisma:migrate  # Executar migrações

# Qualidade de Código
npm run lint            # Rodar ESLint
npm run format          # Formatar com Prettier
```

- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" width="40" height="40"/>ㅤ<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" width="40" height="40"/><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" width="40" height="40"/><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg" width="40" height="40" />
