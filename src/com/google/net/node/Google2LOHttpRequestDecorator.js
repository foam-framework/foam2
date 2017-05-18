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

// TODO:
// - Move file (see new class name)
// - Implement new foam.net.AuthAgent interface.
// - Implement request auth decorator(s).

foam.CLASS({
  package: 'com.google.net.node',
  name: 'Google2LOAuthAgent',

  documentation: `Implements "two-legged OAuth" (2LO) for Google APIs for
      server-to-server authentication over HTTPRequest objects. The correct
      procedure is documented at:
      https://developers.google.com/identity/protocols/OAuth2ServiceAccount`,

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
      class: 'String',
      name: 'jwtHeader',
      documentation: 'Header for JWT used in authorization requests.',
      required: true,
      factory: function() { return { alg: 'RS256', typ: 'JWT' }; }
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
    {
      name: 'base64url',
      documentation: `Base64url encode a string, optionally parsed using
          "opt_enc" encoding. Default encoding is UTF-8.`,
      code: function(str, opt_enc) {
        return this.stripBase64ForURL(
            new Buffer(str, opt_enc || 'utf8').toString('base64'));
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
      code: function() {
        var iat = Math.floor(new Date().getTime() / 1000);
        var exp = iat + 3600;
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
    }
  ]
});
