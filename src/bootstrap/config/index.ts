import { loadConfig } from "./config.js";

export const config = loadConfig();
export { loadConfig };
export type { Config } from "./config.schema.js";
