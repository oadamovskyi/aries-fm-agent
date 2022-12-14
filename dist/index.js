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
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var apiMethods_1 = require("./apiMethods");
var app_1 = require("./app");
dotenv_1["default"].config();
var faber, alice;
var connectionId;
var app = (0, express_1["default"])();
var port = 8000;
app.use(express_1["default"].json());
app.get('/', function (req, res) {
    res.send('Express + TypeScript Server');
});
app.get('/schema', function (req, response) {
    var id = req.body.id;
    if (id) {
        var schema = (0, apiMethods_1.getSchema)(faber, id);
        schema.then(function (el) {
            response.send(el);
        });
    }
    else {
        response.send('Id has to be specified');
    }
});
app.post('/createSchema', function (req, response) {
    var _a, _b, _c;
    var attributes = (_a = req.body) === null || _a === void 0 ? void 0 : _a.attributes;
    var version = (_b = req.body) === null || _b === void 0 ? void 0 : _b.version;
    var name = (_c = req.body) === null || _c === void 0 ? void 0 : _c.name;
    (0, apiMethods_1.createSchema)(faber, attributes, version, name).then(function (res) {
        response.send({ "schema": res });
    })["catch"](function (err) {
        response.send({ "error": err.message });
    });
});
app.post('/createCredentialDefinition', function (req, response) {
    var _a;
    var schemaId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.schemaId;
    (0, apiMethods_1.getSchema)(faber, schemaId).then(function (schema) {
        (0, apiMethods_1.createCredentnialDefinition)(faber, schema).then(function (res) {
            response.send({ "credentialDefinition": res });
        })["catch"](function (err) {
            response.send({ "error": err.message });
        });
    });
});
app.post('/offerCredential', function (req, response) {
    var _a, _b;
    var attributes = (_a = req.body) === null || _a === void 0 ? void 0 : _a.attributes;
    var credentialDefinitionId = (_b = req.body) === null || _b === void 0 ? void 0 : _b.credentialDefinitionId;
    (0, apiMethods_1.createCredentialOffer)(faber, credentialDefinitionId, attributes).then(function (res) {
        response.send({ "credentialOffer": res });
    })["catch"](function (err) {
        response.send({ "error": err.message });
    });
});
app.listen(port, function () {
    console.log("\u26A1\uFE0F[server]: Server is running at http://localhost:".concat(port));
});
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, outOfBandRecord, invitationUrl;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, app_1.getAgent)("my-demo")];
            case 1:
                faber = _b.sent();
                return [4 /*yield*/, (0, app_1.getAgent2)("my-demo-holder")];
            case 2:
                alice = _b.sent();
                return [4 /*yield*/, (0, app_1.createNewInvitation)(faber)];
            case 3:
                _a = _b.sent(), outOfBandRecord = _a.outOfBandRecord, invitationUrl = _a.invitationUrl;
                (0, app_1.setupConnectionListener)(faber, outOfBandRecord, function (connectionRecord) {
                    connectionId = connectionRecord.id;
                });
                console.log('connectionId', connectionId);
                return [4 /*yield*/, (0, app_1.receiveInvitation)(alice, invitationUrl)];
            case 4:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var testFlow = function (agent) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, credentialDefinition, atts, offerCredentialExchangeRecord;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, apiMethods_1.createSchema)(agent, ["name"], "3.2", 'testSchema')];
            case 1:
                schema = _a.sent();
                return [4 /*yield*/, (0, apiMethods_1.createCredentnialDefinition)(agent, schema)];
            case 2:
                credentialDefinition = _a.sent();
                atts = [
                    { "name": "name", "value": "alex" }
                ];
                return [4 /*yield*/, agent.credentials.offerCredential({
                        connectionId: connectionId,
                        protocolVersion: "v1",
                        credentialFormats: {
                            indy: {
                                credentialDefinitionId: credentialDefinition.id,
                                attributes: [
                                    { name: "name", value: "Berend" }
                                ]
                            }
                        }
                    })
                    // alice.credentials.acceptOffer({
                    //     credentialRecordId: offerCredentialExchangeRecord.id
                    // }).then(result => {
                    //     console.log('Accepted Offer: ', result);
                    // })
                ];
            case 3:
                offerCredentialExchangeRecord = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
void init().then(function () {
    testFlow(faber);
});
// const run = async () => {
//     const agent = await getAgent("my-demo");
//     // const schema = await agent.ledger.getSchema('596945')
//     const schema = await agent.ledger.registerSchema({
//         attributes: ["name","age"],
//         version: "2.0", 
//         name: "test-schema2"
//     });
//     console.log('THIS IS SCHEMA: ', schema);
//     const credentialDefinition = await agent.ledger.registerCredentialDefinition({
//         schema,
//         supportRevocation: false,
//         tag: "default"
//     })
//     console.log('THIS IS CREDENTIAL_DEFINITION: ', credentialDefinition);
// const {outOfBandRecord, invitation} = await agent.oob.createLegacyInvitation();
//     console.log('THIS IS OOB: ',outOfBandRecord);
//     console.log('THIS IS INVITATION: ', invitation);    
//     const url = invitation.toUrl({domain: "https://example.org"})
//     console.log('THIS IS URL: ', url);
//     //================================================================================
//     const createOffer = await agent.credentials.createOffer({
//         protocolVersion: "v1",
//         credentialFormats: {
//             indy: {
//                 credentialDefinitionId: credentialDefinition.id,
//                 attributes: [
//                     {name: "name", value: "Berend"},
//                     {name: "age", value: "23"}
//                 ]
//             }
//         }
//     })
//     console.log('THIS IS OFFER: ', createOffer.credentialRecord.connectionId = '');
//     const connections = await agent.connections.getAll();
//     console.log('RECEIVED CONNECTIONS: ', connections);
//     const tryGetOffer = await agent.credentials.getAll();
//     console.log('RECEIVED ALL OFFERS: ', tryGetOffer);
//     //================================================================================
//     qrcode.generate(url);
//     const connectionId = await connectionListener(agent, outOfBandRecord.id)
//     const offerCredentialExchangeRecord = await agent.credentials.offerCredential({
//         connectionId,
//         protocolVersion: "v1",
//         credentialFormats: {
//             indy: {
//                 credentialDefinitionId: credentialDefinition.id,
//                 attributes: [
//                     {name: "name", value: "Berend"},
//                     {name: "age", value: "23"}
//                 ]
//             }
//         }
//     })
//     console.log('THIS IS OFFER OFFER CREDENTIAL: ', offerCredentialExchangeRecord);
// }
// void run()
