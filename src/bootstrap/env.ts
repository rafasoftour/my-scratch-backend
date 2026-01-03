import { config } from "dotenv";

if (process.env.NODE_ENV === "development") {
  config({ path: ".env.development" });
  console.log("dotenv loaded from .env.development");
}