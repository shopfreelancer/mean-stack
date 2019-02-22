const redis = require('redis');
const util = require('util');
const mongoose = require('mongoose');

// handler to original function
const exec = mongoose.Query.prototype.exec;


const redisUrl = process.env.REDIS_URL;
let client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);


mongoose.Query.prototype.exec = async function () {
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    const cacheValue = await client.get(key);

    if (cacheValue) {

        const doc = new this.model(JSON.parse(cacheValue));
        // hydrating models
        // can be single model or collection of models
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    let result = await exec.apply(this, arguments);
    client.set(key, JSON.stringify(result))

    return result;
}