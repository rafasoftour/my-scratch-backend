import "./env.js";
import { config } from "./config/index.js";

if (process.env.NODE_ENV === "development") {
  void config;
  console.log("dev ok");
} else {
  void config;
  console.log("start ok");
}
