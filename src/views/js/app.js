const socket = io();
const statusTag = document.getElementById("status");
const count = document.getElementById("count");
const msg = document.getElementById("msg");
const username = document.getElementById("username");
const containerMsg = document.getElementById("containerMsg");
const form = document.getElementById("form");
const typing = document.getElementById("typing");
const dropdownusers = document.getElementById("dropdownusers");
const btnEmoji = document.getElementById("btnEmoji");
const cajaEmojis = document.querySelector('emoji-picker');

// instance emoji piker
const emojis = new Emoji(cajaEmojis, btnEmoji, msg);

let userLocal = {}

function socketStatus () {
    if (socket.connected) {
        statusTag.textContent = "en línea 😇";
        statusTag.classList.remove('is-warning');
        statusTag.classList.add('is-success');
    } else {
        statusTag.textContent = "fuera de línea 😑";
        statusTag.classList.remove('is-success');
        statusTag.classList.add('is-warning');
    }
}

function loadMessageLocal(data) {
    const date = new Date();
    const hora = date.getHours();
    const min = date.getMinutes();
    return `
    <div class="msg-container box-end">
        <article class="message is-info is-small msg">
            <div class="message-header">
            <p id="name">${data.name}</p>
            <p id="hora">${hora >= 10 ? hora:'0'+hora}:${min >= 10 ? min:'0'+min}</p>
            </div>
            <div class="message-body is-size-6" id="message">
                ${data.message}
            </div>
        </article>
    </div>
    `;
}


function loadMessageEmit(data) {
    const date = new Date();
    const hora = date.getHours();
    const min = date.getMinutes();
    return `
    <div class="msg-container">
        <article class="message is-link is-small msg">
            <div class="message-header">
            <p id="name">${data.name}</p>
            <p id="hora">${hora >= 10 ? hora:'0'+hora}:${min >= 10 ? min:'0'+min}</p>
            </div>
            <div class="message-body is-size-6" id="message">
                ${data.message}
            </div>
        </article>
    </div>
    `;
}


function loadListUsers (list) {

    dropdownusers.innerHTML = "";

    list.forEach(item => {
        const initial = item.username.charAt(0).toUpperCase();
        dropdownusers.innerHTML += `
        <span class="navbar-item contact" id="${item.id}">
            <figure class="image is-32x32">
                <span class="user-item">${initial}</span>
            </figure>
            <span class="tag is-link is-light ml-4">${item.username}</span>
        </span>
        `;
    })
}

function updateUsername (initial, username) {
    return `
    <figure class="image is-32x32">
        <span class="user-item">${initial}</span>
    </figure>
    <span class="tag is-link is-light ml-4">${username}</span>
    `;
}

socket.on('connect', () => {
    console.log('connection!', socket.id);
    
    socketStatus()
    
})

socket.on('disconnect', () => {
    console.log("socket disconnect");
    socketStatus()
})

socket.on('welcome', (data) => {
    count.textContent = data.count > 1 ? `${data.count} conectados` : `${data.count} conectado`;
    loadListUsers(data.listUsers)
})

socket.on('userdata', (data) => {
    username.value = data.name;
    console.log(data);
    userLocal = {...data}
})

socket.on('message:received', (data) => {
    containerMsg.innerHTML += loadMessageEmit(data.message);
    const initial = data.message.name.charAt(0).toUpperCase();
    const userItem = document.getElementById(data.message.id);
    // userItem.innerHTML = updateUsername(initial, data.message.name);
})

socket.on("typing:received", (status) => {
    typing.textContent = status;
})


form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (msg.value) {
        const data = {
            ...userLocal,
            message: msg.value
        }
        containerMsg.innerHTML += loadMessageLocal(data);
        console.log(data);
        const userItem = document.getElementById(data.id);
        console.log(userItem)
        // userItem.innerHTML = updateUsername(data.name.charAt(0).toUpperCase(), data.name);
        socket.emit('message:send', data);
        msg.value = "";
        socket.emit("typing:send", ""); 
    }
})

msg.addEventListener("input", (e) => {
    socket.emit("typing:send", username.value + " esta escribiendo...");
})



// -------events emojis-----------//
btnEmoji.onclick = () => {
    emojis.views();
} 
  
cajaEmojis.addEventListener('emoji-click', e => {
emojis.write(e);
})
  


//------toogle button menu-----//
document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

        });
    });
});
