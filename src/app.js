import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

/* ----------------------------------------
   CORS Middleware
   ----------------------------------------
   Enables cross-origin requests from the frontend domain
   specified in the environment variable (CORS_ORIGIN).

   Required when frontend (React) and backend (Express)
   run on different ports.

   The `credentials: true` option allows cookies or tokens
   to be sent across origins.
---------------------------------------- */
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

/* ----------------------------------------
   JSON Parser Middleware
   ----------------------------------------
   Parses incoming requests with JSON payloads
   (such as POST or PUT requests).

   Automatically converts JSON data into `req.body`.
   Limits the request body size to 16kb to prevent abuse.
---------------------------------------- */
app.use(express.json({ limit: "16kb" }));

/* ----------------------------------------
   URL-Encoded Parser Middleware
   ----------------------------------------
   Parses incoming requests with URL-encoded data
   (such as HTML form submissions).

   `extended: true` allows nested objects in form data.
   Limits request size to 16kb for safety.
---------------------------------------- */
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

/* ----------------------------------------
   Cookie Parser Middleware
   ----------------------------------------
   Parses cookies attached to incoming client requests.

   Commonly used to read authentication tokens or
   user session data stored in cookies.
---------------------------------------- */
app.use(cookieParser());


// Importing Routes
import userRouter from "./routes/user.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js"
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"




//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)




export default app;
