import React from 'react'

export interface ServerNoteProps {
    noteText: string
}

export const ServerNote = (props: ServerNoteProps) => {
    return <div>{props.noteText}</div>
}