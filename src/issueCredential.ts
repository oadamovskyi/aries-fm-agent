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
  } from '@aries-framework/core'
  import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
  import { Schema } from 'indy-sdk'
  import fetch from 'node-fetch'
  
  const getGenesisTransaction = async (url: string) => {
    const response = await fetch(url)
  
    return await response.text()
  }
  
  const initializeHolderAgent = async (name: string) => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config: InitConfig = {
      label: name,
      walletConfig: {
        id: name,
        key: '1234567',
      },
      publicDidSeed: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      indyLedgers: [
        {
          id: 'bcovrin-test-net',
          isProduction: false,
          genesisTransactions: genesisTransactionsBCovrinTestNet,
        },
      ],
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: ['http://localhost:3002'],
    }
  
    // A new instance of an agent is created here
    const agent = new Agent(config, agentDependencies)
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))
  
    // Initialize the agent
    await agent.initialize()
  
    return agent
  }
  
  const initializeIssuerAgent = async (name: string) => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const config: InitConfig = {
      label: name,
      walletConfig: {
        id: name,
        key: '1234567',
      },
      publicDidSeed: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      indyLedgers: [
        {
          id: 'bcovrin-test-net',
          isProduction: false,
          genesisTransactions: genesisTransactionsBCovrinTestNet,
        },
      ],
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      autoAcceptConnections: true,
      endpoints: ['http://localhost:3001'],
    }
  
    // A new instance of an agent is created here
    const agent = new Agent(config, agentDependencies)
  
    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())
  
    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())
  
    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))
  
    // Initialize the agent
    await agent.initialize()
  
    return agent
  }
  
  const registerSchema = async (issuer: Agent) =>
    issuer.ledger.registerSchema({ attributes: ['name', 'age'], name: 'Identity1', version: '1.1' })
  
  const registerCredentialDefinition = async (issuer: Agent, schema: Schema) =>
    issuer.ledger.registerCredentialDefinition({ schema, supportRevocation: false, tag: 'default' })
  
  const setupCredentialListener = (holder: Agent, issuer: Agent) => {
    holder.events.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {

      switch (payload.credentialRecord.state) {
        case CredentialState.OfferReceived:

          console.log('received a credential')
          // custom logic here
          issuer.credentials.getAll().then(res => {
            console.log('THE ISSUER CREDENTIALS OfferReceived',res);
            
          }).catch(err => {
            console.log('ERROR',err);
            
          })

          holder.credentials.getAll().then(res => {
            console.log('THE HOLDER CREDENTIALS OfferReceived',res);
            
          }).catch(err => {
            console.log('ERROR',err);
            
          })

          await holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
        case CredentialState.Done:

            issuer.credentials.getAll().then(res => {
                console.log('THE ISSUER CREDENTIALS Done',res);
                
              }).catch(err => {
                console.log('ERROR',err);
                
              })
    
              holder.credentials.getAll().then(res => {
                console.log('THE HOLDER CREDENTIALS Done',res);
                
              }).catch(err => {
                console.log('ERROR',err);
                
              })
    
          console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
          // For demo purposes we exit the program here.
          process.exit(0)
      }
    })
  }
  
  const issueCredential = async (issuer: Agent, credentialDefinitionId: string, connectionId: string) =>
    issuer.credentials.offerCredential({
      protocolVersion: 'v1',
      connectionId,
      credentialFormats: {
        indy: {
          credentialDefinitionId,
          attributes: [
            { name: 'name', value: 'Jane Doe' },
            { name: 'age', value: '23' },
          ],
        },
      },
    })
  
  const createNewInvitation = async (issuer: Agent) => {
    const outOfBandRecord = await issuer.oob.createInvitation()
    
  
    return {
      invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
      outOfBandRecord,
    }
  }
  
  const receiveInvitation = async (holder: Agent, invitationUrl: string) => {
    const { outOfBandRecord } = await holder.oob.receiveInvitationFromUrl(invitationUrl)
  
    return outOfBandRecord
  }
  
  const setupConnectionListener = (
    issuer: Agent,
    outOfBandRecord: OutOfBandRecord,
    cb: (...args: any) => Promise<unknown>
  ) => {
    issuer.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
      if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
      if (payload.connectionRecord.state === DidExchangeState.Completed) {
        // the connection is now ready for usage in other protocols!
        console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)
  
        // Custom business logic can be included here
        // In this example we can send a basic message to the connection, but
        // anything is possible
        await cb(payload.connectionRecord.id)
      }
    })
  }
  
  const flow = (issuer: Agent) => async (connectionId: string) => {
    console.log('Registering the schema...')
    const schema = await registerSchema(issuer)
    console.log('Registering the credential definition...')
    const credentialDefinition = await registerCredentialDefinition(issuer, schema)
    console.log('Issuing the credential...')
    await issueCredential(issuer, credentialDefinition.id, connectionId)
  }
  
  const testCredentialStates = async(holder: Agent, issuer: Agent) => {
    const credential = await holder.credentials.findById('be9eacb5-df57-45c3-8d60-fa141d4ea248');
    // const credentialAcceptOffer = await issuer.credentials.acceptRequest({credentialRecordId: 'be9eacb5-df57-45c3-8d60-fa141d4ea248'});
    // const credential = await issuer.credentials.getById('be9eacb5-df57-45c3-8d60-fa141d4ea248');
    // const credentialAcceptCredential = await issuer.credentials.acceptCredential({credentialRecordId: credential.id});

    console.log('THIS IS CREDENTIAL: ', credential);
    // console.log('THIS IS CREDENTIAL_ACCEPT_OFFER: ', credentialAcceptOffer);
    // console.log('THIS IS CREDENTIAL_ACCEPT_CREDENTIAL: ', credentialAcceptCredential);
    
  }

  const run = async () => {
    console.log('Initializing the holder...')
    const holder = await initializeHolderAgent('test-holder')

    console.log('Initializing the issuer...')
     const issuer = await initializeIssuerAgent('test-issuer')

    console.log('Initializing the credential listener...')
    setupCredentialListener(holder,issuer)
  
    console.log('Initializing the connection...')
    const { outOfBandRecord, invitationUrl } = await createNewInvitation(issuer)
    setupConnectionListener(issuer, outOfBandRecord, flow(issuer))
    await receiveInvitation(holder, invitationUrl)
  }
  
  void run()
  