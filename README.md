## Introduction
SQL generator and console that knows your schema and entity relations. Powered by latest OpenAI Assistant API and GPT-4.

DB Assistant is a Next.js app that uses latest OpenAI Assistant API to provide SQL generation through chat. DB Assistant will call functions automatically to fetch your table schemas and relations to generate more accurate SQL based on your data than vanilla ChatGPT.

Currently it ONLY supports Postgres SQL.

## Screenshots Demo
<img width="1593" alt="screenshot-chat" src="https://github.com/chat-stack/db-assistant/assets/8742155/e72d96a8-b5d3-41df-a266-dca506d1a653">

<img width="1601" alt="screenshot-sql-console" src="https://github.com/chat-stack/db-assistant/assets/8742155/806259b7-aa6e-4d1f-be4d-500713de2a27">

## Getting Started

To install run

```
pnpm install
```

And to start dev run

```
pnpm dev
```

Head to settings page. Fill in your OpenAI API Key and Postgres SQL database credentials. Then you can create an assistant there. Now head to DB Chat page to start a chat.

**Disclaimer:**
- Your credentials are persisted locally. If you still have security concerns you can manually clear them after usage.
- It's better to run this locally than deploy it. Its backend uses polling on OpenAI Assistant API resulting in a lot of function execution GB-Hrs.
- This app requires your OpenAI API key (Assistant + GPT-4) and you need to pay attention on the cost since it generate many tokens into prompt to make GPT generate more accurate SQL based on your database information.

DB assistant won't execute SQL, but you can copy the SQL to console tab and execute them there. But I still suggest you use a dev database or a read-only user to prevent potential data loss because we cannot predict the SQL generated by AI. Once you get the SQL you want you can manually execute it on your production database.

## Features

- Create OpenAI Assistant with built-in custom instructions and dynamically fetched table names.
- Dynamically fetch table schemas with OpenAI functions
- Dynamically fetch entity relations with OpenAI functions
- Generate SQLs and run/debug them right in SQL console tab.

## Tech stack

- Next.js
- OpenAI API
- Ant Design
- Zustand
- Tailwind
- more in package.json

## Feedbacks

Have questions, bug reports or feature request? Feel free to open a github issue or PR.
