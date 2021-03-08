import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
const path = `${__dirname}/../../dev.env`;
dotenv.config({ path: path });

// Service Bus Connection String
const connectionString = process.env.SB_CONNECTION_STRING;
// Max Retries
const maxRetries = process.env.SB_SENDER_MAX_RETRIES;
// Message to show during internal server error to user
const INTERNAL_SERVER_ERROR_MESSAGE = 'Something Went Wrong';

@Injectable()
export class ServiceBusSenderService {
  /**
   * Send Single Message to Service Bus
   *
   * @param {string} topicName - The name of the topic to send message
   * @param {any} message - The json body to send on Azure Service Bus
   */
  async sendMessage(topicName: string, message: any) {
    const sbClient = new ServiceBusClient(connectionString, {
      retryOptions: { maxRetries: parseInt(maxRetries) },
    });

    // Create sender instance
    const sender = sbClient.createSender(topicName);

    const sbMessage: ServiceBusMessage = {
      body: message,
      messageId: this.uuid(),
    };
    try {
      console.log('SB MESSASGE===>' + sbMessage);
      // Send Message to Service Bus
      await sender.sendMessages(sbMessage);
      await sender.close();
    } catch (err) {
      console.log('ERR-->', err);
      throw new HttpException(
        INTERNAL_SERVER_ERROR_MESSAGE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await sbClient.close();
    }
  }

  /**
   * Send Single Message Batch to Service Bus
   *
   * @param {string} topicName - The name of the topic to send message
   * @param {[]} messages - The json body array to send on Azure Service Bus
   */
  async sendMessageBatch(topicName: string, messages: []) {
    // Create Service Bus Client Instance
    const sbClient = new ServiceBusClient(connectionString, {
      retryOptions: { maxRetries: parseInt(maxRetries) },
    });

    // Create Service Bus Sender Instance
    const sender = sbClient.createSender(topicName);

    // Create Message Batch Instance
    let batch = await sender.createMessageBatch();

    for (let i = 0; i < messages.length; i++) {
      const sbMessage: ServiceBusMessage = {
        body: messages[i],
        messageId: this.uuid(),
      };

      if (!batch.tryAddMessage(sbMessage)) {
        // Send the current batch as it is full and create a new one
        await sender.sendMessages(batch);
        batch = await sender.createMessageBatch();

        if (!batch.tryAddMessage(messages[i])) {
          throw new HttpException(
            INTERNAL_SERVER_ERROR_MESSAGE,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
          // throw new Error('Message too big to fit in a batch');
        }
      }
    }
  }

  // Generate Unique ID
  private uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
