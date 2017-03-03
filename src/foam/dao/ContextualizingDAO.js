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
  name: 'ContextualizingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    ContextualizingDAO recreates objects returned by find(), giving them
    access to the exports that this ContextualizingDAO has access to.
    <p>
    If using a foam.dao.EasyDAO, set contextualize:true to automatically
    contextualize objects returned by find().
  */},

  methods: [
    /** Found objects are re-created as if this DAO had created them, giving
      them access to the exports that this DAO has access to. */
    function find(id) {
      var self = this;
      return self.delegate.find(id).then(function(obj) {
        if ( obj ) return obj.cls_.create(obj, self);
        return null;
      });
    }
    // TODO: select() too?
  ]
});
