import { createRequire } from "node:module";
import * as os from "node:os";
import { PassThrough, pipeline } from "node:stream";
import pino, { type Logger } from "pino";

const require = createRequire(import.meta.url);
const split2 = require("split2");
const fastJsonParse = require("fast-json-parse");
const gelfPipeline = require("pino-gelf/lib/pipeline");

type LoggerConfig = {
  LOG_LEVEL: string;
  NODE_ENV: string;
  GRAYLOG_ENABLED: boolean;
  GRAYLOG_HOSTNAME?: string;
  GRAYLOG_HOST?: string;
  GRAYLOG_PORT?: number;
  GRAYLOG_USESSL?: boolean;
};

const redactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "request.headers.authorization",
  "request.headers.cookie",
];

const buildBaseConfig = (config: LoggerConfig) => {
  const instance = os.hostname();
  const hostname = config.GRAYLOG_ENABLED
    ? config.GRAYLOG_HOSTNAME || instance
    : instance;

  return {
    level: config.LOG_LEVEL,
    redact: {
      paths: redactionPaths,
      remove: true,
    },
    base: {
      service: "my-scratch-backend",
      instance,
      env: config.NODE_ENV,
      hostname,
    },
  };
};

export const createLogger = (config: LoggerConfig): Logger => {
  const baseConfig = buildBaseConfig(config);

  if (!config.GRAYLOG_ENABLED) {
    return pino(baseConfig);
  }

  try {
    const destination = new PassThrough();
    const gelfOptions = {
      host: config.GRAYLOG_HOST,
      port: config.GRAYLOG_PORT,
      maxChunkSize: 1420,
      customKeys: [],
      protocol: "udp",
    };

    pipeline(
      destination,
      split2(fastJsonParse),
      gelfPipeline(gelfOptions),
      () => undefined
    );

    return pino(
      {
        ...baseConfig,
        // GRAYLOG_USESSL does not apply to UDP transports.
      },
      destination
    );
  } catch (error) {
    console.error("Graylog logger initialization failed, using stdout.", error);
    return pino(baseConfig);
  }
};
