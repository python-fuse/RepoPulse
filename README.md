# 📊 RepoPulse

**An intelligent GitHub repository analysis assistant powered by Mastra AI**

RepoPulse is an AI-powered agent that provides deep insights into GitHub repositories, analyzing activity levels, health metrics, and development trends. Built with Mastra.ai framework, it uses Google's Gemini 2.5 Flash model to deliver intelligent repository analysis through natural conversation.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Leverages Google Gemini 2.5 Flash for intelligent repository insights
- 📈 **Activity Tracking**: Monitors commit frequency and categorizes activity levels (High/Medium/Low)
- 🔍 **Repository Metrics**: Fetches stars, forks, open issues, and more
- 💬 **Natural Conversation**: Chat naturally with the agent to get repository information
- 🧠 **Memory System**: Maintains conversation context using LibSQL storage
- 🌐 **Agent-to-Agent Protocol**: Supports A2A (Agent-to-Agent) communication via JSON-RPC 2.0
- 📊 **Observability**: Built-in AI tracing and monitoring

## 🏗️ Architecture

The project is structured around the Mastra framework:

```
src/mastra/
├── index.ts              # Main Mastra configuration
├── agents/
│   └── repo-agent.ts     # Repository analysis agent
├── tools/
│   └── repo-tools.ts     # GitHub API integration tool
├── routes/
│   └── a2aRoute.ts       # Agent-to-Agent API endpoint
└── utils/
    └── definitions.ts    # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.9.0 or higher
- **pnpm**: Package manager (recommended for faster installs)
- **GitHub API Access**: No token required for basic usage (rate-limited to 60 requests/hour)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/python-fuse/RepoPulse.git
   cd RepoPulse
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   _Don't have pnpm? Install it first:_

   ```bash
   npm install -g pnpm
   ```

3. **Configure environment** (Optional)

   Create a `.env` file in the root directory:

   ```env
   # GitHub Token (optional - for higher rate limits)
   GITHUB_TOKEN=your_github_token_here

   # AI Model Configuration (if using different provider)
   # GOOGLE_API_KEY=your_google_api_key
   ```

### Running the Application

#### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
```

The server will start on `http://localhost:4111`

#### Production Build

Build the application:

```bash
pnpm build
```

Run in production:

```bash
pnpm start
```

## 📖 Usage

### Interactive Chat (Mastra Playground)

When you run `pnpm dev`, Mastra automatically opens a playground interface where you can:

1. Select the `repoAgent` from the agents dropdown
2. Start chatting with the agent
3. Ask questions about any GitHub repository

**Example conversations:**

```
You: Analyze https://github.com/microsoft/vscode
Agent: [Provides comprehensive analysis of VS Code repository]

You: What's the activity level of facebook/react?
Agent: [Fetches and analyzes React repository data]

You: Can I contribute to tensorflow/tensorflow?
Agent: [Provides contribution guidelines based on repo data]
```

### Agent-to-Agent API

RepoPulse supports the A2A protocol for programmatic agent interaction.

**Endpoint:** `POST /a2a/agent/repoAgent`

**Request Format (JSON-RPC 2.0):**

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "generate",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Analyze https://github.com/facebook/react"
        }
      ]
    }
  }
}
```

**Response Format:**

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-id",
    "contextId": "context-id",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-01T...",
      "message": {
        "messageId": "msg-id",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Analysis results..."
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [...],
    "history": [...],
    "kind": "task"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:4111/a2a/agent/repoAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-1",
    "method": "generate",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "What are the stats for https://github.com/vercel/next.js?"}]
      }
    }
  }'
```

## 🛠️ Technology Stack

- **[Mastra.ai](https://mastra.ai)**: AI agent framework
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)**: LLM for natural language understanding
- **[LibSQL](https://github.com/tursodatabase/libsql)**: Embedded SQL database for memory/storage
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation
- **TypeScript**: Type-safe development
- **GitHub REST API**: Repository data source

## 📊 What RepoPulse Analyzes

For any GitHub repository URL, the agent can provide:

- **Basic Info**: Name, description, owner details
- **Popularity Metrics**: Stars, forks count
- **Health Indicators**: Open issues count
- **Activity Analysis**:
  - Commits in the last 30 days
  - Activity level categorization (High: 20+ commits, Medium: 5-19, Low: <5)
- **Timeline**: Creation date, last update timestamp
- **Owner Profile**: Username and profile URL

## 🧩 Project Structure Details

### Agent Configuration (`repo-agent.ts`)

The `RepoAgent` is configured with:

- Custom instructions for repository analysis
- Integration with `repoTool` for GitHub API calls
- Memory system for conversation persistence
- Google Gemini model integration

### Tool Definition (`repo-tools.ts`)

The `repoTool`:

- Parses GitHub repository URLs
- Fetches repository metadata from GitHub API
- Calculates activity levels based on recent commits
- Returns structured data matching the output schema

### A2A Route (`a2aRoute.ts`)

Implements JSON-RPC 2.0 protocol for:

- Agent-to-Agent communication
- Message format conversion
- Task tracking and context management
- Artifact generation from tool results

## 🔧 Configuration

### Mastra Configuration

The main configuration in `src/mastra/index.ts` includes:

- **Agents**: `repoAgent` for repository analysis
- **Storage**: LibSQL in-memory storage (change to `file:../mastra.db` for persistence)
- **Logger**: Pino logger with configurable levels
- **Observability**: Default AI tracing enabled
- **Server**: Custom API routes for A2A communication

### Database Persistence

To enable persistent memory across restarts, modify `src/mastra/index.ts`:

```typescript
storage: new LibSQLStore({
  url: "file:./mastra.db", // Changed from ":memory:"
}),
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Invalid GitHub repository URL"**

- Ensure URL is in format: `https://github.com/owner/repo`
- Check for typos in owner or repository name

**Issue: "Failed to fetch repository info"**

- Repository might be private or deleted
- Check if you have network connectivity
- Verify GitHub API rate limits (60/hour without auth)

**Issue: Port 4111 already in use**

- Stop other Mastra instances or change port in configuration

### Rate Limiting

Without authentication, GitHub API limits to 60 requests/hour. To increase:

1. Generate a GitHub Personal Access Token
2. Add to `.env`: `GITHUB_TOKEN=your_token`
3. Update `repo-tools.ts` to include Authorization header

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain existing code style
- Add comments for complex logic
- Test with multiple repositories before submitting

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Mastra.ai](https://mastra.ai) - The AI agent framework
- Powered by [Google Gemini](https://ai.google.dev/)
- GitHub REST API for repository data

## 📮 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check [Mastra documentation](https://mastra.ai/docs)
- Review [GitHub API docs](https://docs.github.com/en/rest)

---

**Made with ❤️ using Mastra.ai**
