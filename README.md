# ConnectSphere

*Uma plataforma social interativa para compartilhar publicações, interagir com outros usuários e criar conexões por meio de comentários, curtidas e uploads de imagens.*

Construído com as seguintes ferramentas e tecnologias:

- **Frontend:** Vite, TypeScript, Tailwind CSS, React
- **Backend:** Node.js, Express, Prisma
- **Banco de Dados:** SQLite

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Primeiros Passos](#primeiros-passos)

---

## Visão Geral

O ConnectSphere é uma aplicação web full-stack que permite aos usuários criar, compartilhar e interagir com publicações em uma plataforma social dinâmica. O frontend, desenvolvido com React, TypeScript, Vite e Tailwind CSS, oferece uma interface responsiva e moderna, com tipagem estática para maior segurança no código. O backend, construído com Node.js, Express e Prisma em JavaScript, fornece uma API robusta para gerenciar usuários, publicações, comentários e uploads de imagens. A integração com o Prisma garante flexibilidade no gerenciamento do banco de dados, suportando sistemas como SQLite para desenvolvimento ou PostgreSQL/MySQL para produção.

A plataforma é ideal para usuários que desejam compartilhar conteúdos criativos, como textos e imagens, e se conectar com outros por meio de interações como comentários e curtidas. O uso de Vite no frontend assegura tempos de carregamento rápidos, enquanto o TypeScript melhora a manutenção do código. No backend, a arquitetura modular facilita a adição de novas funcionalidades, e a autenticação segura permite que os usuários gerenciem suas contas e conteúdos com confiança.

---

## Funcionalidades

O ConnectSphere oferece funcionalidades que promovem uma experiência social envolvente. Abaixo está uma descrição detalhada de cada uma:

- **Autenticação e Autorização de Usuários**  
  Usuários podem se registrar fornecendo um e-mail e senha, com validações no backend para garantir dados seguros. Após o login, a autenticação (geralmente via JWT) protege endpoints da API, restringindo ações como criar publicações ou editar perfis a usuários autenticados. A autorização garante que apenas o proprietário de uma publicação ou comentário possa editá-lo ou excluí-lo. No frontend, formulários React com TypeScript validam entradas em tempo real, exibindo mensagens de erro para credenciais inválidas ou campos obrigatórios ausentes.

- **Criação, Leitura, Atualização e Exclusão de Publicações (CRUD)**  
  Usuários autenticados podem criar publicações com texto e imagens, que são armazenadas no banco de dados via Prisma e exibidas no feed geral ou no perfil do usuário. O frontend utiliza componentes React tipados com TypeScript para formulários de criação e edição, com visualização prévia de imagens. A leitura de publicações suporta paginação para carregar conteúdos dinamicamente, otimizando o desempenho. Usuários podem editar suas publicações (ex.: corrigir texto ou substituir imagens) ou excluí-las, com validações no backend para verificar permissões e no frontend para feedback visual.

- **Comentários em Publicações**  
  Usuários autenticados podem comentar em qualquer publicação, com os comentários exibidos abaixo do post, incluindo autor e data. O frontend renderiza comentários em tempo real usando componentes React, enquanto o backend valida o conteúdo (ex.: tamanho máximo) e associa o comentário à publicação via Prisma. Usuários podem editar ou excluir seus próprios comentários, com verificações no backend para impedir alterações não autorizadas. TypeScript no frontend garante que os dados dos comentários sejam tipados corretamente para a API.

- **Curtidas em Publicações**  
  Usuários podem curtir publicações com um clique, com o contador de curtidas atualizado dinamicamente no frontend. O backend gerencia curtidas por usuário, evitando duplicações, e armazena a relação no banco de dados. A funcionalidade de descurtir permite remover a curtida, com feedback visual imediato (ex.: ícone de coração). No frontend, TypeScript tipa as requisições e respostas da API, garantindo manipulação segura dos dados.

- **Perfis de Usuário**  
  Cada usuário possui um perfil que exibe nome, foto de perfil (se enviada) e suas publicações. O frontend renderiza perfis com componentes React reutilizáveis, enquanto o backend fornece endpoints para recuperar e atualizar dados. Usuários podem editar informações pessoais ou fazer upload de uma nova foto de perfil, com validações para formato e tamanho. Perfis são públicos para visualização de publicações, mas a edição é restrita ao proprietário, com TypeScript no frontend assegurando tipagem consistente.

- **Upload de Imagens**  
  A plataforma suporta uploads de imagens para publicações e fotos de perfil, gerenciados pelo Multer no backend e salvos no diretório `uploads/`. O frontend oferece uma interface para selecionar arquivos, com visualização prévia e validações TypeScript para formatos (ex.: JPEG, PNG) e tamanho máximo. O backend verifica arquivos para evitar uploads maliciosos, retornando URLs para as imagens. O Prisma associa imagens aos registros correspondentes no banco de dados.

---

## Estrutura do Projeto

Abaixo está a estrutura do projeto, com os principais diretórios e arquivos:

```sh
└── /
    ├── client
    │   ├── src
    │   ├── public
    │   ├── vite.config.ts
    │   ├── tailwind.config.js
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsconfig.app.json
    │   ├── tsconfig.node.json
    │   └── eslint.config.js
    └── server
        ├── controllers
        ├── middleware
        ├── prisma
        ├── routes
        ├── uploads
        ├── .env
        ├── index.js
        ├── multerConfig.js
        ├── migrateImages.js
        └── package.json
```

### Descrição Detalhada

- **`client/`**: Contém o frontend, desenvolvido com TypeScript para tipagem estática e maior robustez.
  - **`src/`**: Arquivos-fonte da aplicação React, incluindo:
    - **Componentes**: Para feed, formulários de login/registro, perfis e comentários, todos tipados com TypeScript.
    - **Hooks**: Gerenciam estado (ex.: `useAuth`) e chamadas à API (via Axios), com interfaces TypeScript para respostas.
    - **Utilitários**: Funções para formatação de dados ou validações, tipadas para evitar erros.
  - **`public/`**: Arquivos estáticos, como favicon e `index.html`, ponto de entrada do Vite.
  - **`vite.config.ts`**: Configura o Vite, definindo plugins (ex.: `@vitejs/plugin-react`), portas (ex.: 5173) e caminhos absolutos para imports, com suporte a TypeScript.
  - **`tailwind.config.js`**: Personaliza o Tailwind CSS, com cores, fontes e estilos reutilizáveis.
  - **`package.json`**: Lista dependências como `react`, `typescript`, `axios`, `react-router-dom`, `react-toastify`, e ferramentas de desenvolvimento como `@vitejs/plugin-react`.
  - **`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`**: Configurações do TypeScript, habilitando strict mode, JSX e caminhos absolutos.
  - **`eslint.config.js`**: Regras de linting integradas com TypeScript para manter a qualidade do código.

- **`server/`**: Contém o backend, escrito em JavaScript, gerenciando a API e o banco de dados.
  - **`controllers/`**: Lógica de negócios em arquivos como `authController.js`, `postController.js`, `commentController.js` e `userController.js`. Cada controlador processa requisições HTTP, interage com o Prisma e retorna respostas JSON.
  - **`middleware/`**: Middlewares personalizados, como autenticação (verificação de tokens), validação de dados (ex.: usando Zod, se implementado) e tratamento de erros, escritos em JavaScript.
  - **`prisma/`**: Inclui `schema.prisma`, que define modelos como `User`, `Post`, `Comment` e `Like`, e o diretório `migrations/` com scripts SQL para atualizações do banco (ex.: `20250617153706_add_comments_and_likes`).
  - **`routes/`**: Define rotas da API em arquivos como `auth.js`, `posts.js`, `comments.js` e `users.js`, mapeando endpoints (ex.: `POST /api/posts`) para controladores, usando Express Router.
  - **`uploads/`**: Armazena imagens enviadas, gerenciado pelo Multer.
  - **`.env`**: Contém variáveis como `DATABASE_URL` e `PORT` (ex.: 3000).
  - **`index.js`**: Ponto de entrada do servidor Express, configurando middlewares, rotas e conexão com o Prisma.
  - **`multerConfig.js`**: Configura o Multer para uploads, definindo formatos, tamanhos e destino (`uploads/`).
  - **`migrateImages.js`**: Script para manipulação de imagens (se implementado).
  - **`package.json`**: Lista dependências como `express`, `@prisma/client`, `multer`, `nodemon`, e opcionais como `jsonwebtoken` ou `zod`.

---

## Primeiros Passos

### Pré-requisitos

- **Linguagem de Programação:** JavaScript (backend) e TypeScript (frontend), executados via Node.js (versão recomendada 16 ou superior).
- **Gerenciador de Pacotes:** npm (versão recomendada 8 ou superior).
- **Node.js:** Necessário para o frontend (Vite) e backend (Express).
- **Banco de Dados:** SQLite (para desenvolvimento) ou PostgreSQL/MySQL (para produção), configurado via Prisma.

### Instalação

1. **Clonar o repositório:**  
   ```sh
   git clone https://github.com/VinceMendneck/ConnectSphere
   ```

2. **Navegar até o diretório do projeto:**  
   ```sh
   cd ConnectSphere
   ```

3. **Instalar as dependências:**  
   - Para o frontend:
     ```sh
     cd client
     npm install
     cd ..
     ```
   - Para o backend:
     ```sh
     cd server
     npm install
     cd ..
     ```

4. **Configurar o banco de dados:**  
   No diretório `server/`, crie um arquivo `.env` com:
   ```
   DATABASE_URL="sua-url-do-banco-de-dados"
   ```
   Exemplo para SQLite: `DATABASE_URL="file:./dev.db"`.  
   Aplique as migrações do Prisma:
   ```sh
   cd server
   npx prisma migrate deploy
   ```

### Uso

1. **Iniciar o backend:**  
   No diretório `server/`, execute:
   ```sh
   cd server
   npm start
   ```
   O servidor iniciará na porta configurada (ex.: 3000), fornecendo a API.

2. **Iniciar o frontend:**  
   Em outro terminal, no diretório `client/`, execute:
   ```sh
   cd client
   npm start
   ```
   O frontend iniciará na porta 5173 e abrirá no navegador.

3. **Acessar a aplicação:**  
   Abra `http://localhost:5173` no navegador para usar o ConnectSphere.

---
