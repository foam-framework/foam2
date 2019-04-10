/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'JavaImplements',
  flags: ['java'],
  properties: [
    {
      class: 'String',
      name: 'name'
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      cls.implements = cls.implements.concat(this.name);
    }
  ]
});
