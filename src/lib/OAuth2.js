/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

/** OAuth2 and web client, ported from FOAM1 */
CLASS({
  name: 'OAuth2',
  package: 'foam.oauth2',
  requires: [
    'XHRHTTPRequest',
  ],

  properties: [
    {
      name: 'accessToken',
      help: 'Token used to authenticate requests.'
    },
    {
      name: 'clientId',
      required: true,
      transient: true
    },
    {
      name: 'clientSecret',
      required: true,
      transient: true
    },
    {
      type: 'StringArray',
      name: 'scopes',
      required: true,
      transient: true
    },
    {
      type: 'URL',
      name: 'endpoint',
      defaultValue: "https://accounts.google.com/o/oauth2/"
    },
    {
      type: 'Function',
      name: 'refresh_',
      transient: true,
      lazyFactory: function() {
        return this.refresh_ = /*amerged(*/this.refreshNow_.bind(this)/*)*/;
      }
    }
  ],

  methods: {
    refreshNow_: function(){},

    refresh: function(callback, opt_forceInteractive) {
      return this.refresh_(callback, opt_forceInteractive);
    },

    setJsonpFuture: function(X, future) {
      var agent = this;
      future.set((function() {
        return function(url, params, opt_method, opt_payload) {
          return function(callback) {
            var xhr = agent.XHRHTTPRequest.create();
            xhr.authAgent: agent,
            xhr.responseType: "json",
            xhr.retries: 3
            xhr.url = url + (params ? '?' + params.join('&') : '');
            xhr.payload = opt_payload;
            xhr.method = opt_method ? opt_method : "GET";

            xhr.send().then(function(response) {
              return response.payload.then(function(payload) {
                callback(payload, response.status);
              });
            });
          };
        };
      })());
    }
  }
});




CLASS({
  name: 'OAuth2WebClient',
  package: 'foam.oauth2',
  help: 'Strategy for OAuth2 when running as a web page.',

  extends: 'foam.oauth2.OAuth2',

  methods: {
    refreshNow_: function(callback, opt_forceInteractive) {
      var self = this;
      var w;
      var cb = wrapJsonpCallback(function(code) {
        self.accessToken = code;
        try {
          callback(code);
        } finally {
          w && w.close();
        }
      }, true /* nonce */);

      var path = location.pathname;
      var returnPath = location.origin +
        location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/oauth2callback.html';

      var queryparams = [
        '?response_type=token',
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=' + encodeURIComponent(returnPath),
        'scope=' + encodeURIComponent(this.scopes.join(' ')),
        'state=' + cb.id,
        'approval_prompt=' + (opt_forceInteractive ? 'force' : 'auto')
      ];

      w = window.open(this.endpoint + "auth" + queryparams.join('&'));
    }
  }
});

// direct port from FOAM1, consider refactoring
foam.__JSONP_CALLBACKS__ = {};
var wrapJsonpCallback = (function() {
  var nextID = 0;

  return function(callback, opt_nonce) {
    var id = 'c' + (nextID++);
    if ( opt_nonce ) id += Math.floor(Math.random() * 0xffffff).toString(16);

    var cb = foam.__JSONP_CALLBACKS__[id] = function(data) {
      delete foam.__JSONP_CALLBACKS__[id];

      // console.log('JSONP Callback', id, data);

      callback && callback.call(this, data);
    };
    cb.id = id;

    return cb;
  };
})();

