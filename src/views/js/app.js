const socket = io();
const statusTag = document.getElementById("status");
const count = document.getElementById("count");
const msg = document.getElementById("msg");
const username = document.getElementById("username");
const containerMsg = document.getElementById("containerMsg");
const form = document.getElementById("form");
const typing = document.getElementById("typing");
const tomessage = document.getElementById("tomessage");
const dropdownusers = document.getElementById("dropdownusers");
const btnEmoji = document.getElementById("btnEmoji");
const cajaEmojis = document.querySelector('emoji-picker');
const todos = document.getElementById("todos");

// instance emoji piker
const emojis = new Emoji(cajaEmojis, btnEmoji, msg);

let userLocal = {}
let statusToMessages = "Todos";

function hadleClick (el) {
    const name = el.innerText.split("\n", 2)[1];
    Toastify({
        text: "Se enviara mensaje a " + name,
        duration: 2500,  
    }).showToast();
    tomessage.textContent = "a "+ name;
    statusToMessages = el.id;
}

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
    const { toMessage } = data;
    const date = new Date();
    const hora = date.getHours();
    const min = date.getMinutes();
    return `
    <div class="msg-container box-end">
        <article class="message ${toMessage === "Todos" ? "is-info" : "is-warning"} is-small msg">
            <div class="message-header">
            <p id="name">${data.name}</p> ${toMessage === "Todos" ? "mensaje a todos" : "mensaje privado"}
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
    const { toMessage } = data;
    const date = new Date();
    const hora = date.getHours();
    const min = date.getMinutes();
    return `
    <div class="msg-container">
        <article class="message ${toMessage === "Todos" ? "is-link" : "is-warning"} is-small msg">
            <div class="message-header">
            <p id="name">${data.name}</p> ${toMessage === "Todos" ? "mensaje a todos" : "mensaje privado"}
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
        const initial = item.name.charAt(0).toUpperCase();
        dropdownusers.innerHTML += `
        <span class="navbar-item contact ${userLocal.id === item.id ? null : "btn-point"}" id="${item.id}" name="${item.name}" ${userLocal.id === item.id ? null : 'onClick="hadleClick(this)"'}>
            <figure class="image is-32x32">
                <span class="user-item">${initial}</span>
            </figure>
            <span class="tag is-link is-light ml-4">${item.name}</span>
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


/* -----------on socket io events ---------------*/
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
    userLocal = {...data}
})

socket.on('message:received', (data) => {
    containerMsg.innerHTML += loadMessageEmit(data);
    const initial = data.name.charAt(0).toUpperCase();
    const userItem = document.getElementById(data.id);
    userItem.innerHTML = updateUsername(initial, data.name);
})

socket.on("typing:received", (status) => {
    typing.textContent = status;
})

/* ----------events to button handlers --------*/
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (msg.value) {
        const data = {
            ...userLocal,
            name: username.value,
            message: msg.value,
            toMessage: statusToMessages,
            toTyping: ""
        }
        containerMsg.innerHTML += loadMessageLocal(data);
        socket.emit('message:send', data);

        const userItem = document.getElementById(data.id);
        userItem.innerHTML = updateUsername(data.name.charAt(0).toUpperCase(), data.name);

        msg.value = "";
        socket.emit("typing:send", data);
    }
})

todos.addEventListener("click", () => {
    console.log("Todos!")
    statusToMessages = "Todos";
    tomessage.textContent = "a todos";
    Toastify({
        text: "Se enviara mensaje a Todos",
        duration: 2500,  
    }).showToast();
    
})

msg.addEventListener("input", (e) => {
    const data = {
        toTyping: username.value + " esta escribiendo...",
        toMessage: statusToMessages
    }
    socket.emit("typing:send", data);
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
