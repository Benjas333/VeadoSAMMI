let veadotube_instances = [];
let veadotube_manual_instances = [];

const VEADO_SAMMI__PLUGIN_NAME = 'VeadoSAMMI';
const VEADOTUBE__CHANNELS_PREFIXES = {
        nodes: 'nodes:'
};

const VEADOTUBE__WebSocket_StringStates = {
        0: "Connecting...",
        1: "Connected",
        2: "Disconnecting...",
        3: "Disconnected"
};

let veadotube_auto_reconnect = false;


const VEADO_SAMMI__saveAsVariableBox = {
        variable: ["Save Variable As", 14, ""]
};
const VEADO_SAMMI__saveOldStateAsVariableBox = {
        oldState: ["Save Previous State As", 14, ""]
};

const VEADO_SAMMI__extCommands_w_list = {
        'Set': {
                baseCmdStr: "Set Avatar State",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Push': {
                baseCmdStr: "Push Avatar State",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Pop': {
                baseCmdStr: "Pop Avatar State",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Thumbnail': {
                baseCmdStr: "Get Avatar State Thumbnail",
                args: VEADO_SAMMI__saveAsVariableBox,
                queue: "thumb",
        },
};

const VEADO_SAMMI__extCommands_w_str = {
        'Set (by ID)': {
                baseCmdStr: "Set Avatar State (by ID)",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Push (by ID)': {
                baseCmdStr: "Push Avatar State (by ID)",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Pop (by ID)': {
                baseCmdStr: "Pop Avatar State (by ID)",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
        'Thumbnail (by ID)': {
                baseCmdStr: "Get Avatar State Thumbnail (by ID)",
                args: VEADO_SAMMI__saveAsVariableBox,
                queue: "thumb",
        },
};

const VEADO_SAMMI__extCommands_n_args = {
        'Peek': {
                baseCmdStr: "Peek Actual Avatar State",
                args: VEADO_SAMMI__saveAsVariableBox,
                queue: "peek",
        },
        'Random': {
                baseCmdStr: "Set Random Avatar State",
                args: VEADO_SAMMI__saveOldStateAsVariableBox,
                queue: "peek",
        },
};


class VEADO_SAMMI__LOGGER {
        constructor(id) {
                this.id = id;
        }
        static _log(level, message, alertFn = null) {
                const formattedMessage = `${VEADO_SAMMI__PLUGIN_NAME}: ${message}`;
                if (alertFn) alertFn(formattedMessage);
                console[level](formattedMessage);
        }
        _log(level, message, alertFn = null) {
                const formattedMessage = `${VEADO_SAMMI__PLUGIN_NAME} [Instance: ${this.id}]: ${message}`;
                if (alertFn) alertFn(formattedMessage);
                console[level](formattedMessage);
        }
        log(message) {
                this._log("log", message);
        }
        static log(message) {
                this._log("log", message);
        }
        debug(message) {
                this._log("debug", message);
        }
        static debug(message) {
                this._log("debug", message);
        }
        info(message) {
                this._log("info", message, SAMMI.notification);
        }
        static info(message) {
                this._log("info", message, SAMMI.notification);
        }
        warn(message) {
                this._log("warn", message, SAMMI.alert);
        }
        static warn(message) {
                this._log("warn", message, SAMMI.alert);
        }
        error(message) {
                this._log("error", message, SAMMI.alert);
        }
        static error(message) {
                this._log("error", message, SAMMI.alert);
        }
}    


class VEADOTUBE__Instance {
        constructor(parameters) {
                this.file = parameters.file;
                this.fullName = parameters.name;
                this.name = this.fullName.startsWith('veadotube') ? this.fullName.split(' - ').slice(1).join(' - ').trim() : this.fullName;
                this.server = parameters.server;
                this.serverUrl = `ws://${this.server}?n=${this.fullName}`.replaceAll(' ', '%20');
                this.time = parameters.time;
                this.webSocket = null;
                this.listener = null;
                this.index = parameters.index;
                this.longID = `${this.index}-${this.fullName}`;
                this.shortID = `${this.index}-${this.name}`;
                this.listenerID = `Veadotube-Trigger:${this.shortID}`;
                this.logger = new VEADO_SAMMI__LOGGER(this.shortID);
                this.statesFromName = {};
                this.statesFromID = {};
                this.queues = {
                        peek: [],
                        set: [],
                        push: [],
                        pop: [],
                        thumb: []
                };

                this.type = null;
                if (this.file) {
                        const [type, launchTimestamp, processID] = this.file.split('-');
                        this.type = type;
                        this.launchTimestamp = launchTimestamp;
                        this.processID = processID;
                } else {
                        this.createWebSocket(() => { this.requestListEvents() });
                }
                this.insertCommandsWithListedStates();
                this.insertCommandsWithStringArgs();
                this.insertCommandsWithNoArgs();
                this.insertCommandHooks();
                this.initializeHTML();
        }
        
        async initializeHTML() {
                document.querySelector('.veado-instances-list').innerHTML += VEADOTUBE__box_template.replaceAll("{{veado-instance-id}}", this.shortID).replaceAll("{{veado-instance-type}}", this.type).replaceAll("{{veado-instance-server}}", this.server).replaceAll("{{veado-instance-name}}", this.fullName).replaceAll("{{veado-box-type}}", this.file ? VEADOTUBE__type_box_auto_detected : VEADOTUBE__type_box_manual);
                
                this.instanceBox.querySelector('.refresh-status-btn').addEventListener('click', () => {
                        this.webSocketStatus
                });
                this.instanceBox.querySelector('.connect-websocket-btn').addEventListener('click', () => {
                        this.connectWebSocket();
                });
                this.instanceBox.querySelector('.refresh-states-btn').addEventListener('click', () => {
                        this.refreshAvatarStates();
                });
                this.instanceBox.querySelector('.veado-listener-id').innerText = this.listenerID;
                this.instanceBox.querySelector('.toggle-listener-btn').addEventListener('click', async () => {
                        if (!this.listener) {
                                this.connectListener();
                        } else {
                                await this.requestUnlistenStates();
                                await this.disconnectWebSocket('listener');
                        }
                        this.listenerStatus;
                });
                this.instanceBox.querySelector('.copy-listener-btn').addEventListener('click', () => {
                        const listenerID = this.instanceBox.querySelector('.veado-listener-id').innerHTML;
                        navigator.clipboard.writeText(listenerID);
                });
                if (!!this.file) return;
                this.instanceBox.querySelector('.remove-instance-btn').addEventListener('click', async () => {
                        await this.destroy();
                        VEADOTUBE__removeInstance(this.shortID);
                });
        }

        insertCommandHooks() {
                if (!this.subscribedEvents) this.subscribedEvents = [];

                let commands = {...VEADO_SAMMI__extCommands_n_args, ...VEADO_SAMMI__extCommands_w_list, ...VEADO_SAMMI__extCommands_w_str};
                for (const event in commands) {
                        const event_name = `${event}:${this.longID}`;
                        const callback = async (json) => {
                                const SAMMI_JSON = json.Data;
                                this.queues[commands[event].queue].push((webSocketResponse) => {
                                        let varArg = SAMMI_JSON[Object.keys(commands[event].args)[0]];
                                        if (!!varArg) SAMMI.setVariable(varArg, webSocketResponse, SAMMI_JSON.FromButton);
                                });

                                this.getCommandHooksFunctions(event, SAMMI_JSON)();
                        };
                        sammiclient.on(event_name, callback);
                        this.subscribedEvents.push({ event_name, callback });
                }
        }

        getCommandHooksFunctions(event, SAMMI_JSON) {
                switch (event) {
                        case 'Peek':
                                return () => { this.requestPeekState() };
                        case 'Set':
                                return () => { this.requestSetState(this.statesFromName[SAMMI_JSON.state]) };
                        case 'Push':
                                return () => { this.requestPushState(this.statesFromName[SAMMI_JSON.state])} ;
                        case 'Pop':
                                return () => { this.requestPopState(this.statesFromName[SAMMI_JSON.state]) };
                        case 'Thumbnail':
                                return () => { this.requestThumbState(this.statesFromName[SAMMI_JSON.state]) };
                        case 'Set (by ID)':
                                return () => { this.requestSetState(SAMMI_JSON.state) };
                        case 'Push (by ID)':
                                return () => { this.requestPushState(SAMMI_JSON.state) };
                        case 'Pop (by ID)':
                                return () => { this.requestPopState(SAMMI_JSON.state) };
                        case 'Thumbnail (by ID)':
                                return () => { this.requestThumbState(SAMMI_JSON.state) };
                        case 'Random':
                                return () => {
                                        let states = Object.values(this.statesFromName);
                                        this.requestSetState(states[Math.floor(Math.random() * states.length)]);
                                };
                        default:
                                return () => { this.logger.error(`No command hook function for the "${event}" event.`) };
                }
        }

        insertCommandsWithListedStates() {
                let baseCommands = VEADO_SAMMI__extCommands_w_list;
                for (const event in baseCommands) {
                        SAMMI.extCommand(`${event}:${this.longID}`, 3355443, 52, {
                                instance: ['Instance', 25, `${event}:${this.longID}`, 1, VEADOTUBE__getInstancesList(event)],
                                state: [`${event} State`, 20, '', null, Object.keys(this.statesFromName)],
                                ...baseCommands[event].args,
                        }, false, true);
                }
        }
        
        insertCommandsWithStringArgs() {
                let baseCommands = VEADO_SAMMI__extCommands_w_str;
                for (const event in baseCommands) {
                        SAMMI.extCommand(`${event}:${this.longID}`, 3355443, 52, {
                                instance: ['Instance', 25, `${event}:${this.longID}`, 1, VEADOTUBE__getInstancesList(event)],
                                state: [`${event} State`, 14, ''],
                                ...baseCommands[event].args,
                        }, false, true);
                }
        }
        
        insertCommandsWithNoArgs() {
                let baseCommands = VEADO_SAMMI__extCommands_n_args;
                for (const event in baseCommands) {
                        SAMMI.extCommand(`${event}:${this.longID}`, 3355443, 52, {
                                instance: ['Instance', 25, `${event}:${this.longID}`, 1, VEADOTUBE__getInstancesList(event)],
                                ...baseCommands[event].args,
                        }, false, true);
                }
        }

        createWebSocket(callback = null) {
                this.logger.log('Checking client');
                if (this.webSocket) {
                        if (this.webSocketStatus === WebSocket.CLOSING && veadotube_auto_reconnect) {
                                this.logger.warn('Closure pending, waiting 5 seconds to reconnect.');
                                this.webSocket.addEventListener('close', () => this.createWebSocket(callback), { once: true });
                                return;
                        }
                        if (this.webSocketStatus !== WebSocket.CLOSED) {
                                if (callback) callback();
                                return;
                        }
                }

                this.webSocket = new WebSocket(this.serverUrl);

                this.webSocket.onmessage = (event) => {
                        this.webSocketStatus;
                        if (!event.data) {
                                this.logger.warn('Received empty message from WebSocket');
                                return;
                        }
                        const sanitizedMessage = event.data.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                        this.logger.debug(`WebSocket message: ${sanitizedMessage}`);
                        this.interpretChannel(sanitizedMessage);
                }

                this.webSocket.onclose = (event) => {
                        this.webSocketStatus;
                        this.logger.debug(`Disconnected(${event.code || "No code provided"}, ${event.reason || "No reason provided"})`);
                        this.logger.warn(`WebSocket connection closed`);
                        if (!this.manualDisconnect && veadotube_auto_reconnect) {
                                this.logger.warn('Reconnecting in 5 seconds...');
                                setTimeout(() => this.createWebSocket(callback), 5000);
                        }
                };

                this.webSocket.onopen = (event) => {
                        this.webSocketStatus;
                        this.logger.info(`WebSocket successfully connected!`);
                        if (callback) callback(true);
                };

                this.webSocket.onerror = (event) => {
                        this.webSocketStatus;
                        this.logger.error(`WebSocket error: ${event.message || "Unknown error"}`);
                };
        }

        createListener() {
                if (this.listenerStatus === WebSocket.CLOSING) {
                        this.logger.warn('Closure pending, waiting 5 seconds to reconnect.');
                        setTimeout(() => this.createListener(), 5000);
                        return;
                }

                this.listener = new WebSocket(this.serverUrl);

                this.listener.onmessage = (event) => {
                        this.listenerStatus;
                        if (!event.data) {
                                this.logger.debug('Received empty message from Listener');
                                return;
                        }
                        const sanitizedMessage = event.data.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                        this.logger.debug(`Listener message: ${sanitizedMessage}`);
                        let responseData = JSON.parse(sanitizedMessage.replace(VEADOTUBE__CHANNELS_PREFIXES.nodes, ''));
                        let payload = responseData.payload;
                        if (!payload) return;
                        payload.state = {
                                name: this.statesFromID[payload.state],
                                id: payload.state,
                        };
                        SAMMI.triggerExt(this.listenerID, { veadotube: payload});
                }

                this.listener.onclose = (event) => {
                        this.listenerStatus;
                        this.logger.info(`Listener Disconnected(${event.code || "No code provided"}, ${event.reason || "No reason provided"})`);
                };

                this.listener.onopen = (event) => {
                        this.listenerStatus;
                        this.logger.debug(`Listener successfully connected!`);
                        this.requestListenStates();
                };

                this.listener.onerror = (error) => {
                        this.listenerStatus;
                        this.logger.debug(`Listener error: ${error.message || "No error provided"}`);
                };
        }

        get instanceBox() {
                return document.querySelector(`.veado-instance-box[id="${this.shortID}"]`);
        }

        get webSocketStatus() {
                let status = this.webSocket ? this.webSocket.readyState : 3;
                if (this.instanceBox) this.instanceBox.querySelector('.veadotube-connection-status').innerText = VEADOTUBE__WebSocket_StringStates[status];
                return status;
        }

        get listenerStatus() {
                let status = this.listener?.readyState;
                if (this.instanceBox) this.instanceBox.querySelector('.veado-listener-box').style.display = status !== WebSocket.OPEN ? 'none' : 'block';
                this.instanceBox.querySelector('.toggle-listener-btn').innerText = this.listener ? 'Stop Listener' : 'Start Listener';
                return status;
        }

        interpretChannel(message) {
                let channel = message.split(':')[0];
                let channels = Object.keys(VEADOTUBE__CHANNELS_PREFIXES);
                let responseData;
                switch (channel) {
                        case channels[0]:
                                responseData = JSON.parse(message.replace(`${channel}:`, ''));
                                this.interpretNodesResponse(responseData);
                                break;
                        default:
                                this.logger.warn(`Unknown channel: ${channel}\nRaw response data: ${sanitizedMessage}`);
                                break;
                }
        }

        interpretNodesResponse(responseData) {
                if (!responseData) this.logger.error('VEADOTUBE__Instance.interpretResponse: responseData is null');
                this.interpretID(responseData.id);
                this.interpretEvent(responseData);
        }

        interpretID(id) {
                if (!id) return;

                switch (id) {
                        case 'mini':
                                break;
                        default:
                                this.logger.warn(`This instance type is not fully supported: ${id}. The code will continue anyways.`);
                                break;
                }
        }

        interpretEvent(responseData) {
                if (!responseData.event) this.logger.error('VEADOTUBE__Instance.interpretEvent: responseData.event is null');

                switch (responseData.event) {
                        case 'payload':
                                this.interpretPayloadType(responseData);
                                break;
                        case 'list':
                                this.interpretListEntries(responseData);
                                break;
                        default:
                                this.logger.warn(`Unknown event: ${responseData.event}\nRaw response data: ${responseData}`);
                                break;
                }
        }

        interpretListEntries(responseData) {
                if (!responseData.entries) this.logger.error('VEADOTUBE__Instance.interpretListEntries: responseData.entries is null');
                let stateEventsEntry = responseData.entries.find(entry => entry.type == "stateEvents");
                if (!stateEventsEntry) return;
                this.type = stateEventsEntry.id;
                this.instanceBox.querySelector('.veadotube-instance-type').innerText = this.type;
                this.refreshAvatarStates();
        }

        interpretPayloadType(responseData) {
                if (!responseData.type) this.logger.error('VEADOTUBE__Instance.interpretPayloadType: responseData.type is null');

                switch (responseData.type) {
                        case 'stateEvents':
                                this.interpretPayloadStateEvents(responseData);
                                break;
                        default:
                                this.logger.warn(`Unknown payload type: ${responseData.type}\nRaw response data: ${responseData}`);
                                break;
                }
        }

        interpretPayloadStateEvents(responseData) {
                if (!responseData.payload) this.logger.error('VEADOTUBE__Instance.interpretPayloadStateEvents: responseData.payload is null');
                let payload = responseData.payload;
                let veado_func = null;
                let queue;
                switch (payload.event) {
                        case 'list':
                                this.logger.info(`Found ${payload.states.length} Avatar States.`);
                                this.statesFromName = {};
                                this.statesFromID = {};
                                payload.states.forEach(state => {
                                        this.statesFromName[state.name] = state.id;
                                        this.statesFromID[state.id] = state.name;
                                });

                                this.insertCommandsWithListedStates();
                                break;
                        case 'peek':
                        case 'set':
                        case 'push':
                        case 'pop':
                                // HACK: Used peek queue because WebSocket response always contains peek
                                veado_func = this.queues.peek.shift();
                                while (!!veado_func) {
                                        veado_func({
                                                name: this.statesFromID[payload.state],
                                                id: payload.state,
                                        });
                                        veado_func = this.queues.peek.shift();
                                }
                                break;
                        case 'thumb':
                                veado_func = this.queues[payload.event].shift();
                                while (!!veado_func) {
                                        veado_func({
                                                name: this.statesFromID[payload.state],
                                                id: payload.state,
                                                width: payload.width,
                                                height: payload.height,
                                                png: payload.png,
                                        });
                                        veado_func = this.queues[payload.event].shift();
                                }
                                break;
                        default:
                                this.logger.warn(`Unknown payload.event: ${payload.event}\nRaw response payload: ${payload}`);
                                break;
                }
        }

        sendNodesMessage(request) {
                if (!this.webSocket) {
                        this.logger.warn('WebSocket is not connected');
                        return;
                }
                let webSocketStatus = this.webSocketStatus;
                if (webSocketStatus !== WebSocket.OPEN) this.logger.warn(`Connection pending (${webSocketStatus})`);

                switch (webSocketStatus) {
                        case WebSocket.OPEN:
                                let message = VEADOTUBE__CHANNELS_PREFIXES.nodes + JSON.stringify(request);
                                this.webSocket.send(message);
                                this.logger.debug(`Sent message: ${message}`);
                                break;
                        case WebSocket.CLOSING:
                                if (veadotube_auto_reconnect) setTimeout(() => this.createWebSocket, 5000);
                                break;
                        case WebSocket.CLOSED:
                                if (veadotube_auto_reconnect) this.createWebSocket();
                                break;
                        case WebSocket.CONNECTING:
                                setTimeout(() => { this.sendNodesMessage(request); }, 3000);
                                break;
                        default:
                                this.logger.info("WTF?");
                                break;
                }
        }

        sendListenerMessage(request) {
                if (!this.listener) {
                        this.logger.warn('Listener is not connected');
                        return;
                }
                let listenerStatus = this.listenerStatus;
                if (listenerStatus !== WebSocket.OPEN) this.logger.warn(`Connection pending (${listenerStatus})`);

                switch (listenerStatus) {
                        case WebSocket.OPEN:
                                let message = VEADOTUBE__CHANNELS_PREFIXES.nodes + JSON.stringify(request);
                                this.listener.send(message);
                                this.logger.debug(`Listener sent message: ${message}`);
                                break;
                        case WebSocket.CLOSING:
                                setTimeout(() => this.createListener, 5000);
                                break;
                        case WebSocket.CLOSED:
                                this.createListener();
                                break;
                        case WebSocket.CONNECTING:
                                setTimeout(() => { this.sendListenerMessage(request); }, 3000);
                                break;
                        default:
                                this.logger.info("WTF?");
                                break;
                }
        }

        async generateRequest(event, args = {}) {
                if (this.webSocketStatus !== WebSocket.OPEN) this.logger.warn("Warning - WebSocket is not connected. Command will not work properly.");
                return {
                        event: event,
                        ...args,
                }
        }
        
        async generateStateEventsPayloadRequest(event) {
                let request = await this.generateRequest("payload", {
                        type: "stateEvents",
                        id: this.type,
                        payload: {
                                event: event,
                        },
                });
                return request;
        }

        async requestPeekState() {
                let request = await this.generateStateEventsPayloadRequest("peek");
                this.sendNodesMessage(request);
        }

        async requestSetState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("set");
                request.payload.state = stateID;
                this.sendNodesMessage(request);
        }

        async requestPushState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("push");
                request.payload.state = stateID;
                this.sendNodesMessage(request);
        }

        async requestPopState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("pop");
                request.payload.state = stateID;
                this.sendNodesMessage(request);
        }

        async requestThumbState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("thumb");
                request.payload.state = stateID;
                this.sendNodesMessage(request);
        }

        async requestListStates() {
                let request = await this.generateStateEventsPayloadRequest("list");
                this.sendNodesMessage(request);
        }

        async requestListEvents() {
                let request = await this.generateRequest("list");
                this.sendNodesMessage(request);
        }

        async requestListenStates() {
                let request = await this.generateStateEventsPayloadRequest("listen");
                request.payload.token = this.listenerID;
                this.sendListenerMessage(request);
        }

        async requestUnlistenStates() {
                let request = await this.generateStateEventsPayloadRequest("unlisten");
                request.payload.token = this.listenerID;
                this.sendListenerMessage(request);
        }

        refreshAvatarStates() {
                this.logger.log("Refreshing Avatar States List...");
                this.requestListStates();
        }

        connectWebSocket() {
                !this.webSocket ? this.createWebSocket(() => { this.refreshAvatarStates() }) : this.createWebSocket();
        }

        connectListener() {
                this.createListener();
        }

        async disconnectWebSocket(webSocketName) {
                if (!this[webSocketName]) return;
                if (
                        this[webSocketName].readyState !== WebSocket.CLOSING &&
                        this[webSocketName].readyState !== WebSocket.CLOSED
                ) {
                        if (this[webSocketName].bufferedAmount > 0) {
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                return this.disconnectWebSocket(webSocketName);
                        }
                        
                        return new Promise((resolve) => {
                                this[webSocketName].addEventListener('close', () => resolve(), { once: true });
                                this[webSocketName].close(1000);
                        }).finally(() => {
                                this[webSocketName] = null;
                        });
                }
                this[webSocketName] = null;
        }

        async destroy() {
                this.manualDisconnect = true;
                try {
                        if (this.subscribedEvents) {
                                this.subscribedEvents.forEach(({ event_name, callback }) => {
                                        sammiclient.off(event_name, callback);
                                });
                                this.subscribedEvents = null;
                        }
                        if (this.webSocket) await this.disconnectWebSocket('webSocket');
                        if (this.listener) await this.disconnectWebSocket('listener');
                } catch (error) {
                        this.logger.error(`WebSocket error while disconnecting: ${error.message}`);
                } finally {
                        this.instanceBox.remove();
                        this.logger.info(`Destroyed ${this.shortID} and unsubscribed events.`);
                }
        }
}

