import express from 'express';
import { Book } from '../models/bookModel.js';

const router = express.Router();

/* ===============================
   CREATE BOOK
   =============================== */
router.post('/', async (request, response) => {
  try {
    const { title, author, publishYear } = request.body;

    // ✅ Validation
    if (!title || !author || !publishYear) {
      return response.status(400).json({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    // ✅ FIX: publishYear ko Number me convert
    const newBook = {
      title,
      author,
      publishYear: Number(publishYear),
    };

    const book = await Book.create(newBook);

    return response.status(201).json(book); // ✅ SUCCESS
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: error.message });
  }
});

/* ===============================
   GET ALL BOOKS
   =============================== */
router.get('/', async (request, response) => {
  try {
    const books = await Book.find({});

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: error.message });
  }
});

/* ===============================
   GET BOOK BY ID
   =============================== */
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).json(book);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: error.message });
  }
});

/* ===============================
   UPDATE BOOK
   =============================== */
router.put('/:id', async (request, response) => {
  try {
    const { title, author, publishYear } = request.body;

    if (!title || !author || !publishYear) {
      return response.status(400).json({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    const { id } = request.params;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title,
        author,
        publishYear: Number(publishYear), // ✅ FIX
      },
      { new: true }
    );

    if (!updatedBook) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response
      .status(200)
      .json({ message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: error.message });
  }
});

/* ===============================
   DELETE BOOK
   =============================== */
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response
      .status(200)
      .json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: error.message });
  }
});

export default router;
