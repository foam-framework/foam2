/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.DAOProperty',

  properties: [
    ['javaInfoType', 'foam.core.AbstractDAOPropertyPropertyInfo']
  ],
  
  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = 'return 0;';
      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          {
            name: 'outputter',
            type: 'foam.lib.json.Outputter'
          },
          {
            name: 'value',
            type: 'Object'
          }
        ],
        body: `return;`
      });
      return info;
    }
  ]
})