function VEADOTUBE__getInstancesList(event) {
        let instances = [...veadotube_instances, ...veadotube_manual_instances];
        return instances.map(instance => `${event}:${instance.longID}`);
}

function VEADOTUBE__updateInstancesList() {
        SAMMI.getVariable('veadotube_instances', 'VeadotubeWebSocketsFinder').then(async (response) => {
                for (const instance of veadotube_instances) {
                        try {
                                await instance.destroy();
                        } catch (error) {
                                VEADO_SAMMI__LOGGER.error(`Error destroying instance: ${error.message}`);
                        }
                }

                veadotube_instances = [];
                // document.querySelector('.veado-instances-list').innerHTML = '';
                let instances = response.value;
                let index = 0;
                for (const instance of instances) {
                        let instance_obj = new VEADOTUBE__Instance({
                                index: index++,
                               ...instance
                        });
                        veadotube_instances.push(instance_obj);
                        if (veadotube_auto_reconnect) await instance_obj.connectWebSocket();
                        VEADO_SAMMI__LOGGER.log(`Added instance: ${instance_obj.name} (${instance_obj.serverUrl})`);
                }

                for (const instance of veadotube_manual_instances) {
                        instance.initializeHTML();
                }
                VEADO_SAMMI__updateBaseCommands();
        });
}

