# for-of-walk

A file walker that uses asynchronous iterators. It recursively explores files and directories in a file system and 
returns them as an iterable sequence. Useful when you want to list the files in a directory and its subdirectories.

### Usage

```
const walk = require('@statenlogic/for-of-walk');

async function main() {
    for await (const f of walk('/home/statenlogic')) {
        if( f.error ) {
            console.error( f.error );
        } else if( f.stats && !f.stats.isDirectory() ) {
            console.log( f.path );
        }
    }
}

main();

```

### Output
Iterating the result of `walk` will yield an asynchronous sequence of objects describing the files found. The objects look like this:

```
{
  path: '/home/statenlogic/directory1/directory2/myfile.txt', // the path to the file
  stats: Stats // A Stats object as returned by Node's `fs.lstat` function. May be missing if `fs.lsstat` failed.
  error: Error // A possible error object, present if an error was reported
}
```

### Note
Asynchronous iterators are a new feature of Javascript, available in Node version 10. They must be used in `async` 
functions. If you are using an async function but you still see an error like
```
for await (
    ^^^^^

SyntaxError: Unexpected reserved word
```
it means that your version of Node does not support async iterators and you will need to upgrade.
