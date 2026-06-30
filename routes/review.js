import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import ExpressError from "../utils/ExpressError.js";
import { reviewSchema } from "../schema.js";
import Review from "../models/review.js";
import Listing from "../models/listing.js";
import {isLoggedIn, validateReview,isReviewAuthor} from "../middleware.js"
import {createReview,destroyReview} from "../controllers/reviews.js"

const router=express.Router({mergeParams:true});

router.post("/", isLoggedIn,validateReview, wrapAsync(createReview))

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(destroyReview))

export default router;