const fs = require('fs');
const Redis = require('ioredis');
const defaults = require('./defaults');

const BookKeyPrefix = 'book:';

const redis = new Redis(defaults.getRedisUrl());

const datastore = {
    books: undefined,

    async loadBooks() {
        if (datastore.books) { return; }
    
        let bookKeys = await redis.keys(`${BookKeyPrefix}*`);
    
        if (bookKeys.length === 0) {
            // Populate the Redis DB with default data
            const BooksFilePath = 'books.json';
            const json_books = fs.readFileSync(BooksFilePath, 'utf-8');
            datastore.books = JSON.parse(json_books);
            datastore.saveBooks();
        }
        else {
            const bookRecords = await redis.mget(bookKeys);
            datastore.books = bookRecords.map(rec => JSON.parse(rec));
        }
    },

    async saveBooks() {
        if (!datastore.books || datastore.books.length === 0) { return; }

        const bookRecords = new Map();
    
        datastore.books.forEach(book => {
            const bookJson = JSON.stringify(book);
            bookRecords.set(`${BookKeyPrefix}${book.id}`, bookJson);
        });
    
        await redis.mset(bookRecords);
    },

    async addBook(newBook) {
        if (!datastore.books) {
            await datastore.loadBooks();
        }

        datastore.books.push(newBook);
        await datastore.saveBooks();
    },
    
    async deleteBook(id) {
        if (!datastore.books || datastore.books.length == 0) { return; }
        datastore.books = datastore.books.filter(book => book.id != id);
        await redis.del(`${BookKeyPrefix}${id}`);
    }
};

module.exports = datastore;
