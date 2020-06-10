/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


// Experimental Animation Support
// What about nested objects?

foam.LIB({
  name: 'foam.Animation',

  methods: [
    function animate(obj, f, duration) {
      var argNames = foam.Function.argNames(f);
      var janitor  = foam.FObject.create();
      var l        = function() {
        console.log(arguments);
      };
      var initialValues = new Array(argNames.length);
      var endValues     = new Array(argNames.length);

      for ( var i = 0 ; i < argNames ; i++ ) {
        initialValues[i] = obj[argNames[i]];
//        janitor.onDetach(obj.propertyChange(argNames[i]));
      }

//       foam.Function.withArgs(f, obj) {


//       }

      for ( var i = 0 ; i < argNames ; i++ ) {
        endValues[i] = obj[argNames[i]];
        obj[argNames[i]] = initialValues[i];
      }

      for ( var i = 0 ; i < argNames ; i++ ) {
        obj[argNames[i]] = endValues[i];
      }

//      janitor.detach();
    }
  ]
});


foam.CLASS({
  package: 'foam.animation',
  name: 'Animation',

  imports: [ 'setTimeout' ],

  // TODO: add support for interpolating colours
  properties: [
    {
      class: 'Int',
      name: 'delay',
      units: 'ms'
    },
    {
      class: 'Int',
      name: 'duration',
      units: 'ms',
      value: 1000
    },
    {
      name: 'f',
    },
    {
      class: 'Array',
      name: 'objs'
    },
    {
      name: 'onEnd',
      value: function() {}
    },
    {
      name: 'startTime_'
    },
    {
      class: 'Map',
      name: 'slots_'
    },
    {
      class: 'Boolean',
      name: 'stopped'
    },
    {
      name: 'interp',
      value: function(t) { return t; }
    }
  ],

  methods: [
    function start() {
      if ( this.delay > 0 ) {
        this.setTimeout(this.start_.bind(this), this.delay);
      } else {
        this.start_();
      }
    },

    function start_() {
      var self    = this;
      var cleanup = foam.core.FObject.create();

      this.objs.forEach(function(o) {
        cleanup.onDetach(o.propertyChange.sub(self.propertySet));
      });

      this.f();

      cleanup.detach();

      this.startTime_ = Date.now();

      this.animateValues();
      this.tick();

      this.onDetach(() => this.stopped = true);

      return this;
    },

    function animateValues() {
      for ( var key in this.slots_ ) {
        var s     = this.slots_[key];
        var slot  = s[0], startValue = s[1], endValue = s[2];
        var time  = Math.min(1, (Date.now() - this.startTime_) / this.duration);
        var value = startValue + (endValue-startValue) * this.interp(time);
        slot.set(value);
      }
    }
  ],

  listeners: [
    {
      name: 'propertySet',
      code: function(_, __, __, slot) {
        if ( this.slots_[slot] ) return;

        var oldValue = slot.getPrev(), newValue = slot.get();

        if ( ! foam.Number.isInstance(oldValue) || Number.isNaN(oldValue) ) return;

        this.slots_[slot] = [ slot, oldValue, newValue ];
      }
    },
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        this.animateValues();

        if ( Date.now() < this.startTime_ + this.duration ) {
          this.tick();
        } else {
          this.onEnd();
        }
      }
    }
  ]
});
