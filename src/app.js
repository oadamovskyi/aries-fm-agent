"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getAgent = void 0;
var core_1 = require("@aries-framework/core");
var node_1 = require("@aries-framework/node");
var node_fetch_1 = require("node-fetch");
var getGenesisTransaction = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, node_fetch_1["default"])(url)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getAgent = function (label, port) {
    if (port === void 0) { port = 3001; }
    return __awaiter(void 0, void 0, void 0, function () {
        var genesisTransaction, config, agent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
                    // Simple agent configuration. This sets some basic fields like the wallet
                    // configuration and the label.
                ];
                case 1:
                    genesisTransaction = _a.sent();
                    config = {
                        logger: new core_1.ConsoleLogger(core_1.LogLevel.trace),
                        label: label,
                        walletConfig: {
                            id: label,
                            key: '1234567'
                        },
                        publicDidSeed: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        indyLedgers: [
                            {
                                id: 'bcovrin-test-net',
                                isProduction: false,
                                genesisTransactions: genesisTransaction
                            },
                        ],
                        autoAcceptCredentials: core_1.AutoAcceptCredential.Always,
                        autoAcceptProofs: core_1.AutoAcceptProof.Always,
                        autoAcceptConnections: true,
                        endpoints: ['http://1c7b-194-44-135-134.ngrok.io']
                    };
                    agent = new core_1.Agent(config, node_1.agentDependencies);
                    // Register a simple `WebSocket` outbound transport
                    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
                    // Register a simple `Http` outbound transport
                    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
                    // Register a simple `Http` inbound transport
                    agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: 3001 }));
                    // Initialize the agent
                    return [4 /*yield*/, agent.initialize()["catch"](function (e) { return console.error(e); })];
                case 2:
                    // Initialize the agent
                    _a.sent();
                    return [2 /*return*/, agent];
            }
        });
    });
};
exports.getAgent = getAgent;
