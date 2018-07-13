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
  package: 'foam.u2.search',
  name: 'FilterView',
  extends: 'foam.u2.View',

  imports: [
    'filterController'
  ],

  css: `
    ^header {
      align-items: center;
      display: flex;
    }
    ^label {
      flex-grow: 1;
    }
    ^container {
      margin: 12px;
    }
    ^body input {
      width: 100%;
    }
  `,

  properties: [
    'prop',
    'key',
    'bodyE',
    // TODO(braden): Replace this custom hack when we have "inner" views.
    [ 'overrideAdd_', true ],
    {
      name: 'label',
      expression: function(prop) { return prop.label; }
    },
    [ 'showRemove', true ],
    {
      name: 'addQueue_',
      factory: function() { return []; }
    }
  ],

  actions: [
    {
      name: 'removeFilter',
      label: 'Close',
      icon: 'close',
      code: function() {
        this.filterController.removeFilter(this.key);
      }
    }
  ],

  methods: [
    function add() {
      if ( this.overrideAdd_ ) {
        if ( this.bodyE ) {
          this.bodyE.add.apply(this.bodyE, arguments);
        } else {
          this.addQueue_.push(Array.prototype.slice.call(arguments));
        }
      } else {
        this.SUPER.apply(this, arguments);
      }

      return this;
    },

    function initE() {
      this.overrideAdd_ = false;

      this.addClass(this.myClass()).addClass(this.myClass('container'));
      this.start('div')
        .addClass(this.myClass('header'))
        .start()
            .addClass(this.myClass('label'))
            .add(this.label)
        .end()
        .startContext({ data: this })
          .add(this.showRemove ? this.REMOVE_FILTER : undefined)
        .endContext()
      .end();

      this.bodyE = this.start('div').addClass(this.myClass('body'));
      for ( var i = 0; i < this.addQueue_.length; i++ ) {
        this.bodyE.add.apply(this.bodyE, this.addQueue_[i]);
      }
      this.bodyE.end();

      this.overrideAdd_ = true;
    }
  ]
});
