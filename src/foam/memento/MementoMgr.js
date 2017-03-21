/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.memento',
  name: 'MementoMgr',

  documentation: 'Provide memento undo/redo support.',

  properties: [
    {
      name: 'memento'
    },
    {
      name: 'stack',
      factory: function() { return []; }
    },
    {
      name: 'redo',
      factory: function() { return []; }
    },
    'posFeedback_',
    {
      class: 'Int',
      name: 'position',
      postSet: function(_, n) {
        if ( this.posFeedback_ ) return;

        while ( n < this.stackSize_ ) this.back();
        while ( n > this.stackSize_ ) this.forth();
      }
    },
    'stackSize_',
    'redoSize_',
    'totalSize_'
  ],

  methods: [
    function init() {
      this.memento$.sub(this.onMementoChange);
    },

    function updateSizes() {
      this.posFeedback_  = true;
      this.stackSize_    = this.stack.length;
      this.redoSize_     = this.redo.length;
      this.totalSize_    = this.stack.length + this.redo.length;
      this.position      = this.stack.length;
      this.posFeedback_  = false;
    },

    function remember(memento) {
      this.dumpState('preRemember');
      this.stack.push(memento);
      this.updateSizes();
      this.dumpState('postRemember');
    },

    function restore(memento) {
      this.dumpState('preRestore');
      this.ignore_ = true;
      this.memento = memento;
      this.ignore_ = false;
      this.dumpState('postRestore');
    },

    function dumpState(spot) {
      // Uncomment for debugging
      /*
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
      */
    }
  ],

  actions: [
    {
      name:  'back',
      label: ' <-- ',
      help:  'Go to previous view',

      isEnabled: function(stackSize_) { return !! stackSize_; },
      code: function() {
        this.dumpState('preBack');
        this.redo.push(this.memento);
        this.restore(this.stack.pop());
        this.updateSizes();
        this.dumpState('postBack');
      }
    },
    {
      name:  'forth',
      label: ' --> ',
      help:  'Undo the previous back.',

      isEnabled: function(redoSize_) { return !! redoSize_; },
      code: function() {
        this.dumpState('preForth');
        this.remember(this.memento);
        this.restore(this.redo.pop());
        this.updateSizes();
        this.dumpState('postForth');
      }
    }
  ],

  listeners: [
    function onMementoChange(_,__,___,memento$) {
      if ( this.ignore_ ) return;

      // console.log('MementoMgr.onChange', oldValue, newValue);
      this.remember(memento$.oldValue);
      this.redo = [];
      this.updateSizes();
    }
  ]
});
