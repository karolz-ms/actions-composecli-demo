const express = require('express');
const fs = require('fs');
const uuid = require('uuid');

const datastore = require('./datastore');

const router = express.Router();

router.get('/', async (req, res) => {
    await datastore.loadBooks();
    const books = datastore.books;
    res.render('index', { books: datastore.books });
});

router.get('/new-entry', (req, res) => {
    res.render('new-entry');
});

router.post('/new-entry', async (req, res) => {
    const { title, author, image, description } = req.body;

    if (!title || !author || !image || !description) {
        res.status(400).send("Entries must have a title and body");
        return;
    }

    var newBook = {
        id: uuid.v4(),
        title,
        author,
        image,
        description
    };

    await datastore.addBook(newBook);

    res.redirect('/');
});

router.get('/delete/:id', async (req, res) => {
    await datastore.loadBooks();
    if (!datastore.books.some(book => book.id === req.params.id)) {
        res.status(404).send("Book with given ID does not exist");
        return;
    }
    
    await datastore.deleteBook(req.params.id);

    res.redirect('/')
});

module.exports = router;