let veadotube_instances = [];
let veadotube_manual_instances = [];

const VEADO_SAMMI__PLUGIN_NAME = 'VeadoSAMMI';
const VEADOTUBE__CHANNELS_PREFIXES = {
        nodes: 'nodes:',
        instance: 'instance:',
};

const VEADOTUBE__WebSocket_StringStates = {
        0: "🟡Connecting...",
        1: "🟢Connected",
        2: "🟡Disconnecting...",
        3: "🔴Disconnected"
};

let veadotube_auto_reconnect = false;


const VEADO_SAMMI__saveAsVariableBox = {
        variable: ["Save Variable As", 14, ""]
};
const VEADO_SAMMI__saveOldStateAsVariableBox = {
        oldState: ["Save Previous State As", 14, ""]
};

const VEADO_SAMMI__extCommands_n_args = {
        State: {
                'Peek': {
                        baseCmdStr: "Peek Actual Avatar State",
                        args: VEADO_SAMMI__saveAsVariableBox,
                        queue: "stateChange",
                },
                'Random': {
                        baseCmdStr: "Set Random Avatar State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "stateChange",
                },
        },
        PTT: {
                'Get': {
                        baseCmdStr: "Get Actual Push-To-Talk State",
                        args: VEADO_SAMMI__saveAsVariableBox,
                        queue: "PTTChange",
                },
                'Toggle': {
                        baseCmdStr: "Toggle Push-To-Talk State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "PTTChange",
                },
        },
        Number: {
                'Get': {
                        baseCmdStr: "(Beta) Get Actual Number State",
                        args: VEADO_SAMMI__saveAsVariableBox,
                        queue: "numberChange",
                },
        },
};

const VEADO_SAMMI__extCommands_w_list = {
        State: {
                'Set': {
                        baseCmdStr: "Set Avatar State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "stateChange",
                },
                'Push': {
                        baseCmdStr: "Push Avatar State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "stateChange",
                },
                'Pop': {
                        baseCmdStr: "Pop Avatar State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "stateChange",
                },
                'Toggle': {
                        baseCmdStr: "Toggle Avatar State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "stateChange",
                },
                'Thumbnail': {
                        baseCmdStr: "Get Avatar State Thumbnail",
                        args: VEADO_SAMMI__saveAsVariableBox,
                        queue: "thumbnail",
                },
        },
        PTT: {},
        Number: {},
};

const VEADO_SAMMI__extCommands_w_str = {
        State: {},
        PTT: {},
        Number: {
                'Set': {
                        baseCmdStr: "(Beta) Set Number",
                        args: {
                                ...VEADO_SAMMI__saveOldStateAsVariableBox,
                                min: ["Min (Optional)", 14, ""],
                                max: ["Max (Optional)", 14, ""],
                        },
                        queue: "numberChange",
                },
                'Add': {
                        baseCmdStr: "(Beta) Add Number",
                        args: {
                                ...VEADO_SAMMI__saveOldStateAsVariableBox,
                                min: ["Min (Optional)", 14, ""],
                                max: ["Max (Optional)", 14, ""],
                        },
                        queue: "numberChange",
                },
        },
};

const VEADO_SAMMI__extCommands_w_bool = {
        State: {},
        PTT: {
                'Set': {
                        baseCmdStr: "Set Push-To-Talk State",
                        args: VEADO_SAMMI__saveOldStateAsVariableBox,
                        queue: "PTTChange",
                },
        },
        Number: {},
};

