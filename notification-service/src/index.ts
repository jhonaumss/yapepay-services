import dotenv from "dotenv";
dotenv.config();

import { startConsumer } from "./sqs/consumer";
import { handleTransactionEvent } from "./handlers/notification.handler";

console.log("notification-service starting...");

startConsumer(handleTransactionEvent).catch(console.error);