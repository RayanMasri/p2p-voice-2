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

const connect = (id) => {
    let connection = peer.connect(id);

    connection.on('open', () => {
        const context = new AudioContext();

        connection.on('data', (data) => {
            let blob = window.atob(data);
            let fLen = blob.length / Float32Array.BYTES_PER_ELEMENT;
            let dView = new DataView(
                new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)
            );
            let fAry = new Float32Array(fLen);
            let p = 0;

            for (var j = 0; j < fLen; j++) {
                p = j * 4;
                dView.setUint8(0, blob.charCodeAt(p));
                dView.setUint8(1, blob.charCodeAt(p + 1));
                dView.setUint8(2, blob.charCodeAt(p + 2));
                dView.setUint8(3, blob.charCodeAt(p + 3));
                fAry[j] = dView.getFloat32(0, true);
            }

            let buffer = new AudioBuffer({
                numberOfChannels: 1,
                length: context.sampleRate * 2.0,
                sampleRate: context.sampleRate,
            });

            buffer.getChannelData(0).set(fAry);

            let sound = context.createBufferSource();
            sound.buffer = buffer;
            sound.connect(context.destination);
            sound.start(context.currentTime);
        });

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                const source = context.createMediaStreamSource(stream);
                const processor = context.createScriptProcessor(8192, 1, 1);

                source.connect(processor);
                processor.connect(context.destination);

                processor.onaudioprocess = (e) => {
                    let chunk = btoa(
                        String.fromCharCode.apply(
                            null,
                            new Uint8Array(
                                e.inputBuffer.getChannelData(0).buffer
                            )
                        )
                    );

                    connection.send(chunk);
                };
            });
    });
};

peer.on('open', (id) => {
    console.log(`peer.js is open with id: ${id}`);
});

peer.on('connection', (connection) => {
    const context = new AudioContext();

    connection.on('data', (data) => {
        let blob = window.atob(data);
        let fLen = blob.length / Float32Array.BYTES_PER_ELEMENT;
        let dView = new DataView(
            new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)
        );
        let fAry = new Float32Array(fLen);
        let p = 0;

        for (var j = 0; j < fLen; j++) {
            p = j * 4;
            dView.setUint8(0, blob.charCodeAt(p));
            dView.setUint8(1, blob.charCodeAt(p + 1));
            dView.setUint8(2, blob.charCodeAt(p + 2));
            dView.setUint8(3, blob.charCodeAt(p + 3));
            fAry[j] = dView.getFloat32(0, true);
        }

        let buffer = new AudioBuffer({
            numberOfChannels: 1,
            length: context.sampleRate * 2.0,
            sampleRate: context.sampleRate,
        });

        buffer.getChannelData(0).set(fAry);

        let sound = context.createBufferSource();
        sound.buffer = buffer;
        sound.connect(context.destination);
        sound.start(context.currentTime);
    });

    navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(8192, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = (e) => {
                let chunk = btoa(
                    String.fromCharCode.apply(
                        null,
                        new Uint8Array(e.inputBuffer.getChannelData(0).buffer)
                    )
                );

                connection.send(chunk);
            };
        });
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
