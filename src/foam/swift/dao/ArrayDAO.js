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

foam.CLASS({
  package: 'foam.swift.dao',
  name: 'ArrayDAO',
  extends: 'foam.swift.dao.AbstractDAO',
  properties: [
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'dao',
      swiftFactory: 'return []',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
var found = false
for (i, o) in dao.enumerated() {
  if primaryKey.compare(obj, o) == 0 {
    dao[i] = obj
    found = true
    break
  }
}
if !found { dao.append(obj) }
//notify_("put", fObj: obj)
return obj
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
let i = dao.index { (o) -> Bool in
  return self.primaryKey.compare(obj, o) == 0
}
if i == nil { return nil }
return dao.remove(at: i!)
      */},
    },
    {
      name: 'find',
      swiftCode: function() {/*
let i = dao.index { (o) -> Bool in
  return self.primaryKey.compareValues(id, self.primaryKey.get(o)) == 0
}
if i == nil { return nil }
return dao[i!]
      */},
    },
  ]
});
