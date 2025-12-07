import mongoose from "mongoose";



const MONGODB_URI = process.env.MONGODB_URI! ;
// const MONGODB_URI = mongodb+srv://muhammadimranasghar5_db_user:imran12345@anmollab.904vouv.mongodb.net/;

if(!MONGODB_URI){
    throw new Error("MONGODB_URI is not defined");
}

let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = { conn: null, promise: null };
}


export async function connectionToDB() {
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        const opts = {
            bufferCommands : true,
            maxPoolSize: 10
            
        }
        
        cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then(() => mongoose.connection);
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        throw error
        
    }

    console.log("db connected");
    return cached.conn

    
}