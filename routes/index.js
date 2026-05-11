const contestantRouter = require("./contestantRoutes");
const voteRouter = require("./voteRoutes");
const passwordRouter = require("./passwordRoutes");
const emailRouter = require("./emailVerificationRoutes");


const appRouter = require("express").Router();

appRouter.use("/contestants",  contestantRouter);
appRouter.use("/vote", voteRouter);
appRouter.use("/auth", passwordRouter);
appRouter.use("/verify", emailRouter);

module.exports = appRouter;