const VEADO_SAMMI__extCommands = {
        State: {
                ...VEADO_SAMMI__extCommands_w_bool.State,
                ...VEADO_SAMMI__extCommands_w_str.State,
                ...VEADO_SAMMI__extCommands_w_list.State,
                ...VEADO_SAMMI__extCommands_n_args.State,
        },
        PTT: {
                ...VEADO_SAMMI__extCommands_w_bool.PTT,
                ...VEADO_SAMMI__extCommands_w_str.PTT,
                ...VEADO_SAMMI__extCommands_w_list.PTT,
                ...VEADO_SAMMI__extCommands_n_args.PTT,
        },
        Number: {
                ...VEADO_SAMMI__extCommands_w_bool.Number,
                ...VEADO_SAMMI__extCommands_w_str.Number,
                ...VEADO_SAMMI__extCommands_w_list.Number,
                ...VEADO_SAMMI__extCommands_n_args.Number,
        },
}


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
                this.index = parameters.index;
                this.file = parameters.file || parameters.id;
                this.version = parameters.version;
                this.fullName = parameters.name;
                this.time = parameters.time;
                this.language = parameters.language;
                this.server = parameters.server;
                this.webSocket = null;
                this.states = {};
                this.queues = {
                        stateChange: [],
                        // set: [],
                        // push: [],
                        // pop: [],
                        thumbnail: [],
                        PTTChange: [],
                        numberChange: [],
                };
                this.state = {
                        actual: null,
                        previous: null,
                };
                this.ptt = {
                        actual: null,
                        previous: null,
                };
                this.number = {
                        actual: null,
                        previous: null,
                }

                this.versionWarning = (commandName = null) => {
                        if (!!this.version) return;
                        this.logger.warn(`${commandName || 'This'} command could not work on the version you are currently on.`);
                };
                this.typeWarning = (commandName = null) => {
                        if (this.type !== "mini") return;
                        this.logger.warn(`${commandName || 'This'} command could not work on the instance type you are currently on.`);
                };

                if (!this.file) {
                        this.createWebSocket(() => {
                                this.requestListEvents();
                        });
                } else if (!this.version && this.type === 'mini') this.logger.info('Veadotube mini 2.0a version or older detected. Please update Veadotube for a better experience.');

                VEADO_SAMMI__insertCommandsWithListedStates(this);
                VEADO_SAMMI__insertCommandsWithStringArgs(this);
                VEADO_SAMMI__insertCommandsWithBooleanArgs(this);
                VEADO_SAMMI__insertCommandsWithNoArgs(this);
                this.insertCommandHooks();
                this.initializeHTML();
        }
        
        get instanceBox() {
                return document.querySelector(`.veado-instance-box[id^="${this.index}-"]`);
        }

        get webSocketStatus() {
                let status = this.webSocket ? this.webSocket.readyState : 3;
                if (this.instanceBox) this.instanceBox.querySelector('.veadotube-connection-status').innerHTML = VEADOTUBE__WebSocket_StringStates[status];
                return status;
        }

        get file() {
                return this._file;
        }

        set file(value) {
                this._file = value;
                if (!value) return;
                const [type, launchTimestamp, processID] = value.split('-');
                this.type = type;
                this.launchTimestamp = launchTimestamp;
                this.processID = processID;
        }

        get fullName() {
                return this._fullName;
        }

        set fullName(value) {
                this._fullName = value;
                this.name = value;
                this.longID = value;
                if (this.instanceBox) this.instanceBox.querySelector('.veadotube-instance-name').innerHTML = value;
        }

        get name() {
                return this._name;
        }

        set name(value) {
                let name = value.startsWith('veadotube') ? value.split(' - ').slice(1).join(' - ').trim() : value;
                this._name = name;
                this.shortID = name;
        }

        get longID() {
                return this._longID;
        }

        set longID(value) {
                this._longID = `${this.index}-${value}`;
        }

        get shortID() {
                return this._shortID;
        }

        set shortID(value) {
                let shortID = `${this.index}-${value}`;
                this._shortID = shortID;
                this.listenerStateID = shortID;
                this.listenerPTTID = !!this.version ? shortID : 'NO COMPATIBLE VERSION';
                this.logger = shortID;
                if (this.instanceBox) this.instanceBox.querySelector('.veadotube-instance-id').innerHTML = shortID;
        }

        get listenerStateID() {
                return this._listenerStateID;
        }

        set listenerStateID(value) {
                let listenerStateID = `VeadoStateListener:${value}`;
                this._listenerStateID = listenerStateID;
                if (this.instanceBox) this.instanceBox.querySelector('.veado-state-listener-id').innerHTML = listenerStateID;
        }

        get listenerPTTID() {
                return this._listenerPTTID;
        }

        set listenerPTTID(value) {
                let listenerPTTID = `VeadoPTTListener:${value}`;
                this._listenerPTTID = listenerPTTID;
                if (this.instanceBox) this.instanceBox.querySelector('.veado-ptt-listener-id').innerHTML = listenerPTTID;
        }

        get logger() {
                return this._logger;
        }

        set logger(id) {
                this._logger = new VEADO_SAMMI__LOGGER(id);
        }

        get server() {
                return this._server;
        }

        set server(value) {
                this._server = value;
                this.serverURL = value;
                if (this.instanceBox) this.instanceBox.querySelector(".veadotube-instance-server").innerHTML = value;
        }

        get serverUrl() {
                return this._serverUrl || `ws://${this.server}?n=VeadoSAMMI`.replaceAll(' ', '%20');
        }

        set serverUrl(IP) {
                this._serverUrl = `ws://${IP}?n=VeadoSAMMI`.replaceAll(' ', '%20');
        }

        get version() {
                return this._version;
        }

        set version(value) {
                let version = value === "undefined" ? null : value;
                this._version = version;
                if (this.instanceBox) this.instanceBox.querySelector(".veadotube-instance-version").innerHTML = version || (this.type === "mini" ? '2.0a or older' : '<span style="color: red;">Unable</span> to get instance version');
                if (!value && this.type === 'mini') this.logger?.info('Veadotube mini 2.0a version or older detected. Please update Veadotube for a better experience.');
        }

        get language() {
                return this._language;
        }

        set language(value) {
                this._language = value === "undefined" ? null : value;
        }

        get type() {
                return this._type;
        }

        set type(value) {
                this._type = value;
                if (this.instanceBox) this.instanceBox.querySelector('.veadotube-instance-type').innerHTML = value;
        }
        
        async initializeHTML() {
                document.querySelector('.veado-instances-list').innerHTML += VEADOTUBE__box_template.replaceAll("{{veado-box-type}}", this.file ? VEADOTUBE__type_box_auto_detected : VEADOTUBE__type_box_manual).replaceAll("{{veado-instance-id}}", this.shortID).replaceAll("{{veado-instance-type}}", this.type).replaceAll("{{veado-instance-server}}", this.server).replaceAll("{{veado-instance-version}}", this.version || (this.type === "mini" ? '2.0a or older' : '<span style="color: red;">Unable</span> to get instance version')).replaceAll("{{veado-instance-state-listener}}", this.listenerStateID).replaceAll("{{veado-instance-ptt-listener}}", this.listenerPTTID).replaceAll("{{veado-instance-name}}", this.fullName);
                
                this.instanceBox.querySelector('.refresh-status-btn').addEventListener('click', () => {
                        this.webSocketStatus;
                });
                this.instanceBox.querySelector('.connect-websocket-btn').addEventListener('click', () => {
                        this.connectWebSocket();
                });
                this.instanceBox.querySelector('.refresh-states-btn').addEventListener('click', () => {
                        this.refreshAvatarStates();
                });

                this.instanceBox.querySelector('.copy-state-listener-btn').addEventListener('click', () => {
                        navigator.clipboard.writeText(this.listenerStateID);
                });
                this.instanceBox.querySelector('.copy-ptt-listener-btn').addEventListener('click', () => {
                        navigator.clipboard.writeText(this.listenerPTTID);
                });

                if (!!this.file) return;
                this.instanceBox.querySelector('.remove-instance-btn').addEventListener('click', async () => {
                        await this.destroy();
                        VEADOTUBE__removeInstance(this.shortID);
                });
        }

        insertCommandHooks() {
                if (!this.subscribedEvents) this.subscribedEvents = [];

                for (const family in VEADO_SAMMI__extCommands) {
                        const familyObj = VEADO_SAMMI__extCommands[family];
                        for (const event in familyObj) {
                                const event_name = `${event}:${family}:${this.longID}`;
                                const callback = async (json) => {
                                        const SAMMI_JSON = json.Data;
                                        let { requestFunction, responseFunction } = this.getCommandHooksFunctions(family, event, SAMMI_JSON);
                                        this.queues[familyObj[event].queue].push(responseFunction);
        
                                        requestFunction();
                                };
                                sammiclient.on(event_name, callback);
                                this.subscribedEvents.push({ event_name, callback });
                        }
                }
        }

        getCommandHooksFunctions(family, event, SAMMI_JSON) {
                let functions;
                const eventArgs = Object.keys(VEADO_SAMMI__extCommands[family][event].args);
                const varArg = eventArgs ? SAMMI_JSON[eventArgs[0]] : null;
                switch (family) {
                        case 'State':
                                functions = this.getStateFunctions(event, SAMMI_JSON, varArg);
                                break;
                        case 'PTT':
                                functions = this.getPTTFunctions(event, SAMMI_JSON, varArg);
                                break;
                        case 'Number':
                                functions = this.getNumberFunctions(event, SAMMI_JSON, varArg);
                                break;
                        default:
                                functions = {
                                        requestFunction: () => { this.logger.error(`No command hook request function for the "${family}" family.`) },
                                        responseFunction: (webSocketResponse) => { this.logger.error(`No command hook response function for the "${family}" family. WebSocket response: ${webSocketResponse}`) },
                                };
                                break;
                }
                return functions;
        }
        
        getStateFunctions(event, SAMMI_JSON, varArg) {
                let requestFunction, responseFunction;

                switch (event) {
                        case 'Peek':
                                requestFunction = () => { this.requestPeekState() };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.actual, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Set':
                                requestFunction = () => { this.requestSetState(this.states[SAMMI_JSON.mainArg]?.id) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Push':
                                requestFunction = () => { this.requestPushState(this.states[SAMMI_JSON.mainArg]?.id) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Pop':
                                requestFunction = () => { this.requestPopState(this.states[SAMMI_JSON.mainArg]?.id) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Toggle':
                                requestFunction = () => { this.requestToggleState(this.states[SAMMI_JSON.mainArg]?.id) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Thumbnail':
                                requestFunction = () => { this.requestThumbState(this.states[SAMMI_JSON.mainArg]?.id) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, webSocketResponse, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Random':
                                requestFunction = () => {
                                        let states = Object.values(this.states);
                                        this.requestSetState(states[Math.floor(Math.random() * states.length)].id);
                                };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.state.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        default:
                                requestFunction = () => { this.logger.error(`No command hook request function for the "${event}" event.`) };
                                responseFunction = (webSocketResponse) => {
                                        this.logger.error(`No command hook response function for the "${event}" event. WebSocket response: ${webSocketResponse}`);
                                };
                                break;
                }
                return { requestFunction, responseFunction };
        }

        getPTTFunctions(event, SAMMI_JSON, varArg) {
                let requestFunction, responseFunction;

                switch (event) {
                        case 'Get':
                                requestFunction = () => { this.requestGetPTT() };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.ptt.actual, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Set':
                                requestFunction = () => { this.requestSetPTT(SAMMI_JSON.mainArg) };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.ptt.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Toggle':
                                requestFunction = () => { this.requestTogglePTT() };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.ptt.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        default:
                                requestFunction = () => { this.logger.error(`No command hook request function for the "${event}" event.`) };
                                responseFunction = (webSocketResponse) => {
                                        this.logger.error(`No command hook response function for the "${event}" event. WebSocket response: ${webSocketResponse}`);
                                };
                                break;
                }
                return { requestFunction, responseFunction };
        }

        getNumberFunctions(event, SAMMI_JSON, varArg) {
                let requestFunction, responseFunction;

                switch (event) {
                        case 'Get':
                                requestFunction = () => { this.requestGetNumber() };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.number.actual, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Set':
                                requestFunction = () => {
                                        this.requestSetNumber(parseFloat(SAMMI_JSON.mainArg), parseFloat(SAMMI_JSON.min) || null, parseFloat(SAMMI_JSON.max) || null)
                                };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.number.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        case 'Add':
                                requestFunction = () => {
                                        this.requestAddNumber(parseFloat(SAMMI_JSON.mainArg), parseFloat(SAMMI_JSON.min) || null, parseFloat(SAMMI_JSON.max) || null)
                                };
                                responseFunction = (webSocketResponse) => {
                                        if (varArg) SAMMI.setVariable(varArg, this.number.previous, SAMMI_JSON.FromButton);
                                };
                                break;
                        default:
                                requestFunction = () => { this.logger.error(`No command hook request function for the "${event}" event.`) };
                                responseFunction = (webSocketResponse) => {
                                        this.logger.error(`No command hook response function for the "${event}" event. WebSocket response: ${webSocketResponse}`);
                                };
                                break;
                }
                return { requestFunction, responseFunction };
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
                        setTimeout(() => this.requestListenStates(), 1000);
                        setTimeout(() => this.requestListenPTT(), 2000);
                        setTimeout(() => this.requestListenNumber(), 3000);
                };

                this.webSocket.onerror = (event) => {
                        this.webSocketStatus;
                        this.logger.error(`WebSocket error: ${event.message || event || "Unknown error"}`);
                };
        }

        interpretChannel(message) {
                let channels = Object.keys(VEADOTUBE__CHANNELS_PREFIXES), channel = message.split(':')[0];
                let responseJSON = JSON.parse(message.replace(`${channel}:`, ''));
                switch (channel) {
                        case channels[0]:
                                this.interpretNodesResponse(responseJSON);
                                break;
                        case channels[1]:
                                this.interpretInstanceResponse(responseJSON);
                                break;
                        default:
                                this.logger.warn(`Unknown channel: ${channel}\nRaw response data: ${sanitizedMessage}`);
                                break;
                }
        }

        interpretInstanceResponse(responseData) {
                if (!responseData) {
                        this.logger.error('VEADOTUBE__Instance.interpretInstanceResponse: responseData is null');
                        return;
                }
                
                switch (responseData.event) {
                        case 'info':
                                this.server = responseData.server;
                                this.file = responseData.id;
                                this.version = responseData.version;
                                // this.fullName = responseData.name;
                                this.language = responseData.language;
                                // this.refreshAvatarStates();
                                break;
                        default:
                                this.logger.warn(`Instance event not supported: ${responseData.event}. Raw response: ${responseData}`);
                                break;
                }
        }

        interpretNodesResponse(responseData) {
                if (!responseData) {
                        this.logger.error('VEADOTUBE__Instance.interpretNodesResponse: responseData is null');
                        return;
                }
                this.interpretID(responseData.id);
                this.interpretEvent(responseData);
        }

        interpretID(id) {
                if (!id) return;

                switch (id) {
                        case 'mini':
                                break;
                        default:
                                this.logger.warn(`This instance type is not fully tested: ${id}. The code will continue anyways.`);
                                break;
                }
        }

        interpretEvent(responseData) {
                if (!responseData.event) {
                        this.logger.error('VEADOTUBE__Instance.interpretEvent: responseData.event is null');
                        return;
                }

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
                let entriesList = responseData.entries;
                if (!entriesList) {
                        this.logger.error('VEADOTUBE__Instance.interpretListEntries: responseData.entries is null');
                        return;
                }
                for (const entry of entriesList) {
                        this.interpretListEntry(entry);
                }
                if (!this.version) this.requestListStates();
        }

        interpretListEntry(entry) {
                if (!entry.name) {
                        this.logger.error('VEADOTUBE__Instance.interpretListEntry: entry.name is null');
                        return;
                }

                switch (entry.name) {
                        case "avatar state":
                                if (!this.type) this.type = entry.id;
                                this.version = this.version; // HACK: xd
                                break;
                        case "push-to-talk":
                                this.listenerPTTID = this.shortID;
                                break;
                        default:
                                this.logger.warn(`Unknown entry event name: ${entryName}\nRaw entry: ${entry}`);
                                break;
                }
        }

        interpretPayloadType(responseData) {
                if (!responseData.type) {
                        this.logger.error('VEADOTUBE__Instance.interpretPayloadType: responseData.type is null');
                        return;
                }

                switch (responseData.type) {
                        case 'stateEvents':
                                this.interpretPayloadStateEvents(responseData);
                                break;
                        case 'boolean':
                                this.interpretPayloadBoolean(responseData);
                                break;
                        case 'number':
                                this.interpretPayloadNumber(responseData);
                                break;
                        default:
                                this.logger.warn(`Unknown payload type: ${responseData.type}\nRaw response data: ${responseData}`);
                                break;
                }
        }

        interpretPayloadBoolean(responseData) {
                if (typeof responseData.payload == 'undefined' || responseData.payload === null) {
                        this.logger.error('VEADOTUBE__Instance.interpretPayloadBoolean: responseData.payload is null');
                        return;
                }
                let responseValue = responseData.payload.value;

                this.ptt.previous = this.ptt.actual;
                this.ptt.actual = responseValue;

                let veado_func = this.queues.PTTChange.shift();
                while (!!veado_func) {
                        veado_func(responseValue);
                        veado_func = this.queues.PTTChange.shift();
                }
                SAMMI.triggerExt(this.listenerPTTID, { veadotubePTT: this.ptt.actual, instance: this.fullName });
        }

        interpretPayloadNumber(responseData) {
                if (!responseData.payload) this.logger.error('VEADOTUBE__Instance.interpretPayloadNumber: responseData.payload is null');
                let responseValue = responseData.payload.value;

                this.number.previous = this.number.actual;
                this.number.actual = responseValue;

                let veado_func = this.queues.numberChange.shift();
                while (!!veado_func) {
                        veado_func(responseValue);
                        veado_func = this.queues.numberChange.shift();
                }
                // TODO: Add listener trigger and ID for number in the future
                // SAMMI.triggerExt(this.listenerNumberID, { veadotubeNumber: this.number.actual, instance: this.fullName });
        }

        interpretPayloadStateEvents(responseData) {
                if (!responseData.payload) this.logger.error('VEADOTUBE__Instance.interpretPayloadStateEvents: responseData.payload is null');
                let payload = responseData.payload, veado_func;

                switch (payload.event) {
                        case 'list':
                                this.logger.warn(`Found ${payload.states.length} Avatar States.`);
                                this.states = {};
                                payload.states.forEach(state => {
                                        this.states[state.name] = state;
                                });

                                VEADO_SAMMI__insertCommandsWithListedStates(this);
                                break;
                        case 'peek':
                                this.state.previous = this.state.actual;
                                this.state.actual = !!this.version ? this.states[payload.state] : Object.values(this.states).find(state => state.id === payload.state);
                                // HACK: Used peek queue because WebSocket response always contains peek in 2.0a or older.
                                veado_func = this.queues.stateChange.shift();
                                while (!!veado_func) {
                                        veado_func(payload);
                                        veado_func = this.queues.stateChange.shift();
                                }
                                SAMMI.triggerExt(this.listenerStateID, { veadotubeState: this.state.actual, instance: this.fullName });
                                break;
                        case 'thumb':
                                veado_func = this.queues.thumbnail.shift();
                                while (!!veado_func) {
                                        veado_func({
                                                name: !!this.version ? payload.state : Object.values(this.states).find(state => state.id === payload.state)?.name,
                                                id: payload.state,
                                                width: payload.width,
                                                height: payload.height,
                                                png: payload.png,
                                                hash: payload.hash,
                                        });
                                        veado_func = this.queues[payload.event].shift();
                                }
                                break;
                        case 'set':
                        case 'push':
                        case 'pop':
                        default:
                                this.logger.warn(`Unknown payload.event: ${payload.event}\nRaw response payload: ${payload}`);
                                break;
                }
        }

        sendMessage(request, prefix) {
                if (!this.webSocket) {
                        this.logger.warn('WebSocket is not connected');
                        return;
                }
                let webSocketStatus = this.webSocketStatus;
                if (webSocketStatus !== WebSocket.OPEN) this.logger.warn(`Connection pending (${webSocketStatus})`);

                switch (webSocketStatus) {
                        case WebSocket.OPEN:
                                let message = prefix + JSON.stringify(request);
                                this.webSocket.send(message);
                                this.logger.debug(`Sent message: ${message}`);
                                break;
                        case WebSocket.CLOSING:
                                if (veadotube_auto_reconnect) setTimeout(() => this.createWebSocket(), 5000);
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

        sendNodesMessage(request) {
                this.sendMessage(request, VEADOTUBE__CHANNELS_PREFIXES.nodes);
        }

        sendInstanceMessage(request) {
                this.sendMessage(request, VEADOTUBE__CHANNELS_PREFIXES.instance);
        }

        async generateRequest(event, args = {}) {
                if (this.webSocketStatus !== WebSocket.OPEN) this.logger.warn("Warning - WebSocket is not connected. Command will not work properly.");
                return {
                        event: event,
                        ...args,
                }
        }

        async requestInstanceInfo() {
                let request = await this.generateRequest("info");
                this.sendInstanceMessage(request);
        }

        async requestListEvents() {
                let request = await this.generateRequest("list");
                this.sendNodesMessage(request);
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

        async requestListStates() {
                let request = await this.generateStateEventsPayloadRequest("list");
                this.sendNodesMessage(request);
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

        async requestToggleState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("toggle");
                request.payload.state = stateID;
                this.versionWarning("Toggle State");
                this.sendNodesMessage(request);
        }

        async requestThumbState(stateID) {
                let request = await this.generateStateEventsPayloadRequest("thumb");
                request.payload.state = stateID;
                this.sendNodesMessage(request);
        }

        async requestListenStates() {
                let request = await this.generateStateEventsPayloadRequest("listen");
                request.payload.token = this.listenerStateID;
                this.sendNodesMessage(request);
        }

        async requestUnlistenStates() {
                let request = await this.generateStateEventsPayloadRequest("unlisten");
                request.payload.token = this.listenerStateID;
                this.sendNodesMessage(request);
        }

        async generateBooleanPayloadRequest(event) {
                let request = await this.generateRequest("payload", {
                        type: "boolean",
                        id: this.type,
                        payload: {
                                event: event,
                        },
                });
                return request;
        }

        async requestGetPTT() {
                let request = await this.generateBooleanPayloadRequest("get");
                this.versionWarning("Get Push-To-Talk");
                this.sendNodesMessage(request);
        }

        async requestSetPTT(value) {
                let request = await this.generateBooleanPayloadRequest("set");
                request.payload.value = !!value;
                this.versionWarning("Set Push-To-Talk");
                this.sendNodesMessage(request);
        }

        async requestTogglePTT() {
                let request = await this.generateBooleanPayloadRequest("toggle");
                this.versionWarning("Toggle Push-To-Talk");
                this.sendNodesMessage(request);
        }

        async requestListenPTT() {
                let request = await this.generateBooleanPayloadRequest("listen");
                request.payload.token = this.listenerPTTID;
                this.sendNodesMessage(request);
        }

        async requestUnlistenPTT() {
                let request = await this.generateBooleanPayloadRequest("unlisten");
                request.payload.token = this.listenerPTTID;
                this.sendNodesMessage(request);
        }

        async generateNumberPayloadRequest(event) {
                let request = await this.generateRequest("payload", {
                        type: "number",
                        id: this.type,
                        payload: {
                                event: event,
                        },
                });
                return request;
        }

        async requestGetNumber() {
                let request = await this.generateNumberPayloadRequest("get");
                this.typeWarning("Get Number");
                this.sendNodesMessage(request);
        }

        async requestSetNumber(value, min = null, max = null) {
                let request = await this.generateNumberPayloadRequest("set");
                request.payload.value = {
                        value: value
                };
                if (min && max) {
                        request.payload.value.min = min;
                        request.payload.value.max = max;
                }
                this.typeWarning("Set Number");
                this.sendNodesMessage(request);
        }

        async requestAddNumber(value, min = null, max = null) {
                let request = await this.generateNumberPayloadRequest("add");
                request.payload.value = {
                        value: value
                };
                if (min && max) {
                        request.payload.value.min = min;
                        request.payload.value.max = max;
                }
                this.typeWarning("Add Number");
                this.sendNodesMessage(request);
        }

        async requestListenNumber() {
                let request = await this.generateNumberPayloadRequest("listen");
                request.payload.token = this.longID;
                this.sendNodesMessage(request);
        }

        async requestUnlistenNumber() {
                let request = await this.generateNumberPayloadRequest("unlisten");
                request.payload.token = this.longID;
                this.sendNodesMessage(request);
        }

        refreshAvatarStates() {
                this.logger.log("Refreshing Avatar States List...");
                this.requestListStates();
        }

        connectWebSocket() {
                !!this.version ? this.createWebSocket() : this.createWebSocket(() => {
                        this.requestListStates();
                });
        }

        async disconnectWebSocket() {
                if (!this.webSocket) return;
                if (
                        this.webSocket.readyState !== WebSocket.CLOSING &&
                        this.webSocket.readyState !== WebSocket.CLOSED
                ) {
                        if (this.webSocket.bufferedAmount > 0) {
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                return this.disconnectWebSocket();
                        }
                        
                        return new Promise((resolve) => {
                                this.webSocket.addEventListener('close', () => resolve(), { once: true });
                                this.webSocket.close(1000);
                        }).finally(() => {
                                this.webSocket = null;
                        });
                }
                this.webSocket = null;
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
                        if (this.webSocket) {
                                this.requestUnlistenStates();
                                this.requestUnlistenPTT();
                                this.requestUnlistenNumber();
                        }
                        await this.disconnectWebSocket();
                } catch (error) {
                        this.logger.error(`WebSocket error while disconnecting: ${error.message}`);
                } finally {
                        this.instanceBox.remove();
                        this.logger.warn(`Destroyed ${this.shortID} and unsubscribed events.`);
                }
        }
}

function VEADOTUBE__getInstancesList(family, event) {
        return [...veadotube_instances, ...veadotube_manual_instances].map(instance => `${event}:${family}:${instance.longID}`);
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
                let instances = response.value;
                let index = 0;
                for (const instance of instances) {
                        // if (instance.server.includes(':')) {
                        //         instance.port = instance.server.split(':')[1];
                        // }
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

function VEADO_SAMMI__insertCommandsWithListedStates(instance = null) {
        let baseCommands = VEADO_SAMMI__extCommands_w_list;
        for (const family in baseCommands) {
                const familyObj = baseCommands[family];
                for (const event in familyObj) {
                        const eventObj = familyObj[event];
                        const instanceCmdName = instance ? `${event}:${family}:${instance.longID}` : null;
                        const emptyList = ['No options available! Is the WebSocket connected?'];
                        let defaultList = emptyList;
                        if (instance) {
                                const newList = Object.keys(instance.states);
                                defaultList = newList.length > 0 ? newList : emptyList;
                        }
                        SAMMI.extCommand(instanceCmdName || `${VEADO_SAMMI__PLUGIN_NAME} - ${eventObj.baseCmdStr}`, 3355443, 52, {
                                instance: ['Instance', 25, instanceCmdName || 'Connect to a WebSocket to start', 1, VEADOTUBE__getInstancesList(family, event)],
                                mainArg: [eventObj.baseCmdStr, 20, '', null, defaultList],
                                ...eventObj.args,
                        }, false, !!instance);
                }
        }
        if (instance) return;
        [...veadotube_instances, ...veadotube_manual_instances].forEach(instance => { VEADO_SAMMI__insertCommandsWithListedStates(instance) });
}

function VEADO_SAMMI__insertCommandsWithStringArgs(instance = null) {
        let baseCommands = VEADO_SAMMI__extCommands_w_str;
        for (const family in baseCommands) {
                const familyObj = baseCommands[family];
                for (const event in familyObj) {
                        const eventObj = familyObj[event];
                        const instanceCmdName = instance ? `${event}:${family}:${instance.longID}` : null;
                        SAMMI.extCommand(instanceCmdName || `${VEADO_SAMMI__PLUGIN_NAME} - ${eventObj.baseCmdStr}`, 3355443, 52, {
                                instance: ['Instance', 25, instanceCmdName || 'Connect to a WebSocket to start', 1, VEADOTUBE__getInstancesList(family, event)],
                                mainArg: [eventObj.baseCmdStr, 14, ''],
                                ...eventObj.args,
                        }, false, !!instance);
                }
        }
        if (instance) return;
        [...veadotube_instances, ...veadotube_manual_instances].forEach(instance => { VEADO_SAMMI__insertCommandsWithStringArgs(instance) });
}

function VEADO_SAMMI__insertCommandsWithBooleanArgs(instance = null) {
        let baseCommands = VEADO_SAMMI__extCommands_w_bool;
        for (const family in baseCommands) {
                const familyObj = baseCommands[family];
                for (const event in familyObj) {
                        const eventObj = familyObj[event];
                        const instanceCmdName = instance ? `${event}:${family}:${instance.longID}` : null;
                        SAMMI.extCommand(instanceCmdName || `${VEADO_SAMMI__PLUGIN_NAME} - ${eventObj.baseCmdStr}`, 3355443, 52, {
                                instance: ['Instance', 25, instanceCmdName || 'Connect to a WebSocket to start', 1, VEADOTUBE__getInstancesList(family, event)],
                                mainArg: [eventObj.baseCmdStr, 18, 0, null, ['False', 'True']],
                                ...eventObj.args,
                        }, false, !!instance);
                }
        }
        if (instance) return;
        [...veadotube_instances, ...veadotube_manual_instances].forEach(instance => { VEADO_SAMMI__insertCommandsWithBooleanArgs(instance) });
}

function VEADO_SAMMI__insertCommandsWithNoArgs(instance = null) {
        let baseCommands = VEADO_SAMMI__extCommands_n_args;
        for (const family in baseCommands) {
                const familyObj = baseCommands[family];
                for (const event in familyObj) {
                        const eventObj = familyObj[event];
                        const instanceCmdName = instance ? `${event}:${family}:${instance.longID}` : null;
                        SAMMI.extCommand(instanceCmdName || `${VEADO_SAMMI__PLUGIN_NAME} - ${eventObj.baseCmdStr}`, 3355443, 52, {
                                instance: ['Instance', 25, instanceCmdName || 'Connect to a WebSocket to start', 1, VEADOTUBE__getInstancesList(family, event)],
                                ...eventObj.args,
                        }, false, !!instance);
                }
        }
        if (instance) return;
        [...veadotube_instances, ...veadotube_manual_instances].forEach(instance => { VEADO_SAMMI__insertCommandsWithNoArgs(instance) });
}

function VEADO_SAMMI__updateBaseCommands() {
        VEADO_SAMMI__insertCommandsWithNoArgs();
        VEADO_SAMMI__insertCommandsWithListedStates();
        VEADO_SAMMI__insertCommandsWithBooleanArgs();
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
        // let index = inputServer.includes(':') ? inputServer.split(':')[1] : generateShortHash(`${inputServer}${inputName}`);
        let index = generateShortHash(`${inputServer}${inputName}`);
        let instance_obj = new VEADOTUBE__Instance({
                index: index,
                server: inputServer,
                name: inputName,
        });
        veadotube_manual_instances.push(instance_obj);
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
