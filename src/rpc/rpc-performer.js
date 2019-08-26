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
                        const { correlationId } = msg.properties;

                        if (correlationId in this.requests) {
                            const content = msg.content.toString();
                            const { resolve, timeout } = this.requests[correlationId];

                            clearTimeout(timeout)
                            resolve(content);

                            delete this.requests[correlationId];
                        }
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
            const timeout = setTimeout(() => {
                reject(new Error('RMQ timeout error'));
            }, 5000);

            this.requests[correlationId] = {
                resolve,
                reject,
                timeout,
            };
        })
    }
}

module.exports = RPCPreformer;
