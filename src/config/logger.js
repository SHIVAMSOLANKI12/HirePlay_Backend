import morgan from "morgan";

const logger = morgan(
  ":method :url :status :response-time ms - :res[content-length] bytes"
);

export default logger;