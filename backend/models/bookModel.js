import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    publishYear: {
      type: Number,
      required: [true, 'Publish year is required'],
      min: [1000, 'Publish year must be valid'],
      max: [new Date().getFullYear(), 'Publish year cannot be in future'],
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model('Book', bookSchema);
