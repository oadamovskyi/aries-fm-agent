
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
    autoAcceptCredentials: AutoAcceptCredential.Always,
    autoAcceptProofs: AutoAcceptProof.Always,
    autoAcceptConnections: true,
    endpoints: ['https://api.portal.streetcred.id'],
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