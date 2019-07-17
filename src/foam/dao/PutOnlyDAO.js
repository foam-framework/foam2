/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.dao',
    name: 'PutOnlyDAO',
    extends: 'foam.dao.ProxyDAO',
    documentation: 'DAO decorator that throws errors on find, select, remove, and cmd',
    methods: [
      {
        name: 'find_',
        javaCode: `throw new UnsupportedOperationException("Cannot find from PutOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot find from PutOnlyDAO")`,
        code: function find_(x, obj) {
          return Promise.reject('Cannot find from PutOnlyDAO');
        }
      },
      {
        name: 'select_',
        javaCode: `throw new UnsupportedOperationException("Cannot select from PutOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot select from PutOnlyDAO")`,
        code: function select_(x, obj) {
          return Promise.reject('Cannot select from PutOnlyDAO');
        }
      },
      {
        name: 'remove_',
        javaCode: `throw new UnsupportedOperationException("Cannot remove from PutOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot remove from PutOnlyDAO")`,
        code: function remove_() {
          return Promise.reject('Cannot remove from PutOnlyDAO');
        }
      },
      {
        name: 'cmd_',
        javaCode: `throw new UnsupportedOperationException("Cannot cmd from PutOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot cmd from PutOnlyDAO")`,
        code: function cmd_() {
          return Promise.reject('Cannot cmd from PutOnlyDAO');
        }
      },
      {
        name: 'removeAll',
        javaCode: `throw new UnsupportedOperationException("Cannot removeAll from PutOnlyDAO");`,
        swiftCode: `throw FoamError("Cannot removeAll from PutOnlyDAO")`,
        code: function removeAll_() {
          return Promise.reject('Cannot removeAll from PutOnlyDAO');
        }
      }
    ]
  });
  