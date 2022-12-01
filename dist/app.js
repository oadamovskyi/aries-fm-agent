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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgent = void 0;
const core_1 = require("@aries-framework/core");
const node_1 = require("@aries-framework/node");
const node_fetch_1 = __importDefault(require("node-fetch"));
const getGenesisTransaction = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)(url);
    return yield response.text();
});
const getAgent = (label, port = 3001) => __awaiter(void 0, void 0, void 0, function* () {
    const genesisTransaction = yield getGenesisTransaction('http://test.bcovrin.vonx.io/genesis');
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const config = {
        logger: new core_1.ConsoleLogger(core_1.LogLevel.trace),
        label,
        walletConfig: {
            id: label,
            key: '1234567',
        },
        publicDidSeed: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        indyLedgers: [
            {
                id: 'bcovrin-test-net',
                isProduction: false,
                genesisTransactions: genesisTransaction,
            },
        ],
        autoAcceptCredentials: core_1.AutoAcceptCredential.Always,
        autoAcceptProofs: core_1.AutoAcceptProof.Always,
        autoAcceptConnections: true,
        endpoints: ['http://1c7b-194-44-135-134.ngrok.io'],
    };
    // A new instance of an agent is created here
    const agent = new core_1.Agent(config, node_1.agentDependencies);
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: 3001 }));
    // Initialize the agent
    yield agent.initialize().catch((e) => console.error(e));
    return agent;
});
exports.getAgent = getAgent;
//# sourceMappingURL=app.js.map