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
var app_1 = require("./app");
var qrcode_terminal_1 = require("qrcode-terminal");
var core_1 = require("@aries-framework/core");
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var agent, schema, credentialDefinition, _a, outOfBandRecord, invitation, url, connectionId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, app_1.getAgent)("my-demo")];
            case 1:
                agent = _b.sent();
                return [4 /*yield*/, agent.ledger.registerSchema({
                        attributes: ["name", "age"],
                        version: "1.0",
                        name: "test-schema2"
                    })];
            case 2:
                schema = _b.sent();
                console.log('THIS IS SCHEMA: ', schema);
                return [4 /*yield*/, agent.ledger.registerCredentialDefinition({
                        schema: schema,
                        supportRevocation: false,
                        tag: "default"
                    })];
            case 3:
                credentialDefinition = _b.sent();
                console.log('THIS IS CREDENTIAL_DEFINITION: ', credentialDefinition);
                return [4 /*yield*/, agent.oob.createLegacyInvitation()];
            case 4:
                _a = _b.sent(), outOfBandRecord = _a.outOfBandRecord, invitation = _a.invitation;
                console.log('THIS IS OOB: ', outOfBandRecord);
                console.log('THIS IS INVITATION: ', invitation);
                url = invitation.toUrl({ domain: "https://example.org" });
                console.log('THIS IS URL: ', url);
                qrcode_terminal_1["default"].generate(url);
                return [4 /*yield*/, connectionListener(agent, outOfBandRecord.id)];
            case 5:
                connectionId = _b.sent();
                return [4 /*yield*/, agent.credentials.offerCredential({
                        connectionId: connectionId,
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
                    })];
            case 6:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var connectionListener = function (agent, id) {
    return new Promise((function (resolve) {
        agent.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, function (_a) {
            var payload = _a.payload;
            if (payload.connectionRecord.outOfBandId !== id)
                return;
            if (payload.connectionRecord.isReady) {
                resolve(payload.connectionRecord.id);
            }
        });
    }));
};
void run();
