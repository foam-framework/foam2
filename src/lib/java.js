/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Skeleton',

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'name',
      expression: function(of) {
        return this.of.name + 'Skeleton';
      }
    },
    {
      name: 'package',
      expression: function(of) {
        return this.of.package;
      }
    },
    {
      name: 'id',
      expression: function(name, package) {
        return package + '.' + name;
      }
    }
  ],

  methods: [
    function buildJavaClass(cls) {
      cls = cls || foam.java.Class.create();

      cls.package = this.package;
      cls.name = this.name;
      cls.extends = 'foam.core.ContextAwareSupport',
      cls.implements = ['foam.box.Box'];

      foam.core.Object.create({
        name: 'delegate',
        javaType: this.of.id
      }).buildJavaClass(cls);

      cls.method({
        type: 'void',
        visibility: 'public',
        name: 'send',
        args: [ { name: 'message', type: 'foam.box.Message' } ],
        body: this.sendMethodCode()
      });

      return cls;
    }
  ],

  templates: [
    {
      name: 'sendMethodCode',
      template: function() {/*if ( ! ( message.getObject() instanceof foam.box.RPCMessage) ) {
      // TODO error to errorBox
      return;
    }

    foam.box.RPCMessage rpc = (foam.box.RPCMessage)message.getObject();
    foam.box.Box replyBox = (foam.box.Box)message.getAttributes().get("replyBox");
    Object result = null;

    switch ( rpc.getName() ) {<%
  var methods = this.of.getOwnAxiomsByClass(foam.core.Method);
  for ( var i = 0 ; i < methods.length ; i++ ) {
    var m = methods[i]; %>
      case "<%= m.name %>":
        <% if ( m.javaReturns && m.javaReturns !== 'void' ) { %>result = <% } %>getDelegate().<%= m.name %>(
          <%
    for ( var j = 0 ; j < m.args.length ; j++ ) {
      %>(<%= m.args[j].javaType %>)(rpc.getArgs() != null && rpc.getArgs().length > <%= j %> ? rpc.getArgs()[<%= j %>] : null)<%
      if ( j != m.args.length - 1 ) { %>,
          <% }
    }
    %>);
        break;
    <%
  }%>
      default: throw new RuntimeException("No such method found \\"" + rpc.getName() + "\\"");
    }

    if ( replyBox != null ) {
      foam.box.RPCReturnMessage reply = (foam.box.RPCReturnMessage)getX().create(foam.box.RPCReturnMessage.class);
      reply.setData(result);

      replyBox.send(getX().create(foam.box.Message.class).setObject(reply));
    }*/}
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractMethod',

  properties: [
    {
      class: 'String',
      name: 'javaCode'
    },
    {
      class: 'String',
      name: 'javaReturns'
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: true
    },
    {
      class: 'StringArray',
      name: 'javaThrows'
    }
  ],

  methods: [
    function createChildMethod_(child) {
      var m = child.clone();
      m.returns = child.hasOwnProperty('returns') ?
        child.returns :
        this.returns;

      m.args = child.hasOwnProperty('args') ?
        child.args :
        ( this.args || [] );

      m.javaReturns = child.hasOwnProperty('javaReturns') ?
        child.javaReturns : this.javaReturns;
      m.sourceCls_ = child.sourceCls_;

      child.throws = this.throws;
      child.code = child.code || this.code;
      return m;
    },

    function buildJavaClass(cls) {
      if ( ! this.javaCode && ! this.abstract ) return;

      cls.method({
        name: this.name,
        type: this.javaReturns || 'void',
        visibility: 'public',
        throws: this.javaThrows,
        args: this.args && this.args.map(function(a) {
          return {
            name: a.name,
            type: a.javaType
          };
        }),
        body: this.javaCode ? this.javaCode : ''
      });
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [
    {
      class: 'Boolean',
      name: 'javaSupport',
      value: true
    }
  ],
  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;
      return this.SUPER(cls);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
    {
      class: 'Boolean',
      name: 'abstract',
      value: false
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Import',

  methods: [
    function buildJavaClass(cls) {
      cls.method({
        type: 'Object',
        name: 'get' + foam.String.capitalize(this.name),
        body: 'return getX().get("' + this.key + '");',
        visibility: 'protected'
      });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    {
      name: 'toString',
      javaReturns: 'String',
      code: foam.core.FObject.prototype.toString
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AbstractInterface',
  axioms: [
    {
      installInClass: function(cls) {
        cls.buildJavaClass =  function(cls) {
          cls = cls || foam.java.Interface.create();

          cls.name = this.name;
          cls.package = this.package;
          cls.extends = this.extends;

          var axioms = this.getAxioms();

          for ( var i = 0 ; i < axioms.length ; i++ ) {
            axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls);
          }

          return cls;
        };
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'String',
      name: 'javaType',
      value: 'Object'
    },
    {
      class: 'String',
      name: 'javaJSONParser',
      value: 'foam.lib.json.AnyParser'
    },
    {
      class: 'String',
      name: 'javaInfoType'
    },
    {
      class: 'String',
      name: 'javaToJSON'
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    ['javaType', 'String'],
    ['javaInfoType', 'foam.core.AbstractStringPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.StringParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of ? of : 'foam.core.FObject';
      }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Array',

  properties: [
    ['javaType', 'Object[]'],
    ['javaInfoType', 'foam.core.AbstractPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.ArrayParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',

  properties: [
    {
      name: 'javaType',
      expression: function(of) {
        return of + '[]'
      }
    },
    {
      name: 'javaJSONParser',
      value: 'foam.lib.json.FObjectArrayParser'
    },
    ['javaInfoType', 'foam.core.AbstractPropertyInfo']
  ]
});


foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    ['javaType', 'boolean'],
    ['javaJSONParser', 'foam.lib.json.BooleanParser'],
    ['javaInfoType', 'foam.core.AbstractBooleanPropertyInfo']
  ]
});


foam.CLASS({
  refines: 'foam.core.Object',
  properties: [
    ['javaType', 'Object'],
    ['javaJSONParser', 'foam.lib.json.AnyParser'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo']
  ]
});


foam.CLASS({
  refines: 'foam.core.Proxy',
  properties: [
    {
      name: 'javaType',
      expression: function(of) { return of ? of : 'Object'; }
    },
    ['javaInfoType', 'foam.core.AbstractFObjectPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.FObjectParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [
    ['javaType', 'Object'],
    ['javaJSONParser', 'foam.lib.json.AnyParser'],
    ['javaInfoType', 'foam.core.AbstractObjectPropertyInfo']
  ]
});
