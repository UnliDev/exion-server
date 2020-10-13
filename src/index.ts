import 'reflect-metadata';
import './generated/nexus';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit'; // graphql 쿼리 뎁스(복잡성) 제어: DOS 공격 방어
import { createServer } from 'http';
import compression from 'compression'; // gzip 압축 라이브러리: 성능향상
import cors from 'cors';
import path from 'path';
import { createContext } from './context';
import { schema } from './schema';

const main = async () => {
  const formatError = (err: any) => {
    console.error("--- GraphQL Error ---");
    console.error("Path:", err.path);
    console.error("Message:", err.message);
    console.error("Code:", err.extensions.code);
    console.error("Original Error", err.originalError);
    return err;
  };

  const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)],
    context: createContext,
    debug: process.env.NODE_ENV !== 'production',
    formatError,
  });

  const app = express();

  app.use('*', cors());
  app.use(compression());

  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer(app);
  httpServer.listen({ port: 4000 }, (): void => console.log(process.env.NODE_ENV !== 'local' ? 'server Start: http://52.78.21.150:4000/graphql' : 'server Start: http://localhost:4000/graphql'));
};

main().catch((error) => {
  console.log(error, 'error');
});
