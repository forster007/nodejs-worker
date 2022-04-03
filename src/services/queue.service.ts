import { ServiceBusClient, ServiceBusMessageBatch, ServiceBusReceiver } from "@azure/service-bus";
import EventEmitter from "events";
import Queues from "../config/queues.config.json";
import IndexController from "../controllers";

interface ServiceBusProps {
  logger: any;
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
    this.logger = options.logger;
    this.queueName = options.queueName;
    this.connection = new ServiceBusClient(process.env.SERVICE_BUS);
    this.receiver = this.connection.createReceiver(this.queueName, "S1");
  }

  async listenToQueue() {
    this.receiver.subscribe({
      processMessage: this.handleSuccess,
      processError: this.handleError,
    });
  }

  async handleSuccess(props: any) {
    this.logger.success(`Received message successfully: ${JSON.stringify(props.body)}`);
    const { status, transactionId } = props;

    if (status === "requested" && transactionId) {
      let newStatus = "processing";
      const indexController = new IndexController();
      await indexController.findOneAndUpdateStatus(status, transactionId, newStatus);

      newStatus = "completed";
      await indexController.findOneAndUpdateStatus(status, transactionId, newStatus);
    }
  }

  async handleError(error: any) {
    this.logger.error(`Received message error: ${JSON.stringify(error)}`);
  }
}

export default {
  villelaBrasilQueueOne: (logger: any) => new ServiceBus({ logger, queueName: Queues.villelaBrasilQueueOne }),
};