function VEADO_SAMMI__insertCommandsWithListedStates() {
        let baseCommands = VEADO_SAMMI__extCommands_w_list;
        for (const event in baseCommands) {
                SAMMI.extCommand(`${VEADO_SAMMI__PLUGIN_NAME} - ${baseCommands[event].baseCmdStr}`, 3355443, 52, {
                        instance: ['Instance', 25, `Connect to a WebSocket to start`, 1, VEADOTUBE__getInstancesList(event)],
                        state: [`${event} State`, 20, '', null, ['No states detected! Is the WebSocket connected?']],
                        ...baseCommands[event].args,
                });
        }
        let instances = [...veadotube_instances, ...veadotube_manual_instances];
        instances.forEach(instance => { instance.insertCommandsWithListedStates() });
}

function VEADO_SAMMI__insertCommandsWithStringArgs() {
        let baseCommands = VEADO_SAMMI__extCommands_w_str;
        for (const event in baseCommands) {
                SAMMI.extCommand(`${VEADO_SAMMI__PLUGIN_NAME} - ${baseCommands[event].baseCmdStr}`, 3355443, 52, {
                        instance: ['Instance', 25, `Connect to a WebSocket to start`, 1, VEADOTUBE__getInstancesList(event)],
                        state: [`${event} State`, 14, ''],
                        ...baseCommands[event].args,
                });
        }
        let instances = [...veadotube_instances, ...veadotube_manual_instances];
        instances.forEach(instance => { instance.insertCommandsWithStringArgs() });
}

