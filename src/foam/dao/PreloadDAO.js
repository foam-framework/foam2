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
  package: 'foam.dao',
  name: 'PreloadDAO',
  extends: 'foam.dao.PromisedDAO',

  properties: [
    {
      name: 'src',
      required: true
    },
    {
      name: 'delegate',
      required: true
    },
    {
      name: 'promise',
      factory: function() {
        var self = this;
        // clear out target
        return self.delegate.removeAll().then(function() {
          // First load the src into the cache
          return self.src.select(self.delegate).then(function() {
            // read and writes to the appropriate dao
            return self.delegate;
          });
        });
      }
    }
  ]
});
