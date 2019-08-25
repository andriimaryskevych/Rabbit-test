const amqp = require('amqplib');

const bindings = process.argv.slice(2);
const exchange = 'logs';

let channel;
let connection

amqp
    .connect('amqp://localhost')
    .then(_connection => {
        connection = _connection;

        return _connection.createChannel()
    })
    .then(_channel => {
        channel = _channel;
        return _channel.assertExchange(exchange, 'direct')
    })
    .then(() => {
        bindings.forEach(routingKey => {
            channel.publish(exchange, routingKey, Buffer.from(routingKey));
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 200);
    });
