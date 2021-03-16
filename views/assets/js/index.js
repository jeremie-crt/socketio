document.querySelector('.chat[data-chat=person0]').classList.add('active-chat');
document.querySelector('.person[data-chat=person0]').classList.add('active');

let friends = {
        list: document.querySelector('ul.people'),
        all: document.querySelectorAll('.left .person'),
        name: ''
    },

    chat = {
        container: document.querySelector('.container .right'),
        current: null,
        person: null,
        name: document.querySelector('.container .right .top .name')
    };


updateFriends()

checkLinkUsersModal()

function setActiveChat(f) {
    friends.list.querySelector('.active').classList.remove('active');
    f.classList.add('active');
    chat.current = chat.container.querySelector('.active-chat');
    chat.person = f.getAttribute('data-chat');
    chat.current.classList.remove('active-chat');
    chat.container.querySelector('[data-chat="' + chat.person + '"]').classList.add('active-chat');
    friends.name = f.querySelector('.name').innerText;
    chat.name.innerHTML = friends.name;
    checkLinkUsersModal()
}

// Vérification de l'usabilité du lien ver le modal users
function checkLinkUsersModal() {
    if (chat.person == 'person0' || chat.person == null) {
        chat.name.addEventListener('click', openUsersModal, false)
        chat.name.style.cursor = 'pointer'
    } else {
        chat.name.removeEventListener('click', openUsersModal, false)
        chat.name.style.cursor = 'default'
    }
}

/* Modal */

let modalContainer = document.body.querySelector('#modal-container'),
    listUsers = modalContainer.querySelector('#contentUsers ul')

// Ouverture du modal sur la demande de l'username
function openUsernameModal() {
    modalContainer.querySelector('#contentUsername').classList.remove('none')
    modalContainer.querySelector('#contentUsers').classList.add('none')
    modalContainer.classList.remove('out')
    document.body.classList.add('modal-active')
}

// Ouverture du modal sur la liste des utilisateurs connectés
function openUsersModal() {
    modalContainer.querySelector('#contentUsername').classList.add('none')
    modalContainer.querySelector('#contentUsers').classList.remove('none')
    modalContainer.classList.remove('out')
    document.body.classList.add('modal-active')
}

// Fermeture du modal
function closeModal() {
    modalContainer.classList.add('out')
    document.body.classList.remove('modal-active')
}

/* END Modal */


//Updates the top menu title wiht the current amount of users
function updateUsers(users) {
    listUsers.innerHTML = ''
    for (let i in users) {
        listUsers.innerHTML += '<li>' + users[i] + '</li>'
    }

    let text = 'General Room(' + users.length + ')'
    friends.all[0].querySelector('.name').innerHTML = text

    if (chat.person == 'person0' || chat.person == null) {
        document.body.querySelector('#infoPersonTop').innerHTML = text
    }
}

let globalChat = chat.container.querySelector('.chat[data-chat=person0]')

function messageNewUserConnected(newUsername) {
    let message = '<div class="conversation-start"><span>' + newUsername + ' is online !</span></div>'
    globalChat.insertAdjacentHTML('beforeend', message)
}

function messageleftSessionUser(newUsername) {
    let message = '<div class="conversation-start"><span>' + newUsername + ' has left !</span></div>'
    globalChat.insertAdjacentHTML('beforeend', message)
}

//Display new message from user own input entry
function showMyMessage(message, dataChat) {
    let text = '<div class="bubble name me">' + message + '</div>'
    chat.container.querySelector('.chat[data-chat="' + dataChat + '"]')
        .insertAdjacentHTML('beforeend', text)
}

//Display new message to all users
function showMessage(message, username, dataChat) {
    let text = '<div class="bubble name you"><span class="username">' + username + '</span>' + message + '</div>'
    chat.container.querySelector('.chat[data-chat="' + dataChat + '"]')
        .insertAdjacentHTML('beforeend', text)
}


//Actions behavior on typing
let someoneWriting = document.body.querySelector('.someoneWriting')

function showSomeoneWriting(usernameWriting, dataChat) {
    if (chat.person == dataChat || (dataChat == 'person0' && chat.person == null)) {
        someoneWriting.innerHTML = usernameWriting + ' is writing...'
        someoneWriting.classList.remove('none')
    }
}

function removeSomeoneWriting(dataChat) {
    if (chat.person == dataChat || (dataChat == 'person0' && chat.person == null)) {
        someoneWriting.classList.add('none')
    }
}

//Display all users chat in menu when connecting
function setFriends(allUsers, allSocketIDs, ownUsername) {
    for (let i = 0; i < allUsers.length; i++) {
        if (ownUsername != allUsers[i]) {
            addUserNewChat(allUsers[i], allSocketIDs[i])
        }
    }
}

//Reload chat links
function updateFriends() {
    friends.all = document.querySelectorAll('.left .person')
    friends.all.forEach(function (f) {
        f.addEventListener('mousedown', function () {
            f.classList.contains('active') || setActiveChat(f);
        });
    });
}

//Create the menu with a new user
function addUserNewChat(newUsername, newSocketId) {
    let element = '<li class="person" data-chat="' + newSocketId + '"><span class="name">' + newUsername + '</span><br><span class="preview">Private chat</span></li>'

    friends.list.insertAdjacentHTML('beforeend', element)

    //Create new chat with user id
    element = '<div class="chat" data-chat="' + newSocketId + '"></div>'
    let lastChat = chat.container.querySelectorAll('.chat')
    lastChat = lastChat[lastChat.length - 1]
    lastChat.insertAdjacentHTML('afterend', element)

    updateFriends()
}

//Delete chat user on leaving
function removeUserChat(oldSocketID) {
    //Switch chat if deleted
    if(chat.person == oldSocketID) {
        setActiveChat(friends.all[0])
    }

    //Delete menu chat user
    let element = friends.list.querySelector('.person[data-chat="' + oldSocketID + '"]')
    element.parentNode.removeChild(element)

    //Delete chat user
    element = chat.container.querySelector('.chat[data-chat="' + oldSocketID + '"]')
    element.parentNode.removeChild(element)

    updateFriends()
}

