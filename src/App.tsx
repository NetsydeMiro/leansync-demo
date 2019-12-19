import React from 'react'
import 'bulma/css/bulma.css'
import './App.css'

import { Header } from './components/Header'

import { Network } from './components/Network'

const App = () => {
  return (
    <div className="App">
        <Header />
        <Network />
    </div>
  )
}

export default App
