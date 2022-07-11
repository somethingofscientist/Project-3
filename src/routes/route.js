const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const middleware = require('../Middleware/middleware')


// REGISTER API 
router.post('/register', userController.register)

// LOGIN API 
router.post('/login', userController.login)

// CREATE BOOK API
router.post('/books', middleware.Authenticate, middleware.Authorisation, bookController.postBooks)

// GET BOOK API
router.get('/books', middleware.Authenticate, bookController.getBooks)

// GET BOOK BY ID
router.get('/books/:bookId', middleware.Authenticate, bookController.getBooksByBookId)

// UPDATE BOOK API
router.put('/books/:bookId', middleware.Authenticate, middleware.Authorisation, bookController.updateBooksByBookId)

// DELETE BOOK API
router.delete('/books/:bookId', middleware.Authenticate, middleware.Authorisation, bookController.deleteBooksByBookId)

module.exports = router;