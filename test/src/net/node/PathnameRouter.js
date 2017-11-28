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

describe('PathnameRouter', function() {
  it('should reflect prefix in handler', function() {
    var PREFIX = '/hello';
    var router = foam.net.node.PathnameRouter.create();
    var handler = router.addPathnamePrefix(
        PREFIX, foam.net.node.PathnamePrefixHandler.create());
    expect(handler.pathnamePrefix).toBe(PREFIX);
  });

  it('should compose over routers', function() {
    var PREFIX1 = '/hello';
    var PREFIX2 = '/world';
    var router1 = foam.net.node.PathnameRouter.create();
    var router2 = router1.addPathnamePrefix(
        PREFIX1, foam.net.node.PathnameRouter.create());
    var handler = router2.addPathnamePrefix(
        PREFIX2, foam.net.node.PathnamePrefixHandler.create());
    expect(handler.pathnamePrefix).toBe(`${PREFIX1}${PREFIX2}`);
  });
});
