import React, { Dispatch, ReducerAction, Reducer } from 'react'
import './Server.css'

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

    let addClient = () => props.dispatch({ type: 'addClient' })

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

