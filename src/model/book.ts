import mongoose from 'mongoose';

interface IBook {
  title: string;
  author: string;
}

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model('Book', bookSchema);

export { Book, IBook };
