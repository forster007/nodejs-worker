import {
  delay,
  isServiceBusError,
  ProcessErrorArgs,
  ServiceBusClient,
  ServiceBusMessageBatch,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
} from "@azure/service-bus";
import EventEmitter from "events";
import Queues from "../config/queues.config.json";
import IndexController from "../controllers";
import makeLogger from "./logger.service";

interface ServiceBusProps {
  queueName: string;
}

class ServiceBus extends EventEmitter {
  batch: ServiceBusMessageBatch;
  connection: ServiceBusClient;
  receiver: ServiceBusReceiver;
  logger: any;
  queueName: string;

  constructor(options: ServiceBusProps = {} as ServiceBusProps) {
    super();
    this.queueName = options.queueName;
    this.connection = new ServiceBusClient(process.env.SERVICE_BUS);
    this.receiver = this.connection.createReceiver(this.queueName, "s1");
  }

  async listenToQueue() {
    this.receiver.subscribe({
      processMessage: this.handleSuccess,
      processError: this.handleError,
    });
  }

  async handleSuccess(props: ServiceBusReceivedMessage) {
    const { name, status, transactionId } = props.body;
    const logger = makeLogger(transactionId, process.env.LOG_LEVEL);
    logger.info(`New message received with props ${JSON.stringify({ name, status, transactionId })}`);

    if (status === "requested" && transactionId) {
      logger.info(`Message received fit with condition`);

      let newStatus = "processing";
      const indexController = new IndexController();
      await indexController.findOneAndUpdateStatus(status, transactionId, newStatus);
      logger.info(`Changed status on Database to processing`);

      await delay(5000);

      newStatus = "completed";
      await indexController.findOneAndUpdateStatus(status, transactionId, newStatus);
      logger.info(`Changed status on Database to completed`);
      logger.success(`All steps finished successfully on request`);
    }
  }

  async handleError(err: ProcessErrorArgs) {
    if (isServiceBusError(err.error)) {
      switch (err.error.code) {
        case "MessagingEntityDisabled":
        case "MessagingEntityNotFound":
        case "UnauthorizedAccess":
          console.log(`An unrecoverable error occurred. Stopping processing. ${err.error.code}`, err.error);
          break;
        case "MessageLockLost":
          console.log(`Message lock lost for message`, err.error);
          break;
        case "ServiceBusy":
          await delay(1000);
          break;
      }
    }
  }
}

export default {
  villelaBrasilQueueOne: new ServiceBus({ queueName: Queues.villelaBrasilQueueOne }),
};
