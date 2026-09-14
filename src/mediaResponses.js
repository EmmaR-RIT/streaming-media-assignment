const fs = require('fs');
const path = require('path');

const getParty = (req, res) => {
    const file = path.resolve(__dirname, '../client/part.mp4');

    fs.stat(file, (err, stats) => {
        // Check for errors
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
            }
            return res.end(err);
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
            'Content-Type': 'video/mp4'
        });

        // Open a file stream to send the data\
        const stream = fs.createReadStream(file, { start, end });
        stream.on('open', () => stream.pipe(res));
        stream.on('error', err => res.end(err))
        return stream;
    });
};

module.exports = { getParty };