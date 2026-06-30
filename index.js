import mongoose from "mongoose";
import initData from "./init/data.js";
import Listing from "./models/listing.js";
import User from "./models/user.js";     
import Review from "./models/review.js"; 
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main()
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// UPGRADED: Analyzes both title and description tailored to your specific seed data
const determineCategory = (title, description) => {
    let text = (title + " " + description).toLowerCase();
    
    if (text.includes("castle") || text.includes("historic villa") || text.includes("scottish")) return "Castles";
    if (text.includes("ski") || text.includes("alps") || text.includes("snow")) return "Arctic"; 
    if (text.includes("mountain") || text.includes("rockies") || text.includes("aspen") && !text.includes("ski")) return "Mountains";
    if (text.includes("pool") || text.includes("oasis") || text.includes("bali") || text.includes("phuket")) return "Amazing Pools";
    if (text.includes("treehouse") || text.includes("lodge") || text.includes("safari") || text.includes("cabin") || text.includes("lake")) return "Camping";
    if (text.includes("farm") || text.includes("cottage") || text.includes("cotswolds") || text.includes("rustic")) return "Farms";
    if (text.includes("boat") || text.includes("canal") || text.includes("overwater")) return "Boats";
    if (text.includes("dome") || text.includes("eco-friendly")) return "Domes";
    if (text.includes("city") || text.includes("loft") || text.includes("penthouse") || text.includes("apartment") || text.includes("downtown") || text.includes("urban")) return "Iconic Cities";
    if (text.includes("beach") || text.includes("island") || text.includes("paradise") || text.includes("luxury")) return "Trending";
    
    return "Rooms"; // Fallback for anything else
};

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log("Database cleared");

        const newUser = new User({ email: "admin@test.com", username: "admin" });
        const registeredUser = await User.register(newUser, "admin123");
        console.log("Default User created -> Username: admin | Password: admin123");

        console.log("Processing Data: Geocoding locations and assigning tailored categories... (This will take about 30 seconds)");
        
        const finalData = [];

        for (let obj of initData.data) {
            
            // 1. Guess the category based on the title AND description
            const assignedCategory = determineCategory(obj.title, obj.description);

            let coordinates = [72.8777, 19.0760]; 

            const locationQuery = encodeURIComponent(`${obj.location}, ${obj.country}`);
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`;
            
            try {
                const response = await fetch(geoUrl, {
                    headers: { 'User-Agent': 'WanderLust_Application_Dev' }
                });
                const geoData = await response.json();

                if (geoData && geoData.length > 0) {
                    coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
                    console.log(`📍 [${assignedCategory}] Mapped: ${obj.title}`);
                } else {
                    console.log(`⚠️ [${assignedCategory}] Fallback used for: ${obj.location}`);
                }
            } catch (err) {
                console.log(`❌ [${assignedCategory}] API Error for ${obj.location}`);
            }

            // Push the formatted object
            finalData.push({
                ...obj,
                owner: registeredUser._id, 
                reviews: [],               
                geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                category: assignedCategory 
            });

            await delay(1000); 
        }

        await Listing.insertMany(finalData);
        console.log("✅ Data was initialised perfectly!");

    } catch (err) {
        console.log("Initialization Error:", err);
    } finally {
        mongoose.connection.close();
    }
};

initDB();