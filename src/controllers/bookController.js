const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")
// const ObjectId = require('mongoose').Types.ObjectId;
const Validator = require("../Validator/validation")
const userModel = require("../models/userModel.js");

// ========> create books
const postBooks = async function (req, res) {
  try {
    let data = req.body
    const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data

    if (!Validator.isValidBody(data)) return res.status(400).send({ status: false, message: "Please enter details" })

    if (!title) return res.status(400).send({ status: false, message: "please enter title" })
    // this regex was removed for the any regex with the any book name and part
    // if (!Validator.isValid(title)) return res.status(400).send({ status: false, message: "Provide valid title" })

    const dup = await bookModel.findOne({ title: title }) // <=====checking duplicate value
    if (dup) return res.status(400).send({ status: false, message: "title already exist" })

    if (!excerpt) return res.status(400).send({ status: false, message: "please enter excerpt" })
    if (!Validator.isValid(excerpt)) return res.status(400).send({ status: false, message: "Provide valid excerpt" })

    if (!userId) return res.status(400).send({ status: false, message: "please enter userId" })
    // if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "please enter valid userId" })

    if (!ISBN) return res.status(400).send({ status: false, message: "please enter ISBN" })
    if (ISBN.length !== 13) return res.status(400).send({ status: false, message: "Provide valid ISBN" })
    const dupISBN = await bookModel.findOne({ ISBN: ISBN }) // <=====checking duplicate value
    if (dupISBN) return res.status(400).send({ status: false, message: "ISBN already exist" })

    if (!category) return res.status(400).send({ status: false, message: "please enter category" })
    if (!Validator.isValid(category)) return res.status(400).send({ status: false, message: "Provide valid category" })

    if (!subcategory) return res.status(400).send({ status: false, message: "please enter subcategory" })
    if (subcategory.length == 0) return res.status(400).send({ status: false, message: "please enter atleast one subcategory" })
    if (subcategory == 0) return res.status(400).send({ status: false, message: "please enter atleast String one subcategory" })

    if (reviews) {
      if (typeof reviews === 'string') return res.status(400).send({ status: false, message: "Provide valid reviews" })
    }

    if (!releasedAt) return res.status(400).send({ status: false, message: "please enter date of release" })
    if (!Validator.isValidDate(releasedAt)) return res.status(400).send({ status: false, message: " wrong date format" })

    console.log(data)
    const savedData = await bookModel.create(data)
    return res.status(201).send({ status: true, message: "success", data: savedData })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

// ==========> get books 
const getBooks = async function (req, res) {
  try {

    let query = req.query

    if (!query) {
      let allBook = await bookModel.find({ isDeleted: false }).sort("title")
      if (allBook.length == 0) return res.status(400).send({ status: false, message: "Book Not Found" })
      return res.status(200).send({ status: true, message: "Books List", data: allBook })
    }

    if (query.userId) {
      let id = query.userId
      if (!Validator.isValidObjectId(id)) return res.status(400).send({ status: false, message: "userId is not valid" })
      let user = await userModel.findById(id)
      if (!user) { return res.status(400).send({ status: false, message: "No book of such user" }) }
    }

    if (query.category) {
      const category = query.category
      const book = await bookModel.find({ category: category })
      if (book.length == 0) { return res.status(400).send({ status: false, message: "No book related to this category" }) }
    }

    if (query.subcategory) {
      const subcategory = query.subcategory
      const book = await bookModel.find({ subcategory: subcategory })
      if (book.length == 0) { return res.status(400).send({ status: false, message: "No book related to this sub-category" }) }
    }

    let getAllBook = await bookModel.find(query).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort("title")

    if (getAllBook.length == 0) return res.status(400).send({ status: false, message: "Book Not Found" })

    return res.status(200).send({ status: true, message: "Books List", data: getAllBook })

  } catch (err) {
    return res.status(500).send({status: false, message: err.message })
  }
}



const getBooksByBookId = async function (req, res) {
  try {
    let query = req.params.bookId

    if (!Validator.isValidObjectId(query)) return res.status(400).send({ status: false, message: "bookId is not valid" })
    const book = await bookModel.findOne({ _id: query }).lean()  //<===== for pushing the data(review)
    if (!book) {
      return res.status(404).send({ status: false, message: "book not found" })
    }
    const reviews = await reviewModel.find({ bookId: query })
    book.reviewsData = reviews
    res.status(200).send({ status: true, message: 'Books list', data: book })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


// =============>  Update books
const updateBooksByBookId = async function (req, res) {
  try {
    let data = req.body
    let bookId = req.params.bookId;

    if(!bookId)return res.status(400).send({status: false,message:"Id Not present" })
    if (!Validator.isValidObjectId(bookId)) return res.status(400).send({ status: false, message:"Problem" })

    if (!Validator.isValidBody(data)) return res.status(400).send({ status: false, message: "Please enter details" })

    const { title, excerpt, releasedAt, ISBN } = data

    if (title) {
      if (!Validator.isValid(title)) return res.status(400).send({ status: false, message: "Provide valid title" })
      const duptitle = await bookModel.findOne({ title: title })
      if (duptitle) { return res.status(400).send({ status: false, message: "this title is already in use" }) }
    }

    if (excerpt) {
      if (!Validator.isValid(excerpt)) return res.status(400).send({ status: false, message: "Provide valid excerpt" })
    }

    if (ISBN) {
      if (ISBN.length !== 13) return res.status(400).send({ status: false, message: "Provide valid ISBN" })
      const dupISBN = await bookModel.findOne({ ISBN: ISBN })
      if (dupISBN) { return res.status(400).send({ status: false, message: "this ISBN is already in use" }) }
    }

    if (releasedAt) {
      if (!Validator.isValidDate(releasedAt)) return res.status(400).send({ status: false, message: " wrong date format" })
    }

    const updatedBlog = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },
      { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true });

    res.status(200).send({ status: true, message: "success", data: updatedBlog })

  } catch (err) {
    return res.status(500).send({status: false, message: err.message })
  }
}



const deleteBooksByBookId = async function (req, res) {
  try {
    let BookId = req.params.bookId
    let date = new Date()
    // if(!Validator.isValidObjectId(BookId)) return res.status(400).send({ status: false, message: "bookId is not valid" })

    let Book = await bookModel.findOne({ $and: [{ _id: BookId }, { isDeleted: false }] })
    if (!Book) { return res.status(400).send({ status: false, message: "Book not exist" }) }

    let check = await bookModel.findOneAndUpdate(
      { _id: BookId }, { isDeleted: true, deletedAt: date }, { new: true })

    return res.status(200).send({ status: false, message: " BOOK IS DELETED ", data: check })
  }

  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


module.exports.postBooks = postBooks
module.exports.getBooks = getBooks
module.exports.getBooksByBookId = getBooksByBookId
module.exports.updateBooksByBookId = updateBooksByBookId
module.exports.deleteBooksByBookId = deleteBooksByBookId