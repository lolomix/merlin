const EventEmitter = require("events");

class Emitter extends EventEmitter {}

const emitter = new Emitter();

exports.default = emitter;
