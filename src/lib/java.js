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
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'javaType'
    }
  ],
  templates: [
    {
      name: 'axiomJavaSource',
      template: function() {/*<% var cls = arguments[1]; if ( this.javaType ) { %>
private <%= this.javaType %> <%= this.name %>_;

public <%= this.javaType %> get<%= foam.String.capitalize(this.name) %>() {
  return <%= this.name %>_;
}

public <%= cls.name %> set<%= foam.String.capitalize(this.name) %>(<%= this.javaType %> val) {
  <%= this.name %>_ = val;
  return this;
}
<% } %>*/}
    },
    {
      name: 'axiomClassInfo',
      template: function() {/*<% var cls = arguments[1]; %>
  .addProperty(
    new PropertyInfo() {
      @Override
      public String getName() { return "<%= this.name %>"; }

      @Override
      public Object get(Object obj) {
        return ((<%= cls.name %>)obj).get<%= foam.String.capitalize(this.name) %>();
      }

      @Override
      public void set(Object obj, Object value) {
        ((<%= cls.name %>)obj).set<%= foam.String.capitalize(this.name) %>((<%= this.javaType %>)value);
      }

      @Override
      public Parser jsonParser() {
        return new <%= foam.String.capitalize(this.javaType) %>Parser();
      }})
*/}
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    ['javaType', 'String']
  ]
});

foam.CLASS({
  refines: 'foam.core.Int',
  properties: [
    ['javaType', 'int']
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

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;

import foam.lib.parse.*;
import foam.lib.json.*;

public class <%= cls.name %> extends FObject {
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
