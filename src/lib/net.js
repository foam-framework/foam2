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
  id: 'foam.net.LibScript',
  // TODO: flags/requires?
  code: function() {
  var pkg = 'foam.net.' + (foam.isServer ? 'node' : 'web');
  var clss = [
    'BaseHTTPRequest',
    'HTTPRequest',
    'HTTPResponse',
    'WebSocket',
    'WebSocketService'
  ];

  // For each class with a "web" (browser) and "node" (Node JS)
  // implementation, register "foam.net.[environment].[class]" as
  // "foam.net.[class]".
  //
  // TODO: This should be provided via a sort of "ContextFactory" or similar.
  for ( var i = 0; i < clss.length; i++ ) {
    foam.register(foam.lookup(pkg + '.' + clss[i]), 'foam.net.' + clss[i]);
  }
  }
})
