[English](README.md) | [中文](README-zh-cn.md)

中文版由GPT-4翻译，作者稍微校正了下

## 引言
DB Assistant是一个SQL生成器和控制台，了解您的表结构和实体关系。由最新的OpenAI Assistant API和GPT-4提供动力。

DB Assistant是一个使用最新的OpenAI Assistant API的Next.js应用，通过聊天提供SQL生成。DB Assistant将自动调用函数来获取您的表结构和关系，以生成基于您数据的更准确的SQL，优与普通版本的ChatGPT。

目前它仅支持Postgres SQL。

## 屏幕截图演示
<img width="1594" alt="screenshot-chat" src="https://github.com/chat-stack/db-assistant/assets/8742155/706afd49-d54b-4702-b5c8-48e1a7d362f3">

<img width="1596" alt="screenshot-console" src="https://github.com/chat-stack/db-assistant/assets/8742155/ea13e6d2-968c-4b74-aacc-b1b9ad383f6b">

## 入门

要安装，请运行

```
pnpm install
```

要开始开发，请运行

```
pnpm dev
```

前往设置页面。填写您的OpenAI API密钥和Postgres SQL数据库凭据。然后您可以在那里创建一个助手。现在前往DB Chat页面开始聊天。

提示：要开始一个新的聊天线程，请刷新您的页面。

**免责声明：**
- 您的凭据会在本地持久化。如果您仍然有安全顾虑，您可以在使用后手动清除它们。
- 最好在本地运行此应用，而不是部署它。其后端使用对OpenAI Assistant API的轮询，导致大量函数执行GB-Hrs。
- 此应用需要您的OpenAI API密钥（Assistant+GPT-4），您需要注意成本，因为它会生成许多令牌到提示中，以使GPT基于您的数据库信息生成更准确的SQL。

DB assistant不会执行SQL，但您可以将SQL复制到控制台选项卡中并在那里执行。但我仍然建议您使用开发数据库或只读用户来防止潜在的数据丢失，因为我们无法预测AI生成的SQL。一旦您获得您想要的SQL，您可以手动在您的生产数据库上执行它。

## 特点

- 创建具有内置自定义指令和动态获取的表名的OpenAI助手。
- 使用OpenAI函数动态获取表架构。
- 使用OpenAI函数动态获取实体关系。
- 在SQL控制台选项卡中生成SQL，并直接运行/调试它们。

## 技术栈

- Next.js
- OpenAI API
- Ant Design
- Zustand
- Tailwind
- 更多在package.json中

## 反馈

有问题、错误报告或功能请求？欢迎在github上开设问题或PR