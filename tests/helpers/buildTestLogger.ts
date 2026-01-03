import pino from "pino";

export const buildTestLogger = () => pino({ level: "silent" });
