/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'Session',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      javaFactory: 'return java.util.UUID.randomUUID().toString();',
    },
    {
      class: 'Long',
      name: 'userId',
      tableCellFormatter: function(value, obj) {
        this.add(value);
        this.__context__.userDAO.find(value).then(function(user) {
          this.add(' ', user.label());
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      javaFactory: 'return new Date();'
    },
    {
      class: 'DateTime',
      name: 'lastUsed'
    },
    {
      class: 'Long',
      name: 'uses'
    },
    {
      class: 'DateTime',
      name: 'expiry',
      javaFactory: 'return new Date(System.currentTimeMillis()+8l*60l*60l*1000l);'
    },
    {
      class: 'String',
      name: 'remoteHost'
    },
    {
      class: 'Object',
      name: 'context',
      javaType: 'foam.core.X',
      javaFactory: 'return foam.core.EmptyX.instance().put(Session.class, this);',
      hidden: true,
      transient: true
    }
  ]
});
