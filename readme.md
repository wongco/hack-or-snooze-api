# hack-or-snooze-api

Hack-or-snooze-api is a RESTful API backend for story/message posting board built in node, express & postgresql.

## Prerequisites

You will need to have the following items installed in order to run this program:

1. Install Node.js and npm
2. Install PostgreSQL
3. Create databases for application

- hack-or-snooze
- hack-or-snooze-test (if you want to run the tests)

## Getting Started

1. Fork or clone the repo, and run npm install. package.json has all required dependencies.

   - only production packages

   ```
   npm install --production
   ```

   - only dev packages

   ```
   npm install --only=dev
   ```

   - Install Everything

   ```
   npm install
   ```

2. Use a global install of nodemon or start the program by running server.js

   ```
   nodemon server.js
   ```

   or

   ```
   node server.js
   ```

3. Install the postgresql schema tables onto your database.

   For production database:

   ```
   psql hack-or-snooze < data.sql
   ```

   For test database:

   ```
   psql hack-or-snooze-test < data.sql
   ```

   If you want to load sample data on your database, run the following command:

   ```
   node ./helpers/addUserData.js
   ```

## Running Tests

- In the root folder, run:
  `npm test`

## Routes Reference

### Authentication

- POST - /login

### Users

- GET - /users
- POST - /users
- GET - /users/username
- PATCH - /users/username
- DELETE - /users/username

### Companies

- GET - /companies
- POST - /companies
- GET - /companies/handle
- PATCH - /companies/handle
- DELETE - /companies/handle

### Jobs

- GET - /jobs
- POST - /jobs
- GET - /jobs/id
- PATCH - /jobs/id
- DELETE - /jobs/id
- POST - /jobs/id/apply

## Built With

- Node.js - Server Language
- express.js - Node Web Framework
- dotenv - Env Variable Parser
- bcrypt - Password Encryption Library
- jsonschema - JSON Validation Library
- jsonwebtoken - JSON Web Token
- pg - PostgreSQL client for Node.js

Testing stack:

- jest - Testing Library
- supertest - Testing Library (mock http requests)
- morgan - HTTP Request Logger

## Authors

- WongCo - https://github.com/wongco
- Ronihe - https://github.com/Ronihe
