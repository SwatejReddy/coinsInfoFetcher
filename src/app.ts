import mongoose from "mongoose";
import axios from "axios";
import Crypto from "./models/crypto.model"; // Adjust the import based on your project structure
import { DATABASE_NAME } from "./constants";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DATABASE_NAME}`);
        console.log("MONGODB connection successful!\n", connectionInstance.connection.host);
    } catch (error) {
        console.log("MONGODB connection failed!", error);
        process.exit(1);
    }
}

export const updateCoinData = async () => {
    const coin = "matic-network";
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );
        const info = response.data;

        const updatedData = {
            latestData: {
                price: info.market_data.current_price.usd,
                marketCap: info.market_data.market_cap.usd,
                "24hChange": info.market_data.price_change_24h_in_currency.usd,
                lastUpdated: new Date(),
            },
            $push: {
                coinHistory: {
                    timestamp: new Date(),
                    price: info.market_data.current_price.usd,
                    marketCap: info.market_data.market_cap.usd,
                    "24hChange": info.market_data.price_change_24h_in_currency.usd,
                },
            },
        };

        await Crypto.findOneAndUpdate({ coinName: coin }, { $set: updatedData }, { upsert: true, new: true });
        console.log(`Updated data for ${coin}`);
    } catch (error) {
        console.error(`Error fetching or updating ${coin} data:`, error);
    }
};

const run = async () => {
    await connectDB();
    await updateCoinData();
};

run().catch(err => console.error(err));
