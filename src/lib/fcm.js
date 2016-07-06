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

// TODO: doc
foam.CLASS({
  package: 'com.firebase',
  name: 'CloudMessaging',

  requires: [
    'foam.net.node.HTTPRequest',
  ],

  properties: [
    {
      name: 'serverKey'
    }
  ],

  methods: [
    function send(id, payload, collapseKey) {
      return this.HTTPRequest.create({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
          "content-type": "application/json",
          "Authorization": "key=" + this.serverKey
        },
        responseType: 'json',
        payload: JSON.stringify({
          to: id,
          data: payload
        })
      }).send().then(function(resp) {
        if ( ! resp.success ) {
          return resp.payload.then(function(p) { return Promise.reject(p); });
        }
      });
    }
  ]
});
