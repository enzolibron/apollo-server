import express, { Express } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { authResolver, bookResolver } from './resolvers';
import { auth, book, directive } from './typeDefs';
import dotenv from 'dotenv';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { authDirectiveTransformer } from './directives/auth';

dotenv.config();
const resolvers = [bookResolver, authResolver];
const typeDefs = [book, auth, directive];

const main = async () => {
  mongoose.set('strictQuery', false);
  mongoose
    .connect('mongodb://localhost:27017/sample')
    .then(() => console.log('connected to the database'));
  const app: Express = express();

  const httpServer = http.createServer(app);

  // Create the base executable schema
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  schema = authDirectiveTransformer(schema);

  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    })
  );

  app.get('/', (req, res) => res.send('hello world'));

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
};

main().catch((err) => console.log(err));
