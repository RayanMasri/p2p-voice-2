const context = new AudioContext();
const peer = new Peer({
    path: '/peerjs',
    host: location.hostname,
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
});

const query = (url) => {
    return fetch(url, {
        method: 'GET',
    }).then((result) => result.json());
};

const stream = (callback) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        callback(stream);
    });
};

// const processCall = (call) => {
// call.on('stream', (stream) => {
//     const processor = context.createScriptProcessor(4096, 1, 1);

//     context.createMediaStreamSource(stream).connect(processor);
//     processor.connect(context.destination);

//     processor.onaudioprocess = (event) => {
//         let sound = context.createBufferSource();
//         sound.buffer = event.inputBuffer;
//         sound.connect(context.destination);
//         sound.start(context.currentTime);
//     };
// });
// };

$('#create-room').click(() => {
    const name = $('#create-room-input').val();
    query(`/create?name=${name}`);
});

$('#join-room').click(() => {
    const name = $('#join-room-input').val();
    query(`/join?name=${name}&id=${peer.id}`);
});

$('#update-room').click(() => {
    $('#update-room').prop('disabled', true);
    query('/info').then((info) => {
        // Show rooms
        $('#rooms').empty();
        info.rooms.map((room) => {
            $('#rooms').append(
                $(`<li>${room.name} - ${room.clients.length}</li>`).css(
                    'color',
                    room.clients.some((client) => client.id == peer.id)
                        ? 'red'
                        : 'black'
                )
            );
        });

        const clients = info.rooms
            .find((room) => room.clients.some((client) => client.id == peer.id))
            .clients.filter((client) => client.id != peer.id);

        console.log(clients);

        stream((stream) => {
            clients.map((client) => {
                console.log(`calling: '${client.id}'`);
                const call = peer.call(client.id, stream);

                call.on('stream', (stream) => {
                    console.log(`received audio from: '${client.id}'`);
                    console.log(stream);

                    // const audio = document.createElement("audio")

                    const audio = new Audio();
                    audio.srcObject = stream;
                    audio.play();

                    // const audio = $('<audio controls>');

                    // audio.src = stream;
                    // console.log(audio[0]);
                    // audio[0].play();
                    //
                    // $('body').append(audio);

                    // audio.play();
                });

                // processCall(peer.call(client.id, stream));
            });
        });

        $('#update-room').prop('disabled', false);
    });
});

peer.on('open', (id) => {
    console.log(`identified as: '${id}'`);
});

peer.on('call', (call) => {
    console.log(`received call from: '${call.peer}'`);
    stream((stream) => {
        call.answer(stream);
        console.log(`answered call from: '${call.peer}'`);

        call.on('stream', (stream) => {
            console.log(`received audio from: '${call.peer}'`);
            console.log(stream);
        });
    });
});
