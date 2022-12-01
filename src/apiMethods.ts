import { Agent } from "@aries-framework/core"
import { Schema } from "indy-sdk"
import {ISchemaResponse} from "./responess/responseWrapper"

export const getSchema = async(agent: Agent, id: string) => {
    return await agent.ledger.getSchema(id)
}

export const getCredentialDefinition = async(agent: Agent, id: string) => {
    return await agent.ledger.getCredentialDefinition(id)
}

export const createCredentnialDefinition = async (agent: Agent, schema: Schema) => {
    return await agent.ledger.registerCredentialDefinition({
        schema,
        supportRevocation: false,
        tag: "default"
    })
}

export const createSchema = async (agent: Agent, attributes:string[], version: string, name: string) => {

    return await agent.ledger.registerSchema({
        attributes,
        version,
        name
    })

}

export const createCredentialOffer = async(agent: Agent, credentialDefinitionId: string, attributes: []) => {
    return await agent.credentials.createOffer({
                protocolVersion: "v1",
                credentialFormats: {
                    indy: {
                        credentialDefinitionId,
                        attributes
                    }
                }
            })
}