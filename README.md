# Physical Store API

Esta é uma API para cadastro e consulta de lojas com base em coordenadas geográficas e CEP. Permite adicionar novas lojas e buscar lojas próximas a um determinado CEP.

## Tecnologias Utilizadas

- Node.js
- Express.js
- TypeScript
- MongoDB (com Mongoose)
- Winston (para logging)
- Axios (para chamadas a APIs externas)

## Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/victor-co/physical-store.git
   cd physical-store
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Configure o arquivo `.env` com as credenciais do MongoDB:
   ```sh
   MONGODB_URI=sua_string_de_conexao
   PORT=3000
   ```
4. Inicie o servidor:
   ```sh
   npm run dev
   ```

## Endpoints

#### 🚀 Passos para testar:

1. Instale o Postman, caso ainda não tenha.
2. Inicie o servidor localmente (`npm run dev` ou `npm start`).
3. Utilize os seguintes endpoints para testar a API:

### Criar uma loja

- **POST** `/api/stores`
- **Body:**
  ```json
  {
    "name": "Minha Loja",
    "cep": "01001000"
  }
  ```
- **Resposta:**
  ```json
  {
    "name": "Minha Loja",
    "cep": "01001000",
    "street": "Praça da Sé",
    "neighborhood": "Sé",
    "city": "São Paulo",
    "state": "SP",
    "latitude": -23.55052,
    "longitude": -46.633308
  }
  ```

### Buscar lojas próximas

- **GET** `/api/stores/nearby?cep=01001000`
- **Resposta:**
  ```json
  [
    {
      "store": {
        "name": "Loja Exemplo",
        "cep": "01002000",
        "latitude": -23.5506,
        "longitude": -46.6342
      },
      "distance": "1.2 Km"
    }
  ]
  ```
