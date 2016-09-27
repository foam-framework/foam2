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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KM.IND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2400000;

var fs = require('fs');

describe("Comparing benchmarks", function() {

  var BENCH_A, BENCH_B;

  beforeEach(function() {
    var strA = fs.readFileSync('bench-regression-reference.log').toString();
    strA = strA.substring(strA.indexOf('"'), strA.lastIndexOf('},')+1);
    var strB = fs.readFileSync('bench-regression-current.log').toString();
    strB = strB.substring(strB.indexOf('"'), strB.lastIndexOf('},')+1);

    console.log("read",strA.lastIndexOf(','),"{"+strA+"}", "{"+strB+"}");

    BENCH_A = eval("{"+strA+"}");
    BENCH_B = eval("{"+strB+"}");
  });
  afterEach(function() {
  });

  it("is within time tolerance", function() {
    for ( var key in BENCH_A ) {
      expect(BENCH_B[key]).toBeDefined();
      var a = test.TestRun.create(BENCH_A[key]);
      var b = test.TestRun.create(BENCH_B[key]);
      expect(a.compareTo(b)).toEqual(0);
    }
  });
  
  //TODO: unmatched keys in B
});
