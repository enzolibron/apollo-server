import { Book, IBook } from '../model/book';

const bookResolver = {
  Query: {
    books: async () => await Book.find({}),
  },
  Mutation: {
    addBook: async (_: any, book: IBook) => {
      return await Book.create(book);
    },
  },
};

export { bookResolver };
