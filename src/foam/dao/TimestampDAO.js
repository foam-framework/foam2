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
  name: 'TimestampDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that sets the current time on each put() object, provided not already set. By default, the .id proeprty is set.',

  properties: [
    {
      /**
        The property of incoming objects to set.
      */
      class: 'String',
      name: 'property',
      value: 'id'
    }
  ],

  methods: [
    /** For each put() object, set the timestamp if .property is not
      set for that object. */
    function put(obj) {
      if ( ! obj.hasOwnProperty(this.property) ) obj[this.property] = this.nextTimestamp();
      return this.delegate.put(obj);
    },

    /** Generates a timestamp. Override to change the way timestamps are
      created. */
    function nextTimestamp() {
      return Date.now();
    }
  ]
});
