const { expect } = require('chai');
const path = require('path');
const walkModule = require( '../../lib/walk');

const mockFs = (files) => ({
    readdir: (dir,cb) => {
        files.hasOwnProperty(dir) ? files[dir]==='x' ?  cb( {code:'EACCESS', debug:dir} ) : cb(null, files[dir]) : cb( {code:'ENOENT', debug: dir} );
    },
    lstat: (path, cb) => {
        cb( null, {
            someStat: true,
            isDirectory: () => path.split('/').pop().startsWith('dir'),
            isSymbolicLink: () => false
        } );
    }
});


const gatherResults = async (walk) => {
    result = [];
    for await (const f of walk('dir0')) {
        result.push(f);
    }
    return result;
};

describe( 'walk' , () => {
    context( 'on a directory with 4 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':['file1','file2','file3','file4']}),path));
        });
        it( 'returns 5 files and directories', () => {
            expect( result.length).equal(5);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
        it( 'returns the first file', () => {
            expect( result[1].path ).equal( 'dir0/file1' );
        });
        it( 'returns the second file', () => {
            expect( result[2].path ).equal( 'dir0/file2' );
        });
        it( 'returns the third file', () => {
            expect( result[3].path ).equal( 'dir0/file3' );
        });
        it( 'returns the fourth file', () => {
            expect( result[4].path ).equal( 'dir0/file4' );
        });
    } );
    context( 'on a directory with 0 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':[]}),path));
        });
        it( 'returns only one directory', () => {
            expect( result.length).equal(1);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
    } );
    context( 'on a directory with 1 directory with 0 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':['dir1'],'dir0/dir1':[]}),path));
        });
        it( 'returns both directories', () => {
            expect( result.length).equal(2);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
        it( 'returns the directory', () => {
            expect( result[1].path ).equal( 'dir0/dir1' );
        });
    } );
    context( 'on a directory with 1 directory with 2 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':['dir1'],'dir0/dir1':['file1','file2']}),path));
        });
        it( 'returns 4 files and directories', () => {
            expect( result.length).equal(4);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
        it( 'returns the directory', () => {
            expect( result[1].path ).equal( 'dir0/dir1' );
        });
        it( 'returns the first file', () => {
            expect( result[2].path ).equal( 'dir0/dir1/file1' );
        });
        it( 'returns the second file', () => {
            expect( result[3].path ).equal( 'dir0/dir1/file2' );
        });
    } );
    context( 'on a directory with 2 files and 2 directories with 2 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':['dir1','file1','dir2','file2'],'dir0/dir1':['file3','file4'],'dir0/dir2':['file5','file6']}),path));
        });
        it( 'returns 9 files and directories', () => {
            expect( result.length).equal(9);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
        it( 'returns the first directory', () => {
            expect( result[1].path ).equal( 'dir0/dir1' );
        });
        it( 'returns the first file', () => {
            expect( result[2].path ).equal( 'dir0/file1' );
        });
        it( 'returns the second directory', () => {
            expect( result[3].path ).equal( 'dir0/dir2' );
        });
        it( 'returns the second file', () => {
            expect( result[4].path ).equal( 'dir0/file2' );
        });
        it( 'returns the third file', () => {
            expect( result[5].path ).equal( 'dir0/dir1/file3' );
        });
        it( 'returns the fourth file', () => {
            expect( result[6].path ).equal( 'dir0/dir1/file4' );
        });
        it( 'returns the fifth file', () => {
            expect( result[7].path ).equal( 'dir0/dir2/file5' );
        });
        it( 'returns the sixth file', () => {
            expect( result[8].path ).equal( 'dir0/dir2/file6' );
        });
    } );
    context( 'on a directory with 2 files and 2 directories each with 2 files and 2 directories each with 2 files', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({
                'dir0':['dir1','file1','dir2','file2'],
                'dir0/dir1':['file3','file4','dir3','dir4'],
                'dir0/dir2':['dir5','dir6','file5','file6'],
                'dir0/dir1/dir3':['file7','file8'],
                'dir0/dir1/dir4':['file9','file10'],
                'dir0/dir2/dir5':['file11','file12'],
                'dir0/dir2/dir6':['file13','file14'],
            }),path));
        });
        it( 'returns 21 files and directories', () => {
            expect( result.length).equal(21);
        });
        it( 'returns all the files', () => {
            expect( result.map(({path})=>path) ).deep.equal( [
                'dir0',
                'dir0/dir1',
                'dir0/file1',
                'dir0/dir2',
                'dir0/file2',
                'dir0/dir1/file3',
                'dir0/dir1/file4',
                'dir0/dir1/dir3',
                'dir0/dir1/dir4',
                'dir0/dir2/dir5',
                'dir0/dir2/dir6',
                'dir0/dir2/file5',
                'dir0/dir2/file6',
                'dir0/dir1/dir3/file7',
                'dir0/dir1/dir3/file8',
                'dir0/dir1/dir4/file9',
                'dir0/dir1/dir4/file10',
                'dir0/dir2/dir5/file11',
                'dir0/dir2/dir5/file12',
                'dir0/dir2/dir6/file13',
                'dir0/dir2/dir6/file14'
            ] );
        });
    } );
    context( 'ignores directory with permission denied to read', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({'dir0':['file1','file2','dirx'],'dir0/dirx':'x'}),path));
        });
        it( 'returns 4 files and directories', () => {
            expect( result.length).equal(4);
        });
        it( 'returns the source directory', () => {
            expect( result[0].path ).equal( 'dir0' );
        });
        it( 'returns the first file', () => {
            expect( result[1].path ).equal( 'dir0/file1' );
        });
        it( 'returns the second file', () => {
            expect( result[2].path ).equal( 'dir0/file2' );
        });
        it( 'returns the erroring directory', () => {
            expect( result[3].path ).equal( 'dir0/dirx' );
        });
        it( 'returns an error for the directory', () => {
            expect( result[3].error ).exist;
            expect( result[3].error.code ).equal('EACCESS');
        });
    } );
    context( 'when initial directory is missing', () => {
        let result;
        beforeEach( async () => {
            result = await gatherResults(walkModule(mockFs({}),path));
        });
        it( 'returns 1 error', () => {
            expect( result.length).equal(1);
        });
        it( 'returns the error', () => {
            expect( result[0].error ).exist;
            expect( result[0].error.code ).equal('ENOENT');
        });
    } );

});