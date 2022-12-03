var amqp = require('amqplib');
var fs = require('fs');
var env = require('dotenv');
env.config();
var channel;

async function connectQueue() {
    const opt = { credentials: amqp.credentials.plain('rabbit', 'mq') };
    try {
      const amqpServer = process.env.rabbit_ip;
      connection = await amqp.connect(amqpServer, opt);
      channel = await connection.createChannel();
      await channel.assertQueue('update', {
        durable: false
      });
    } catch (error) {
      console.log(error)
    }
}
exports.connectQueue = connectQueue;

function sendToChannel(queue, message) {
    channel.sendToQueue(queue, Buffer.from(message));
}
exports.sendToChannel = sendToChannel;