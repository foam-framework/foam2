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


foam.LIB({
  name: 'foam.AbstractClass',
  methods: [
    function javaSource() {
      return foam.java.JavaUtil.create().javaSource(this);
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
      public Parser jsonParser() {
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
  refines: 'foam.core.FObjectProperty',
  properties: [
    ['javaType', 'foam.core.FObject'],
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
  package: 'foam.java',
  name: 'JavaUtil',
  axioms: [
    foam.pattern.Singleton.create()
  ],
  templates: [
    {
      name: 'classInfo',
      template: function(cls) {/*<% var cls = arguments[1]; %>
new ClassInfo()
  .setId("<%= cls.id %>")
  <%
  var a = cls.getAxioms();
  for ( var i = 0 ; i < a.length ; i++ ) {
    if ( ! a[i].axiomClassInfo ) continue;
    a[i].axiomClassInfo(output, cls);
%>
  <%
  }
%>;*/}
    },
    {
      name: 'javaSource',
      template: function(cls) {/*<% var cls = arguments[1];
%>// GENERATED CODE
// adamvy@google.com
package <%= cls.package %>;

import foam.core.*;

import foam.lib.parse.*;
import foam.lib.json.*;

public <%= cls.model_.abstract ? 'abstract ' : '' %>class <%= cls.name %> extends <%= cls.model_.extends %><%
  var interfaces = cls.getAxiomsByClass(foam.core.Implements);
  if ( interfaces.length > 0 ) { %> implements <% }
  for ( var i = 0 ; i < interfaces.length ; i++ ) {
    var intf = interfaces[i];
    %><%= intf.path %><%
    if ( i < interfaces.length - 1 ) { %>,<% }
    %> <%
  }
%> {
  private static ClassInfo classInfo_ = <% this.classInfo(output, cls) %>

  public ClassInfo getClassInfo() {
    return classInfo_;
  }

  public static ClassInfo getOwnClassInfo() {
    return classInfo_;
  }

<%
  var a = cls.getAxioms();

for ( var i = 0 ; i < a.length; i++ ) {
if ( ! a[i].axiomJavaSource ) continue;
%>
  <% a[i].axiomJavaSource(output, cls); %>
<%
}

%>
}
*/}
    }
  ]
});
