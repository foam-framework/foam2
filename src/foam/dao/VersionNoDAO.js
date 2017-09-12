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

// TODO(markdittmer): foam.dao.InternalException should be unnecessary here;
// make this a PromisedDAO.
foam.CLASS({
  package: 'foam.dao',
  name: 'VersionNoDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: `DAO decorator that applies an incrementing version number
      to all objects put() and remove()d. Instead of deleting objects that
      are remove()d, a placeholder with a deleted flag is put() in its place.
      This allows foam.dao.SyncDAO clients that are polling a VersionNoDAO to
      recieve deletes from other clients.

      This DAO expects to be "of" a class that has the trait
      foam.version.VersionTrait.

      Note that marking records as deleted violates certain expectaions DAO
      expectations. For example, removing an object and then finding it will not
      yield null, it will yield a record marked as deleted.

      This DAO throws an InternalException when writes are issued before it has
      synchronized its delegate. To get a DAO of this class that can accept
      writes immediately, decorate it with a StoreAndForwardDAO.`,

  requires: [
    'foam.dao.InternalException',
    'foam.version.VersionTrait'
  ],

  properties: [
    {
      name: 'of',
      required: true
    },
    {
      name: 'delegate',
      required: true,
      final: true
    },
    {
      class: 'Int',
      name: 'version',
      value: 1
    },
    {
      class: 'Boolean',
      name: 'ready_'
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();

      // Get largest version number in delegate's records.
      this.delegate
          // Like MAX(), but faster on DAOs that can optimize order+limit.
          .orderBy(this.DESC(this.VersionTrait.VERSION_)).limit(1)
          .select().then(function(sink) {
            var propName = this.VersionTrait.VERSION_.name;
            if ( sink.array[0] && sink.array[0][propName] )
              this.version = sink.array[0][propName] + 1;
            this.ready_ = true;
          }.bind(this));
    },
    function validate() {
      this.SUPER();
      if ( ! this.VersionTrait.isSubClass(this.of) ) {
        throw new Error(`VersionNoDAO.of must have trait
                            foam.version.VersionTrait`);
      }
    },
    function put_(x, obj) {
      if ( ! this.ready_ )
        return Promise.reject(this.InternalException.create());

      // Increment version number and put to delegate.
      obj[this.VersionTrait.VERSION_.name] = this.version;
      this.version++;
      return this.delegate.put_(x, obj);
    },
    function remove_(x, obj) {
      if ( ! this.ready_ )
        return Promise.reject(this.InternalException.create());

      // Increment version number and put empty object (except for "id"
      // and "deleted = true") to delegate.
      var deleted = obj.clone(x);
      deleted[this.VersionTrait.DELETED_.name] = true;
      deleted[this.VersionTrait.VERSION_.name] = this.version;
      this.version++;
      return this.delegate.put_(x, deleted);
    },
    function removeAll_(x, skip, limit, order, predicate) {
      if ( ! this.ready_ )
        return Promise.reject(this.InternalException.create());

      // Select relevant records and mark each as deleted via remove_().
      return this.select_(x, null, skip, limit, order, predicate).
          then(function(sink) {
            var array = sink.array;
            var promises = [];
            for ( var i = 0; i < array.length; i++ ) {
              promises.push(this.remove_(x, array[i]));
            }
            return Promise.all(promises);
          }.bind(this));
    }
  ]
});
