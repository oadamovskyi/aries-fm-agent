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
const app_1 = require("./app");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const core_1 = require("@aries-framework/core");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield (0, app_1.getAgent)("my-demo");
    // const schema = await agent.ledger.getSchema('596945')
    const schema = yield agent.ledger.registerSchema({
        attributes: ["name", "age"],
        version: "1.0",
        name: "test-schema2"
    });
    console.log('THIS IS SCHEMA: ', schema);
    const credentialDefinition = yield agent.ledger.registerCredentialDefinition({
        schema,
        supportRevocation: false,
        tag: "default"
    });
    console.log('THIS IS CREDENTIAL_DEFINITION: ', credentialDefinition);
    const { outOfBandRecord, invitation } = yield agent.oob.createLegacyInvitation();
    console.log('THIS IS OOB: ', outOfBandRecord);
    console.log('THIS IS INVITATION: ', invitation);
    const url = invitation.toUrl({ domain: "https://example.org" });
    console.log('THIS IS URL: ', url);
    qrcode_terminal_1.default.generate(url);
    const connectionId = yield connectionListener(agent, outOfBandRecord.id);
    yield agent.credentials.offerCredential({
        connectionId,
        protocolVersion: "v1",
        credentialFormats: {
            indy: {
                credentialDefinitionId: credentialDefinition.id,
                attributes: [
                    { name: "name", value: "Berend" },
                    { name: "age", value: "23" }
                ]
            }
        }
    });
});
const connectionListener = (agent, id) => {
    return new Promise((resolve => {
        agent.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
            if (payload.connectionRecord.outOfBandId !== id)
                return;
            if (payload.connectionRecord.isReady) {
                resolve(payload.connectionRecord.id);
            }
        });
    }));
};
void run();
//# sourceMappingURL=index.js.map