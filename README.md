# English Story Learning App

A full-stack application for learning English through interactive stories, vocabulary building, and minigames. Added features include AI-generated stories, gamified dashboard, and pronunciation practice.

## 🛠️ Tech Stack
- **Backend:** .NET 9 (ASP.NET Core Web API, Entity Framework Core)
- **Frontend:** Next.js 16 (React 19, TailwindCSS, TypeScript)
- **Database:** SQL Server (Express/LocalDB)

## 🚀 Getting Started

### Prerequisites
1. [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
2. [Node.js](https://nodejs.org/) (LTS version)
3. SQL Server (or SQL Server Express)

### 1. Database Setup
The project uses Entity Framework Core. Update the connection string in `backend/StoryLearning.Api/appsettings.json` if your SQL Server instance is different (default is `Server=SIMON-MY-COM\SQLEXPRESS`).

Apply migrations to create the database:
```bash
cd backend/StoryLearning.Api
dotnet tool install --global dotnet-ef
dotnet ef database update
```

### 2. Backend Setup
This project uses Google Gemini AI for generating stories.
1. Open `backend/StoryLearning.Api/appsettings.json`
2. Update `"GeminiApiKey"` with your API key.
   * **⚠️ IMPORTANT:** If you commit this code to GitHub, **REMOVE** your real API key from this file first!

Run the backend:
```bash
cd backend/StoryLearning.Api
dotnet run
```
The API will typically start at `http://localhost:5027`.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.
