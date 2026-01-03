import mongoose from "mongoose";

type MongoConfig = {
  MONGO_URI: string;
  MONGO_DB_NAME: string;
  MONGO_OPTIONS: string;
};

export const connectMongo = async (config: MongoConfig) => {
  const uri = `${config.MONGO_URI}${config.MONGO_DB_NAME}?${config.MONGO_OPTIONS}`;
  return mongoose.connect(uri);
};