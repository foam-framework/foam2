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

  properties: [
    {
      name: 'memento'
    },
    {
      name:  'stack',
      factory: function() { return []; }
    },
    {
      name:  'redo',
      factory: function() { return []; }
    },
    'stackSize_',
    'redoSize_'
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

  methods: [
    function init() {
      this.memento$.sub(this.onMementoChange);
    },

    function updateSizes() {
      this.stackSize_ = this.stack.length;
      this.redoSize_  = this.redo.length;
    },

    function remember(value) {
      this.dumpState('preRemember');
      this.stack.push(value);
      this.updateSizes();
      this.dumpState('postRemember');
    },

    function restore(value) {
      this.dumpState('restore');
      this.ignore_ = true;
      this.memento = value;
      this.ignore_ = false;
    },

    dumpState: function(spot) {
      // Uncomment for debugging
      /*
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
      */
    }
  ],

  listeners: [
    function onMementoChange(_, __, oldValue, newValue) {
      if ( this.ignore_ ) return;

      // console.log('MementoMgr.onChange', oldValue, newValue);
      this.remember(oldValue);
      this.redo = [];
      this.updateSizes();
    }
  ]
});
