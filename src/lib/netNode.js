/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.SCRIPT({
  package: 'foam.net',
  name: 'NodeLibScript',
  flags: ['node'],
  requires: [
    'foam.net.node.BaseHTTPRequest',
    'foam.net.node.HTTPRequest',
    'foam.net.node.HTTPResponse',
    'foam.net.node.WebSocket',
    'foam.net.node.WebSocketService'
  ],
  code: function() {
  var pkg = 'foam.net.node';
  var clss = [
    'BaseHTTPRequest',
    'HTTPRequest',
    'HTTPResponse',
    'WebSocket',
    'WebSocketService'
  ];

  // TODO: This should be provided via a sort of "ContextFactory" or similar.
  for ( var i = 0; i < clss.length; i++ ) {
    foam.register(foam.lookup(pkg + '.' + clss[i]), 'foam.net.' + clss[i]);
  }
  }
})
