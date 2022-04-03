import { IndexInterface, IndexModel } from "../models";

class IndexController {
  async findOneAndUpdateStatus(status: string, transactionId: string, newStatus: string): Promise<IndexInterface> {
    const record = await IndexModel.findOne({
      status,
      transactionId,
    });

    if (record) {
      record.status = newStatus;
      record.save();
    }

    return record;
  }
}

export default IndexController;
