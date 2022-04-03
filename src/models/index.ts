import { model, Schema } from "mongoose";

export interface IndexInterface {
  name: string;
  status: string;
  transactionId: string;
}

const schema = new Schema<IndexInterface>(
  {
    name: { type: String, required: true },
    status: { type: String, required: true },
    transactionId: { type: String, required: true },
  },
  {
    id: true,
    timestamps: true,
  }
);

export const IndexModel = model<IndexInterface>("indexinterface", schema);
