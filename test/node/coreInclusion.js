describe('Inclusion of all core files', function() {
  it('Expect all src/core/*.js files to be listed in src/core.json',
     function(done) {
       var fs = require('fs');
       var includedJsFileNames =
           JSON.parse(fs.readFileSync('src/core.json'));
       fs.readdir('src/core', function(err, fileNames) {
         expect(err).toBeFalsy();
         var coreJsFileNames = fileNames.filter(function(fileName) {
           return !!fileName.match(/[.]js$/);
         });

         // Expectation: coreJsFileNames is a subset of includedJsFileNames.
         var coreJsFileNamesMap = {};
         var i;
         for (i = 0; i < coreJsFileNames.length; i++) {
           coreJsFileNamesMap['core/' + coreJsFileNames[i]] = true;
         }
         for (i = 0; i < includedJsFileNames.length; i++) {
           if (coreJsFileNamesMap[includedJsFileNames[i]])
             delete coreJsFileNamesMap[includedJsFileNames[i]];
         }
         expect(coreJsFileNamesMap).toEqual({});
         done();
       });
     });
});
