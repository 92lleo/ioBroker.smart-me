"use strict";

/*
 * Created with @iobroker/create-adapter v1.18.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const request = require('request');

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;

var url = "https://smart-me.com:443/api/Devices";
var base64auth = "";

/**
 * Starts the adapter instance
 * @param {Partial<ioBroker.AdapterOptions>} [options]
 */
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: "smart-me",

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                adapter.log.info("cleaned everything up...");
                callback();
            } catch (e) {
                callback();
            }
        },

        // is called if a subscribed object changes
        objectChange: (id, obj) => {
            if (obj) {
                // The object was changed
                adapter.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
            } else {
                // The object was deleted
                adapter.log.info(`object ${id} deleted`);
            }
        },

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            if (state) {
                // The state was changed
                adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            } else {
                // The state was deleted
                adapter.log.info(`state ${id} deleted`);
            }
        },

        // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
        // requires "common.message" property to be set to true in io-package.json
        // message: (obj) => {
        // 	if (typeof obj === "object" && obj.message) {
        // 		if (obj.command === "send") {
        // 			// e.g. send email or pushover or whatever
        // 			adapter.log.info("send command");

        // 			// Send response in callback if required
        // 			if (obj.callback) adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
        // 		}
        // 	}
        // },
    }));
}

function checkDevices() {
    request(
        {
            url: url,
            json: true,
            headers : {
                "Authorization" : base64auth
            }
        },
        function (error, response, content) {
            adapter.log.debug('remote request done');

            if (!error && response.statusCode == 200) {
                if (content) {

                    content.forEach(function(device) {

                        var callback = function(val){
                            //
                        }

                        var id = device.Id;

                        adapter.log.info("Device id: " + id);

                        // "Id": "xxxx",
                        // "Name": "xxxx",
                        // "Serial": 12345,
                        // "DeviceEnergyType": 1,
                        // "FamilyType": 1,
                        // "ActivePower": 0,
                        // "ActivePowerUnit": "kW",
                        // "CounterReading": 429.659,
                        // "CounterReadingUnit": "kWh",
                        // "CounterReadingT1": 429.659,
                        // "CounterReadingImport": 429.659,
                        // "SwitchOn": false,
                        // "Voltage": 225.8,
                        // "VoltageL1": 225.8,
                        // "Current": 0,
                        // "PowerFactor": 0,
                        // "PowerFactorL1": 0,
                        // "Temperature": 4.65,
                        // "ValueDate": "2019-12-24T21:24:16.8909147Z"

                        adapter.createState('', id, 'Id', {
                            name: "Id",
                            def: entry.Id,
                            type: 'string',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'device id'
                        }, callback);

                        adapter.createState('', id, 'Serial', {
                            name: "Serial",
                            def: entry.Serial,
                            type: 'string',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'device serial'
                        }, callback);

                        adapter.createState('', id, 'Name', {
                            name: "Name",
                            def: entry.Name,
                            type: 'string',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'device name'
                        }, callback);

                        adapter.createState('', id, 'ActivePower', {
                            name: "ActivePower",
                            def: entry.ActivePower,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current power in kW'
                        }, callback);

                        adapter.createState('', id, 'CounterReading', {
                            name: "CounterReading",
                            def: entry.CounterReading,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current counter reading in kWh'
                        }, callback);

                        adapter.createState('', id, 'Voltage', {
                            name: "Voltage",
                            def: entry.Voltage,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current voltage'
                        }, callback);

                        adapter.createState('', id, 'Current', {
                            name: "Current",
                            def: entry.Current,
                            type: 'number',
                            read: 'true',
                            write: 'false',
                            role: 'value',
                            desc: 'current current'
                        }, callback);

                        adapter.createState('', id, 'SwitchOn', {
                            name: "SwitchOn",
                            def: entry.SwitchOn,
                            type: 'boolean',
                            read: 'true',
                            write: 'true',
                            role: 'value',
                            desc: 'current switch state'
                        }, callback);    

                    }
                    
                } else {
                    adapter.log.warn('Response has no valid content. Check your data and try again. '+response.statusCode);
                }
            } else {
                adapter.log.warn(error);
            }

        setTimeout(checkDevices, 30*1000);
    });
}

function main() {

    // Reset the connection indicator during startup
    this.setState("info.connection", false, true);

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info("config option1: " + adapter.config.option1);
    adapter.log.info("config option2: " + adapter.config.option2);

    var username = adapter.config.username;
    var password = adapter.config.password;
    var base64auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

    checkDevices();

    this.setState("info.connection", true, true);


    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates("*");

    /*
        setState examples
        you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
    */
    // the variable testVariable is set to true as command (ack=false)
    adapter.setState("testVariable", true);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    adapter.setState("testVariable", { val: true, ack: true });

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    adapter.setState("testVariable", { val: true, ack: true, expire: 30 });

    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword("admin", "iobroker", (res) => {
        adapter.log.info("check user admin pw ioboker: " + res);
    });

    adapter.checkGroup("admin", "admin", (res) => {
        adapter.log.info("check group user admin group admin: " + res);
    });
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
