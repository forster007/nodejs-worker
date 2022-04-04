import { IndexInterface, IndexModel } from "../models";

class IndexController {
  async findOneAndInsertNeoWayData(transactionId: string, data: any) {
    const record = await IndexModel.findOne({
      transactionId,
    });

    if (record) {
      record.responses.neoway.data = data;
      record.save();
    }

    return record;
  }

  async findOneAndUpdateStatus(status: string, transactionId: string, newStatus: string): Promise<IndexInterface> {
    const record = await IndexModel.findOne({
      "response.neoway.status": status,
      transactionId,
    });

    if (record) {
      record.responses.neoway.status = newStatus;
      record.save();
    }

    return record;
  }
}

export default IndexController;
