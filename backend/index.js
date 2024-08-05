// import { ApolloServer } from "@apollo/server";
// import { startStandaloneServer } from "@apollo/server/standalone";
// import { expressMiddleware } from '@apollo/server/express4';
// import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import mergedResolvers from "./resolvers/index.js";
// import mergedTypeDefs from "./typeDef/index.js";


// const app = express();
// const httpServer = http.createServer(app);

// const server = new ApolloServer({
//   typeDefs: mergedTypeDefs,
//   resolvers: mergedResolvers,
//   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// });
// await server.start();

// app.use(
//   '/',
//   cors(),
//   express.json(),
//   // expressMiddleware accepts the same arguments:
//   // an Apollo Server instance and optional configuration options
//   expressMiddleware(server, {
//     context: async ({ req }) => ({ req }),
//   }),
// );

// // Modified server startup
// await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

// console.log(`🚀 Server ready at http://localhost:4000/`);

 
// const { url } = await startStandaloneServer(server);

// console.log(`🚀 Server ready at ${url}`);
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import passport from "passport";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";

import { GraphQLLocalStrategy, buildContext } from "graphql-passport";

import express from 'express';
import http from 'http';
import cors from 'cors';
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDef/index.js";
import dotenv from "dotenv";

import { connectDB } from "./db/connectDB.js";

import { configurePassport } from "./passport/passport.config.js";



dotenv.config();
configurePassport();

const app = express();
const httpServer = http.createServer(app);

const MongoDBStore=connectMongo(session);
const store = new MongoDBStore({
  uri:process.env.MONGO_URI,
  collection: "sessions",
})
store.on("error",(err)=>console.log(err));//debug and for error handleinng


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave:false, // tells wherther we save the session to the store evertimne we req, if it becoems true then  we will be havibng multiple seessions for the same user
    saveUninitialized: false, // whether to save the uninitialized session
    cookie:{
      maxAge: 1000*60*60*24*5*7,
      httpOnly:true, //privacy- basically prevents  XSS attacks
    } ,
    store:store
  })
)

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/',
  cors({
    origin:"http://localhost:3000",
    credentials:true,

  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req,res}) => buildContext ({ req,res }),//object shared among all resolvers 
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/`);
