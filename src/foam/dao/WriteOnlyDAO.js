/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.dao',
    name: 'WriteOnlyDAO',
    extends: 'foam.dao.ProxyDAO',
    documentation: 'DAO decorator that throws errors on find, select, remove.',
    methods: [
      {
        name: 'find_',
        javaCode: `throw new UnsupportedOperationException("Cannot find from WriteOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot find from WriteOnlyDAO")`,
        code: function put_(x, obj) {
          return Promise.reject('Cannot find from WriteOnlyDAO');
        }
      },
      {
        name: 'select_',
        javaCode: `throw new UnsupportedOperationException("Cannot select from WriteOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot select from WriteOnlyDAO")`,
        code: function remove_(x, obj) {
          return Promise.reject('Cannot select from WriteOnlyDAO');
        }
      },
      {
        name: 'remove_',
        javaCode: `throw new UnsupportedOperationException("Cannot remove from WriteOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot remove from WriteOnlyDAO")`,
        code: function removeAll() {
          return Promise.reject('Cannot remove from WriteOnlyDAO');
        }
      },
      {
        name: 'cmd_',
        javaCode: `throw new UnsupportedOperationException("Cannot cmd from WriteOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot cmd from WriteOnlyDAO")`,
        code: function removeAll() {
          return Promise.reject('Cannot cmd from WriteOnlyDAO');
        }
      }
    ]
  });
  