import { createServer } from "node:http";
import next from 'next'
import {Server} from "socket.io"

const dev = true
const hostname = 'localhost'
const port = 3001

const app = next({dev, hostname, port})
const handler = app.getRequestHandler()

// room per user, buat notif
const rooms = []

app.prepare().then(() => {
   const httpServer = createServer(handler)

   const io = new Server(httpServer)

   io.on('connection', (socket) => {
      console.log('A user has connected')


      socket.on('join', (room) => {
         if(!rooms.includes(room))rooms.push(room)
         socket.join(room)
         console.log(`Created room: ${room}`)
         console.log(`Current rooms: ${rooms}`)
      })


      socket.on('send-msg', ({msg, user}) => {
         console.log({msg})
         io.except(user).emit('notify', {user, msg})
      })
   })

   httpServer.once('error', (err) => {
      console.error(err)
      process.exit(1)
   })
   .listen(port, () => {
      console.log(`Ready on http://${hostname}:${port}`)
   })
})