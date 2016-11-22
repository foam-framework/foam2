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

describe('HTTPMethod', function() {

  it('creates request objects when required', function(done) {

    foam.CLASS({ name: 'Hello', properties: [ 'a', 'b' ] });

    foam.CLASS({
      name: 'MockRequest',

      methods: [
        function send() {
          return Promise.resolve({
            status: 200,
            responseType: 'json',
            payload: Promise.resolve("response")
          });
        }
      ]
    });
    var mockRequests = [];

    foam.CLASS({
      name: "ExportAllServices",
      properties: [
        {
          class: "foam.core.Property",
          name: "HTTPRequestFactory",
          factory: function () {
            var self = this;
            return function(opt_args, opt_X) {
              // TODO: locked into one kind of auth.
              var ret = MockRequest.create(undefined, foam.__context__);
              mockRequests.push(ret);
              if ( opt_args ) ret.copyFrom(opt_args);
              return ret;
            }
          }
        },
      ],
      exports: [
        "HTTPRequestFactory"
      ],
    });
    var serviceContext = ExportAllServices.create(undefined, foam.__context__);

    var httpMethod = foam.net.HTTPMethod.create({
      name: 'wee',
      args: [
        foam.net.HTTPArgument.create({
          name: 'a',
          typeName: 'number'
        }, foam.__context__),
        foam.net.HTTPArgument.create({
          name: 'b',
          typeName: 'string'
        }, foam.__context__),
      ],
      buildRequestType: 'Hello',
    }, serviceContext);

    foam.CLASS({
      name: 'MethodUser',
      imports: [ 'HTTPRequestFactory' ],
      axioms: [ httpMethod ]
    });

    var m = MethodUser.create(undefined, serviceContext);

    m.wee(4, 5);

    expect(mockRequests[0].payload).toEqual("{\"a\":4,\"b\":5}");

    done();

  })

});
