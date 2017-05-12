/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'JavaImport',

  documentation: 'Specify imports to be added to generated Java class.',
  properties: [
    {
      class: 'String',
      name: 'import'
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      cls.imports.push(this.import);
    }
  ]
});
