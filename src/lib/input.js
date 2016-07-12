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
    'y'
  ],

  methods: [
    function install(element) {
      element.on('mousedown', this.onMouseDown);
      element.on('mouseup',   this.onMouseUp);
      element.on('mousemove', this.onMouseMove);
    }
  ],

  listeners: [
    {
      name: 'onMouseDown',
      code: function(e) {
        this.x = e.offsetX;
        this.y = e.offsetY;

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
          this.x = e.offsetX;
          this.y = e.offsetY;

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
      name: 'ref'
    }
  ],

  methods: [
    function install(e) {
      this.ref = e;
      e.on('touchstart', this.onTouchStart);
      e.on('touchmove',  this.onTouchMove);
      e.on('touchend',   this.onTouchEnd);
    }
  ],

  listeners: [
    function onTouchStart(e) {
      var newTouches = e.changedTouches;
      var reference  = this.ref.getBoundingClientRect();

      for ( var i = 0 ; i < newTouches.length ; i++ ) {
        var touch = newTouches.item(i);

        var touchEvent = foam.input.TouchEvent.create({
          x: touch.clientX - reference.left,
          y: touch.clientY - reference.top
        });

        this.touch.pub(touchEvent);
        if ( touchEvent.claimed ) e.preventDefault();

        this.touches[touch.identifier] = touchEvent;
      }
    },

    function onTouchMove(e) {
      var changed = e.changedTouches;

      var reference = this.ref.getBoundingClientRect();

      for ( var i = 0 ; i < changed.length ; i++ ) {
        var touch = changed.item(i);

        var event = this.touches[touch.identifier];
        event.x = touch.clientX - reference.left;
        event.y = touch.clientY - reference.top;
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
      name: 'mouseInput',
      factory: function() {
        return this.Mouse.create();
      }
    },
    {
      name: 'touchInput',
      factory: function() {
        return this.Touch.create();
      }
    }
  ],

  methods: [
    function install(e) {
      this.mouseInput.install(e);
      this.touchInput.install(e);
      this.mouseInput.touch.sub(this.onTouch);
      this.touchInput.touch.sub(this.onTouch);
    }
  ],

  listeners: [
    function onTouch(e, _, t) {
      this.touch.pub(t);
    }
  ]
});
