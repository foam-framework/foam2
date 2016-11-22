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

describe('UTF-8 decoder', function() {
  it('test decoding sample string', function() {
    var decoder = foam.encodings.UTF8.create(undefined, foam.__context__);
    var string = "Hello world! 23048alsdf alskl234";

    var buffer = new Buffer(string, 'utf8');
    decoder.put(new Uint8Array(buffer));

    expect(decoder.string).toBe(string);
  });
});
