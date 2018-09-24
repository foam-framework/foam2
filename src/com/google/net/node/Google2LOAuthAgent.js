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
  package: 'com.google.net.node',
  name: 'Google2LOAuthAgent',
  extends: 'foam.net.auth.AuthAgent',

  documentation: `Implements "two-legged OAuth" (2LO) for Google APIs for
      server-to-server authentication over HTTPRequest objects. The correct
      procedure is documented at:
      https://developers.google.com/identity/protocols/OAuth2ServiceAccount`,

  requires: [
    'foam.net.HTTPRequest',
    'foam.net.auth.TokenBearerCredential'
  ],

  properties: [
    {
      class: 'String',
      name: 'tokenURL',
      documentation: 'URL used for requesting new tokens.',
      value: 'https://www.googleapis.com/oauth2/v4/token'
    },
    {
      class: 'String',
      name: 'email',
      documentation: 'Email sent as a part of token request payload.',
      required: true
    },
    {
      class: 'String',
      name: 'privateKey',
      documentation: 'Private key used to sign token requests.',
      required: true
    },
    {
      class: 'StringArray',
      name: 'scopes',
      documentation: `Scopes for which to request authorization. For listing,
          see: https://developers.google.com/identity/protocols/googlescopes`,
      assertValue: function(_, nu) {
        if (nu.length < 1)
          throw new Error('Google 2LO requires at least one scope');

        return nu;
      }
    },
    {
      name: 'jwtHeader',
      documentation: 'Header for JWT used in authorization requests.',
      required: true,
      factory: function() { return { alg: 'RS256', typ: 'JWT' }; }
    },
    {
      class: 'String',
      name: 'grantType',
      documentation: 'Grant type requested from OAuth2 server.',
      value: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
    },
    {
      name: 'credential_',
      factory: function() {
        var promise = Promise.reject(new Error('No credential'));
        // Suppress Node JS unhandled/handled warning messages.
        promise.catch(function() {});
        return promise;
      }
    },
    {
      class: 'String',
      name: 'scope_',
      expression: function(scopes) {
        return scopes.join(' ');
      }
    },
    {
      class: 'String',
      name: 'base64urlEncodedJWTHeader_',
      documentation: `Base64url encoding of required header:
          '{"alg":"RS256","typ":"JWT"}'`,
      expression: function(jwtHeader) {
        return this.base64url(JSON.stringify(jwtHeader), 'binary');
      }
    }
  ],

  methods: [
    function init() {
      this.__subContext__.register(
          this.__context__.lookup('foam.net.auth.TokenBearerHTTPRequest'),
          'foam.net.HTTPRequest');
      this.SUPER();
    },
    function getCredential() {
      return this.credential_ = this.credential_.then(
        this.onGetCredential,
        this.onNoCredential);
    },
    function refreshCredential() {
      return this.onNoCredential(new Error('Forced credential refresh'));
    },
    {
      name: 'getIat',
      documentation: `Get "iat" for token request payload. This value should be
          a current timestamp.`,
      code: function() { return Math.floor(new Date().getTime() / 1000); }
    },
    {
      name: 'getExp',
      documentation: `Get "exp" for token request payload. This value should be
          a desired expiration time, sometime after "iat".`,
      code: function(iat) { return iat + 3600; }
    },
    {
      name: 'base64url',
      documentation: `Base64url encode a string, optionally parsed using
          "opt_enc" encoding. Default encoding is UTF-8.`,
      code: function(str, opt_enc) {
        return this.stripBase64ForURL(
            Buffer.from(str, opt_enc || 'utf8').toString('base64'));
      }
    },
    {
      name: 'stripBase64ForURL',
      documentation: 'Strip base64-encoded string to make it base64url-encoded',
      code: function(str) {
        return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      }
    },
    {
      name: 'getJWTClaimSetString',
      documentation: 'Get a string representation of a fresh JWT claim set.',
      code: function(iat) {
        var exp = this.getExp(iat);
        return JSON.stringify({
          iss: this.email,
          scope: this.scope_,
          aud: this.tokenURL,
          exp: exp,
          iat: iat,
        });
      }
    },
    {
      name: 'signEncodedHeaderAndClaimSet',
      documentation: 'Sign base64url-encoded <header>.<claim set>.',
      code: function(headerDotClaimSet) {
        var signer = require('crypto').createSign('RSA-SHA256');
        signer.update(headerDotClaimSet);
        return this.stripBase64ForURL(signer.sign(this.privateKey, 'base64'));
      }
    },
    {
      name: 'needsRefresh_',
      documentation: `Report whether or not a fresh access token request is
          necessary at this time.`,
      code: function(credential) {
        if ( ! credential ) return true;

        return new Date().getTime() >= credential.expiry;
      }
    }
  ],

  listeners: [
    function onNoCredential(error) { return this.onGetCredential(null); },
    function onGetCredential(credential) {
      if ( ! this.needsRefresh_(credential) )
        return credential;

      var iat = this.getIat();
      var headerDotClaimSet =
          this.base64urlEncodedJWTHeader_ + '.' +
          this.base64url(this.getJWTClaimSetString(iat));
      var signature = this.signEncodedHeaderAndClaimSet(headerDotClaimSet);
      var assertion = headerDotClaimSet + '.' + signature;
      var payload = 'grant_type=' + encodeURIComponent(this.grantType) + '&' +
          'assertion=' + assertion;

      var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      return this.HTTPRequest.create({
        method: 'POST',
        url: this.tokenURL,
        headers: headers,
        responseType: 'json',
        payload: payload
      }).send().then(this.onAuthAttemptResponse)
          .then(this.onAuthAccept.bind(this, iat));
    },
    function onAuthAttemptResponse(response) {
      if ( response.status !== 200 ) {
        throw new Error(
            'Unexpected response code from Google 2LO request: ' +
                response.status);
      }
      return response.payload;
    },
    function onAuthAccept(iat, payload) {
      return this.TokenBearerCredential.create({
        accessToken: payload.access_token,
        expiry: (iat + payload.expires_in) * 1000
      });
    }
  ]
});
