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
