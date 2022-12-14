import qrcode from "qrcode-terminal"
import {Agent, AgentMessage, AutoAcceptProof, ConnectionEventTypes, ConnectionRecord, ConnectionStateChangedEvent, CreateProofRequestOptions, CredentialExchangeRecord, CredentialState, DidExchangeState, IndyRevocationInterval, OutOfBandRecord, ProofAttributeInfo, ProofRequestOptions, ProofState, RequestedAttribute, RequestedCredentials, RetrievedCredentials} from "@aries-framework/core"
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {getSchema,createCredentialOffer,createCredentnialDefinition,createSchema, getCredentialDefinition, createCredentialOfferWithConnection, acceptRequest} from "./apiMethods"
import { createNewInvitation, getAgent, getAgent2, receiveInvitation, setupConnectionListener, credentialListener, setupProofsListener, messageListener} from "./app"
import { Proof } from "../indy-sdk/vcx/wrappers/node/src";

dotenv.config();

export class CredentialHolder {
    id: string;
    state: string;
    record: CredentialExchangeRecord

    constructor(credentialRecord: CredentialExchangeRecord){
        this.id = credentialRecord.id
        this.state = credentialRecord.state
        this.record = credentialRecord
    }
}

let faber, alice: Agent
let credentialHolder = {credentialId:'', state:''}
let proofHolder = {proofId:'', state:''}
let credentialsByRequestedAttributes: {credentials: Record<string,RequestedAttribute[]>}
// let issuerCredentialReceived = {credentialId:''}
let outOfBandId: string
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
    getConnectionRecordId(faber,outOfBandId).then(connectionRecord => {
        console.log('connectionRecord',connectionRecord);
        createCredentialOfferWithConnection(faber, credentialDefinitionId, attributes,connectionRecord).then(res => {
    
    
            let interval = setInterval(() => {
                console.log('Polling');
                console.log('credentialHolder.state',credentialHolder.state);
                
                if(credentialHolder.state === CredentialState.OfferReceived){
                    alice.credentials.findOfferMessage(credentialHolder.credentialId).then(credential => {
                        response.send(credential);

                    })
                

                    clearInterval(interval)
                }
            },1500)
            }).catch(err =>{
                response.send({"error": err.message})
            })
    })

    
    
  })

  app.post('/acceptOffer',(req: Request, response: Response) => {
    
    const credentialRecordId = req.body?.credentialRecordId

    alice.credentials.acceptOffer({
        credentialRecordId
    }).then(() => {
    
        let interval = setInterval(() => {
            console.log('Polling on Accepting Offer');

            if(credentialHolder.state === CredentialState.Done){
                
                clearInterval(interval)

                faber.credentials.getById(credentialHolder.credentialId).then(acceptedCredential => {

                    response.send({'acceptedCredential' : acceptedCredential})

                })

                
            }
        },1500)

    }).catch(err =>{
        response.send({"error": err.message})
    })
    
  })

  app.post('/declineOffer',(req: Request, response: Response) => {
    
    const credentialRecordId = req.body?.credentialRecordId
    
    alice.credentials.declineOffer(
        credentialRecordId
    ).then(() => {
        alice.credentials.findAllByQuery
        let interval = setInterval(() => {
            console.log('Polling on Declining Offer');
            response.send({'response' : 'Credential successfully declined'})
            // if(credentialHolder.state === CredentialState.Declined){
                
            //     clearInterval(interval)

            //     alice.credentials.getById(credentialHolder.credentialId).then(declinedCredential => {

            //         response.send({'declinedCredential' : declinedCredential})

            //     })

                
            // }
        },1500)

    }).catch(err =>{
        response.send({"error": err.message})
    })
    
  })

  app.post('/requestProof',(req: Request, response: Response) => {
    
    const attributeName = req.body?.attributeName

    // const createProofRequest: CreateRequestOptions<PFs> = {
    //     connectionRecord: connection,
    //     proofFormats: options.proofFormats,
    //     autoAcceptProof: options.autoAcceptProof,
    //     parentThreadId: options.parentThreadId,
    //     comment: options.comment,
    //   }

    const proofAttribute = {
        name: new ProofAttributeInfo({
          name: attributeName,
        }),
      }

    const proofRequestOptions: CreateProofRequestOptions = {
        name: 'proof-request',
        nonce: '1298236324864',
        requestedAttributes: proofAttribute,
    }

    getConnectionRecordId(faber,outOfBandId).then(connectionId => {
        faber.proofs.requestProof(
            connectionId,
            proofRequestOptions
        ).then(() => {
            let interval = setInterval(() => {
                if(proofHolder.state == ProofState.RequestReceived){
                    clearInterval(interval)

                    alice.proofs.getById(proofHolder.proofId).then(proof => {
                        response.send({'Verification Request':proof})
                    }).catch(holderProofError => {
                        response.send({'holderProofError':holderProofError.message})
                    })
                }
            })
        }).catch(requestErr => {
            response.send({'requestProofError':requestErr.message})
        })
    }).catch(err => {
        response.send({'gettingConnectionError':err.message})
    })
    
  })

  app.post('/getRequestedCredentials',(req: Request, response: Response) => {
    
    const proofRecordId = req.body?.proofRecordId

    alice.proofs.getRequestedCredentialsForProofRequest(
        proofRecordId
      ).then(getRequestedCredential => {
        // console.log('getRequestedCredential',getRequestedCredential.requestedAttributes['name']);
        getRequestedCredential.requestedAttributes['name'].forEach((credential, index) => {
          console.log(`cred #${index}:`,credential);
        })

        response.send({getRequestedCredential})

      }).catch(requestedCredentialsError => {
        response.send({'requestedCredentialsError':requestedCredentialsError.message})
      })

  })

  app.post('/acceptProof',(req: Request, response: Response) => {
    
    const proofRecordId = req.body?.proofRecordId
 
    alice.proofs.getRequestedCredentialsForProofRequest(
        proofRecordId
      ).then(getRequestedCredential => {
        // console.log('getRequestedCredential',getRequestedCredential.requestedAttributes['name']);
        getRequestedCredential.requestedAttributes['name'].forEach((credential, index) => {
          console.log(`cred #${index}:`,credential);
        })

        const requestedAttributes: Record<string, RequestedAttribute> = {
            name : getRequestedCredential.requestedAttributes['name'][0]
        }

        alice.proofs.acceptRequest(
            proofHolder.proofId,
            new RequestedCredentials({
                requestedAttributes 
            })
        ).then(proved => {
            response.send({proofRequest:proved,provedWith:requestedAttributes})
        }).catch(acceptingProveError => {
            response.send({acceptingProveError:acceptingProveError.message})
        })


      }).catch(requestedCredentialsError => {
        response.send({'requestedCredentialsError':requestedCredentialsError.message})
      })
    

  })

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

