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

foam.CLASS({
  name: 'ClientStub',
  package: 'com.google.urlz',
  documentation: 'The root object of a remote client, setting up\
  the context for communication back to the server.',
  
  requires: [
    'com.google.urlz.LocalFetcher',
  ]
  
  exports: [
    'Fetch',
    'Commit',
    '__url_map__',
  ],
  
  properties: [
    {
      class: 'FunctionProperty',
      name: 'Fetch',
      factory: function() {
        var fetcher = this.LocalFetcher.create({ rootObject: this });
        return fetcher.fetch.bind(fetcher);
      }
    }
  ]
})