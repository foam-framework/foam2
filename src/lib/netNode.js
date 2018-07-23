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
