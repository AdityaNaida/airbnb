const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

const Review = require("./models/review.js");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");

const ExpressError = require("./utils/ExpressError.js");

const { listingSchema, reviewSchema } = require("./schema.js");
const Listning = require("./models/listening.js");

const listings = require("./routes/listing.js");

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

// app.get("/testListing", async (req, res) => {
//   let sampleListning = new Listing({});

//   await sampleListning.save();
//   console.log("Sample was saved!");
//   res.send("successful");
// });

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

app.use("/listings", listings);

//REVIEWS
//POST REVIEW ROUTE

app.post(
  "/listings/:id/review",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

//DELETE REVIEW ROUTE

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

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
