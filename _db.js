/**
 * _db.js — Mock In-Memory Database
 *
 * In a real production app, this data would live in an actual database
 * like PostgreSQL, MongoDB, or MySQL. For learning purposes, we're using
 * plain JavaScript arrays to simulate a database.
 *
 * "In-memory" means the data only lives while the server is running.
 * Every time you restart the server, it resets back to this original data.
 *
 * Notice the naming convention: the file starts with an underscore (_db.js).
 * This is a common convention to signal that this file is "private" or
 * internal — it's infrastructure, not something you'd expose directly.
 */

/**
 * GAMES
 *
 * Each game has:
 *  - id: a unique string identifier (in a real DB this would be auto-generated)
 *  - title: the name of the game
 *  - platform: an ARRAY of strings, because a game can release on multiple platforms
 *
 * Notice there is NO "reviews" field here. That relationship is resolved
 * dynamically in our GraphQL resolvers by matching game_id on the reviews.
 * This is how relational data works — you don't store the whole related
 * object, just a reference (the id) to it.
 */
let games = [
    {
        id: "1",
        title: "Legend of Code",
        platform: ["PC", "Switch"]
    },
    {
        id: "2",
        title: "Bug Hunter 3000",
        platform: ["Xbox", "PlayStation"]
    },
    {
        id: "3",
        title: "Terminal Quest",
        platform: ["PC"]
    }
];

/**
 * AUTHORS
 *
 * Each author has:
 *  - id: unique identifier
 *  - name: display name of the reviewer
 *  - verified: a boolean (true/false) — imagine this like a "verified reviewer" badge
 *
 * Again, no "reviews" array here. The connection to reviews is made
 * through the author_id field that lives on each review object.
 */
let authors = [
    {
        id: "201",
        name: "Alice Devlin",
        verified: true
    },
    {
        id: "202",
        name: "Bob Coder",
        verified: false
    },
    {
        id: "203",
        name: "Charlie Script",
        verified: true
    }
];

/**
 * REVIEWS
 *
 * Each review has:
 *  - id: unique identifier
 *  - rating: a number (1–5 scale)
 *  - content: the written review text
 *  - author_id: a FOREIGN KEY — this links the review to an author
 *  - game_id: a FOREIGN KEY — this links the review to a game
 *
 * "Foreign key" is a database term. It just means: "a reference to another
 * record's id". This is how we model relationships without duplicating data.
 *
 * Example: review "101" has author_id "201" — that means Alice Devlin wrote it.
 * Instead of copying Alice's full object into the review, we just store her id.
 * When we need her details, we look her up by that id in the authors array.
 */
let reviews = [
    {
        id: "101",
        rating: 5,
        content: "Absolutely loved the gameplay and story!",
        author_id: "201",   // Alice Devlin wrote this
        game_id: "1"        // About "Legend of Code"
    },
    {
        id: "102",
        rating: 3,
        content: "Fun mechanics but gets repetitive after a while.",
        author_id: "202",   // Bob Coder wrote this
        game_id: "2"        // About "Bug Hunter 3000"
    },
    {
        id: "103",
        rating: 4,
        content: "Solid experience, great graphics and soundtrack.",
        author_id: "203",   // Charlie Script wrote this
        game_id: "3"        // About "Terminal Quest"
    },
    {
        id: "104",
        rating: 2,
        content: "Too many bugs, felt unfinished.",
        author_id: "202",   // Bob Coder wrote this too (one author, multiple reviews)
        game_id: "1"        // Also about "Legend of Code"
    }
];

/**
 * We export all three arrays as a single default object.
 *
 * This means when another file imports this module, they get:
 *   import db from './_db.js'
 *   db.games    ← the games array
 *   db.authors  ← the authors array
 *   db.reviews  ← the reviews array
 *
 * We use `let` (not `const`) for the arrays because in our mutations
 * (like deleteGame, updateGame) we reassign the entire array.
 * If we used `const`, those reassignments would throw an error.
 */
export default { games, authors, reviews }