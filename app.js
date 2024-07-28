const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

const Listing = require("./models/listening.js");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js")


const ExpressError = require("./utils/ExpressError.js")

const { listingSchema } = require("./schema.js");

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

const validateListening = (req, res, next) => {
  const {error} = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error)
  } else {
    next();
  }
}

//Index Route
app.get("/listings",wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));




//Create Route
app.post("/listings", validateListening, wrapAsync(async (req, res, next) => {
 
  const newListing = new Listing(req.body.listing);
  await newListing
      .save()
        res.redirect("/listings");
}))

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
  // res.send("new ");
});
//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const data = await Listing.findById(id);
  res.render("listings/show.ejs", { data });
}));

//Edit Route
app.get("/listings/:id/edit", validateListening , wrapAsync(async (req, res) => {
  const { id } = req.params;
  const data = await Listing.findById(id);
  res.render("listings/edit.ejs", { data });
}));

//Updated Route
app.put("/listings/:id", wrapAsync( async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Destroy Route

app.delete("/listings/:id", wrapAsync( async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

app.get("/", (req, res) => {
  res.send("Hello, I'm the root!");
});

app.all("*", (req, res, err) => {
  res.send(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) => {
  const { status = 500, message = "Internal Server Error!"} = err;
  res.status(status).render("error.ejs", {err})
  // res.status(status).send(message);
})

app.listen(8080, () => {
  console.log("App listening at 8080");
});
