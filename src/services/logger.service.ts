import { addColors, createLogger, format, transports } from "winston";

const { colorize, combine, label, printf, timestamp } = format;
const isLabel = (info) => (info.label ? `[_${info.label}_]` : "");

const defaultFormat = printf(
  (info) =>
    `${new Date(info.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })} - ${isLabel(info)} [_${info.level}_] : ${info.message}`
);

const myCustomLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    profile: 5,
    debug: 6,
    trace: 7,
  },
  colors: {
    fatal: "magenta",
    error: "red",
    warn: "yellow",
    success: "green",
    info: "blue",
    profile: "cyan",
    debug: "gray",
    trace: "grey",
  },
};

addColors(myCustomLevels.colors);

const combineDev = (tag) =>
  combine(timestamp(), colorize(), label({ label: tag }), defaultFormat);

const combineProd = (tag) =>
  combine(timestamp(), label({ label: tag }), defaultFormat);

const getCombine = (tag) =>
  process.env.NODE_ENV === "Production" ? combineProd(tag) : combineDev(tag);

const getLogger = (tag, level) =>
  createLogger({
    format: getCombine(tag),
    transports: [new transports.Console({ level })],
    levels: myCustomLevels.levels,
    silent: process.env.NODE_ENV === "Test",
  });

const makeLogger = (tag, level) => {
  const logger = getLogger(tag, level);

  const makeLogFunction = (name) => {
    return (data) => logger[name](JSON.stringify(data));
  };

  return {
    fatal: makeLogFunction("fatal"),
    error: makeLogFunction("error"),
    warn: makeLogFunction("warn"),
    success: makeLogFunction("success"),
    info: makeLogFunction("info"),
    profile: makeLogFunction("profile"),
    debug: makeLogFunction("debug"),
    trace: makeLogFunction("trace"),
  };
};

export default makeLogger;
