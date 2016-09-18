/*
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
  name: 'QuickTransactionSink',
  
  extends: 'foam.dao.QuickSink',
  
  properties: [
    { 
      name: 'promises_',
      hidden: true,
      factory: function() { return []; }
    }
  ],
  
  methods: [
    function put() {
      var r = this.SUPER.apply(this, arguments);
      r && this.promises_.push(r);
    },
    function remove() {
      var r = this.SUPER.apply(this, arguments);
      r && this.promises_.push(r);      
    },
    function complete() {
      var p = Promise.all(this.promises_);
      this.promises_ = [];
      return p;
    },
    function rollback() {
      throw "Rollback not supported";
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'TransactionAdapter',
  
  implements: [ 'foam.dao.Sink' ], // and Transaction
  
  properties: [
    {
      of: 'foam.dao.DAO',
      name: 'delegate',
      required: true,
    },
    { 
      name: 'promises_',
      hidden: true,
      factory: function() { return []; }
    }
  ],
  
  methods: [
    function put() {
      var r = this.delegate.put.apply(this.delegate, arguments);
      r && this.promises_.push(r);
    },
    function remove() {
      var r = this.delegate.remove.apply(this.delegate, arguments);
      r && this.promises_.push(r);      
    },
    function complete() { // eof
      var p = Promise.all(this.promises_);
      this.promises_ = [];
      return p;
    },
    function rollback() { // 
      // TODO: journal and roll back
      throw "Rollback not supported";
    }
  ]
});

