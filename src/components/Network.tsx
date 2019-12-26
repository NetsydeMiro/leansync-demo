import React, { useReducer, useEffect } from 'react'
import './Network.css'

import { Server } from './Server'
import { Client } from './Client'

import { mockNetworkReducer, initialNetwork } from '../models/MockNetwork'


export const Network = () => {

    const [mockNetwork, dispatch] = useReducer(mockNetworkReducer, initialNetwork)

    let clients = mockNetwork.clients.map((client, ix) => {
        return <Client key={ix} clientIndex={ix} isOffline={client.isOffline} dispatch={dispatch} />
    })

    return (
        <div>
            <div className='computers'>
                <Server resolutionStrategy={mockNetwork.server.resolutionStrategy} syncRequest={mockNetwork.server.syncRequest} dispatch={dispatch} />
                {clients}
            </div>
        </div>
    )
}

export default Network
