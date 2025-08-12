AI Flight Assistant ✈️
A TypeScript-based CLI chatbot powered by OpenAI’s GPT models, capable of assisting users with flight information and reservations.
The assistant uses OpenAI’s function calling feature to dynamically invoke backend functions for:

Fetching available flights between two airports

Making reservations for selected flights

Features

Written in TypeScript with full type safety

Reusable function registry — easily add new tools without changing core logic

Dynamic OpenAI tool generation from the registry

Clean, maintainable, and extensible code structure

CLI interface for interactive flight queries

Tech Stack

Node.js

TypeScript

OpenAI GPT models (function calling)

Example Usage

bash
Copy
Edit
$ npm start
Welcome to flight assistant chatbot!
> Find me flights from SFO to LAX
Getting available flights
> Reserve UA 123
Reserving flight UA 123