function VEADO_SAMMI__insertCommandsWithNoArgs() {
        let baseCommands = VEADO_SAMMI__extCommands_n_args;
        for (const event in baseCommands) {
                SAMMI.extCommand(`${VEADO_SAMMI__PLUGIN_NAME} - ${baseCommands[event].baseCmdStr}`, 3355443, 52, {
                        instance: ['Instance', 25, `Connect to a WebSocket to start`, 1, VEADOTUBE__getInstancesList(event)],
                        ...baseCommands[event].args,
                });
        }
        let instances = [...veadotube_instances, ...veadotube_manual_instances];
        instances.forEach(instance => { instance.insertCommandsWithNoArgs() });
}

function VEADO_SAMMI__updateBaseCommands() {
        VEADO_SAMMI__insertCommandsWithNoArgs();
        VEADO_SAMMI__insertCommandsWithListedStates();
        VEADO_SAMMI__insertCommandsWithStringArgs();
}


function VEADO_SAMMI__insertBaseCommands() {
        SAMMI.extCommand(`${VEADO_SAMMI__PLUGIN_NAME} - Update Instances`, 3355443, 52, {
                detailsLabel: ['This command is intended for the extension internal logic. Anyways, you can use it if you want.', 30]
        });
        VEADO_SAMMI__updateBaseCommands();
}

