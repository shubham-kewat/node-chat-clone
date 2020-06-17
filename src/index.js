let express = require('express')//we will refactor the code to ues socket io in a proper way bacause sometime we require to use express and socket io application server
const {generateMessage,locationMessage} = require('./utils/messages' )
const http = require('http')
const socketIo = require('socket.io') 
let path = require('path')
const Filter = require('bad-words')

const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/user')

let app = express()
const server = http.createServer(app)
const io = socketIo(server) 


const port =3000||process.env.PORT

let indexPath  = path.join(__dirname,'../public')
app.use(express.static(indexPath))

let count = 0
io.on('connection',(socket)=>{
    //challange    
    let useUser=''
    socket.on('join',({userName,room},callback)=>{
        let {error, user }= addUser({id:socket.id,userName,room})
        useUser = user
        if(error){
            return callback(error)
        }
        socket.join(user.room)//allows  a given chat room and 
        socket.emit('message',generateMessage('Admin','welcome!'))
        
        socket.broadcast.to(room).emit('message',generateMessage(`${user.userName} has joined`))//this will help to send message to all except this one that a new user has connected
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback()
        //socket.to.emit,socket.broadcast.to.emit,these methodw will send messages to the specific chat room
    })    

    socket.on('message',(message,callback)=>{
        const user = getUser(socket.id)
        console.log(user)
        let filter = new Filter()        
        if(filter.isProfane(message)){
            return callback('profinity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.userName,message))//using this when ever a message is comes then it will display to  all the users
        callback()
    })

    socket.on('location',(cords,callback)=>{
        // //console.log(cords)
        let user = getUser(socket.id)
        io.to(user.room).emit('location-message',locationMessage(user.userName,`https://google.com/maps?q=${cords.latitude},${cords.longitude}`))
        callback("location sent")
    })

    socket.on('disconnect',()=>{//whenever the client disconnect this code will run
        let user = removeUser(socket.id)
        if(user){   
            io.to(useUser.room).emit('message',generateMessage( `${useUser.userName} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
            
        }
    })
    // //console.log('new websocket connection established')
    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //     // socket.emit('countUpdated',count)//but using it here is not updating for all the user see by opening the two browsers and console of both the browsers so to implement such that all the client get notify simultaneously we have a second option given below
    //     io.emit('countUpdated',count)
    // })
})

app.get('/',(req,res)=>{
    res.send('hellow world')
})

server.listen(3000,()=>{
    console.log('server is listening on port '+port)
})

