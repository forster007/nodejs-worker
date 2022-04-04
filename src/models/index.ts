import { model, Schema } from "mongoose";

export interface IndexInterface {
  cnpj: string;
  name: string;
  responses: {
    exatodigital: {
      data: object;
      status: string;
    };
    neoway: {
      data: object;
      status: string;
    };
    serasa: {
      data: object;
      status: string;
    };
  };
  status: string;
  transactionId: string;
}

const schema = new Schema<IndexInterface>(
  {
    cnpj: { type: String, required: true },
    name: { type: String, required: true },
    responses: {
      exatodigital: {
        data: { type: Object },
        status: { type: String },
      },
      neoway: {
        data: { type: Object },
        status: { type: String },
      },
      serasa: {
        data: { type: Object },
        status: { type: String },
      },
    },
    status: { type: String, required: true },
    transactionId: { type: String, required: true },
  },
  {
    id: true,
    timestamps: true,
  }
);

export const IndexModel = model<IndexInterface>("indexinterface", schema);
