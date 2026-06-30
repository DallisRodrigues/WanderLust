import Listing from "../models/listing.js";
import { cloudinary } from "../cloudConfig.js";

export const index = async (req, res) => {
    const { category, q } = req.query;
    
    let dbQuery = {};
    
    if (category) {
        dbQuery.category = category;
    }
    
    if (q) {
        dbQuery.$or = [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ];
    }
    
    const allListings = await Listing.find(dbQuery);
    
    if (allListings.length === 0 && q) {
        req.flash("error", `No destinations found matching "${q}".`);
        return res.redirect("/listings");
    }
    
    res.render("listings/index.ejs", { 
        allListings,
        searchQuery: q || "",           
        activeCategory: category || ""  
    });
};

export const renderNewForm = (req, res) => {
    res.render("listings/new");
};

export const showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

export const createListing = async (req, res, next) => {
    const locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country}`);
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`;

    const response = await fetch(geoUrl, {
        headers: { 'User-Agent': 'WanderLust_Application_Dev' }
    });
    const geoData = await response.json();

    let coordinates = [72.8777, 19.0760];
    if (geoData && geoData.length > 0) {
        coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
    }

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;

    newlisting.geometry = {
        type: 'Point',
        coordinates: coordinates
    };

    if (req.file && req.file.cloudinaryUrl) {
        newlisting.image = {
            url: req.file.cloudinaryUrl,
            filename: req.file.cloudinaryId
        };
    }

    await newlisting.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

export const renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit", { listing, originalImageUrl });
};

export const updateListing = async (req, res) => {
    let { id } = req.params;
    let originalListing = await Listing.findById(id);
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    const locationChanged = req.body.listing.location !== originalListing.location || 
                            req.body.listing.country !== originalListing.country;

    if (locationChanged) {
        const locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country}`);
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`;
        
        const response = await fetch(geoUrl, {
            headers: { 'User-Agent': 'WanderLust_Application_Dev' }
        });
        const geoData = await response.json();

        if (geoData && geoData.length > 0) {
            listing.geometry = {
                type: 'Point',
                coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
            };
        }
    }
    
    if (req.file && req.file.cloudinaryUrl) {
        if (originalListing.image.filename !== "listingimage") {
            await cloudinary.uploader.destroy(originalListing.image.filename);
        }
        listing.image = { 
            url: req.file.cloudinaryUrl, 
            filename: req.file.cloudinaryId 
        };
    }
    
    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

export const destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);

    if (deletedListing.image && deletedListing.image.filename !== "listingimage") {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
    }

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};