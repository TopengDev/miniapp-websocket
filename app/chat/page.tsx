'use client'

import { useEffect, useRef, useState } from "react"
import {socket} from '../socket'

export default function Page(){

   const [currentUser, setCurrentUser] = useState<string>('')
   const [userLocked, setUserLocked] = useState<boolean>(false)

   const [isConnected, setIsConnected] = useState<boolean>(false)
   const [transport, setTransport] = useState<any>('N/A')

   useEffect(() => {

      if(socket.connected){
         onConnect()
      }

      function onConnect(){
         setIsConnected(true)
         setTransport(socket.io.engine.transport.name)

         socket.io.engine.on('upgrade', (transport) => {
            setTransport(transport.name)
         })
      }

      function onDisconnect(){
         setIsConnected(false)
         setTransport('N/A')
      }

      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)

      

      return () => {
         socket.off('connect', onConnect)
         socket.off('disconnect', onDisconnect)
      }
   },[])


   const [textInput, setTextInput] = useState<string>('')

   const [messages, setMessages] = useState<{msg: string, user: string}[]>([])

   function sendMsg(){
      if(textInput){
         socket.emit('send-msg', {user: currentUser,msg: textInput,})
         setMessages([...messages, {msg:textInput, user:currentUser}])
         setTextInput('')
      }
   }

   socket.on('notify',({msg, user}) => {
      setMessages([...messages, {msg, user}])
      console.log({msg})
      alert(`${user}: ${msg}`)
   })

   return (
      <main style={{width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
         <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>

         {/* STATUS INFO */}
         <div style={{padding: '4rem', border: '2px solid black', borderRadius: '5%'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
               <p>Status: </p>
               <p style={{color: isConnected ? 'green' : 'red'}}>{isConnected ? 'Connected' : 'disconnected'}</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
               <p>Transport: </p>
               <p style={{color: 'blue'}}>{transport}</p>
            </div>
         </div>
         {/* CHAT BOX */}
         <div style={{padding: '4rem', border: '2px solid black', borderRadius: '5%'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
               {messages.map((m, i) => (
                  <div key={`msg-${i}`} style={{padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                     <p>{m.user}:</p>
                     <p>{m.msg}</p>
                  </div>
               ))}
            </div>
         </div>
         {/* CURRENT USER INPUT */}

         <div style={{padding: '4rem', border: '2px solid black', borderRadius: '5%'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>

               <label htmlFor="text-input">Username:</label>
               {currentUser}
               </div>
               <div style={{display: 'flex', alignItems: 'center', gap:'0.25rem' }}>
                  {
                     !userLocked && (
                        <input id="text-input" type="text" value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} />
                     )
                  }
               <button type="button" onClick={() => {
                  socket.emit(`join`, currentUser)
                  setUserLocked(!userLocked)}}>
                  {
                     !userLocked ? 'Set User' : 'Modify User'
                  }
               </button>
               </div>
            </div>
         </div>
         {/* CHAT INPUT */}
         <div style={{padding: '4rem', border: '2px solid black', borderRadius: '5%'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
               <label htmlFor="text-input">Input Message</label>
               <div style={{display: 'flex', alignItems: 'center', gap:'0.25rem' }}>
               <input id="text-input" type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
               <button type="button" onClick={sendMsg}>Send</button>
               </div>
            </div>
         </div>
         </div>
      </main>
   )
}