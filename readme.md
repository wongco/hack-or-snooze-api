# hack-or-snooze-api

Hack-or-snooze-api is a RESTful API backend for a story/message posting board built in Node, Express & PostgreSQL.

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

2. Create database instances as referenced above

   - Production database

   ```
   createdb hack-or-snooze
   ```

   - (Optional - Test database)

   ```
   createdb hack-or-snooze-test
   ```

3. Use a global install of nodemon or start the program by running server.js

   ```
   nodemon server.js
   ```

   or

   ```
   node server.js
   ```

4. Install the postgresql schema tables onto your database.

   - (**Note, any of the steps below will reset and drop your existing tables**)

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
	npm run dbrefresh
	```

5. (Optional) - Twilio SMS Recovery Routes are unavailable unless a .env file or environmental variables are set with the appropriate Twilio Account Keys. Please see the config.js file for reference. Sign up at Twilio for a trial account to test them out.

   [https://www.twilio.com](https://www.twilio.com)

## Running Tests

- In the root folder, run:
  `npm test`

## Routes Reference

### Authentication

- POST - /login
- POST - /signup

### Users

- GET - /users
- GET - /users/username
- PATCH - /users/username
- DELETE - /users/username
- POST - /users/username/favorites/storyId
- DELETE - /users/username/favorites/storyId
- POST - /users/username/recovery
- PATCH - /users/username/recovery

### Stories

- GET - /stories
- POST - /stories
- GET - /stories/storyId
- PATCH - /stories/storyId
- DELETE - /stories/storyId

## Built With

- twilio - Programmable SMS - (Account Signup Required)
- Node.js - Server Language
- express.js - Node Web Framework
- PostgreSQL - SQL Database
- dotenv - Env Variable Parser
- bcrypt - Password Encryption Library
- jsonschema - JSON Validation Library
- jsonwebtoken - JSON Web Token
- cors - Cross Origin Resource Sharing Library
- pg - PostgreSQL client for Node.js
- phone - Phone Number Validation Library
- helmet - HTTP Header Protection

Testing stack:

- jest - Testing Library
- supertest - Testing Library (mock http requests)
- morgan - HTTP Request Logger
- faker - Generate Random Content

## Author

- WongCo - https://github.com/wongco
