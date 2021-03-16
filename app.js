//Modules
const express = require('express')
const morgan = require('morgan')
const config = require('./config.json')
const http = require('http')
const socketio = require('socket.io')
const striptags = require('striptags')


//Globals
const app = express()
const server = http.Server(app)
const io = socketio(server)
const port = config.express.port
const options = {
    root: __dirname + '/views/'
}

let usernames = []

//Midllewares
/*app.use(function (req, res, next) {
    console.log('Time: %d', Date.now())
    console.log(req.path)
    next()
})*/
app.use(express.static(options.root));
app.use(morgan('dev'));


//Routes
app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/home', (req, res) => {
    res.sendFile('index.html', options)
})

app.get('/params/:name', (req, res) => {
    res.send('URL ' + req.params.name)
})


//IO
io.on('connection', (socket) => {
    console.log('IO connection is now established by user ' + socket.id)

    //Set username event
    socket.on('setUsername', (usernameWanted) => {
        usernameWanted = striptags(usernameWanted.trim())

        //Check if username is unique
        let usernameTaken = false
        for (let socketid in usernames) {
            if (usernames[socketid] == usernameWanted) {
                usernameTaken = true
            }
        }

        let timeFakeLoading = 0
        setTimeout(() => {
            //Actions
            if (usernameTaken) {
                socket.emit('rejectUsername', usernameWanted)
            } else {
                socket.join('users')
                usernames[socket.id] = usernameWanted
                let justUsernames = getUsernames()

                socket.emit('acceptUsername', usernameWanted, justUsernames, getSocketIds())
                socket.to('users').emit('newUserConnected', usernameWanted, socket.id, justUsernames)
            }
        }, timeFakeLoading)

    })

    socket.on('sendNewMessage', (message, dataChat) => {
        message = striptags(message.trim())
        if (message != '') {
            //Defines which socket to send the message and chat to show
            let data = getInfoDataChat(dataChat, socket.id)

            socket.to(data.roomToSend).emit('sendingNewMessage', message, usernames[socket.id], data.addContentToChat)
            socket.emit('confirmMessage', message, data.dataChat)
        }
    })

    //Behavior on typing
    socket.on('startWriting', (dataChat) => {
        let data = getInfoDataChat(dataChat, socket.id)

        socket.to(data.roomToSend).emit('userStartWriting', usernames[socket.id], data.addContentToChat)
    })
    socket.on('stopWriting', (dataChat) => {
        let data = getInfoDataChat(dataChat, socket.id)
        socket.to(data.roomToSend).emit('userStopWriting', data.addContentToChat)
    })

    //Log out event
    socket.on('disconnect', () => {
        console.log('disconnection from user ' + usernames[socket.id] + ' with ID: ' + socket.id)
        if (usernames[socket.id]) {
            let oldUsername = usernames[socket.id]
            delete usernames[socket.id]
            socket.to('users').emit('leftSessionUser', getUsernames(), oldUsername, socket.id)
        }
    })
})

//Starts the App
server.listen(port, () => {
    console.log('Connected to App ! On Port: ' + port)
})


//Send array with usernames without indexes
function getUsernames() {
    let users = []
    for (let socketid in usernames) {
        users.push(usernames[socketid])
    }
    return users
}

//Send array with socketIDs
function getSocketIds() {
    let socketIDs = []
    for (let socketid in usernames) {
        socketIDs.push(socketid)
    }
    return socketIDs
}

//Sends all info from dataChat
function getInfoDataChat(dataChat, socketID) {
    dataChat = dataChat == null ? 'person0' : dataChat

    return {
        roomToSend: dataChat == 'person0' ? 'users' : dataChat,
        addContentToChat: dataChat == 'person0' ? dataChat : socketID,
        dataChat: dataChat
    }
}