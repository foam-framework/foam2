/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  refines: 'foam.core.Int',
  properties: [
    {
      name: 'swiftType',
      value: 'Int',
    },
    {
      name: 'swiftAdapt',
      factory: function() {
        return function() {/*
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        */}
      },
    },
    {
      name: 'swiftValue',
      expression: function(value) {
        return value + '';
      },
    },
    {
      name: 'swiftView',
      value: 'foam.swift.ui.FOAMUITextFieldInt',
    },
  ],
});

foam.CLASS({
  refines: 'foam.core.Long',
  properties: [
    {
      name: 'swiftAdapt',
      factory: function() {
        return function() {/*
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int { return i }
return 0
        */}
      },
    },
  ],
});
