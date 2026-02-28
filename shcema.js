/**
 * schema.js — GraphQL Type Definitions (the "Schema")
 *
 * The schema is the CONTRACT of your API.
 * It defines:
 *   1. What types of data exist
 *   2. What fields each type has, and what type each field returns
 *   3. What queries a client is allowed to ask
 *   4. What mutations (data changes) a client is allowed to perform
 *
 * Think of it like a menu at a restaurant — you can only order what's on the menu.
 * The schema IS the menu. If it's not defined here, clients can't ask for it.
 *
 * We write the schema as a template literal string (backticks) with the
 * special `#graphql` comment at the top. This is just a hint to code editors
 * so they can apply GraphQL syntax highlighting inside the string.
 */

export const typeDefs = `#graphql

    # =========================================================
    # SCALAR TYPES (built-in primitives — no need to define these)
    # =========================================================
    # GraphQL comes with 5 built-in scalar (single-value) types:
    #
    #   String   — text, e.g. "Hello"
    #   Int      — whole number, e.g. 42
    #   Float    — decimal number, e.g. 3.14
    #   Boolean  — true or false
    #   ID       — a unique identifier, treated as a string internally
    #              but signals "this is an identifier, not just any string"
    #
    # The ! after a type means NON-NULLABLE — the field MUST have a value,
    # it can never return null. Without !, the field is allowed to be null.
    # Example:
    #   name: String!   ← always returns a string, never null
    #   name: String    ← might return a string, might return null


    # =========================================================
    # TYPE: Game
    # =========================================================
    # This defines the shape of a Game object in our API.
    # When a client queries for a game, they'll receive an object
    # with exactly these fields (they choose which ones they want).
    type Game {
        id: ID!                  # Every game has a unique ID — never null
        title: String!           # Every game has a title — never null
        platform: [String!]!     # An array of strings — never null, and no null items inside
                                 # [String!]! means: the array itself is non-null,
                                 # AND every item inside the array is non-null.
                                 # Compare: [String] could be null, and could contain null items
        reviews: [Review!]       # A game can have many reviews (or none, hence no ! at the end)
                                 # This field is RESOLVED dynamically — see Game resolver in index.js
    }


    # =========================================================
    # TYPE: Review
    # =========================================================
    # Notice: Review has both a "game" and an "author" field.
    # These are NESTED types — GraphQL lets you ask for related
    # objects directly, not just their IDs.
    #
    # In REST, you'd have to make multiple requests:
    #   GET /reviews/101
    #   GET /games/1
    #   GET /authors/201
    #
    # In GraphQL, one single query can ask for all of that at once.
    type Review {
        id: ID!
        rating: Int!             # A whole number — we chose Int, not Float, because ratings are 1,2,3,4,5
        content: String!         # The written review text
        game: Game!              # The full Game object this review belongs to — never null
        author: Author!          # The full Author object who wrote this — never null
    }


    # =========================================================
    # TYPE: Author
    # =========================================================
    type Author {
        id: ID!
        name: String!
        verified: Boolean!       # Is this author a verified reviewer? true or false — never null
        reviews: [Review!]       # All reviews this author has written (could be empty array, not null)
    }


    # =========================================================
    # TYPE: Query  (special built-in type)
    # =========================================================
    # This is one of three special "root" types in GraphQL:
    #   Query    — for READ operations (fetching data)
    #   Mutation — for WRITE operations (creating, updating, deleting)
    #   Subscription — for real-time data (we're not using this here)
    #
    # Every field defined here becomes an "entry point" — a question
    # a client is allowed to ask your API.
    #
    # Think of Query fields as the endpoints in a REST API:
    #   REST:    GET /games        →  GraphQL: games: [Game]
    #   REST:    GET /games/:id    →  GraphQL: game(id: ID!): Game
    type Query {
        reviews: [Review]        # "Give me all reviews" — returns an array
        review(id: ID!): Review  # "Give me one review by id" — (id: ID!) means id is a required argument
        games: [Game]            # "Give me all games"
        game(id: ID!): Game      # "Give me one game by id"
        authors: [Author]        # "Give me all authors"
        author(id: ID!): Author  # "Give me one author by id"
    }


    # =========================================================
    # TYPE: Mutation  (special built-in type)
    # =========================================================
    # Mutations are for any operation that CHANGES data:
    #   - Creating a new record
    #   - Updating an existing record
    #   - Deleting a record
    #
    # After a mutation runs, you specify what it RETURNS.
    # This is powerful — after adding a game, the API immediately
    # hands back the newly created game object. No second request needed.
    type Mutation {
        addGame(game: AddGameInput!): Game    # Creates a new game, returns the created Game
        deleteGame(id: ID!): [Game]           # Deletes a game by id, returns the remaining games list
        updateGame(id: ID!, edits: EditGameInput!): Game  # Updates a game, returns the updated Game
    }


    # =========================================================
    # INPUT TYPES
    # =========================================================
    # Input types are like regular types, but ONLY used as arguments
    # passed INTO a mutation (or query). You can't use a regular type
    # like Game as an input — GraphQL separates "output types" (what
    # you return) from "input types" (what you receive).
    #
    # Why? Because output types can have resolvers and circular
    # references; input types must be simple flat data.

    # Used when creating a new game.
    # Notice: NO "id" field — the server generates the id automatically.
    # The client shouldn't be deciding what the id is.
    input AddGameInput {
        title: String!
        platform: [String!]!
    }

    # Used when updating an existing game.
    # Notice: both fields are OPTIONAL (no ! at the end of String and [String!]).
    # This lets clients send only the fields they want to change.
    # e.g. just update the title without touching the platform, or vice versa.
    input EditGameInput {
        title: String           # Optional — client can omit this if they don't want to change it
        platform: [String!]     # Optional — client can omit this too
    }

`

/**
 * QUICK REFERENCE: The ! (non-null) rules
 *
 *  String      → nullable string (can be null)
 *  String!     → non-null string (always has a value)
 *  [String]    → nullable array of nullable strings
 *  [String!]   → nullable array, but items inside are non-null
 *  [String]!   → non-null array, but items inside can be null
 *  [String!]!  → non-null array AND all items are non-null (most strict)
 */