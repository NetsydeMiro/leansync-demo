import React, { useState, Dispatch, ReducerAction, Reducer } from 'react'
import './Client.css'

import { MockServer, MockNetwork, ActionType } from '../models/MockNetwork'
import { BASIC_CONFLICT_RESOLUTION_STRATEGIES, BasicConflictResolutionStrategy } from 'leansync'
import { ServerNote } from './ServerNote'

export interface ServerProps extends MockServer {
    dispatch: Dispatch<ReducerAction<Reducer<MockNetwork, ActionType>>>
}

export const Server: React.FC<ServerProps> = (props) => {

    let noteComponents = props.notes.map((note, ix) => {
        return <ServerNote key={ix} noteText={note.text} />
    })

    let strategyOptions = BASIC_CONFLICT_RESOLUTION_STRATEGIES.map(strategy => <option value={strategy}>{strategy}</option>)

    let changeStrategyHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.dispatch({ type: 'setResolutionStrategy', strategy: e.target.value as BasicConflictResolutionStrategy })
    }

    return (
        <div>
            <h2>Server</h2>
            <label>
                Conflict Resolution Strategy
                <select onChange={changeStrategyHandler}>
                    {strategyOptions}
                </select>
            </label>
            <br />
            {noteComponents}
        </div>
    )
}

export default Server 

