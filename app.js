//Modules
const express = require('express')
const morgan = require('morgan')
const config = require('./config.json')
const http = require('http')
const socketio = require('socket.io')


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
        usernameWanted = usernameWanted.trim()

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
                socket.emit('acceptUsername', usernameWanted, justUsernames)
                socket.to('users').emit('newUserConnected', usernameWanted, justUsernames)
            }
        }, timeFakeLoading)

    })

    socket.on('sendNewMessage', (message) => {
        message.trim()
        if (message != '') {
            socket.to('users').emit('sendingNewMessage', message)
            socket.emit('confirmMessage', message)
        }

    })

    //Log out event
    socket.on('disconnect', () => {
        console.log('disconnection from user ' + socket.id)
        if (usernames[socket.id]) {
            let oldUsername = usernames[socket.id]
            delete usernames[socket.id]
            socket.to('users').emit('leftSessionUser', getUsernames(), oldUsername)
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