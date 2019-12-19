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

    return (
        <div>
            <div className='computers'>
                <Server notes={mockNetwork.server.notes} resolutionStrategy={mockNetwork.server.resolutionStrategy} dispatch={dispatch} />
                {clients}
            </div>
        </div>
    )
}

export default Network