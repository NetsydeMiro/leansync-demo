import React, { Dispatch, ReducerAction, Reducer, useState, useEffect } from 'react'
import './Server.css'

import { LeanSyncServer, LeanSyncServerConfig } from 'leansync'
import { Note, NotesDatabase } from '../models/Note'
import { MockServer, MockNetwork, ActionType } from '../models/MockNetwork'
import { BASIC_CONFLICT_RESOLUTION_STRATEGIES, BasicConflictResolutionStrategy, SyncResponse } from 'leansync'
import { ServerNote } from './ServerNote'

export interface ServerProps extends MockServer {
    dispatch: Dispatch<ReducerAction<Reducer<MockNetwork, ActionType>>>
}

export const Server: React.FC<ServerProps> = (props) => {
    let [serverNotes, setServerNotes] = useState([] as Array<Note>)

    let noteComponents = serverNotes.map((note, ix) => {
        return <ServerNote key={ix} noteText={note.text} />
    })

    let strategyOptions = BASIC_CONFLICT_RESOLUTION_STRATEGIES.map(strategy => <option value={strategy}>{strategy}</option>)

    let changeStrategyHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.dispatch({ type: 'setResolutionStrategy', strategy: e.target.value as BasicConflictResolutionStrategy })
    }

    let addClient = () => props.dispatch({ type: 'addClient' })

    useEffect(() => {

        if (props.syncRequest) {
            let serverDb = new NotesDatabase(serverNotes)

            let serverConfig: LeanSyncServerConfig<Note> = {
                entityKey: (note) => note.id,
                entityLastUpdated: (note) => note.updatedAt,
                areEntitiesEqual: (note1, note2) => note1.text == note2.text,
                getServerEntities: serverDb.getByKey.bind(serverDb),
                getServerEntitiesSyncedSince: serverDb.getSyncedSince.bind(serverDb),
                updateServerEntity: serverDb.update.bind(serverDb),
                createServerEntity: serverDb.add.bind(serverDb),
                conflictResolutionStrategy: props.resolutionStrategy
            }

            let leanServer = new LeanSyncServer(serverConfig)

            leanServer.sync(props.syncRequest.notes, props.syncRequest.lastSync)
                .then(response => {
                    setServerNotes(serverDb.rows)
                    props.dispatch({ type: 'respondSync', response })
                })
                .catch(ex => { throw ex })
        }

    }, [props.syncRequest])

    return (
        <div className='computer server'>
            <div className='computer-header'>
                <h3 className='title is-3'>Server</h3>
                <button className='button' onClick={addClient}>Add Client</button>
            </div>

            <div className='computer-wrapper server-wrapper'>
                <div className='server-notes'>
                    {noteComponents}
                </div>

                <div id='resolution-strategy'>
                    <label>
                        Conflict Resolution Strategy <br />
                        <div className='select'>
                            <select onChange={changeStrategyHandler}>
                                {strategyOptions}
                            </select>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Server

