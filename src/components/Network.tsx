import React, { useReducer, useEffect } from 'react'
import './Network.css'

import { Server } from './Server'
import { Client } from './Client'

import { mockNetworkReducer, initialNetwork, doSync } from '../models/MockNetwork'


export const Network = () => {

    const [mockNetwork, dispatch] = useReducer(mockNetworkReducer, initialNetwork)

    useEffect(() => {
        if (!!mockNetwork.syncRequest) {
            doSync(mockNetwork, mockNetwork.syncRequest.clientIndex, mockNetwork.syncRequest.clientNotes)
                .then(processSyncAction => dispatch(processSyncAction))
                .catch(e => { throw e })
        }
    })

    let clients = mockNetwork.clients.map((client, ix) => {
        return <Client key={ix} clientIndex={ix} notes={client.notes} dispatch={dispatch} />
    })

    let addClient = () => dispatch({ type: 'addClient' })

    return (
        <div>
            <div>
                <Server notes={mockNetwork.server.notes} resolutionStrategy={mockNetwork.server.resolutionStrategy} dispatch={dispatch} />
            </div>
            <div>
                {clients}
            </div>
            <button onClick={addClient}>Add Client</button>
        </div>
    )
}

export default Network
