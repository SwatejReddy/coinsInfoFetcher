import mongoose from "mongoose";
import axios from "axios";
import Crypto from "./models/crypto.model";
import { DATABASE_NAME } from "./constants";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DATABASE_NAME}`);
        console.log("MONGODB connection successful!\n", connectionInstance.connection.host);
    } catch (error) {
        console.log("MONGODB connection failed!", error);
        process.exit(1);
    }
};

// Function to update data for a specific coin
export const updateCoinData = async (coin: string) => {
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );
        const info = response.data;

        const latestData = {
            price: info.market_data.current_price.usd,
            marketCap: info.market_data.market_cap.usd,
            "24hChange": info.market_data.price_change_24h_in_currency.usd,
            lastUpdated: new Date(),
        };

        const coinHistoryEntry = {
            timestamp: new Date(),
            price: info.market_data.current_price.usd,
            marketCap: info.market_data.market_cap.usd,
            "24hChange": info.market_data.price_change_24h_in_currency.usd,
        };

        const result = await Crypto.findOneAndUpdate(
            { coinName: coin },
            {
                $set: { latestData },
                $push: { coinHistory: coinHistoryEntry },
            },
            { upsert: true, new: true }
        );

        console.log(`Updated data for ${coin}:`, result);
    } catch (error) {
        console.error(`Error fetching or updating ${coin} data:`, error);
    }
};

// Function to update data for multiple coins
const updateMultipleCoins = async () => {
    const coins = ["matic-network", "bitcoin", "ethereum"];  // List of coins

    for (const coin of coins) {
        await updateCoinData(coin);  // Update each coin
    }
};

const run = async () => {
    await connectDB();
    await updateMultipleCoins();  // Run the update for all coins
    process.exit(0);
};

run().catch(err => console.error(err));
