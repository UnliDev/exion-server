import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit'; // graphql 쿼리 뎁스(복잡성) 제어: DOS 공격 방어
import { createServer } from 'http';
import compression from 'compression'; // gzip 압축 라이브러리: 성능향상
import cors from 'cors';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver';
import { createContext } from './context';

const main = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
    validate: false,
  });

  const context = createContext();

  const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)],
    context,
  });

  const app = express();

  app.use('*', cors());
  app.use(compression());

  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer(app);
  httpServer.listen({ port: 4000 }, (): void => console.log('server Start'));
};

main().catch((error) => {
  console.log(error, 'error');
});
