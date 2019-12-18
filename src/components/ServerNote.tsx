import React from 'react'

export interface ServerNoteProps {
    noteText: string
}

export const ServerNote = (props: ServerNoteProps) => {
    return <div className='server-note'>{props.noteText}</div>
}