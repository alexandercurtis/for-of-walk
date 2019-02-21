module.exports = function (fs, path) {

    function readdirP(dir) {
        return new Promise((res, rej) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    rej(err);
                } else {
                    res(files.map(file => path.join(dir, file)));
                }
            });
        });
    }

    function lstatP(path) {
        return new Promise((res) => {
            fs.lstat(path, (error, stats) => {
               res({path, error, stats});
            });
        });
    }

    return async function* walk(dir) {

        const q = [];

        q.push( await lstatP(dir) );

        while (q.length) {
            const fileObj = q.shift();

            if( !fileObj.error && fileObj.stats && fileObj.stats.isDirectory() ) {
                let filePaths;
                try {
                    filePaths = await readdirP(fileObj.path);
                } catch (e) {
                    fileObj.error = e;
                    filePaths = [];
                }

                const fileObjs = await Promise.all(
                    filePaths.map(lstatP)
                );

                Array.prototype.push.apply(q, fileObjs);
            }

            yield fileObj;
        }
    }
};
