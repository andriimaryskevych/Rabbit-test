const amqp = require('amqplib');

const queueName = 'test';

let channel;
let connection;
let queue;

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
        channel.consume(queueName, msg => {
            console.log('1', msg.content.toString());

            channel.ack(msg);
        })
        .then(() => { console.log('Here 1'); })

        channel.consume(queueName, msg => {
            console.log('2', msg.content.toString());
        })
        .then(() => { console.log('Here 2'); })

        channel.consume(queueName, msg => {
            console.log('3', msg.content.toString());
        })
        .then(() => { console.log('Here 3'); })

        channel.consume(queueName, msg => {
            console.log('4', msg.content.toString());
        })
        .then(() => { console.log('Here 4'); })
    });
