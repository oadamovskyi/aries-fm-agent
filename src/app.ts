
import {
  InitConfig,
  Agent,
  WsOutboundTransport,
  HttpOutboundTransport,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidExchangeState,
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialState,
  CredentialStateChangedEvent,
  OutOfBandRecord,
  ConsoleLogger,
  LogLevel,
  AutoAcceptProof,
  ProofStateChangedEvent,
  ProofEventTypes,
  ProofState,
  RequestedCredentials,
  RetrievedCredentials,
  MessagesReceivedMessage,
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import fetch from 'node-fetch'
import { CredentialHolder } from './index'

export let connectionId: string

const getGenesisTransaction = async (url: string) => {
  const response = await fetch(url)
  return await response.text()
}

export const getAgent = async (label: string, port: number = 3001) => {
  const genesisTransaction = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label.

  const config: InitConfig = {
    logger: new ConsoleLogger(LogLevel.trace),
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
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    autoAcceptProofs: AutoAcceptProof.ContentApproved,
    autoAcceptConnections: true,
    endpoints: [`http://localhost:${port}`],
  }

  // A new instance of an agent is created here
  const agent = new Agent(config, agentDependencies)

  // Register a simple `WebSocket` outbound transport
  agent.registerOutboundTransport(new WsOutboundTransport())

  // Register a simple `Http` outbound transport
  agent.registerOutboundTransport(new HttpOutboundTransport())

  // Register a simple `Http` inbound transport
  agent.registerInboundTransport(new HttpInboundTransport({ port: port }))

  // Initialize the agent
  await agent.initialize().catch((e) => console.error(e))

  return agent
}

export const getAgent2 = async (label: string, port: number = 3002) => {
  const genesisTransaction = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label.

  const config: InitConfig = {
    logger: new ConsoleLogger(LogLevel.trace),
    label,
    walletConfig: {
      id: label,
      key: '1234567',
    },
    publicDidSeed: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    indyLedgers: [
      {
        id: 'bcovrin-test-net2',
        isProduction: false,
        genesisTransactions: genesisTransaction,
      },
    ],
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    autoAcceptProofs: AutoAcceptProof.ContentApproved,
    autoAcceptConnections: true,
    endpoints: [`http://localhost:${port}`],
  }

  // A new instance of an agent is created here
  const agent = new Agent(config, agentDependencies)

  // Register a simple `WebSocket` outbound transport
  agent.registerOutboundTransport(new WsOutboundTransport())

  // Register a simple `Http` outbound transport
  agent.registerOutboundTransport(new HttpOutboundTransport())

  // Register a simple `Http` inbound transport
  agent.registerInboundTransport(new HttpInboundTransport({ port: port }))

  // Initialize the agent
  await agent.initialize().catch((e) => console.error(e))

  return agent
}

export const createNewInvitation = async (agent: Agent) => {
  const outOfBandRecord = await agent.oob.createInvitation()

  
  return {
    invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
    outOfBandRecord
  }
}

export const receiveInvitation = async (agent: Agent, invitationUrl: string) => {
  const { connectionRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)
  console.log(`Connection Record from receiveIncvitatio ${connectionRecord.state}`);
  

  return connectionRecord
}


export const setupConnectionListener = (agent: Agent, outOfBandRecord: OutOfBandRecord, cb: (...args: any) => void) => {

    agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return 
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
  
        // the connection is now ready for usage in other protocols!
        
        // Custom business logic can be included here
        // In this example we can send a basic message to the connection, but
        // anything is possibl
        // We exit the flow
        console.log('Connection Id Listener: ', payload.connectionRecord.id);
        cb(agent,outOfBandRecord)
        //cb(payload.connectionRecord.id)
      }
    })
  }

  export const credentialListener = (agent: Agent, credentialHolder: {credentialId: string, state: string}) => {
    agent.events.on(
      CredentialEventTypes.CredentialStateChanged,
      async ({ payload }: CredentialStateChangedEvent) => {

        console.log('AGENT LABEL', agent.config.label);
        console.log('payload.credentialRecord',payload);
        console.log('payload.credentialRecord.state',payload.credentialRecord.state);
        credentialHolder.credentialId = payload.credentialRecord.id
        credentialHolder.state = payload.credentialRecord.state

        // if (payload.credentialRecord.state === CredentialState.OfferReceived) {
        //   credentialHolder.state = payload.credentialRecord.state
          
        // } else if (payload.credentialRecord.state === CredentialState.RequestReceived) {
        //   credentialHolder.credentialId = payload.credentialRecord.id
        // }
      }
    )
  }

  export const setupProofsListener = (agent: Agent, proofHolder: {proofId:string, state:string}) => {

    agent.events.on<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged, ({ payload }) => {
      console.log(`AGENT: ${agent.config.label} - PROOF RECORD STATE: ${payload.proofRecord.state}`)
      RequestedCredentials

      if(proofHolder !== null) {
        proofHolder.proofId = payload.proofRecord.id
        proofHolder.state = payload.proofRecord.state
      } 
        
      // agent.proofs.getRequestedCredentialsForProofRequest(
      //   payload.proofRecord.id
      // ).then(getRequestedCredential => {
      //   // console.log('getRequestedCredential',getRequestedCredential.requestedAttributes['name']);
      //   const requestedCredentials = agent.proofs.autoSelectCredentialsForProofRequest(getRequestedCredential)
      //   console.log('requestedCredentials',requestedCredentials);
        

      // })
      
      // const requestedCredentials = agent.proofs.autoSelectCredentialsForProofRequest({getRequestedCredential})
    })


  }

  export const messageListener = (agent: Agent, name: string) => {
    agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async (event: BasicMessageStateChangedEvent) => {
      console.log('TRACKING MESSAGE: ', event.payload.message.content);
      
    })
  }
  