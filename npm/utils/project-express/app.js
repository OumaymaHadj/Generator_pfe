const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const port = 3003;

app.use(cors());

const indexRouter = require("./routes/index");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);


  server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
module.exports = app;