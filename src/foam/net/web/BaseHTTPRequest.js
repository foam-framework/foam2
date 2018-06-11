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


foam.SCRIPT({
  id: 'foam.net.web.HTTPRequestScript',
  requires: [
    'foam.net.web.HTTPRequest',
  ],
  flags: ['web'],
  code: function() {
// Registering BaseHTTPRequest facilitates decoration when HTTPRequest has been
// re-overridden.
foam.register(foam.lookup('foam.net.web.HTTPRequest'),
              'foam.net.web.BaseHTTPRequest');
  }
});
