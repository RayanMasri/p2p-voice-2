const express = require('express');
const app = express();

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', () => {
    console.log('a socket.io client connected');
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`listening on *:${server.address().port}`);
});

// peer.js config
const { ExpressPeerServer } = require('peer');
const peer = ExpressPeerServer(server, {
    debug: true,
});

peer.on('connection', () => {
    console.log('a peer.js client connected');
});

app.use('/peerjs', peer);
