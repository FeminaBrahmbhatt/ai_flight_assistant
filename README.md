# AI Flight Assistant ✈️

A TypeScript-based CLI chatbot powered by OpenAI’s GPT models, capable of assisting users with flight information and reservations.  
The assistant uses **OpenAI’s function calling** feature to dynamically invoke backend functions for:
- Fetching available flights between two airports
- Making reservations for selected flights

---

## 🚀 Features
- Written in **TypeScript** with full type safety
- **Reusable function registry** — easily add new tools without changing core logic
- **Dynamic OpenAI tool generation** from the registry
- Clean, maintainable, and extensible code structure
- CLI interface for interactive flight queries

---

## 🛠 Tech Stack
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI GPT Models](https://platform.openai.com/docs/guides/function-calling)

---

## 📦 Installation

1. **Clone the repository**  
   Run:  
   `git clone https://github.com/<your-username>/ai_flight_assistant.git`  
   `cd ai_flight_assistant`

2. **Install dependencies**  
   Run:  
   `npm install`

3. **Set up environment variables**  
   Create a `.env` file in the project root and add:  
   `OPENAI_API_KEY=your_openai_api_key_here`

---

## ▶️ Usage

**Start the assistant**  
Run:  
`npm start`

**Example interaction**

Welcome to flight assistant chatbot!
> Find me flights from SFO to LAX

Getting available flights
> Reserve UA 123

Reserving flight UA 123
