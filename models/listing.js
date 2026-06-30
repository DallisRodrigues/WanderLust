import mongoose, { Schema } from "mongoose";
import reviewSchema from "./review.js";

const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1722325110558-63a1a50c2f28?q=80&w=995&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const listingSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: DEFAULT_IMAGE_URL,
            set: (v) => v === "" || !v ? DEFAULT_IMAGE_URL : v
        }
    },
    price: Number,
    location: String,
    country: String,
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"]
    },
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],  // Array of numbers: [Longitude, Latitude]
            required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {

        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
})


const Listing = mongoose.Schema.models?.Listing || mongoose.model("Listing", listingSchema);

export default Listing;