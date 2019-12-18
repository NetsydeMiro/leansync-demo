import React, { useState, Dispatch, ReducerAction, Reducer } from 'react'
import './Client.css'

import { MockClient, MockNetwork, ActionType } from '../models/MockNetwork'
import { Note, newNote } from '../models/Note'
import { ClientNote } from './ClientNote'

export interface ClientProps extends MockClient {
    clientIndex: number
    dispatch: Dispatch<ReducerAction<Reducer<MockNetwork, ActionType>>>
}

export const Client: React.FC<ClientProps> = (props) => {
    let [clientNotes, setNotes] = useState(props.notes)

    // TODO: refactor with NotesDatabase?
    // TODO: add client note database & operations
    let getNoteUpdateHandler = (noteIndex: number) => (noteText: string) => {
        let updatedNotes = clientNotes.slice()

        let updatedNote = { ...updatedNotes[noteIndex] }

        updatedNote.text = noteText

        updatedNotes[noteIndex] = updatedNote

        setNotes(updatedNotes)
    }

    let noteComponents = clientNotes.map((note, ix) => {
        let originalNote = (props.notes.length > ix) && props.notes[ix]
        let hasChanges = !originalNote || note.text != originalNote.text
        return <ClientNote key={note.id} noteText={note.text} hasChanges={hasChanges} onChange={getNoteUpdateHandler(ix)} />
    })

    let addNote = () => {
        let updatedNotes = clientNotes.slice()

        updatedNotes.push(newNote(''))

        setNotes(updatedNotes)
    }

    let toggleOffline = () => {
        props.dispatch({ type: 'setClientOffline', clientIndex: props.clientIndex, isOffline: !props.isOffline })
    }

    let removeClient = () => {
        props.dispatch({ type: 'removeClient', clientIndex: props.clientIndex })
    }

    let requestSync = () => {
        props.dispatch({ type: 'requestSync', clientIndex: props.clientIndex, clientNotes })
    }

    return (
        <div>
            <h2>Client {props.clientIndex}</h2>
            <button onClick={removeClient}>Remove</button>
            <br />
            <label>
                <input type='checkbox' onClick={toggleOffline} />
                Is Offline
            </label>
            <br />
            {noteComponents}
            <button onClick={addNote}>New</button>
            <button onClick={requestSync}>Sync</button>
        </div>
    )
}

export default Client
