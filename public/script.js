let socket = io(
    window.location.protocol +
        '//' +
        window.location.hostname +
        ':' +
        window.location.port
);
let peer = new Peer({
    path: '/peerjs',
    host: location.hostname,
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
});

const connect = (id) => {};

peer.on('open', (id) => {
    console.log(`peer.js is open with id: ${id}`);
});

socket.on('info', (clients) => {
    $('#clients').empty();

    clients.map((client) => {
        $('#clients').append(
            $(
                `<button>${
                    client == peer.id ? `<strong>${client}</strong>` : client
                }</button>`
            ).click(() => {
                connect(client);
            })
        );
    });
});

// console.log(`connecting socket.io to ${socket.io.uri}`);
// console.log(
//     `connecting peer.js to ${peer._options.host}:${peer._options.port}`
// );

// socket.on('connect', () => {
//     console.log(`socket.io is open with id: ${socket.id}`);
// });
