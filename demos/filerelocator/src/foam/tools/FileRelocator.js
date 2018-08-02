/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: "foam.tools",
  name: "FileRelocator",
  requires: [
    "foam.json.Outputter"
  ],
  documentation: `
This tool can take a file that contains models and refinements and will split it
up into multiple files and automatically format them.

Running this requires a couple of npms:

npm install prompt-sync mkdirp-sync

Some things to keep in mind when using this tool:
- Comments outside of functions will get stripped out.
- If no package is declared on the model, defaultPackage will be used.
- If no name is declared on the model then it's assumed to be a refinement and a
  name of Refine_ID will be given (where ID is the ID of the model that's being
  refined.
- Instances of FObjects will be serialized and may cause things to break. This
  typically happens with axioms, constants, and default values. This tool will
  display a warning if FObjects are encountered. The developer should manually
  resolve this before proceeding.
  `,
  properties: [
    {
      class: "String",
      name: "filePath",
      required: true,
      documentation: "Path to a file containing models that are to be split and relocated."
    },
    {
      class: "String",
      name: "defaultPackage"
    },
    {
      class: "String",
      name: "outputPath",
      documentation: "Files will be placed using this as the base path and dirs will be created for the package path."
    },
    {
      class: "FObjectProperty",
      of: "foam.json.Outputter",
      name: "outputter",
      factory: function () {
        return this.Outputter.create({
          indentStr: '  ',
          useTemplateLiterals: true,
          formatFunctionsAsStrings: false,
          strict: false,
          objectKeyValuePredicate: function(k, v) {
            if ( foam.core.FObject.isInstance(v) ) {
              console.warn(`Warning: ${k} is an instance of ${v.cls_.id} and may break.`);
            }
            return true;
          },
        });
      }
    }
  ],
  actions: [
    {
      name: "execute",
      code: function () {
        var files = {};
        var refines = [];

        var sep = require('path').sep;
        var fs = require('fs')
        var prompt = require('prompt-sync')();
        var mkdirp = require('mkdirp-sync');

        var self = this;

        var foamCLASS = foam.CLASS;
        foam.CLASS = function(m) {
          var package = m.package || self.defaultPackage;
          var name = m.name || ('Refine_' + m.refines.replace(/\./g, '_'));

          while ( true ) {
            var dir = self.outputPath + sep + package.replace(/\./g, sep);
            var path = dir + sep + name + '.js';
            if ( files[path] ) {
              console.log(`Error: Duplicate path found in file: ${path}`);
              process.exit();
            }
            if ( fs.existsSync(path) ) {
              console.log(`Warning: ${path} already exists and will get replaced.`);
            }
            m.name = name;
            m.package = package;
            files[path] = {
              path: path,
              dir: dir,
              contents: `
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS(${self.outputter.stringify(m)});
                `.trim(),
            };
            break;
          }

          if ( m.refines ) {
            refines.push((package ? package + '.' : '') + name);
          }
        };

        var js = fs.readFileSync(self.filePath, 'utf8');
        eval(js);

        console.log('New files:');
        console.log(Object.keys(files).join('\n'));

        console.log('Refinements you may want to require:');
        console.log(refines.map(id => `'${id}'`).join(',\n'));

        if ( prompt('Do you wish to proceed? (type: YES to confirm): ').trim() == 'YES' ) {
          Object.values(files).forEach(function(o) {
            mkdirp(o.dir);
          });
          Object.values(files).forEach(function(o) {
            fs.writeFileSync(o.path, o.contents);
          });
        }
      }
    }
  ]
});
