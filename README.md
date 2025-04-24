# 🏪 Physical Store API

API para gerenciamento de lojas físicas e cálculo de opções de entrega

## 📌 Visão Geral

A Physical Store API é uma solução completa para:

- Cadastro e gestão de lojas físicas
- Cálculo inteligente de opções de entrega
- Integração com serviços de geolocalização e fretes
- Disponibilização de dados para sistemas de e-commerce

## 🛠 Tecnologias Utilizadas

| Tecnologia       | Descrição                     |
| ---------------- | ----------------------------- |
| NestJS           | Framework backend             |
| MongoDB          | Banco de dados NoSQL          |
| Mongoose         | ODM para MongoDB              |
| Swagger          | Documentação de API           |
| Google Maps API  | Cálculo de distâncias e rotas |
| ViaCEP API       | Consulta de endereços por CEP |
| Melhor Envio API | Cálculo de fretes e prazos    |

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb://localhost:27017/physical-store
GOOGLE_MAPS_API_KEY=sua_chave_aqui
MELHOR_ENVIO_TOKEN=seu_token_aqui
```

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor em modo desenvolvimento
npm run start:dev

# Rodar testes
npm run test
```

Acesse a documentação interativa em:

http://localhost:3000/api

## 🌐 Endpoints Principais

| Método | Endpoint             | Descrição                              |
| ------ | -------------------- | -------------------------------------- |
| POST   | /stores              | Cria uma nova loja                     |
| GET    | /stores              | Lista todas as lojas (paginação)       |
| GET    | /stores/:storeID     | Busca loja por ID                      |
| GET    | /stores/state/:state | Busca lojas por estado (UF)            |
| GET    | /stores/cep/:cep     | Busca lojas por CEP com opções entrega |

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes específicos
npm run test stores.service.spec.ts
```

## 🔒 Segurança

- Validação de dados com class-validator
- Tratamento centralizado de erros
- Configuração segura de conexão MongoDB
- Variáveis sensíveis em .env

## 📄 Licença

MIT © 2024 Physical Store API