const getConnectionRecordId = async (agent: Agent, outOfBandId: string): Promise<string> => {
    const connectionRecord = await agent.connections.findAllByOutOfBandId(outOfBandId)
    console.log('CONNECTION RECORD: ',connectionRecord);
    
    return connectionRecord.at(0).id
}

const testFlow = async (agent: Agent) => {

    
    // agent.connections.findAllByOutOfBandId(outOfBendRecord.id).then(res => {
        
    //     console.log('agentConnection',res.at(0));
    // });
    // alice.connections.findAllByOutOfBandId(outOfBendRecord.id).then(res => {
        
    //     console.log('aliceConnection',res.at(0));
    // });
    
    // const schema = await createSchema(faber,["name"],"6.9",'testSchema');
    // // const credentialDefinition = await createCredentnialDefinition(agent,schema)
    // const credentialDefinition = await faber.ledger.registerCredentialDefinition({
    //     schema: schema,
    //     tag: "default",
    //     supportRevocation: false
    // })
    
    // // const offerCredential = await createCredentialOfferWithConnection(agent,credentialDefinition.id,atts,connectionId)
    
    // const offerCredentialExchangeRecord = await faber.credentials.offerCredential({
    //             connectionId,
    //             protocolVersion: "v1",
    //             credentialFormats: {
    //                 indy: {
    //                     credentialDefinitionId: credentialDefinition.id,
    //                     attributes: [
    //                         {name: "name", value: "Berend"}
    //                     ]
    //                 }
    //             }
    //        })

        
            
        

    //Accept offer should be in CredentialStateChanged listener
    // alice.credentials.acceptOffer({
    //     credentialRecordId: offerCredentialExchangeRecord.id
    // }).then(result => {
    //     console.log('Accepted Offer: ', result);
        
    // })
}

const init = async () => {

    faber = await getAgent("issuer");
    alice = await getAgent2("holder");

    const { outOfBandRecord, invitationUrl } = await createNewInvitation(faber)

    outOfBandId = outOfBandRecord.id;

    setupConnectionListener(faber, outOfBandRecord,testFlow);

    await receiveInvitation(alice, invitationUrl)

    await credentialListener(alice, credentialHolder)
    await credentialListener(faber, credentialHolder)

    await setupProofsListener(alice,proofHolder)
    await setupProofsListener(faber, null)

    await messageListener(faber,'Issuer')
    await messageListener(alice,'Holder')

    
        
}

void init()
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