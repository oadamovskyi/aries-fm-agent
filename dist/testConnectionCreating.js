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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const node_1 = require("@aries-framework/node");
const initializeBobAgent = () => __awaiter(void 0, void 0, void 0, function* () {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config = {
        label: 'demo-agent-bob',
        walletConfig: {
            id: 'mainBob',
            key: 'demoagentbob00000000000000000000',
        },
        autoAcceptConnections: true,
    };
    // A new instance of an agent is created here
    const agent = new core_1.Agent(config, node_1.agentDependencies);
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    // Initialize the agent
    yield agent.initialize();
    return agent;
});
const initializeAcmeAgent = () => __awaiter(void 0, void 0, void 0, function* () {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const config = {
        label: 'demo-agent-acme',
        walletConfig: {
            id: 'mainAcme',
            key: 'demoagentacme0000000000000000000',
        },
        autoAcceptConnections: true,
        endpoints: ['http://localhost:3001'],
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
    yield agent.initialize();
    return agent;
});
const createNewInvitation = (agent) => __awaiter(void 0, void 0, void 0, function* () {
    const outOfBandRecord = yield agent.oob.createInvitation();
    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
        outOfBandRecord,
    };
});
const createLegacyInvitation = (agent) => __awaiter(void 0, void 0, void 0, function* () {
    const { invitation } = yield agent.oob.createLegacyInvitation();
    return invitation.toUrl({ domain: 'https://example.org' });
});
const receiveInvitation = (agent, invitationUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const { outOfBandRecord } = yield agent.oob.receiveInvitationFromUrl(invitationUrl);
    return outOfBandRecord;
});
const setupConnectionListener = (agent, outOfBandRecord, cb) => {
    agent.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id)
            return;
        if (payload.connectionRecord.state === core_1.DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`);
            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            cb();
            // We exit the flow
            process.exit(0);
        }
    });
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Initializing Bob agent...');
    const bobAgent = yield initializeBobAgent();
    console.log('Initializing Acme agent...');
    const acmeAgent = yield initializeAcmeAgent();
    console.log('Creating the invitation as Acme...');
    const { outOfBandRecord, invitationUrl } = yield createNewInvitation(acmeAgent);
    console.log('Listening for connection changes...');
    setupConnectionListener(acmeAgent, outOfBandRecord, () => console.log('We now have an active connection to use in the following tutorials'));
    console.log('Accepting the invitation as Bob...');
    yield receiveInvitation(bobAgent, invitationUrl);
});
exports.default = run;
void run();
//# sourceMappingURL=testConnectionCreating.js.map