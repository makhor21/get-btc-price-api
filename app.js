require("dotenv").config();
const express = require("express");
const app = express();
const logger = require("morgan");
const getApiData = require("./services/getApiData");
const apiRouter = require("./routes/api");

app.use(logger("dev"));
app.set("view engine", "ejs");

app.use("/", apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on localhost:${process.env.PORT} ...`);
});
