import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chat from './components/Chat'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto py-4 px-4 flex items-center">
          <div className="mr-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AI Therapist
            </h1>
            <p className="text-sm text-gray-500">Your personal mental health companion</p>
          </div>
        </div>
      </header>
      <main className="pt-20">
        <Chat />
      </main>
    </div>
  )
}

export default App
