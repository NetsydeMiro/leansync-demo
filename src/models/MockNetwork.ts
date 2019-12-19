import { Note, NotesDatabase, newNote } from './Note'
import { BasicConflictResolutionStrategy, LeanSyncServer, LeanSyncServerConfig } from 'leansync'
import { LeanSyncClient, LeanSyncClientConfig } from 'leansync'
import { assertNever } from '../utility'

export interface MockServer {
    notes:  Array<Note>
    resolutionStrategy: BasicConflictResolutionStrategy
}

export interface MockClient {
    notes: Array<Note>
    lastSync?: Date
    isOffline?: boolean
}

export interface SyncRequest {
    clientIndex: number
    clientNotes: Array<Note>
}

export interface SyncResult {
    clientNotes: Array<Note>
    serverNotes: Array<Note>
}

export interface MockNetwork {
    server: MockServer
    clients: Array<MockClient>
    syncRequest?: SyncRequest
}

export const initialNetwork: MockNetwork = {
    server: { notes: [], resolutionStrategy: 'takeClient' },
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
    nw.clients.push({ notes: [] })

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

interface RequestSyncAction {
    type: 'requestSync'
    clientIndex: number
    clientNotes: Array<Note>
}

function requestSync(network: MockNetwork, clientIndex: number, clientNotes: Array<Note>): MockNetwork {
    let nw = { ...network }

    let syncRequest: SyncRequest = {
        clientIndex, 
        clientNotes
    }

    nw.syncRequest = syncRequest

    return nw
}

interface ProcessSyncAction {
    type: 'processSync'
    clientIndex: number
    clientNotes: Array<Note>
    serverNotes: Array<Note>
    syncStamp: Date
}

function processSync(network: MockNetwork, clientIndex: number, clientNotes: Array<Note>, serverNotes: Array<Note>, syncStamp: Date): MockNetwork {
    let nw = { ...network }

    let server = { ...nw.server }
    server.notes = serverNotes

    let clients = nw.clients.slice()
    let updatedClient = { ...clients[clientIndex] }

    updatedClient.notes = clientNotes
    updatedClient.lastSync = syncStamp
    clients[clientIndex] = updatedClient

    nw.clients = clients
    nw.server = server

    delete nw.syncRequest

    return nw
}

export type ActionType = 
    SetResolutionStrategyAction | 
    AddClientAction | 
    RemoveClientAction | 
    SetClientOfflineAction | 
    RequestSyncAction | 
    ProcessSyncAction 

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
            modifiedNetwork = requestSync(network, action.clientIndex, action.clientNotes) 
            break
        case 'processSync': 
            modifiedNetwork = processSync(network, action.clientIndex, action.clientNotes, action.serverNotes, action.syncStamp) 
            break
        default: assertNever(action)
    }

    return modifiedNetwork
}

export async function doSync(network: MockNetwork, clientIndex: number, clientNotes: Array<Note>): Promise<ProcessSyncAction> {
    let serverDb = new NotesDatabase(network.server.notes)
    let clientDb = new NotesDatabase(clientNotes)

    let serverConfig: LeanSyncServerConfig<Note> = {
        entityKey: (note) => note.id,
        entityLastUpdated: (note) => note.updatedAt, 
        areEntitiesEqual: (note1, note2) => note1.text == note2.text, 
        getServerEntities: serverDb.getByKey.bind(serverDb), 
        getServerEntitiesSyncedSince: serverDb.getSyncedSince.bind(serverDb), 
        updateServerEntity: serverDb.update.bind(serverDb), 
        createServerEntity: serverDb.add.bind(serverDb), 
        conflictResolutionStrategy: network.server.resolutionStrategy
    }

    let leanServer = new LeanSyncServer(serverConfig)

    let client = network.clients[clientIndex]

    // we'll record the sync stamp here
    let syncStamp = new Date()

    let clientConfig: LeanSyncClientConfig<Note> = {
        keySelector: (note) => note.id,
        getClientEntitiesRequiringSync: clientDb.getRequiringSync.bind(clientDb),
        getClientEntities: clientDb.getByKey.bind(clientDb),
        getLastSyncStamp: async () => client.lastSync,
        markSyncStamp: async (lastSync) => { syncStamp = lastSync },
        updateEntity: async (note, syncStamp, originalKey) => { clientDb.update(note, syncStamp, originalKey) },
        createEntity: async (note) => { clientDb.add(note) },
        syncWithServer: async (entities, lastSync) => {
            return leanServer.sync(entities, lastSync)
        },
    }

    let leanClient = new LeanSyncClient(clientConfig)

    await leanClient.sync()

    let action: ProcessSyncAction = {
        type: "processSync", 
        clientIndex, 
        serverNotes: serverDb.rows, 
        clientNotes: clientDb.rows, 
        syncStamp
    }

    return action
}
