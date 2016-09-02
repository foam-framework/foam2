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
  name: 'Argument',
  properties: [
    'type',
    'name'
  ],
  templates: [
    {
      name: 'code',
      template: '<%= this.type %> <%= this.name %>'
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'Method',
  properties: [
    'name',
    'visibility',
    'static',
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    'body'
  ],
  templates: [
    {
      name: 'code',
      template: function() {/*<%=
  this.visibility %> <%=
  this.static ? 'static ' : '' %><%=
  this.type %> <%=
  this.name %>(<%
  if ( this.args && this.args.length ) {
    for ( var i = 0 ; i < this.args.length ; i++ ) {
      this.args[i].code(output);
    }
  } %>) {
<%= this.body %>
}*/}
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'Field',
  properties: [
    'name',
    'visibility',
    'static',
    'type',
    'initializer'
  ],
  templates: [
    {
      name: 'code',
      template: function() {/*<%= this.visibility %> <%=
  this.static ? 'static ' : '' %><%=
  this.type %> <%=
  this.name %><%
  if ( this.initializer ) { %> = <%= this.initializer %><% } %>;*/}
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'Constructor',
  properties: [
    'args',
    'code'
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'Class',
  properties: [
    'name',
    'package',
    'implements',
    'abstract',
    'extends',
    {
      name: 'methods',
      factory: function() { return []; }
    },
    {
      name: 'fields',
      factory: function() { return []; }
    },
//    { class: 'FObjectArray', of: 'foam.java.Field', name: 'fields' },
    'imports',
    'constructors'
  ],
  methods: [
    function field(f) {
      this.fields.push(foam.java.Field.create(f));
      return this;
    },
    function method(m) {
      this.methods.push(foam.java.Method.create(m));
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
public <%= this.abstract ? 'abstract ' : '' %>class <%= this.name %><%
  if ( this.extends ) { %> extends <%= this.extends %><% }
  if ( this.implements && this.implements.length > 0 ) { %> implements <%
    for ( var i = 0 ; i < this.implements.length ; i++ ) {
      %><%= this.implements[i] %><%
      if ( i < this.implements.length - 1 ) { %>,<% }
      %> <%
    }
  }
%> {
<%
  for ( var i = 0 ; i < this.fields.length ; i++ ) {
    this.fields[i].code(output, this);%>
<%
  }

  for ( var i = 0 ; i < this.methods.length ; i++ ) {
    this.methods[i].code(output, this);%>
<%
  }
%>
}
*/}
    }
  ]
});

foam.LIB({
  name: 'foam.AbstractClass',
  methods: [
    function buildJavaClass(cls) {
      cls.name = this.model_.name;
      cls.package = this.model_.package;
      cls.extends = this.model_.extends === 'FObject' ?
        'foam.core.AbstractFObject' : this.model_.extends;
      cls.abstract = this.model_.abstract;

      var axioms = this.getAxioms();
      for ( var i = 0 ; i < axioms.length ; i++ ) {
        axioms[i].buildJavaClass && axioms[i].buildJavaClass(cls);
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.Property',
  methods: [
    function buildJavaClass(cls) {
      var privateName = this.name + '_';
      var capitalized = foam.String.capitalize(this.name);

      cls
        .field({
          name: privateName,
          type: this.javaType,
          visibility: 'private'
        })
        .method({
          name: 'get' + capitalized,
          type: this.javaType,
          visibility: 'public',
          body: 'return ' + privateName
        })
        .method({
          name: 'set' + capitalized,
          visibility: 'public',
          args: [
            {
              type: this.javaType,
              name: 'val'
            }
          ],
          type: cls.name,
          body: privateName + ' = val;\n'
            + 'return this'
        });
    }
  ]
});
