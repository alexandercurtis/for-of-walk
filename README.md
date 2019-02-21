# A file walker that uses async iterators

Async iterators are a new feature of Javascript, only available in Node version 10 upwards.

Usage

```
const {walk} = require('@statenlogic/for-of-walk');

for await (const f of walk('.')) {
    if( f.error ) {
        console.error( f.error );
    }
    else {
        console.log( f.filename );
    }
}

```

`walk` will yield an asynchronous sequence of objects describing the files found. The objects look like this:

```
{
  path: 'directory1/directory2/myfile.txt', // the path to the file relative to the initial director
  stats: Stats // A Stats object as returned by Node's `fs.lsstat` function. May be missing if `fs.lsstat` failed.
  error: Error // An optional error object, present if an error was reported
}
```
