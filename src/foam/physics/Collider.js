/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/** Collision detection manager. **/
foam.CLASS({
  package: 'foam.physics',
  name: 'Collider',

  documentation: 'Apply physics when objects collide.',

  topics: [ 'onTick' ],

  properties: [
    {
      class: 'Boolean',
      name: 'bounceOnWalls'
    },
    {
      name: 'bounds',
      hidden: true
    },
    {
      name: 'children',
      factory: function() { return []; },
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'stopped_',
      value: true,
      hidden: true
    }
  ],

  methods: [
    function updateChild(c) {
      if ( this.bounceOnWalls && this.bounds ) {

        if ( c.left_   < this.bounds.x      ) { c.vx =  Math.abs(c.vx); c.x++; }
        if ( c.top_    < this.bounds.y      ) { c.vy =  Math.abs(c.vy); c.y++; }
        if ( c.right_  > this.bounds.width  ) { c.vx = -Math.abs(c.vx); c.x--; }
        if ( c.bottom_ > this.bounds.height ) { c.vy = -Math.abs(c.vy); c.y--; }
      }
    },

    function updateChildren() {
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        this.updateChild(cs[i]);
      }
    },

    function detectCollisions() {
      /* implicit k-d-tree divide-and-conquer algorithm */
      // this.detectCollisions_(0, this.children.length-1, 'x', false, '');
      // TODO: put back above line when properly supports mixing circles and squares
      this.detectCollisions__(0, this.children.length-1, 'x', false, '');
    },

    function detectCollisions__(start, end) {
      /*
        Simple O(n^2) algorithm, used by more complex algorithm
        once data is partitioned.
      */
      var cs = this.children;
      for ( var i = start ; i <= end ; i++ ) {
        var c1 = cs[i];
        for ( var j = i+1 ; j <= end ; j++ ) {
          var c2 = cs[j];
          try {
            if ( c1.intersects && c1.intersects(c2) ) this.collide(c1, c2);
          } catch (x) {
            console.warn('Exception in collider', x);
          }
        }
      }
    },

    function choosePivot(start, end, axis) {
      var p = 0, cs = this.children, n = end-start;
      for ( var i = start ; i <= end ; i++ ) p += cs[i][axis] / n;
      return p;
    },

    // TODO: Add support for rectangular objects
    function detectCollisions_(start, end, axis, oneD) {
      if ( start >= end ) return;

      var cs = this.children;
      var pivot = this.choosePivot(start, end, axis);
      var nextAxis = oneD ? axis : axis === 'x' ? 'y' : 'x' ;

      var p = start;
      for ( var i = start ; i <= end ; i++ ) {
        var c = cs[i];
        if ( c[axis] - c.radius < pivot ) {
          var t = cs[p];
          cs[p] = c;
          cs[i] = t;
          p++;
        }
      }

      if ( p === end + 1 ) {
        if ( oneD ) {
          this.detectCollisions__(start, end);
        } else {
          this.detectCollisions_(start, end, nextAxis, true);
        }
      } else {
        this.detectCollisions_(start, p-1, nextAxis, oneD);

        p--;
        for ( var i = p ; i >= start ; i-- ) {
          var c = cs[i];
          if ( c[axis] + c.radius > pivot ) {
            var t = cs[p];
            cs[p] = c;
            cs[i] = t;
            p--;
          }
        }
        if ( p === start-1 ) {
          if ( oneD ) {
            this.detectCollisions__(start, end);
          } else {
            this.detectCollisions_(start, end, nextAxis, true);
          }
        } else {
          this.detectCollisions_(p+1, end, nextAxis, oneD);
        }
      }
    },

    // TODO: add support for rectangles
    function collide(c1, c2) {
      c1.collideWith && c1.collideWith(c2);
      c2.collideWith && c2.collideWith(c1);

      if ( ! c1.mass || ! c2.mass ) return;

      var a  = Math.atan2(c2.y-c1.y, c2.x-c1.x);
      var m1 =  c1.momentumAtAngle(a);
      var m2 = -c2.momentumAtAngle(a);
      var m  = ( m1 + m2 )/2;

      // ensure a minimum amount of momentum so that objects don't overlap
      if ( m >= 0 ) {
        m = Math.max(1, m);
        var tMass = c1.mass + c2.mass;
        c1.applyMomentum(-m * c2.mass/tMass, a);
        c2.applyMomentum( m * c1.mass/tMass, a);
      }
    },

    // add one or more components to be monitored for collisions
    function add() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        this.children.push(arguments[i]);
      }
      return this;
    },

    function findChildAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var cs = this.children;
      // Start from the end to find the child in the foreground
      for ( var i = cs.length-1 ; i >= 0 ; i-- ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) return c1;
      }
    },

    function selectChildrenAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var children = [];
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) children.push(c1);
      }
      return children;
    },

    function remove() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        foam.Array.remove(this.children, arguments[i]);
      }
      return this;
    },

    function detach() {
      this.stopped_ = true;
      this.children = [];
    }
  ],

  actions: [
    {
      name: 'start',
      isEnabled: function(stopped_) { return stopped_; },
      code: function start() {
        this.stopped_ = false;
        this.tick();
      }
    },
    {
      name: 'stop',
      isEnabled: function(stopped_) { return ! stopped_; },
      code: function start() { this.stopped_ = true; }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function tick() {
        if ( this.stopped_ ) return;
        this.onTick.pub();
        this.detectCollisions();
        this.updateChildren();

        this.tick();
      }
    }
  ]
});
