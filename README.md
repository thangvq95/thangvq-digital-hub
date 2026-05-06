# 🌟 ThangVQ Digital Hub: Next.js Starter + AI Agent Workspace

This project is a high-performance **Next.js** application featuring a modern dashboard for tracking technology trends. It also includes an integrated **AI Agent Workspace** powered by Nous Research's Hermes, enabling fully offline, automated CI/CD workflows.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (LTS version)
- **npm** (or pnpm/yarn)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Development Mode
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
# or
pnpm dev
```

### Production Build
Build the optimized production application:
```bash
npm run build
# or
pnpm build
```
Then run the server:
```bash
npm run start
# or
pnpm start
```

## 🛠️ AI Agent Workspace

This repository includes a complete, offline-capable AI Agent environment for automated development tasks (CI/CD, bug fixes, feature additions).

### Key Features
- **Fully Offline Capable**: No internet required for the agent. All skills are committed to `.agents/skills/`.
- **Custom Skills**: Includes a full suite of custom skills for Next.js development (code generation, testing, build verification).
- **Direct Git Integration**: The agent can read and modify the codebase directly.
- **VPS Deployment Ready**: Includes `infra/ai-developer-workspace` scripts for easy Docker-based deployment.

### Quick Local Agent Setup
1. **Install All Skills**:
   ```bash
   npx skills experimental_install -y
   ```
2. **Run Hermes Agent**:
   ```bash
   # Run Hermes in development mode with skills from local repo
   hermes -w . --skills-dir .agents/skills --shell "bash" --model "nous-hermes-3-27b:free"
   ```

### Using the Automated CI/CD Workflow (VPS)
See the dedicated documentation:
👉 [AI Agent Workspace Setup Guide](infra/ai-developer-workspace/README-ai-workspace.md)

## 📁 Project Structure

```
/thangvq-digital-hub
├── /app                    # Next.js Application
│   ├── (dashboard)         # Main dashboard pages
│   ├── api/                # API Routes
│   └── components/         # Reusable UI components
├── /infra                  # Infrastructure & Deployment Scripts
│   └── ai-developer-workspace/  # AI Agent Workspace (Dockerfile, listener.py)
├── .agents/                # AI Agent Configuration & Custom Skills
│   └── custom-skills/      # All custom skills for Hermes
├── AGENTS.md               # Agent configuration and instructions
├── package.json            # Project dependencies
├── skills-lock.json        # Lock file for installed skills
└── ...                     # Standard Next.js files
```

## 📚 Custom Skills

The `.agents/custom-skills/` directory contains a comprehensive set of skills for working with Next.js applications. These skills are committed directly to the repository for offline access.

**Key Skill Categories:**
- **Project Management**: `plan-project`, `add-feature`, `refactor-code`
- **Next.js Development**: `add-nextjs-component`, `add-nextjs-page`, `fix-nextjs-typescript-error`, `install-nextjs-dependency`
- **Testing**: `add-nextjs-test`, `verify-nextjs-test-pass`
- **CI/CD**: `fix-nextjs-ci-failure`, `add-nextjs-ci-test`

### Adding/Updating Skills
1. Create or edit a skill in `.agents/custom-skills/`
2. Run `npx skills experimental_install -y` to update the lock file
3. Commit the changes:
   ```bash
   git add .agents/custom-skills/ AGENTS.md infra/
   git commit -m "chore: update skills"
   git push
   ```
