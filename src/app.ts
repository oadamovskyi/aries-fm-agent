
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
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import fetch from 'node-fetch'


const getGenesisTransaction = async (url: string) => {
  const response = await fetch(url)
  return await response.text()
}

export const getAgent = async (label: string, port: 3001) => {
  const genesisTransaction = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
  // Simple agent configuration. This sets some basic fields like the wallet
  // configuration and the label.

  const config: InitConfig = {
    logger: new ConsoleLogger(LogLevel.trace),
    label: 'demo-agent-issuer',
    walletConfig: {
      id: 'demo-agent-issuer',
      key: '00000000000000000000000000000000',
    },
    publicDidSeed: 'abcabcabc12345678912332132345433',
    indyLedgers: [
      {
        id: 'bcovrin-test-net',
        isProduction: false,
        genesisTransactions: genesisTransaction,
      },
    ],
    autoAcceptCredentials: AutoAcceptCredential.Always,
    autoAcceptProofs: AutoAcceptProof.Always,
    autoAcceptConnections: true,
    endpoints: ['http://1c7b-194-44-135-134.ngrok.io'],
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
  await agent.initialize().catch((e) => console.error(e))

  return agent
}