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

foam.CLASS({
  package: 'com.google.net',
  name: 'GoogleOAuth2HTTPRequestDecorator',

  imports: [
    'setTimeout',
    'warn'
  ],

  constants: {
    GAPI_SIGNIN_PROMISE: { a: null }
  },

  properties: [
    'clientId',
    'cookiePolicy',
    'scopes',
    'auth2',
    'authToken'
  ],

  methods: [
    function init() {
      this.SUPER();

      this.headers = this.headers || {};

      var self = this;

      self.auth2 = new Promise(function(resolve, reject) {
        var authLoad = function() {
          if ( ! gapi ) {
            self.warn("Google Authentication Platform API (gapi) not loaded in time. Retrying.")
            self.setTimeout(authLoad, 500);
          }

          // fn to init if necessary and resolve everything
          function getAuth2() {
            if ( ! gapi.auth2.getAuthInstance() ) {
              gapi.auth2.init({
                client_id: self.clientId,
                cookiepolicy: self.cookiePolicy ,
                scope: self.scopes
              });
            }
            // Note: auth2 is thenable, so can't put it directly into the Promise
            resolve({ a: gapi.auth2.getAuthInstance() });
          }

          // load if necessary and complete with getAuth2()
          if ( ! gapi.auth2 ) {
            gapi.load('auth2', function() {
              getAuth2();
            });
          } else {
            getAuth2();
          }
        }
        authLoad();
      });
    },

    function onSignIn(user) {
      var authResponse = user.getAuthResponse();
      this.authToken = authResponse.token_type + " "+ authResponse.access_token;
      this.headers.Authorization = this.authToken;
    },

    function send() {
      var self = this;
      var SUPER = this.SUPER.bind(this);

      return self.auth2.then(function(auth2) {
        auth2 = auth2.a;

        if ( ! auth2.isSignedIn.get() ) {
          // kick off GAPI_SIGNIN_PROMISE if non-existent
          if ( ! self.GAPI_SIGNIN_PROMISE.a ) {
            self.GAPI_SIGNIN_PROMISE.a = auth2.signIn();
          }
          return self.GAPI_SIGNIN_PROMISE.a.then(self.onSignIn.bind(self)).then(SUPER).then(self.completeSend);

        } else {
          // grab token from gapi if we don't have a local copy yet
          if ( ! self.authToken || ! self.headers.Authorization ) {
            self.onSignIn(auth2.currentUser.get());
          }
          return SUPER().then(self.completeSend);
        }
      });
    },

    function completeSend(response) {
      // check for 403, retry request
      return Promise.resolve(response);
    }
  ]
});


foam.CLASS({
  package: 'com.google.net',
  name: 'GoogleOAuth2XMLHTTPRequest',
  extends: 'foam.net.web.XMLHTTPRequest',

  implements: [
    'com.google.net.GoogleOAuth2HTTPRequestDecorator'
  ]
});
