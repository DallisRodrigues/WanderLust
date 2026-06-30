import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import Listing from "../models/listing.js";
import { listingSchema, reviewSchema } from "../schema.js";
import ExpressError from "../utils/ExpressError.js";
import { validateListing, isOwner, isLoggedIn } from "../middleware.js";
import Review from "../models/review.js";
import * as listingController from "../controllers/listings.js";
import { upload, uploadToCloudinary } from "../cloudConfig.js";

const router = express.Router();

router.route("/")
    // index route
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single('listing[image]'), 
        uploadToCloudinary, 
        validateListing, 
        wrapAsync(listingController.createListing)
    );

// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    // show route
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'), 
        uploadToCloudinary, 
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    // delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

export default router;