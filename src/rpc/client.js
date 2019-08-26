const RPCPerformer = require('./rpc-performer');
const {
    EVENT_READY,
    EVENT_ERROR,
} = require('./constants');

const performer = new RPCPerformer();

performer.on(EVENT_READY, () => {
    process.stdin.on('data', async buffer => {
        let input = buffer.toString();
        input = input.substr(0, input.length - 1);

        console.log('Input received', input);
        console.log('Sending request');

        try {
            const result = await performer.perform(input);

            console.log('Service success');
            console.log('Request:', input, '\nResponse:', result);
        } catch (error) {
            console.log('Service error', error);
        }
    });
});

performer.on(EVENT_ERROR, error => {
    console.log('Error occured', error);

    process.exit();
});
