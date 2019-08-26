const amqp = require('amqplib');

const queueName = 'test';

let channel;
let connection;

amqp
    .connect('amqp://localhost')
    .then(conn => {
        connection = conn;

        return connection.createChannel()
    })
    .then(chann => {
        channel = chann;

        return channel.assertQueue(queueName, { noAck: true })
    })
    .then(() => {
        channel.publish('', queueName, Buffer.from('Task to do'));

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 200);
    });
