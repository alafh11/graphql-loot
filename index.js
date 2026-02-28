/**
 * index.js — Apollo Server Setup & Resolvers
 *
 * This is the heart of the application. It does two major things:
 *
 *   1. RESOLVERS — Functions that define HOW to fetch or modify the data
 *      for every field defined in the schema. Think of resolvers as the
 *      "handlers" for each query and mutation.
 *
 *   2. SERVER SETUP — Creates an Apollo Server instance, plugs in the
 *      schema (typeDefs) and the resolvers, and starts listening for requests.
 *
 * The relationship between schema and resolvers:
 *   Schema  → defines WHAT data looks like and WHAT you can ask for
 *   Resolver → defines HOW to actually get or change that data
 *
 * Every field in your Query and Mutation types MUST have a matching resolver.
 * If a resolver is missing, Apollo will return null for that field.
 */

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Our mock in-memory database (arrays of games, authors, reviews)
import db from './_db.js'

// Our GraphQL schema — the type definitions that describe the API contract
import { typeDefs } from './schema.js';


// =============================================================================
// RESOLVERS
// =============================================================================
/**
 * The resolvers object mirrors the structure of your schema exactly.
 * Top-level keys match type names: Query, Mutation, Game, Author, Review.
 * Inside each, the keys match field names defined in the schema.
 *
 * Every resolver function can receive up to 4 arguments:
 *   (parent, args, context, info)
 *
 *   parent  → the resolved value of the PARENT type (used in nested resolvers)
 *   args    → any arguments passed in the query/mutation, e.g. game(id: "1") → args.id = "1"
 *   context → shared data across all resolvers (auth tokens, db connections, etc.) — not used here
 *   info    → advanced metadata about the query execution — rarely needed
 *
 * When we don't need an argument, we use _ as a placeholder by convention.
 * e.g. (_, args) means "I don't need parent, but I do need args"
 */
