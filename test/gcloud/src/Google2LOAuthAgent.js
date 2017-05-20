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

describe('Google2LOAuthAgent', function() {
  var IAT = 1495118477;
  var EXP_DELTA = 3600;
  var EXP = IAT + EXP_DELTA;
  var TOKEN_URL = 'https://auth.example.com/token';
  var EMAIL = 'test@example.com';
  var PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEAtEXMs3n9aRnCYcfuaGtncyZ8wTjEHCU/f6P1SQquDiMVD4/r\nY9OZZlfvjAvzEQXPWGMt7xUDN/ZejC9gdJ5dDWj3pzl9UE2iS4kjHx+TRN9RD5QT\n+csqSxFCGjl6HAWKSsl0EC6qJLIChP6wupvwmukRI47cfcggCdIdzwHPYBs+jBmw\nsUeBMYVYjSNStXYO3zwH5OkhZDFyfOgVCsmEah/4uD347U8ac39gAa+JQyzEk925\nisFe7U12S23DdArQQwZP2U2I5YoJy2R1XTm1zNz195rLWSCtx49tF/uZZMniHsJm\n9M/3vWBitQWnfUsDTQLwr/96jxWWTnnFbkdokwIDAQABAoIBAH0YqrIpByb1zyPX\nf6NKVOFdZdkXsU7ush+7AS2MkbgRtD22W1xMq/iPMRX3/NZlN7tYJ7nu1Oryti2F\neuOyOVRi8OhERqeBGAxev9aLLMDwTuoGkc4Xo+OvuDVGiWwElDDNlxLbrwoD1SfB\nLZZxPAfjkBcivfMy+riV7EWINgWz97nWdRPfJO/bMwKbL4lgra727v+G4gxF7prC\nVCPlEig+zKrgEgs9T4+cURN9ySENVRAXLW1YxNXIO5bqjLhAJ0fgLmcX0R5AnOMG\nzrWszJeoaTjkCzKw36tMiAHiB1CkJD469AwjF3VLE1lxGQBjIaT0Sp1c3F+y9gjr\nO8EIP1ECgYEA4TPZ2maYUV5XoH0P+POpTiVjcuTmWsVNkYPCBa3IpaJ691oq5yH7\ndbmv6z9KscwoOnXbUfMd6VjB846AsOWZt8zSO0XxfQgxxVptFgdq4nwnA72E2MD7\n39Ad1HnsN96Kp8T96qnHIcT8VyVv8ejRSmYmOMl2TK1VijZq18L/AbUCgYEAzOz9\n1h76kS4cOAkmlCwwQg0Bvf/xp5BmpiUyXDL+BYjOpO2lYxUPbPKTKiQh9upjmmCW\nx3EOOx/nctihtlMmtx+NWzPMffGIQS2thSj1QmiVbXaGGeo/1Vy7iFjVUNMh2a+M\nVuBBY1NxrNqkATRDIZGXzzT5gPENxnlYLoDlTicCgYAwB1fp7UGE8QLtNl7msEim\nYvDvuwOpzjR52UjS3zpQoPNqt2849hVkCSMMn+X1P15BAYux0ZDKiGRs5jJqB72d\n5m/btlIHYW0D8wIa1aAlB2dms8+WTqopFICYJRyM2chmeWvR1T2j5RgQGerjA81G\n+bwjFkxFlB4PKQXmWC78lQKBgEkT/pV8KKjbQ67r/Hj8pRz43HUwL7IsuZ5oR2Q/\nvvykQ+Tm5oLGAOE+RCLUDdSq02g7J6np9EQ7ZWM8Q7bsQjMtqlAq0bLcDlYH/wgs\nigHrn9YQXVQiiC8DSdEetLuE/15MzwQwJsFQAYq90ZyoUYRIElYPMya7T8lGfp7e\n0mcjAoGAGgHtfP6yDdYnb0GIEurWqvmwsaxGLKf0RBpKUdp9vsaLjjYYewb+c7/q\nbMnPWlPqSlWKNYbHQeUCSS4R+U7n6Mnr310S6Yg53XqIOMHjDmIDWE2Tz3IMvMj5\nw+9vd+ixjOzHDiYolUbUDnA9dPtCdzrm9EZ//r0ZdrMFjELBjHQ=\n-----END RSA PRIVATE KEY-----\n';
  var PAYLOAD = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0QGV4YW1wbGUuY29tIiwic2NvcGUiOiIiLCJhdWQiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20vdG9rZW4iLCJleHAiOjE0OTUxMjIwNzcsImlhdCI6MTQ5NTExODQ3N30.Up5GC05Gun3iecYm6A7J5HDyv6P5yI3AF4LDFrpBDrjbHwc8oI6Ni3ft_RJSHI9L5rU3GJDBwlvs2RTlorI5rzteOjG9A96ma_AF7CcaqGRANYGafJHZ-MhuRs1vtBHAjKwYf-pG6TLaCU_FsilJW8tnzCbxyB8QaDi9c-qHCPC0Ofy5qxHg0RmkcOAnHB0yxSABS6wTaVbV62z5hrd0IgeeGk_Yeo3dte6TQ0f47VxoJAB5zDuZT0m_rTvDr1712NTT8aMMAjEbhBxgQjBvUicFce2UAw7ySc42FJRuJIHhwIwKBB-EEK9-ubJRzT2PHaPFdOgwsTIL98xWeRzjZA';
  var OK = 'OK';
  var ACCESS_TOKEN = 'jwt-access-token';
  var getCredentialSpy;

  function mkAgent(opt_ctx) {
    var ctx = opt_ctx || foam.__context__;
    return ctx.lookup('com.google.net.node.test.Google2LOAuthAgent').create({
      tokenURL: TOKEN_URL,
      email: EMAIL,
      privateKey: PRIVATE_KEY,
      requiresAuthorization: function(request) {
        if ( request.url ) request.fromUrl(request.url);

        return request.protocol === 'https' &&
            request.hostname === 'api.example.com';
      }
    }, ctx);
  }

  beforeEach(function() {
    foam.CLASS({
      package: 'com.google.net.node.test',
      name: 'HTTPRequest',
      extends: 'foam.net.HTTPRequest',

      requires: [ 'foam.net.HTTPResponse' ],

      methods: [
        function send() {
          return this.url === TOKEN_URL ?
              this.checkTokenURLPayload() :
              this.handleNonTokenURL();
        },
        function handleNonTokenURL() {
          return Promise.resolve(this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(OK)
          }));
        },
        function checkTokenURLPayload() {
          if ( this.payload !== PAYLOAD )
            return Promise.reject(this.HTTPResponse.create({status: 401}));

          return Promise.resolve(this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve({
              access_token: ACCESS_TOKEN,
              expires_in: EXP_DELTA
            })
          }));
        }
      ]
    });
    foam.register(foam.lookup('com.google.net.node.test.HTTPRequest'),
                  'foam.net.BaseHTTPRequest');
    foam.register(foam.lookup('com.google.net.node.test.HTTPRequest'),
                  'foam.net.HTTPRequest');

    getCredentialSpy = jasmine.createSpy('getCredential');
    foam.CLASS({
      package: 'com.google.net.node.test',
      name: 'Google2LOAuthAgent',
      extends: 'com.google.net.node.Google2LOAuthAgent',

      methods: [
        function getIat() { return IAT; },
        function getExp(iat) { return iat + EXP_DELTA; },
        function getCredential() {
          getCredentialSpy();
          return this.SUPER();
        }
      ]
    });
  });

  it('should generate the correct token request payload', function(done) {
    mkAgent().getCredential().then(done, done.fail);
  });

  it('should authenticate in context with "authAgent" and "TokenBearerHTTPRequest" as "HTTPRequest"', function(done) {
    expect(getCredentialSpy).not.toHaveBeenCalled();
    var ctx = mkAgent().__subContext__;
    ctx.lookup('foam.net.HTTPRequest').create({
      method: 'POST',
      url: 'https://api.example.com/api',
      payload: '{"data":true}'
    }, ctx).send().then(function() {
      expect(getCredentialSpy).toHaveBeenCalled();
      done();
    }, done.fail);
  });

  it('should not authenticate against unrelated URLs', function(done) {
    var ctx = mkAgent().__subContext__;
    ctx.lookup('foam.net.HTTPRequest').create({
      method: 'POST',
      url: 'https://static.example.com/example.png'
    }, ctx).send().then(function() {
      expect(getCredentialSpy).not.toHaveBeenCalled();
      done();
    }, done.fail);
  });

  it('should reject on bad auth attempt', function(done) {
    foam.CLASS({
      package: 'com.google.net.node.test.reject',
      name: 'HTTPRequest',
      extends: 'com.google.net.node.test.HTTPRequest',

      requires: [ 'foam.net.HTTPResponse' ],

      methods: [
        function checkTokenURLPayload() {
          return Promise.reject(this.HTTPResponse.create({status: 401}));
        }
      ]
    });

    var ctx = foam.__context__.createSubContext({});
    ctx.register(foam.lookup('com.google.net.node.test.reject.HTTPRequest'),
                 'foam.net.BaseHTTPRequest');
    ctx.register(
        foam.lookup('foam.net.auth.TokenBearerHTTPRequest'),
        'foam.net.HTTPRequest');
    var testCtx = mkAgent(ctx).__subContext__;

    testCtx.lookup('foam.net.HTTPRequest').create({
      method: 'POST',
      url: 'https://api.example.com/api',
      payload: '{"data":true}'
    }, testCtx).send().then(done.fail, done);
  });

  it('should work with multiple context mixins', function(done) {
    foam.CLASS({
      package: 'com.google.net.node.test',
      name: 'OuterContextMixin',

      exports: [ 'as authAgent' ],

      methods: [
        function requiresAuthorization(request) {
          throw new Error('OuterContextMixin.requiresAuthorization: ' +
              'this should not be exercised auth agent');
        },
        function getCredential() {
          throw new Error('OuterContextMixin.getCredential: ' +
              'this should not be exercised auth agent');
        }
      ]
    });

    var ctx = foam.__context__.createSubContext({});
    var agent = mkAgent(foam.__context__.createSubContext(
        foam.lookup('com.google.net.node.test.OuterContextMixin')
            .create(null, ctx)));
    var testCtx = agent.__subContext__;
    testCtx.lookup('foam.net.HTTPRequest').create({
      method: 'POST',
      url: 'https://api.example.com/api',
      payload: '{"data":true}'
    }, agent).send().then(done, done.fail);
  });

  it('should yield the same token with multiple synchronous calls', function(done) {
    // Use classes that:
    // - Do not mock start + expiry times,
    // - Always grant authorization with a new token every time.
    var accessTokenCounter = 0;
    foam.CLASS({
      package: 'com.google.net.node.test.passthru',
      name: 'HTTPRequest',
      extends: 'foam.net.HTTPRequest',

      requires: [ 'foam.net.HTTPResponse' ],

      methods: [
        function send() {
          return this.url === TOKEN_URL ?
              this.handleTokenURLPayload() :
              this.handleNonTokenURL();
        },
        function handleNonTokenURL() {
          return Promise.resolve(this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve(OK)
          }));
        },
        function handleTokenURLPayload() {
          return Promise.resolve(this.HTTPResponse.create({
            status: 200,
            payload: Promise.resolve({
              access_token: ACCESS_TOKEN + accessTokenCounter++,
              expires_in: EXP_DELTA
            })
          }));
        }
      ]
    });
    var ctx = foam.__context__.createSubContext({});
    ctx.register(foam.lookup('com.google.net.node.test.passthru.HTTPRequest'),
                  'foam.net.BaseHTTPRequest');
    ctx.register(foam.lookup('com.google.net.node.test.passthru.HTTPRequest'),
                  'foam.net.HTTPRequest');

    var token = ACCESS_TOKEN + accessTokenCounter;
    var agent = ctx.lookup('com.google.net.node.Google2LOAuthAgent').create({
      tokenURL: TOKEN_URL,
      email: EMAIL,
      privateKey: PRIVATE_KEY,
      requiresAuthorization: function(request) {
        if ( request.url ) request.fromUrl(request.url);

        return request.protocol === 'https' &&
            request.hostname === 'api.example.com';
      }
    }, ctx);
    var testCtx = agent.__subContext__;

    function checkRequest() {
      var request = testCtx.lookup('foam.net.HTTPRequest').create({
        method: 'POST',
        url: 'https://api.example.com/api',
        payload: '{"data":true}'
      }, testCtx);
      return request.send().then(function() {
        // Expect TokenBearerHTTPRequest to have decorated request headers with
        // the same token every time.
        //
        // TODO(markdittmer): Probably depending too much on
        // TokenBearerHTTPRequest implementation details here.
        expect(request.headers['Authorization'])
            .toBe('Bearer ' + token);
      });
    }

    // Issue several requests in rapid succession. (Expect the same token every
    // time.)
    Promise.all([
      checkRequest(),
      checkRequest(),
      checkRequest()
    ]).then(done, done.fail);
  });
});
