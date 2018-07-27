/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.SCRIPT({
  package: 'foam.net',
  name: 'WebLibScript',
  flags: ['web'],
  requires: [
    'foam.net.web.HTTPRequest',
    'foam.net.web.HTTPRequestScript', // For BaseHTTPRequest
    'foam.net.web.HTTPResponse',
    'foam.net.web.WebSocket',
    'foam.net.web.WebSocketService',
  ],
  code: function() {
  var pkg = 'foam.net.web';
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
