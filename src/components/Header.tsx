import React from 'react'

import githubMark from './GitHub-Mark-32px.png'
import './Header.css'

export const Header = () => (
    <header>
        <div>
            <h1 className='title is-1'>LeanSync Demo (Alpha)</h1>
        </div>
        <div>
            <a href='https://github.com/NetsydeMiro/leansync'>
                <img src={githubMark} className="App-logo" alt="logo" />
                LeanSync Algorithm Repo
            </a>
            <br />
            <a href='https://github.com/NetsydeMiro/leansync-demo'>
                <img src={githubMark} className="App-logo" alt="logo" />
                LeanSync Demo Repo
            </a>
        </div>
    </header>
)