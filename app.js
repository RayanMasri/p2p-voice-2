const express = require('express');
const { connect } = require('http2');
const app = express();

let info = {
    rooms: [],
};

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/info', (req, res) => {
    res.end(JSON.stringify(info));
});

app.get('/create', (req, res) => {
    if (!info.rooms.some((room) => room.name == req.query.name)) {
        info = {
            rooms: info.rooms.concat([
                {
                    name: req.query.name,
                    clients: [],
                },
            ]),
        };
    }

    res.end('{}');
});

app.get('/join', (req, res) => {
    if (info.rooms.some((room) => room.name == req.query.name)) {
        info = {
            rooms: info.rooms.map((room) => {
                return {
                    name: room.name,
                    clients:
                        room.name == req.query.name
                            ? !room.clients.some(
                                  (client) => client.id == req.query.id
                              )
                                ? room.clients.concat([
                                      {
                                          id: req.query.id,
                                      },
                                  ])
                                : room.clientss
                            : room.clients,
                };
            }),
        };
    }

    res.end('{}');
});

const peer = require('peer').ExpressPeerServer(
    require('http')
        .createServer(app)
        .listen(process.env.PORT || 3000, () => {
            console.log(`listening on *:${process.env.PORT || 3000}`);
        })
);

peer.on('connection', (client) => {
    // if (!connected_users.includes(client.id)) {
    //     connected_users.push(client.id);
    // }
    console.log(`'${client.id}' connected`);
});

peer.on('disconnect', (client) => {
    // if (connected_users.includes(client.id)) {
    // connected_users = connected_users.filter((user) => user != client.id);
    // }
    console.log(`'${client.id}' disconnected`);
});

app.use('/peerjs', peer);
