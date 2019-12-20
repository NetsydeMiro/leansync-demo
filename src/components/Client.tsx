import React, { useState, Dispatch, ReducerAction, Reducer, useEffect } from 'react'
import './Client.css'

import { MockClient, MockNetwork, ActionType } from '../models/MockNetwork'
import { Note, newNote, NotesDatabase } from '../models/Note'
import { ClientNote } from './ClientNote'

export interface ClientProps extends MockClient {
    clientIndex: number
    dispatch: Dispatch<ReducerAction<Reducer<MockNetwork, ActionType>>>
}

export const Client: React.FC<ClientProps> = (props) => {
    let [clientNotes, setNotes] = useState(props.notes)

    useEffect(() => {
        // update component state if props notes have changed (this would be due to a sync that occurred)
        setNotes(props.notes)
    }, [props.notes])

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

    let requestSync = async () => {
        let db = new NotesDatabase(clientNotes)
        let requiringSync = await db.getRequiringSync()
        props.dispatch({ type: 'requestSync', clientIndex: props.clientIndex, clientNotes: requiringSync })
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
                    <button title='Add Note' className='new button is-success is-outlined' onClick={addNote}><span/></button>
                    <button title='Sync Notes' className='sync button is-link is-outlined' onClick={requestSync}><span/></button>
                </div>
            </div>
        </div>
    )
}

export default Client
