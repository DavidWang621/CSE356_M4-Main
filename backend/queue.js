var amqp = require('amqplib');
var channel;

async function connectQueue() {
    const opt = { credentials: amqp.credentials.plain('rabbit', 'mq') };
    try {
      const amqpServer = 'amqp://209.94.58.157'
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