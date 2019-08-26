const EventEmitter = require('events');

const amqp = require('amqplib');
const uuid = require('uuid');

const {
    WORK_EXCHANGE,
    REPLY_QUEUE,
    EVENT_READY,
    EVENT_ERROR,
} = require('./constants');

class RPCPreformer extends EventEmitter {
    constructor() {
        super();

        amqp
            .connect('amqp://localhost')
            .then(connection => connection.createChannel())
            .then(channel => {
                this.channel = channel;

                return channel;
            })
            .then(channel => {
                return channel
                    .assertExchange(WORK_EXCHANGE, 'fanout')
                    .then(() => channel);
            })
            .then(channel => {
                return channel
                    .consume(REPLY_QUEUE, msg => {
                        console.log(msg);
                    },
                    {
                        noAck: true
                    })
                    .then(() => {
                        this.emit(EVENT_READY)
                    });
            })
            .catch(error => {
                this.emit(EVENT_ERROR, error);
            });

        this.requests = {};
    }

    async perform(input) {
        const correlationId = uuid.v4();

        this.channel.publish(WORK_EXCHANGE, '', Buffer.from(input), {
            correlationId,
            replyTo: REPLY_QUEUE,
        });

        return new Promise((resolve, reject) => {
            this.requests[correlationId] = {
                resolve,
                reject
            };
        })
    }
}

module.exports = RPCPreformer;
