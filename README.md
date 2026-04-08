For the Server Repository (server/README.md)
NovaNews Backend
This server handles news fetching, AI summarization, and database interactions for the NovaNews application.

Tech Stack
Runtime: Node.js and Express

Database: PostgreSQL via Supabase

AI Integration: Google Gemini API

Local Setup
Clone the repository:
git clone https://github.com/adyakatkar/server.git

Install dependencies:
npm install

Environment Variables:
Create a .env file in the root directory and add the following keys:

NEWS_API_KEY

GEMINI_API_KEY

SUPABASE_URL

SUPABASE_KEY

Start the server:
node server.js

The server will run on http://localhost:5000

For the Frontend Repository (client/README.md)
NovaNews Frontend
NovaNews is a web application that displays real-time news headlines and provides AI-generated summaries.

Tech Stack
Framework: React.js

Data Fetching: Axios

Backend Connection: Node.js Proxy

Local Setup
Clone the repository:
git clone https://github.com/adyakatkar/client.git

Install dependencies:
npm install

Configure API URL:
Open src/App.js and ensure the API_BASE_URL is set to http://localhost:5000.

Start the application:
npm start

The application will run on http://localhost:3000
