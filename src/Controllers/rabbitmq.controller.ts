// userController.ts
import { Request, Response } from 'express';
import amqp from 'amqplib';

export const consume = async (req: Request, res: Response) => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queueName = 'userRegistrationQueue';

    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Get a single message from the queue without continuous consumption
    const message = await channel.get(queueName, { noAck: false });

    if (message) {
      const userDetails = JSON.parse(message.content.toString());
      console.log("Fetched user registration details:", userDetails);

      // Acknowledge the message to remove it from the queue
      channel.ack(message);

      // Close the connection after fetching
      await channel.close();
      await connection.close();

      res.json({ success: true, userDetails });
    } else {
      // No messages in the queue
      await channel.close();
      await connection.close();

      res.json({ success: false, message: "No messages available in the queue" });
    }
  } catch (error) {
    console.error("Error fetching user registration:", error);
    res.status(500).json({ success: false, message: "Error fetching user registration" });
  }
};
