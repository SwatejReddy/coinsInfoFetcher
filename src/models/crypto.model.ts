import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the Crypto document
export interface ICrypto extends Document {
    coinName: string;
    coinHistory: {
        timestamp: Date;
        price: number;
        marketCap: number;
        "24hChange": number;
    }[];
    latestData: {
        price: number;
        marketCap: number;
        "24hChange": number;
        lastUpdated: Date;
    };
}

// Define the Crypto schema
const CryptoSchema: Schema<ICrypto> = new Schema({
    coinName: {
        type: String,
        required: true,
        enum: ['bitcoin', 'ethereum', 'matic-network'],
        index: true
    },
    coinHistory: [{
        timestamp: {
            type: Date,
            required: true,
            index: true
        },
        price: {
            type: Number,
            required: true
        },
        marketCap: {
            type: Number,
            required: true
        },
        "24hChange": {
            type: Number,
            required: true
        }
    }],
    latestData: {
        price: Number,
        marketCap: Number,
        "24hChange": Number,
        lastUpdated: Date
    }
});

// Export the Crypto model
const Crypto: Model<ICrypto> = mongoose.model<ICrypto>('Crypto', CryptoSchema);
export default Crypto;
