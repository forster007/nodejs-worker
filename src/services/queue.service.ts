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
import ServiceRequest from "./axios.service";
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
    const { cnpj, status, transactionId, ...body } = props.body;
    const logger = makeLogger(transactionId, process.env.LOG_LEVEL);
    logger.info(`New message received with props ${JSON.stringify({ body, transactionId })}`);

    if (transactionId) {
      logger.info(`Message received fit with condition`);

      const indexController = new IndexController();
      let actualStatus = status;
      let newStatus = "processing";

      await indexController.findOneAndUpdateStatus(actualStatus, transactionId, newStatus);
      logger.info(`Changed NEOWAY status on Database to ${newStatus}`);

      const serviceRequest = new ServiceRequest();
      await serviceRequest.refreshToken();
      const { data } = await serviceRequest.getCompany(cnpj);

      if (data) {
        await indexController.findOneAndInsertNeoWayData(transactionId, data);
        actualStatus = newStatus;
        newStatus = "completed";

        await indexController.findOneAndUpdateStatus(actualStatus, transactionId, newStatus);
        logger.info(`Changed NEOWAY status on Database to ${newStatus}`);

        logger.success(`All steps finished successfully on request`);
      }
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
