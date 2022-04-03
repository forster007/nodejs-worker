import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import makeLogger from "./services/logger.service";
import mongoService from "./services/mongo.service";
import queueService from "./services/queue.service";

const SERVER_PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.listen(SERVER_PORT, async () => {
  const logger = makeLogger(process.pid, process.env.LOG_LEVEL);

  try {
    await mongoService({ logger });

    await queueService.villelaBrasilQueueOne(logger).listenToQueue();

    logger.success(`Service started on port ${SERVER_PORT}`);
  } catch (err) {
    logger.error(`Service catch error`);
  }
});
