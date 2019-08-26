const amqp = require('amqplib');

const {
    WORK_EXCHANGE,
    WORK_QUEUE,
    REPLY_QUEUE,
} = require('./constants');

amqp
    .connect('amqp://localhost')
    .then(connection => connection.createChannel())
    .then(channel => {
        return channel
            .assertExchange(WORK_EXCHANGE, 'fanout')
            .then(() => channel.assertQueue(WORK_QUEUE))
            .then(() => channel.bindQueue(WORK_QUEUE, WORK_EXCHANGE, ''))
            .then(() => channel);
    })
    .then(channel => {
        return channel
            .consume(WORK_QUEUE, msg => {
                const {
                    correlationId,
                    replyTo,
                } = msg.properties;

                const content = msg.content.toString();

                console.log(content);

                setTimeout(() => {
                    console.log('Sending response');

                    channel.publish('', replyTo, Buffer.from('Processed message: ' + content), {
                        correlationId,
                    });
                }, 4000);
            },
            {
                noAck: true
            })
            .then(() => {
                console.log('Ready')
            });
    })
    .catch(error => {
        console.log('Error', error);
    });