function VEADO_SAMMI__insertCommandHooks() {
        sammiclient.on(`${VEADO_SAMMI__PLUGIN_NAME} - Update Instances`, () => {
                VEADO_SAMMI__LOGGER.log("Updating Instances...");
                VEADOTUBE__updateInstancesList();
        });
}

function veado__scanForInstances() {
        SAMMI.triggerExt('VEADO_SAMMI__getInstances', {});
}

function veado__addManualInstance() {
        const inputServer = document.getElementById("veadotube-websocket-server").value?.trim();
        const inputName = document.getElementById("veadotube-window-title").value?.trim();
        if (!inputServer || !inputName) return;
        let index = generateShortHash(`${inputServer}${inputName}`);
        let instance_obj = new VEADOTUBE__Instance({
                index: index,
                server: inputServer,
                name: inputName,
        });
        veadotube_manual_instances.push(instance_obj);
        // if (veadotube_auto_reconnect) instance_obj.connectWebSocket();
        VEADO_SAMMI__LOGGER.log(`Manually added instance: ${instance_obj.name} (${instance_obj.serverUrl})`);
        document.getElementById("veadotube-websocket-server").value = '';
        document.getElementById("veadotube-window-title").value = '';
        VEADO_SAMMI__updateBaseCommands();
}

function generateShortHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
                hash = (hash * 31 + input.charCodeAt(i)) % 0x7FFFFFFF;
        }
        return hash.toString(36).slice(0, 6);
}

function VEADOTUBE__removeInstance(shortID) {
        veadotube_manual_instances = veadotube_manual_instances.filter(instance => instance.shortID !== shortID);
        VEADO_SAMMI__updateBaseCommands();
}

function VEADO_SAMMI__initialize() {
        if (!sammiclient) {
                setTimeout(VEADO_SAMMI__initialize, 1000);
                return;
        }

        VEADO_SAMMI__LOGGER.info("Started $!VERSIONNUMBER!$");
        VEADO_SAMMI__insertBaseCommands();
        VEADO_SAMMI__insertCommandHooks();
        const toggle_slider = document.getElementById('toggleSlider');
        toggle_slider.addEventListener('change', () => {
                veadotube_auto_reconnect = toggle_slider.checked;
                veadotube_instances.forEach(instance => {
                        if (veadotube_auto_reconnect) instance.connectWebSocket();
                });
        });
        veado__scanForInstances();
}
