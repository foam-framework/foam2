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
  package: 'foam.input',
  name: 'TouchEvent',

  properties: [
    {
      class: 'Float',
      name: 'x'
    },
    {
      class: 'Float',
      name: 'y'
    },
    {
      class: 'Boolean',
      name: 'claimed',
      value: false
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Mouse',

  topics: [
    'down',
    'up',
    'move',
    'touch'
  ],

  properties: [
    'lastTouch',
    'x',
    'y',
    {
      name: 'element',
      postSet: function(old, e) {
        if ( old ) {
          old.removeEventListener('mousedown', this.onMouseDown);
          old.removeEventListener('mouseup',   this.onMouseUp);
          old.removeEventListener('mousemove', this.onMouseMove);
        }
        e.addEventListener('mousedown', this.onMouseDown);
        e.addEventListener('mouseup',   this.onMouseUp);
        e.addEventListener('mousemove', this.onMouseMove);
      }
    }
  ],

  methods: [
    function install(element) {
      this.ref = element;
    }
  ],

  listeners: [
    {
      name: 'onMouseDown',
      code: function(e) {
        var bounds = this.element.getBoundingClientRect();

        this.x = e.clientX - bounds.left;
        this.y = e.clientY - bounds.top;

        this.down.pub();

        if ( this.touch.hasListeners() ) {
          if ( this.lastTouch ) this.lastTouch.destroy();

          this.lastTouch = foam.input.TouchEvent.create();
          this.lastTouch.onDestroy(this.lastTouch.x$.follow(this.x$));
          this.lastTouch.onDestroy(this.lastTouch.y$.follow(this.y$));

          this.touch.pub(this.lastTouch);

          if ( this.lastTouch && this.lastTouch.claimed ) e.preventDefault();
        }
      }
    },
    {
      name: 'onMouseUp',
      code: function(e) {
        this.up.pub();

        if ( this.lastTouch ) {
          this.lastTouch.destroy();
          this.lastTouch = undefined;
        }
      }
    },
    {
      name: 'onMouseMove',
      code: function(e) {
        if ( this.lastTouch ||
             this.hasListeners('propertyChange') ||
             this.move.hasListeners() ) {

          var bounds = this.element.getBoundingClientRect();

          this.x = e.clientX - bounds.left;
          this.y = e.clientY - bounds.top;

          this.move.pub();

          if ( this.lastTouch && this.lastTouch.claimed ) e.preventDefault();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Touch',

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'touches',
      factory: function() { return {}; }
    },
    {
      name: 'element',
      postSet: function(old, e) {
        if ( old ) {
          old.removeEventListener('touchstart', this.onTouchStart);
          old.removeEventListener('touchmove',  this.onTouchMove);
          old.removeEventListener('touchend',   this.onTouchEnd);
        }
        e.addEventListener('touchstart', this.onTouchStart);
        e.addEventListener('touchmove',  this.onTouchMove);
        e.addEventListener('touchend',   this.onTouchEnd);
      }
    }
  ],

  listeners: [
    function onTouchStart(e) {
      var newTouches = e.changedTouches;
      var bounds     = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < newTouches.length ; i++ ) {
        var touch = newTouches.item(i);

        var touchEvent = foam.input.TouchEvent.create({
          x: touch.clientX - bounds.left,
          y: touch.clientY - bounds.top
        });

        this.touch.pub(touchEvent);
        if ( touchEvent.claimed ) e.preventDefault();

        this.touches[touch.identifier] = touchEvent;
      }
    },

    function onTouchMove(e) {
      var changed = e.changedTouches;
      var bounds  = this.element.getBoundingClientRect();

      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        var event = this.touches[touch.identifier];
        event.x = touch.clientX - bounds.left;
        event.y = touch.clientY - bounds.top;
        if ( event.claimed ) e.preventDefault();
      }
    },

    function onTouchEnd(e) {
      var changed = e.changedTouches;
      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        this.touches[touch.identifier].destroy();
        delete this.touches[touch.identifier];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.input',
  name: 'Pointer',

  requires: [
    'foam.input.Mouse',
    'foam.input.Touch'
  ],

  topics: [
    'touch'
  ],

  properties: [
    {
      name: 'element',
      required: true
    },
    {
      name: 'mouseInput',
      factory: function() {
        var m = this.Mouse.create();
        this.onDestroy(m.element$.follow(this.element$));
        this.onDestroy(m.touch.sub(this.onTouch));
      }
    },
    {
      name: 'touchInput',
      factory: function() {
        var t = this.Touch.create();
        this.onDestroy(t.element$.follow(this.element$));
        this.onDestroy(t.touch.sub(this.onTouch));
      }
    }
  ],

  methods: [
    function init() {
      // Assigning to unused variables to make Closure happy.
      var mi = this.mouseInput;
      var ti = this.touchInput;
    }
  ],

  listeners: [
    function onTouch(e, _, t) {
      this.touch.pub(t);
    }
  ]
});
