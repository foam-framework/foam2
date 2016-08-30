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
      value: 'foam.core.FObject'
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
        if ( foam.String.is(v) ) return [v];
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
      class: 'Class2',
      name: 'of'
    },
    {
      name: 'name',
      expression: function(of) {
        return this.of$cls.name + 'Skeleton';
      }
    },
    {
      name: 'package',
      expression: function(of) {
        return this.of$cls.package;
      }
    },
    {
      name: 'id',
      expression: function(name, package) {
        return package + '.' + name;
      }
    }
  ],
  templates: [
    {
      name: 'code',
      template: function() {/*
package <%= this.package %>;

import foam.core.ContextAwareSupport;

public class <%= this.name %> extends ContextAwareSupport implements foam.box.Box {
  private <%= this.of %> delegate_;
  public <%= this.of %> getDelegate() { return delegate_; }
  public <%= this.name %> setDelegate(<%= this.of %> delegate) {
    delegate_ = delegate;
    return this;
  }

  public void send(foam.box.Message message) {
    if ( ! ( message instanceof foam.box.RPCMessage) ) {
      // TODO error to errorBox
      return;
    }

    foam.box.RPCMessage rpc = (foam.box.RPCMessage)message;
    foam.box.Box replyBox = message.getReplyBox();
    Object result = null;

    switch ( rpc.getName() ) {<%
  var methods = this.of$cls.getAxiomsByClass(foam.core.Method);
  for ( var i = 0 ; i < methods.length ; i++ ) {
    var m = methods[i]; %>
      case "<%= m.name %>":
        <% if ( m.javaReturns && m.javaReturns !== 'void' ) { %>result = <% } %>getDelegate().<%= m.name %>(<%
    for ( var j = 0 ; j < m.args.length ; j++ ) {
      %>(<%= m.args[j].javaType %>)rpc.getArgs()[<%= j %>]<%
      if ( j != m.args.length - 1 ) { %>, <% }
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
    }
  }
}
  */}
    }
  ]
});

foam.LIB({
  name: 'foam.AbstractClass',
  methods: [
    function javaSource() {
      return foam.java.JavaClass.create().fromClass(this).code();
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
    }
  ],

  methods: [
    function createChildMethod_(child) {
      var m = child.clone();
      m.returns = this.returns;
      m.args = this.args;
      m.javaReturns = this.javaReturns;
      m.sourceCls_ = child.sourceCls_;
      return m;
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
  refines: 'foam.core.Import',
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
  refines: 'foam.core.Interface',
  templates: [
    {
      name: 'javaSource',
      template: function() {/*
// GENERATED CODE
package <%= this.package %>;

public interface <%= this.name %><% if ( this.extends ) { %><%= this.extends %><% } %> {
<%
  for ( var i = 0 ; i < this.axioms_.length ; i++ ) {
    var axiom = this.axioms_[i];
    if ( axiom.axiomJavaInterfaceSource ) axiom.axiomJavaInterfaceSource(output, this);
  }
%>
}
*/}
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'javaType'
    },
    {
      class: 'String',
      name: 'javaJsonParser'
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
    new AbstractPropertyInfo() {
      @Override
      public String getName() { return "<%= this.name %>"; }

      @Override
      public Object get(Object obj) {
        return ((<%= cls.name %>)obj).get<%= foam.String.capitalize(this.name) %>();
      }

      @Override
      public void set(Object obj, Object value) {<%
// TODO(adamvy): There should be a more polymorphic way of doing this.
// or we shouldn't support Array properties and use Lists instead.
if ( foam.core.FObjectArray.isInstance(this) ) { %>
        Object[] src = (Object[])value;
        <%= this.javaType %> a = new <%= this.of %>[src.length];
        System.arraycopy(src, 0, a, 0, src.length);
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>(a);
<% } else { %>
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>((<%= this.javaType %>)value);
<% } %>
      }

<% if ( this.javaOutputJSON ) { %>
      @Override
      public void toJSON(foam.lib.json.Outputter outputter, StringBuilder out, Object value) {
<%= this.javaToJSON %>
      }
<% } %>

      @Override
      public foam.lib.parse.Parser jsonParser() {
        return new <%= this.javaJsonParser %>();
      }})
*/}
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      class: 'String',
      name: 'javaType',
      value: 'String'
    },
    ['javaJsonParser', 'foam.lib.json.StringParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Int',
  properties: [
    ['javaType', 'int'],
    ['javaJsonParser', 'foam.lib.json.IntParser']
  ]
});


foam.CLASS({
  refines: 'foam.core.Array',
  properties: [
    ['javaType', 'Object[]'],
    ['javaJsonParser', 'foam.lib.json.ArrayParser']
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
    ['javaJsonParser', 'foam.lib.json.FObjectParser']
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
      name: 'javaJsonParser',
      value: 'foam.lib.json.FObjectArrayParser'
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    ['javaType', 'boolean'],
    ['javaJsonParser', 'foam.lib.json.BooleanParser']
  ]
});
