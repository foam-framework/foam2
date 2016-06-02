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
  package: 'foam.net',
  name: 'GoogleOAuth2HTTPRequestDecorator',

  imports: [
    'oauth2ClientId',
    'oauth2CookiePolicy',
    'oauth2Scopes',
  ],

  properties: [
    'auth2',
    'authToken',
  ],

  methods: [
    function init() {
      this.SUPER();

      this.headers = this.headers || {};

      var self = this;

      self.auth2 = new Promise(function(resolve, reject) {
        gapi.load('auth2', function() {
          var a = gapi.auth2.getAuthInstance();
          if ( ! a ) {
            gapi.auth2.init({
              client_id: '163485588758-gtudr76snfr5lcuvsav62oi1l7vakolg.apps.googleusercontent.com',
              cookiepolicy: 'single_host_origin',
              scope: 'profile email https://www.googleapis.com/auth/memegen.read https://www.googleapis.com/auth/memegen.comment https://www.googleapis.com/auth/memegen.vote'
            }).then(function() { resolve(gapi.auth2.getAuthInstance()); });
            return;
          }
          resolve(a);
        });
      });
    },

    function onSignIn(user) {
      var authResponse = googleUser.getAuthResponse();
      this.authToken = authResponse.token_type + " "+ authResponse.access_token;
      this.headers.Authorization = this.authToken;
    },

    function send() {
      var self = this;
      var SUPER = this.SUPER.bind(this);

      return self.auth2.then(function(auth2) {
        var user = auth2.currentUser.get();
        if ( ! user.isSignedIn() || ! self.authToken || ! self.headers.Authorization ) {
          return auth2.signIn().then(self.onSignIn).then(SUPER).then(self.completeSend);
        } else {
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
  package: 'foam.net',
  name: 'GoogleOAuth2XHRHTTPRequest',

  extends: 'foam.net.XHRHTTPRequest',
  implements: [
    'foam.net.GoogleOAuth2HTTPRequestDecorator'
  ],


});

