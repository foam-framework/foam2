/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foamlink',
  name: 'FoamlinkData',
  documentation: `
    Information about classes and files as determined by Foamlink.
  `,
  properties: [
    {
      name: 'filesToClasses',
      class: 'Map',
      value: {},
      // keys are 'String' *
      // values are 'StringArray'
    },
    {
      name: 'classesToFiles',
      class: 'Map',
      value: {},
      // keys are 'String'
      // values are 'String'
    },
  ],
  methods: [
    function add(fileName, idsPresent) {
      this.filesToClasses[fileName] = idsPresent;
      // idsPresent could be an array if it was set using the MANUAL function
      // in a foamlink.js file; it's usually a map with model ids as keys
      if ( ! Array.isArray(idsPresent) ) {
        idsPresent = Object.keys(idsPresent);
      }
      for ( var i = 0; i < idsPresent.length; i++ ) {
        this.classesToFiles[idsPresent[i]] = fileName;
      }
    },
    function saveToDisk(filepath) {
      require('fs').writeFileSync(filepath, JSON.stringify({
        // TODO: Better way to get the natural object for a model's properties?
        filesToClasses: this.filesToClasses,
        classesToFiles: this.classesToFiles
      }));
    }
  ]
})

// TODO: *Perhaps some way to specify map key and value types
