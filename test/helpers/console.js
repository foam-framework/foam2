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

// Test helpers for capturing the console output.
// Each of these returns a function that restores the original console, and
// returns the captured output.

function captureConsole(part, dontSuppress) {
  var old = console[part];
  var output = [];
  console[part] = function() {
    output.push(Array.from(arguments).join(' '));
    if ( dontSuppress ) old.apply(this, arguments);
  };

  return function() {
    console[part] = old;
    return output;
  };
}

global.captureLog = function(dontSuppress) {
  return captureConsole('log', dontSuppress);
};
global.captureWarn = function(dontSuppress) {
  return captureConsole('warn', dontSuppress);
};
global.captureError = function(dontSuppress) {
  return captureConsole('error', dontSuppress);
};

// And a helper for finding particular lines.
global.matchingLine = function(output, substring) {
  for ( var i = 0; i < output.length; i++ ) {
    if ( output[i].indexOf(substring) >= 0 ) return output[i];
  }
  return undefined;
};
