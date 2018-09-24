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
  package: 'foam.net',
  name: 'RetryHTTPRequest',
  extends: 'foam.net.BaseHTTPRequest',

  documentation: `HTTP request for retrying requests that fail at the service
      level; e.g., network timeout, connection reset. This class does not check
      HTTP status codes, it simply retries requests that reject-on-send().`,

  requires: [ 'foam.net.BaseHTTPRequest' ],
  imports: [ 'error', 'warn' ],

  properties: [
    {
      class: 'Int',
      name: 'numTries',
      value: 4
    },
    {
      class: 'Proxy',
      of: 'foam.net.BaseHTTPRequest',
      name: 'delegate',
      factory: function() {
        return this.BaseHTTPRequest.create(this);
      }
    },
    {
      class: 'Int',
      name: 'currentTry_'
    }
  ],

  methods: [
    function send() {
      return this.delegate.send().catch(this.onError);
    }
  ],

  listeners: [
    function onError(error) {
      this.currentTry_++;
      this.__context__.warn('RetryHTTPRequest: Try #' + this.currentTry_ +
                ' failed on ' + error);
      if ( this.currentTry_ < this.numTries ) {
        return this.send();
      } else {
        this.error('RetryHTTPRequest: Max tries reached');
        throw new Error('RetryHTTPRequest: Max tries reached');
      }
    }
  ]
});
