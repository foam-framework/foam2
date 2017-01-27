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
  name: 'JavaClass',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'String',
      name: 'id',
      expression: function(name, package) {
        return package + '.' + name;
      }
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: false
    },
    {
      class: 'String',
      name: 'extends',
      preSet: function(_, a) {
        if ( a === 'FObject' ) return 'AbstractFObject';
        return a;
      }
    },
    {
      class: 'StringArray',
      name: 'imports',
      value: [
        'foam.core.*'
      ]
    },
    {
      class: 'StringArray',
      name: 'implements',
      adapt: function(o, v) {
        if ( foam.String.isInstance(v) ) return [v];
        return v;
      }
    },
    {
      class: 'Boolean',
      name: 'generateClassInfo',
      value: true
    },
    {
      class: 'Array',
      name: 'axioms'
    }
  ],

  methods: [
    function fromClass(cls) {
      this.package = cls.model_.package;
      this.name = cls.model_.name;
      this.extends = cls.model_.extends;
      this.implements = cls.getAxiomsByClass(foam.core.Implements).map(function(a) {
        return a.path;
      });
      this.abstract = cls.model_.abstract;
      this.axioms = cls.getAxioms();
      return this;
    }
  ],

  templates: [
    {
      name: 'code',
      template: function() {/*<%
%>// GENERATED CODE
// adamvy@google.com
package <%= this.package %>;

<% for ( var i = 0 ; this.imports && i < this.imports.length ; i++ ) {
%>import <%= this.imports[i] %>;
<% } %>

public <%= this.abstract ? 'abstract ' : '' %>class <%= this.name %> extends <%= this.extends %><%
  if ( this.implements && this.implements.length > 0 ) { %> implements <%
    for ( var i = 0 ; i < this.implements.length ; i++ ) {
      %><%= this.implements[i] %><%
      if ( i < this.implements.length - 1 ) { %>,<% }
      %> <%
    }
  }
%> {
<% if ( this.generateClassInfo ) { %>
  private static ClassInfo classInfo_ = new ClassInfo()
    .setId("<%= this.id %>")
<%
  var a = this.axioms;
  for ( var i = 0 ; i < a.length ; i++ ) {
    if ( ! a[i].axiomClassInfo ) continue;
    a[i].axiomClassInfo(output, this);
%>
  <%
  }
%>;

  public ClassInfo getClassInfo() {
    return classInfo_;
  }

  public static ClassInfo getOwnClassInfo() {
    return classInfo_;
  }

<%
  }

  var a = this.axioms;

for ( var i = 0 ; i < a.length; i++ ) {
  if ( ! a[i].axiomJavaSource ) continue;
  a[i].axiomJavaSource(output, this); %>
<%
}

%>
}
*/}
    }
  ]
});


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
      template: function() {/*if ( ! ( message instanceof foam.box.RPCMessage) ) {
      // TODO error to errorBox
      return;
    }

    foam.box.RPCMessage rpc = (foam.box.RPCMessage)message;
    foam.box.Box replyBox = message.getReplyBox();
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

      replyBox.send(reply);
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
  ],

  templates: [
    {
      name: 'axiomJavaInterfaceSource',
      template: function() {/*
  public <%= this.javaReturns || 'void' %> <%= this.name %>(<%
for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
  var arg = this.args[i];
  %><%= arg.javaType || 'Object' %> <%= arg.name %><%
  if ( i != this.args.length - 1 ) { %>, <% }
}
%>);
*/}
    },
    {
      name: 'axiomJavaSource',
      template: function() {/*<% if ( ! this.javaCode ) { return opt_outputter || ''; } %>
  public <%= this.javaReturns || 'void' %> <%= this.name %>(<%
for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
  var arg = this.args[i];
  %><%= arg.javaType || 'Object' %> <%= arg.name %><%
  if ( i != this.args.length - 1 ) { %>, <% }
}
%>) {
  <%= this.javaCode %>
  }
*/}
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
  ],

  templates: [
    {
      name: 'axiomJavaSource',
      template: function() {/*
  public Object get<%= foam.String.capitalize(this.name) %>() {
    return getX().get("<%= this.key %>");
  }
*/}
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
  ],

  templates: [
    {
      name: 'axiomJavaInterfaceSource',
      template: function() {/*<% var cls = arguments[1] %>
  public <%= this.javaType %> get<%= foam.String.capitalize(this.name) %>();
  public <%= cls.name %> set<%= foam.String.capitalize(this.name) %>(<%= this.javaType %> val);
*/}
    },
    {
      name: 'axiomJavaSource',
      template: function() {/*<% var cls = arguments[1]; if ( this.javaType ) { %>
private <%= this.javaType %> <%= this.name %>;

public <%= this.javaType %> get<%= foam.String.capitalize(this.name) %>() {
  return <%= this.name %>;
}

public <%= cls.name %> set<%= foam.String.capitalize(this.name) %>(<%= this.javaType %> val) {
  <%= this.name %> = val;
  return this;
}
<% } %>*/}
    },
    {
      name: 'axiomClassInfo',
      template: function() {/*<% var cls = arguments[1]; %>
  .addProperty(
    new <%= this.javaInfoType %>() {
      @Override
      public String getName() { return "<%= this.name %>"; }

      @Override
      public Object get(Object o) {
        return get_(o);
      }

      public <%= this.javaType %> get_(Object obj) {
        return ((<%= cls.name %>)obj).get<%= foam.String.capitalize(this.name) %>();
      }

      @Override
      public void set(Object obj, Object value) {
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>((<%= this.javaType %>)value);
      }

<% if ( this.javaToJSON ) { %>
      @Override
      public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value) {
<%= this.javaToJSON %>
      }
<% } %>

      @Override
      public int compare(Object o1, Object o2) {
        return compareValues((<%= this.javaType %>)get(o1), (<%= this.javaType %>)get(o2));
      }

      @Override
      public foam.lib.parse.Parser jsonParser() {
        return new <%= this.javaJSONParser %>();
      }})
*/}
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
  ],

  templates: [
    {
      name: 'axiomClassInfo',
      template: function() {/*<% var cls = arguments[1]; %>
  .addProperty(
    new <%= this.javaInfoType %>() {
      @Override
      public String getName() { return "<%= this.name %>"; }

      @Override
      public Object get(Object o) {
        return get_(o);
      }

      public <%= this.javaType %> get_(Object obj) {
        return ((<%= cls.name %>)obj).get<%= foam.String.capitalize(this.name) %>();
      }

      @Override
      public void set(Object obj, Object value) {
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>((<%= this.javaType %>)value);
      }

<% if ( this.javaToJSON ) { %>
      @Override
      public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value) {
<%= this.javaToJSON %>
      }
<% } %>

      public int compare(Object o1, Object o2) {
        <%= this.javaType %> values1 = get_(o1);
        <%= this.javaType %> values2 = get_(o2);
        if ( values1.length > values2.length ) return 1;
        if ( values1.length < values2.length ) return -1;

        int result;
        for ( int i = 0 ; i < values1.length ; i++ ) {
          result = ((Comparable)values1[i]).compareTo(values2[i]);
          if ( result != 0 ) return result;
        }
        return 0;
      }

      @Override
      public foam.lib.parse.Parser jsonParser() {
        return new <%= this.javaJSONParser %>();
      }})*/}
    }
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
  ],

  templates: [
    {
      name: 'axiomClassInfo',
      template: function() {/*<% var cls = arguments[1]; %>
  .addProperty(
    new <%= this.javaInfoType %>() {
      @Override
      public String getName() { return "<%= this.name %>"; }

      @Override
      public Object get(Object o) {
        return get_(o);
      }

      public <%= this.javaType %> get_(Object obj) {
        return ((<%= cls.name %>)obj).get<%= foam.String.capitalize(this.name) %>();
      }

      @Override
      public void set(Object obj, Object value) {
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>((<%= this.javaType %>)value);
      }

<% if ( this.javaToJSON ) { %>
      @Override
      public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value) {
<%= this.javaToJSON %>
      }
<% } %>

      public int compare(Object o1, Object o2) {
        <%= this.javaType %> values1 = get_(o1);
        <%= this.javaType %> values2 = get_(o2);
        if ( values1.length > values2.length ) return 1;
        if ( values1.length < values2.length ) return -1;

        int result;
        for ( int i = 0 ; i < values1.length ; i++ ) {
          result = ((Comparable)values1[i]).compareTo(values2[i]);
          if ( result != 0 ) return result;
        }
        return 0;
      }

      @Override
      public foam.lib.parse.Parser jsonParser() {
        return new <%= this.javaJSONParser %>();
      }})*/}
    }
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
