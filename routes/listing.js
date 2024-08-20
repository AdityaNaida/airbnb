const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listening.js");
const ExpressError = require("../utils/ExpressError.js");

const validateListening = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

//Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//Create Route
router.post(
  "/",
  validateListening,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("listings/listings");
  })
);

router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
  // res.send("new ");
});

//Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const data = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { data });
  })
);

//Edit Route
router.get(
  "/:id/edit",
  validateListening,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const data = await Listing.findById(id);
    res.render("listings/edit.ejs", { data });
  })
);

//Updated Route
router.put(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`listings/${id}`);
  })
);

//Destroy Route

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("listings/listings");
  })
);

module.exports = router;
