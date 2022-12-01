import { getAgent } from "./app"
import qrcode from "qrcode-terminal"
import {Agent, ConnectionEventTypes, ConnectionStateChangedEvent} from "@aries-framework/core"
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {getSchema,createCredentialOffer,createCredentnialDefinition,createSchema, getCredentialDefinition} from "./apiMethods"
import { createTextChangeRange } from "typescript";
import { Schema } from "../indy-sdk/vcx/wrappers/node/src";

dotenv.config();

let faber: Agent
const app: Express = express();
const port = 8000;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/schema', (req: Request, response: Response) => {
    const id = req.body.id;
    if(id) {
        const schema = getSchema(faber,id)
        schema.then(el => {
            response.send(el);
        })
    }
    else{
        response.send('Id has to be specified')
    }
  });

  app.post('/createSchema',(req: Request, response: Response) => {
    
    const attributes = req.body?.attributes
    const version = req.body?.version
    const name = req.body?.name
   createSchema(faber, attributes, version, name).then(res => {
    response.send({"schema": res});
    }).catch(err =>{
        response.send({"error": err.message})
    })
    
    
  })

  app.post('/createCredentialDefinition',(req: Request, response: Response) => {
    
    const schemaId = req.body?.schemaId
    getSchema(faber,schemaId).then(schema => {
        createCredentnialDefinition(faber, schema).then(res => {
            response.send({"credentialDefinition" : res});
            }).catch(err =>{
                response.send({"error": err.message})
            })
    })
   
    
    
  })

  app.post('/offerCredential',(req: Request, response: Response) => {
    
    const attributes = req.body?.attributes
    const credentialDefinitionId = req.body?.credentialDefinitionId

    createCredentialOffer(faber, credentialDefinitionId, attributes).then(res => {
        response.send({"credentialOffer" : res});
        }).catch(err =>{
            response.send({"error": err.message})
        })
    
    
  })

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

const init = async () => {
    faber = await getAgent("my-demo");
}


void init();
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

const connectionListener = (agent: Agent, id: string): Promise<string> => {
    return new Promise((resolve =>{
        agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({payload}) => {
            if(payload.connectionRecord.outOfBandId !== id) return
            if(payload.connectionRecord.isReady){
                resolve(payload.connectionRecord.id)
            }
        })
    }))
}

// void run()