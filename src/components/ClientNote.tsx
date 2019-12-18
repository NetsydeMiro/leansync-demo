import React from 'react'
import classNames from 'classnames'

export interface ClientNoteProps {
    noteText: string
    hasChanges: boolean
    onChange: (val: string) => void
}

export const ClientNote = (props: ClientNoteProps) => {
    let { hasChanges } = props
    let className = classNames({ hasChanges })

    return (
        <div>
            <textarea
                value={props.noteText}
                onChange={(e) => props.onChange(e.target.value)}
                className={className}
            >
            </textarea>
        </div>
    )
}