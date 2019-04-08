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
  name: 'CascadingRemoveDAO',
  extends: 'foam.dao.ProxyDAO',

  label: 'Cascading Remove DAO',

  documentation: `
       DAO Decorator which cascades removes to relationship DAOs.

       TODO:
       Perhaps the Relationship should be stored as an Axiom on the source
       and target classes so that it can be found. We might need two axiom
       types: RelationshiipTarget and RelationshipSource, both of which
       just contain a reference to the Relationship. EasyDAO could make use
       of this as could a Relationship-Aware DAOController. - Kevin
  `,

  properties: [
    {
      /** Relationship name, from which elements will be removed.*/
      name: 'name',
      hidden: true,
      required: true,
      transient: true
    },
    {
      name: 'pending_',
      hidden: true,
      transient: true,
      factory: function() { return new Map(); }
    }
  ],

  methods: [
    function remove_(x, obj) {
      var self = this;
      return obj[this.name].removeAll().then(function() {
        return self.delegate.remove_(x, obj);
      });
    },

    function removeAll_(x, skip, limit, order, predicate) {
      var self = this;

      // NOTE: grabbing the first object as we have no other access
      // to the relationship.

      return self.delegate.select_(x, skip, limit, order, predicate).then(function(sink) {
        return Promise.all(
            sink.array.map(function(obj) {
              if (self.pending_.has(obj.id)) {
                return self.delegate.removeAll();
              } else {
                self.pending_.set(obj.id, true);
                return new Promise(function(resolve, reject) {
                  return obj[self.name].removeAll().then(function() {
                    return self.delegate.removeAll_(x, skip, limit, order, predicate).then(function() {
                      self.pending_.delete(obj.id);
                      resolve(obj);
                    });
                  });
                });
              }
            })
            );
      });
    }
  ]
});
