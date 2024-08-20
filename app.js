const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// const

main()
  .then(() => {
    console.log("connected to the DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.send("Hello, I'm the root!");
});

app.all("*", (req, res, err) => {
  res.send(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error!" } = err;
  res.status(status).render("error.ejs", { err });
  // res.status(status).send(message);
});

app.listen(8080, () => {
  console.log("App listening at 8080");
});
