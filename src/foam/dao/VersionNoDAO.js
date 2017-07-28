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
  package: 'foam.dao',
  name: 'VersionNoDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: `DAO decorator that applies an incrementing version number
      to all objects put() and remove()d. Instead of deleting objects that
      are remove()d, a placeholder with a deleted flag is put() in its place.
      This allows foam.dao.SyncDAO clients that are polling a VersionNoDAO to
      recieve deletes from other clients.

      This DAO throws an InternalException when writes are issued before it has
      synchronized its delegate. To get a DAO of this class that can accept
      writes immediately, decorate it with a StoreAndForwardDAO.`,

  requires: [ 'foam.dao.InternalException' ],

  properties: [
    {
      name: 'delegate',
      required: true,
      final: true
    },
    {
      class: 'FObjectProperty',
      of: 'Property',
      name: 'versionProperty',
      required: true,
      hidden: true,
      transient: true
    },
    {
      class: 'FObjectProperty',
      of: 'Property',
      name: 'deletedProperty',
      required: true,
      hidden: true,
      transient: true
    },
    {
      class: 'Int',
      name: 'version',
      value: 1
    },
    {
      class: 'Boolean',
      name: 'ready_',
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();

      // Get largest version number in delegate's records.
      this.delegate
          // Like MAX(), but faster on DAOs that can optimize order+limit.
          .orderBy(this.DESC(this.versionProperty)).limit(1)
          .select().then(function(sink) {
            var propName = this.versionProperty.name;
            if ( sink.array[0] && sink.array[0][propName] )
              this.version = sink.array[0][propName] + 1;

            // Flush backlog, resolving put() promises.
            var delegate = this.delegate;
            var puts = this.putBacklog_;
            for ( var i = 0; i < puts.length; i++ ) {
              var obj = puts[i].data;
              obj[propName] = this.version;
              this.version++;
              delegate.put(obj).then(puts[i].resolve, puts[i].reject);
            }
            this.ready_ = true;
          }.bind(this));
    },
    function put_(x, obj) {
      if ( ! this.ready_ ) return Promise.reject(this.InternalException.create());

      // Increment version number and put to delegate.
      obj[this.versionProperty.name] = this.version;
      this.version++;
      return this.delegate.put_(x, obj);
    },
    function remove_(x, obj) {
      if ( ! this.ready_ ) return Promise.reject(this.InternalException.create());

      // Increment version number and put empty object (except for "id"
      // and "deleted = true") to delegate.
      var deleted = this.of.create({ id: obj.id }, x);
      deleted[this.deletedProperty.name] = true;
      deleted[this.versionProperty.name] = this.version;
      this.version++;
      return this.delegate.put_(x, deleted);
    },
    function removeAll_(x, skip, limit, order, predicate) {
      // TODO(markdittmer): Implement this in terms of remove_() implementation.
    }
  ]
});
