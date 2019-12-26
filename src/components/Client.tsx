import React, { useState, Dispatch, ReducerAction, Reducer, useEffect } from 'react'
import './Client.css'

import { LeanSyncClient, LeanSyncClientConfig, SyncResponse } from 'leansync'
import { MockClient, MockNetwork, ActionType, SyncRequest } from '../models/MockNetwork'
import { Note, newNote, NotesDatabase } from '../models/Note'
import { ClientNote } from './ClientNote'

export interface ClientProps extends MockClient {
    clientIndex: number
    dispatch: Dispatch<ReducerAction<Reducer<MockNetwork, ActionType>>>
}

export const Client: React.FC<ClientProps> = (props) => {
    let [lastSync, setLastSync] = useState<Date>()
    let [clientNotes, setClientNotes] = useState([] as Array<Note>)


    // TODO: refactor with NotesDatabase?
    // TODO: add client note database & operations
    let getNoteUpdateHandler = (noteIndex: number) => (noteText: string) => {
        let updatedNotes = clientNotes.slice()

        let updatedNote = { ...updatedNotes[noteIndex] }

        updatedNote.text = noteText

        updatedNotes[noteIndex] = updatedNote

        setClientNotes(updatedNotes)
    }

    let noteComponents = clientNotes.map((note, ix) => {
        return <ClientNote key={note.id} noteText={note.text} onChange={getNoteUpdateHandler(ix)} />
    })

    let addNote = () => {
        let updatedNotes = clientNotes.slice()

        updatedNotes.push(newNote(''))

        setClientNotes(updatedNotes)
    }

    let toggleOffline = () => {
        props.dispatch({ type: 'setClientOffline', clientIndex: props.clientIndex, isOffline: !props.isOffline })
    }

    let removeClient = () => {
        props.dispatch({ type: 'removeClient', clientIndex: props.clientIndex })
    }

    let requestSync = () => {
        let clientDb = new NotesDatabase(clientNotes)

        let clientConfig: LeanSyncClientConfig<Note> = {
            keySelector: (note) => note.id,
            getClientEntitiesRequiringSync: clientDb.getRequiringSync.bind(clientDb),
            getClientEntities: clientDb.getByKey.bind(clientDb),
            getLastSyncStamp: async () => lastSync,
            markSyncStamp: async (lastSync) => { setLastSync(lastSync) },
            updateEntity: async (note, syncStamp, originalKey) => { clientDb.update(note, syncStamp, originalKey) },
            createEntity: async (note) => { clientDb.add(note) },

            syncWithServer: async (entities, lastSync) => {
                let request: SyncRequest<Note> = {
                    clientIndex:props.clientIndex, 
                    notes: entities, 
                    lastSync
                }

                props.dispatch({ type: 'requestSync', request })

                let fakeResponse: SyncResponse<Note> = {
                    newEntities: [], 
                    syncedEntities: [],
                    conflictedEntities: [], 
                    syncStamp: new Date()
                }

                return Promise.resolve(fakeResponse)
            },
        }

        let leanClient = new LeanSyncClient(clientConfig)

        leanClient.sync()
            .then(response => {
                // this shouldn't matter
                console.log(response)

            })
            .catch(ex => { throw console.log(ex) })
    }

    if (props.syncResponse) {
        let clientDb = new NotesDatabase(clientNotes)

        let clientConfig: LeanSyncClientConfig<Note> = {
            keySelector: (note) => note.id,
            getClientEntitiesRequiringSync: clientDb.getRequiringSync.bind(clientDb),
            getClientEntities: clientDb.getByKey.bind(clientDb),
            getLastSyncStamp: async () => lastSync,
            markSyncStamp: async (lastSync) => { setLastSync(lastSync) },
            updateEntity: async (note, syncStamp, originalKey) => { clientDb.update(note, syncStamp, originalKey) },
            createEntity: async (note) => { clientDb.add(note) },

            syncWithServer: async (entities, lastSync) => {
                let request: SyncRequest<Note> = {
                    clientIndex:props.clientIndex, 
                    notes: entities, 
                    lastSync
                }

                props.dispatch({ type: 'requestSync', request })

                let fakeResponse: SyncResponse<Note> = {
                    newEntities: [], 
                    syncedEntities: [],
                    conflictedEntities: [], 
                    syncStamp: new Date()
                }

                return Promise.resolve(fakeResponse)
            },
        }

        let leanClient = new LeanSyncClient(clientConfig)

        leanClient.processSyncResponse(props.syncResponse)

        setClientNotes(clientDb.rows)
        setLastSync(props.syncResponse.syncStamp)

        props.dispatch({ type: 'acknowledgeSync', clientIndex: props.clientIndex })
    }

    return (
        <div className='computer client'>
            <div className='computer-header'>
                <h2 className='title is-3'>
                    <a className='remove' title='Remove Client' onClick={removeClient}></a>
                    Client
                </h2>
                <label className='offline checkbox'>
                    <input type='checkbox' onClick={toggleOffline} />
                    Offline
                </label>
            </div>
            <div className='computer-wrapper client-wrapper'>
                <div className='client-notes'>
                    {noteComponents}
                </div>
                <div className='client buttons are-small'>
                    <button title='Add Note' className='new button is-success is-outlined' onClick={addNote}><span /></button>
                    <button title='Sync Notes' className='sync button is-link is-outlined' onClick={requestSync}><span /></button>
                </div>
            </div>
        </div>
    )
}

export default Client
