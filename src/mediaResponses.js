const fs = require('fs');
const path = require('path');

const streamMedia = (req, res, dirPath, mime) => {
    const file = path.resolve(__dirname, dirPath);

    fs.stat(file, (err, stats) => {
        // Check for errors
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
            }
            return res.end();
        }

        // Parse and calculate requsted byte range
        let { range } = req.headers;
        if (!range) {
            range = 'bytes=0-';
        }
        const positions = range.replace(/bytes=/, '').split('-');
        let start = parseInt(positions[0], 10);
        const end = positions[1] ? parseInt(positions[1], 10) : stats.size - 1;
        if (start > end)
            start = end - 1;

        // Write the headers for the requested range
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stats.size - 1}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mime
        });

        // Open a file stream to send the data\
        const stream = fs.createReadStream(file, { start, end });
        stream.on('open', () => stream.pipe(res));
        stream.on('error', err => res.end(err))
        return stream;
    });
}

const getParty = (req, res) => { streamMedia(req, res, '../client/party.mp4', 'video/mp4'); };

const getBling = (req, res) => { streamMedia(req, res, '../client/bling.mp3', 'audio/mpeg'); };

const getBird = (req, res) => { streamMedia(req, res, '../client/bird.mp4', 'video/mp4'); };

module.exports = { getParty, getBling, getBird };