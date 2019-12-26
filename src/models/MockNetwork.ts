import { Note, NotesDatabase, newNote } from './Note'
import { BasicConflictResolutionStrategy, LeanSyncServer, LeanSyncServerConfig, SyncResponse } from 'leansync'
import { LeanSyncClient, LeanSyncClientConfig } from 'leansync'
import { assertNever } from '../utility'

export interface SyncRequest<T> {
    clientIndex: number
    notes: Array<T>
    lastSync?: Date
}

export interface MockServer {
    resolutionStrategy: BasicConflictResolutionStrategy
    syncRequest?: SyncRequest<Note>
}

export interface MockClient {
    isOffline?: boolean
    syncResponse?: SyncResponse<Note>
}

export interface MockNetwork {
    server: MockServer
    clients: Array<MockClient>
}

export const initialNetwork: MockNetwork = {
    server: { resolutionStrategy: 'takeClient' },
    clients: [],
}

interface SetResolutionStrategyAction {
    type: 'setResolutionStrategy'
    strategy: BasicConflictResolutionStrategy
}

function setResolutionStrategy(network: MockNetwork, resolutionStrategy: BasicConflictResolutionStrategy): MockNetwork {
    let nw = { ...network }

    nw.server = { ...network.server, resolutionStrategy }

    return nw
}

interface AddClientAction {
    type: 'addClient'
}

function addClient(network: MockNetwork): MockNetwork {
    let nw = { ...network }

    nw.clients = network.clients.slice()
    nw.clients.push({})

    return nw
}

interface RemoveClientAction {
    type: 'removeClient'
    clientIndex: number
}

function removeClient(network: MockNetwork, clientIndex: number): MockNetwork {
    let nw = { ...network }

    nw.clients = network.clients.slice()
    nw.clients.splice(clientIndex, 1)

    return nw
}

interface SetClientOfflineAction {
    type: 'setClientOffline'
    clientIndex: number
    isOffline: boolean
}

function setClientOffline(network: MockNetwork, clientIndex: number, isOffline: boolean): MockNetwork {
    let nw = { ...network }

    nw.clients = network.clients.slice()
    nw.clients[clientIndex] = { ...network.clients[clientIndex], isOffline }

    return nw
}

interface RequestSyncAction  {
    type: 'requestSync'
    request: SyncRequest<Note>
}

function requestSync(network: MockNetwork, syncRequest: SyncRequest<Note>): MockNetwork {
    let nw = { ...network }

    let server = { ...nw.server }
    server.syncRequest = syncRequest

    nw.server = server

    return nw
}

interface RespondSyncAction {
    type: 'respondSync'
    response: SyncResponse<Note>
}

export function respondSync(network: MockNetwork, syncResponse: SyncResponse<Note>): MockNetwork {
    // this shouldn't happen, but does.  TODO: investigate double rendering
    if (!network.server.syncRequest) return network 

    let nw = { ...network }

    let clientIndex = nw.server.syncRequest!.clientIndex

    let server = { ...nw.server }
    delete server.syncRequest
    nw.server = server

    nw.clients = nw.clients.slice()
    let client = { ...nw.clients[clientIndex] }
    client.syncResponse = syncResponse

    nw.clients[clientIndex] = client

    return nw
}

export interface AcknowledgeSyncAction {
    type: 'acknowledgeSync'
    clientIndex: number
}

export function acknowledgeSync(network: MockNetwork, clientIndex: number): MockNetwork {
    let nw = { ...network }

    nw.clients = nw.clients.slice()
    let client = { ...nw.clients[clientIndex] }
    delete client.syncResponse

    nw.clients[clientIndex] = client

    return nw
}

export type ActionType = 
    SetResolutionStrategyAction | 
    AddClientAction | 
    RemoveClientAction | 
    SetClientOfflineAction | 
    RequestSyncAction | 
    RespondSyncAction |
    AcknowledgeSyncAction

export function mockNetworkReducer(network: MockNetwork, action: ActionType ): MockNetwork {
    let modifiedNetwork: MockNetwork

    switch(action.type) {
        case 'setResolutionStrategy': 
            modifiedNetwork = setResolutionStrategy(network, action.strategy) 
            break
        case 'addClient': 
            modifiedNetwork = addClient(network) 
            break
        case 'removeClient': 
            modifiedNetwork = removeClient(network, action.clientIndex) 
            break
        case 'setClientOffline': 
            modifiedNetwork = setClientOffline(network, action.clientIndex, action.isOffline) 
            break
        case 'requestSync': 
            modifiedNetwork = requestSync(network, action.request) 
            break
        case 'respondSync': 
            modifiedNetwork = respondSync(network, action.response)
            break
        case 'acknowledgeSync': 
            modifiedNetwork = acknowledgeSync(network, action.clientIndex)
            break
        default: assertNever(action)
    }

    return modifiedNetwork
}
