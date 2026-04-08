NovaNews Backend
This is the Node.js and Express server for the NovaNews application. It handles news data retrieval, AI summarization logic, and database interactions.

Prerequisites
Node.js installed

npm (Node Package Manager)

Setup and Installation
Clone the repository to your local machine.

Open a terminal in the project directory.

Install the dependencies:
npm install

Configuration
Create a file named .env in the root directory.

Add the following environment variables (ensure values are provided in the application document):

NEWS_API_KEY

GEMINI_API_KEY

SUPABASE_URL

SUPABASE_KEY

Running the Server
Start the server using the command:
node server.js

The server will be active at http://localhost:5000.
