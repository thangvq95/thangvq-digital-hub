# Roadmap Phase 3: GraphRAG Long-Term Memory

This document outlines the architecture for giving the AI Agent system Long-Term Semantic and Episodic Memory, scheduled for implementation in Phase 3.

## 1. The Core Challenge: System Amnesia

Currently, AI Agents suffer from different levels of "amnesia":
- **GitNexus** provides *Spatial Memory*: It knows where code lives right now, but forgets historical implementations if the code is deleted.
- **GitHub Projects / PRD** provides *Working Memory*: It knows what tasks are active this week and what the immediate roadmap looks like.
- **Missing Link:** *Episodic & Semantic Memory*. The system lacks the ability to recall: "Why did we abandon React for Next.js 2 years ago?", "What common bugs did we encounter across 100 UI repositories?", or "What was the resolution for Sentry Bug #102?".

Phase 3 introduces a system where the AI learns and compounds knowledge over years.

## 2. Phase 3 Architecture: GraphRAG (Knowledge Graph + Vector)

The goal is to implement GraphRAG—combining semantic similarity (Vector Search) with logical relationships (Knowledge Graphs)—to provide context for future decisions.

### Step 3A: The "All-in-One" Postgres Setup (MVP)
To maintain the "Simplicity First" philosophy and avoid unnecessary infrastructure overhead, we will leverage the existing VPS environment.

- **Storage:** Use the existing **PostgreSQL (Docker)** database and enable the `pgvector` extension.
- **Relational Graph:** Model the Knowledge Graph using standard SQL relational tables (`repo`, `technology`, `release`, `lesson_learned`).
- **Embeddings:** Store AI-generated summaries, architectural decisions, and bug resolutions as vector embeddings in `pgvector` for semantic search.

### Step 3B: The Neo4j Leap (Scale)
If the intelligence database scales to the point where multi-hop graph queries (e.g., finding unadopted alternatives to a deprecated library trending on GitHub) become too slow or complex in SQL:
- Migrate the knowledge graph to a dedicated **Neo4j** container on the VPS.
- Neo4j natively supports Vector Indexing, making it the perfect unified backend for high-scale GraphRAG without split-brain issues.

## 3. The "Archivist" Role (Knowledge Distillation)

A new automated role (or cronjob task assigned to Hermes) will be introduced to handle continuous learning:

1. **Trigger:** Runs weekly or at the end of a milestone.
2. **Reflect:** The agent reads all closed GitHub Issues, merged PRs, and AI-analyzed release notes from the past week.
3. **Distill:** It synthesizes "Lessons Learned", "Architectural Decisions", and "Tech Stack Evolutions".
4. **Store:** The synthesized knowledge is embedded and saved into the `knowledge_graph` schema in PostgreSQL.

## 4. Integration with Planning (RAG)

Once the memory bank is established, the planning phase becomes exponentially smarter. 

When a user triggers the `brainstorming` or `writing-plans` skill to design a new feature (e.g., "Implement an advanced caching layer"):
1. The Agent queries PostgreSQL via Vector Search: *"Retrieve all past lessons, bugs, and architectural choices related to caching over the last 2 years."*
2. The Agent cross-references this historical semantic context with the current spatial context from GitNexus.
3. The resulting implementation plan is heavily optimized, specifically engineered to avoid repeating past mistakes.

*Result: An AI Department that genuinely grows smarter and more experienced the longer the project runs.*
