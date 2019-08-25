const amqp = require('amqplib');

const bindings = process.argv.slice(2);
const exchange = 'logs';

let channel;
let queueName;

amqp
    .connect('amqp://localhost')
    .then(connection => connection.createChannel())
    .then(_channel => {
        channel = _channel;
        return _channel.assertExchange(exchange, 'direct')
    })
    .then(() => channel.assertQueue('', { exclusive: true }))
    .then(({ queue }) => {
        queueName = queue;

        bindings.forEach(bindingKey => {
            channel.bindQueue(queueName, exchange, bindingKey);
        });
    })
    .then(() => {
        channel.consume(queueName, msg => {
            console.log(msg.content.toString());
        });
    })
