import mongoose from "mongoose";

const mongoService = async (props) => {
  const { logger } = props;

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("Service connected to MongoDB");
  } catch (err) {
    logger.error(`Service could not connect to MongoDB: ${process.env.MONGODB_URL}`);
    process.exit(1);
  }
};

export default mongoService;
