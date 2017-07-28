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

  classes: [
    {
      name: 'PutData',

      properties: [
        {
          class: 'FObjectProperty',
          of: 'FObject',
          name: 'data'
        },
        {
          class: 'Function',
          name: 'resolve'
        },
        {
          class: 'Function',
          name: 'reject'
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'Property',
      name: 'property',
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
      class: 'FObjectArray',
      of: 'FObject',
      // of: 'PutData',
      name: 'putBacklog_'
    },
    {
      class: 'Function',
      name: 'putImpl_',
      factory: function() { return this.putToBacklog_; }
    }
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();

      // Get largest version number in delegate's records.
      this.delegate
          // Like MAX(), but faster on DAOs that can optimize order+limit.
          .orderBy(this.DESC(this.property)).limit(1)
          .select().then(function(sink) {
            var propName = this.property.name;
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
            this.putImpl_ = this.putToDelegate_;
          }.bind(this));
    },
    function put_(x, obj) {
      // Either putToBacklog_() or putToDelegate_(), depending on whether
      // version number has been initialized.
      return this.putImpl_(x, obj);
    },
    function putToBacklog_(x, obj) {
      // Store put()s before version number is initialized.
      return new Promise(function(resolve, reject) {
        this.putBacklog_.push(this.PutData.create({
          data: obj,
          resolve: resolve,
          reject: reject
        }));
      }.bind(this));
    },
    function putToDelegate_(x, obj) {
      // Increment version number and put to delegate.
      obj[this.property.name] = this.version;
      this.version++;
      return this.delegate.put_(x, obj);
    }
  ]
});
