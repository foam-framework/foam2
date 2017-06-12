
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
  package: 'foam.box.pipeline',
  name: 'Pipeline',

  requires: [
    'foam.box.LogBox',
    'foam.box.PromisedBox',
    'foam.box.SkeletonBox',
    'foam.nanos.log.LogLevel'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.box.Runnable',
      name: 'runnable',
      postSet: function(old, nu) {
        nu.outputBox = this.output;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'localInput',
      transient: true,
      expression: function(runnable) {
        return this.SkeletonBox.create({
          data: runnable
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.PromisedBox',
      name: 'remoteInput',
      factory: function() { return this.PromisedBox.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'output',
      postSet: function(old, nu) {
        if ( this.runnable ) this.runnable.outputBox = nu;
      },
      factory: function() { return this.defaultOutput; }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'defaultOutput',
      factory: function() { return this.LogBox.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.box.Box',
      name: 'errorBox',
      factory: function() {
        return this.LogBox.create({
          logLevel: this.LogLevel.ERROR
        });
      }
    }
  ]
});
