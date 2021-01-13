/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'NotificationClientDAO',
  extends: 'foam.dao.BaseNotificationClientDAO',

  documentation: `NotificationClientDAO is a send and forget DAO, not waiting on a response like the ClientDAO.`,

  requires: [
    'foam.box.SkeletonBox',
    'foam.core.Serializable',
    'foam.dao.ArraySink',
    'foam.dao.ClientSink'
  ],

  methods: [
    {
      name: 'put_',
      code:     function put_(x, obj) {
        return this.SUPER(null, obj);
      },
      javaCode: `
      return super.put_(null, obj);
      `,
      swiftCode: 'return try super.put_(nil, obj)'
    },
    {
      name: 'remove_',
      code: function remove_(x, obj) {
        return this.SUPER(null, obj);
      },
      javaCode: `
      return super.remove_(null, obj);
      `,
      swiftCode: 'return try super.remove_(nil, obj)'
    },
    {
      name: 'find_',
      code:     function find_(x, key) {
        return null;
      },
      javaCode: 'throw new UnsupportedOperationException();',
      swiftCode: 'return nil'
    },
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        sink && sink.eof;
        return sink;
      },
      javaCode: 'throw new UnsupportedOperationException();',
      swiftCode: `
sink?.eof()
return sink
`
    },
    {
      name: 'removeAll_',
      code: function removeAll_(x, skip, limit, order, predicate) {
        if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
        if ( ! skip ) skip = 0;
        if ( foam.Undefined.isInstance(limit) ) limit = Number.MAX_SAFE_INTEGER;

        return this.SUPER(null, skip, limit, order, predicate);
      },
      javaCode: 'super.removeAll_(null, skip, limit, order, predicate);',
      swiftCode: 'try super.removeAll_(nil, skip, limit, order, predicate)'
    },
    {
      name: 'cmd_',
      code:     function cmd_(x, obj) {
        return this.SUPER(null, obj);
      },
      javaCode: 'return super.cmd_(null, obj);',
      swiftCode: 'return try super.cmd_(nil, obj)'
    },
    // TODO/REVIEW: ?
    // {
    //   name: 'listen_',
    //   code: function listen_(x, sink, predicate) {
    //     this.SUPER(null, sink, predicate);
    //     return foam.core.FObject.create();
    //   },
    //   javaCode: `super.listen_(null, sink, predicate);`,
    //   swiftCode: `return try super.listen_(nil, sink, predicate)`
    // },
  ]
});
