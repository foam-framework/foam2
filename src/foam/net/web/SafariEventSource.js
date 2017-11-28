/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.net.web',
  name: 'SafariEventSource',
  extends: 'foam.net.web.EventSource',

  requires: [
    'foam.net.web.XMLHTTPRequest as HTTPRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'buffer'
    }
  ],

  listeners: [
    function onData(s, _, data) {
      this.delay = 1;
      this.keepAlive();

      this.buffer += data;
      var string = this.buffer;

      while ( string.indexOf('\n') != -1 ) {
        var line = string.substring(0, string.indexOf('\n'));
        this.processLine(line);
        string = string.substring(string.indexOf('\n') + 1);
      }

      this.buffer = string;
    }
  ]
});