const resolvers = {

    // =========================================================================
    // QUERY RESOLVERS
    // =========================================================================
    // These handle all READ operations — fetching data without changing anything.
    Query: {

        /**
         * games()
         * Handles the query: { games { id title platform } }
         * Simply returns the entire games array from our mock db.
         * No arguments needed — we're just listing everything.
         */
        games() {
            return db.games
        },

        /**
         * reviews()
         * Handles the query: { reviews { id rating content } }
         */
        reviews() {
            return db.reviews
        },

        /**
         * authors()
         * Handles the query: { authors { id name verified } }
         */
        authors() {
            return db.authors
        },

        /**
         * review(_, args)
         * Handles the query: { review(id: "101") { rating content } }
         *
         * args.id contains the id the client passed in.
         * We use .find() to search the array for a matching review.
         * Returns a single Review object, or undefined if not found.
         */
        review(_, args) {
            return db.reviews.find((review) => review.id === args.id)
        },

        /**
         * game(_, args)
         * Handles the query: { game(id: "1") { title platform } }
         */
        game(_, args) {
            return db.games.find((game) => game.id === args.id)
        },

        /**
         * author(_, args)
         * Handles the query: { author(id: "201") { name verified } }
         */
        author(_, args) {
            return db.authors.find((author) => author.id === args.id)
        }
    },


    // =========================================================================
    // NESTED TYPE RESOLVERS
    // =========================================================================
    /**
     * These resolvers handle the RELATIONSHIPS between types.
     *
     * Why do we need these? Because our database stores a flat reference
     * (e.g. game_id: "1") but our schema promises a full Game object.
     * These resolvers bridge that gap — they receive the parent object
     * and use it to go fetch the related data.
     *
     * GraphQL calls these resolvers automatically when a client asks for
     * a nested field. For example, if a client queries:
     *   { game(id: "1") { title reviews { rating } } }
     * GraphQL first runs the game() Query resolver to get the Game,
     * then runs Game.reviews() with that Game as the "parent" to get its reviews.
     */

    /**
     * Game resolvers
     * These run when a client asks for fields on a Game type.
     */
    Game: {
        /**
         * reviews(parent)
         * Handles: { game(id: "1") { reviews { rating content } } }
         *
         * "parent" here is the Game object that was already resolved.
         * So parent.id is the id of the game we're currently looking at.
         *
         * We filter the reviews array to find all reviews where
         * the review's game_id matches this game's id.
         *
         * This is the GraphQL equivalent of a SQL JOIN:
         *   SELECT * FROM reviews WHERE game_id = parent.id
         */
        reviews(parent) {
            return db.reviews.filter((review) => review.game_id === parent.id)
        }
    },

    /**
     * Author resolvers
     */
    Author: {
        /**
         * reviews(parent)
         * Handles: { author(id: "201") { reviews { rating content } } }
         *
         * parent is the Author object. We find all reviews written by this author.
         */
        reviews(parent) {
            return db.reviews.filter((review) => review.author_id === parent.id)
        }
    },

    /**
     * Review resolvers
     * These run when a client asks for nested fields on a Review.
     */
    Review: {
        /**
         * author(parent)
         * Handles: { review(id: "101") { author { name verified } } }
         *
         * parent is the Review object. It has an author_id field.
         * We use .find() to locate the matching author.
         */
        author(parent) {
            return db.authors.find((author) => author.id === parent.author_id)
        },

        /**
         * game(parent)
         * Handles: { review(id: "101") { game { title platform } } }
         *
         * parent is the Review object. It has a game_id field.
         * We use .find() to locate the matching game.
         */
        game(parent) {
            return db.games.find((game) => game.id === parent.game_id)
        }
    },


    // =========================================================================
    // MUTATION RESOLVERS
    // =========================================================================
    /**
     * These handle all WRITE operations — anything that changes data.
     * Unlike queries, mutations should change state AND return something useful.
     */
    Mutation: {

        /**
         * deleteGame(_, args)
         * Handles: mutation { deleteGame(id: "1") { id title } }
         *
         * args.id is the id of the game to remove.
         *
         * .filter() creates a NEW array that excludes the deleted game.
         * We reassign db.games to this new array (this is why we used `let`
         * in _db.js instead of `const`).
         *
         * Returns the updated games array (so the client can see what remains).
         */
        deleteGame(_, args) {
            db.games = db.games.filter((game) => game.id !== args.id)
            return db.games
        },

        /**
         * addGame(_, args)
         * Handles: mutation { addGame(game: { title: "...", platform: [...] }) { id title } }
         *
         * args.game contains the AddGameInput object: { title, platform }
         *
         * We spread (...) the incoming game data and add a generated id.
         * Math.random() * 10000 gives a random number up to 10000.
         * Math.floor() removes the decimal. .toString() converts it to string (IDs are strings).
         *
         * In production, you'd use a proper UUID library (like `uuid`) instead of Math.random().
         * Math.random() is fine for learning but could produce duplicates in real apps.
         *
         * We push the new game into the array, then return it.
         * The client receives the newly created game object — including its new id.
         */
        addGame(_, args) {
            let game = {
                ...args.game,                                        // spread: { title, platform }
                id: Math.floor(Math.random() * 10000).toString()     // generate a random id
            }
            db.games.push(game)   // add to our mock db
            return game           // return the new game to the client
        },

        /**
         * updateGame(_, args)
         * Handles: mutation { updateGame(id: "1", edits: { title: "New Title" }) { id title } }
         *
         * args.id     — id of the game to update
         * args.edits  — the EditGameInput: partial fields to change (title and/or platform)
         *
         * .map() loops over every game and returns a new array.
         * When we find the matching game (g.id === args.id), we return a new object
         * that merges the original game { ...g } with the new edits { ...args.edits }.
         * If edits only has "title", then only title gets overwritten — platform stays.
         * For all other games, we return them unchanged.
         *
         * After the map, we use .find() to locate and return the updated game.
         * This way the client gets back the full updated game object.
         */
        updateGame(_, args) {
            // Rebuild the games array, updating only the matching game
            db.games = db.games.map((game) => {
                if (game.id === args.id) {
                    return { ...game, ...args.edits }  // merge old data + new edits
                }
                return game   // all other games stay exactly as they are
            })

            // Find and return the updated game so the client can confirm the changes
            return db.games.find((game) => game.id === args.id)
        }
    }
}


// =============================================================================
// SERVER SETUP
// =============================================================================
/**
 * ApolloServer takes our typeDefs and resolvers and wires them together.
 *
 *   typeDefs  → the schema (the API contract — what's possible)
 *   resolvers → the implementation (the logic — how to fulfill requests)
 *
 * Together they form a complete, functional GraphQL API.
 */
const server = new ApolloServer({
    typeDefs,    // shorthand for typeDefs: typeDefs  (ES6 property shorthand)
    resolvers    // shorthand for resolvers: resolvers
})

/**
 * startStandaloneServer is the simplest way to run Apollo Server.
 * It handles all the HTTP boilerplate for you under the hood.
 *
 * We tell it to listen on port 4000.
 * Once it's ready, it gives us back the URL.
 *
 * Visit http://localhost:4000 in your browser to open Apollo Sandbox —
 * a built-in visual tool where you can write and test queries interactively.
 *
 * `await` here works because this file is a module (has import/export),
 * which allows top-level await in Node.js.
 */
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
})

console.log(`🚀 Server ready at ${url}`)