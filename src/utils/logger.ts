import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "backend" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        })
      ),
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  // Add AWS CloudWatch transport in production
  // This would be implemented with a CloudWatch transport package
}

export default logger;
