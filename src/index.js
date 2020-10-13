const url = require('url');
const waitOn = require('wait-on');

const app = require('./app');
const defaults = require('./defaults');

async function main() {
    const redisResource = 'tcp:' + url.parse(defaults.getRedisUrl()).host;
    var redisWaitOpts = {
        resources: [ redisResource ],
        interval: 1000, // one second
        tcpTimeout: 10000  // ten seconds
    };
    try {
        await waitOn(redisWaitOpts);
        console.log(`Detected redis running at ${redisResource}`);
    } catch(err) {
        console.error(`Could not connect to Redis: ${err}`);
        process.exit(1);
    }

    await app.listen(app.get('port'));
    console.log('guestbook-express listening on ', app.get('port'));
}

main();