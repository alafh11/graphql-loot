# 🎮 Games GraphQL API

A fully functional GraphQL API built with **Apollo Server** and **Node.js**, featuring a games review system with full CRUD operations. Built as a hands-on learning project to understand GraphQL core concepts from scratch.

---

## 📖 About

This project is a backend GraphQL API that models a game review platform — similar to how a site like Metacritic might work under the hood. It was built while following along with a GraphQL tutorial to solidify core concepts like type definitions, resolvers, relationships between types, queries, and mutations.

**Three core entities:**
- **Games** — with title and platform info
- **Authors** — the reviewers, with a verified flag
- **Reviews** — ratings and written content, linked to both a game and an author

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Apollo Server | GraphQL server |
| GraphQL | Query language & schema |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
git clone https://github.com/alafh11/graphql-loot.git
cd graphql-loot
npm install
```

### Run the server

```bash
node index.js
```

The server starts at **http://localhost:4000** — open it in your browser to launch **Apollo Sandbox**, a visual interface where you can explore and run queries.

---

## 📡 API Overview

### Queries

```graphql
# Get all games
query {
  games {
    id
    title
    platform
  }
}

# Get a single game with its reviews and authors
query {
  game(id: "1") {
    title
    platform
    reviews {
      rating
      content
      author {
        name
        verified
      }
    }
  }
}

# Get all authors with their reviews
query {
  authors {
    name
    verified
    reviews {
      rating
      content
    }
  }
}

# Get a single review
query {
  review(id: "101") {
    rating
    content
    game {
      title
    }
    author {
      name
    }
  }
}
```

### Mutations

```graphql
# Add a new game
mutation {
  addGame(game: { title: "Elden Ring", platform: ["PC", "PlayStation", "Xbox"] }) {
    id
    title
    platform
  }
}

# Update a game
mutation {
  updateGame(id: "1", edits: { title: "Legend of Code Remastered", platform: ["PC"] }) {
    id
    title
    platform
  }
}

# Delete a game
mutation {
  deleteGame(id: "1") {
    id
    title
  }
}
```

---

## 🧩 Schema

```graphql
type Game {
  id: ID!
  title: String!
  platform: [String!]!
  reviews: [Review!]
}

type Author {
  id: ID!
  name: String!
  verified: Boolean!
  reviews: [Review!]
}

type Review {
  id: ID!
  rating: Int!
  content: String!
  game: Game!
  author: Author!
}
```

---

## 📁 Project Structure

```
├── index.js        # Apollo Server setup + all resolvers
├── schema.js       # GraphQL type definitions (typeDefs)
├── _db.js          # In-memory mock database
├── package.json
└── .gitignore
```

---

## 💡 Key Concepts Practiced

- **Type Definitions** — defining custom types, scalar types (`ID`, `String`, `Int`, `Boolean`), and using `!` for non-nullable fields
- **Resolvers** — writing resolver functions for Query, Mutation, and nested type fields
- **Relationships** — resolving nested types (e.g. fetching a game's reviews from inside a `Game` resolver)
- **Mutations** — implementing `add`, `update`, and `delete` operations
- **Input Types** — using `input` types for cleaner mutation arguments
- **Apollo Sandbox** — using the built-in browser IDE to test queries interactively

---

## 📚 Resources

- [GraphQL Official Docs](https://graphql.org/learn/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [The Net Ninja](https://www.youtube.com/c/TheNetNinja)
