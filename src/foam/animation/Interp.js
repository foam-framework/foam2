/**
 * @license
 * Copyright 2012 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.animation.Interp',

  methods: [

    /** Combinator to create the composite of two functions. **/
    function o(f1, f2) { return function(x) { return f1(f2(x)); }; },

    /** Combinator to create the average of two functions. **/
    function avg(f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; },

    /** Combinator to create a progressive average of two functions. **/
    function spline(f1, f2) { return function(x) { return (1-x)*f1(x) + x*f2(x); }; },

    /** Constant speed. **/
    function linear(x) { return x; },

    /** Move to target value and then return back to original value. **/
    function back(x) { return x < 0.5 ? 2*x : 2-2*x; },

    /** Start slow and accelerate until half-way, then start slowing down. **/
    function accelerate(x) { return (Math.sin(x * Math.PI - Math.PI/2)+1)/2; },

    /** Start slow and ease-in to full speed. **/
    function easeIn(a) {
      var v = 1/(1-a/2);
      return function(x) {
        var x1 = Math.min(x, a);
        var x2 = Math.max(x-a, 0);
        return (a ? 0.5*x1*(x1/a)*v : 0) + x2*v;
      };
    },

    /** Combinator to reverse behaviour of supplied function. **/
    function reverse(f) { return function(x) { return 1-f(1-x); }; },

    /** Reverse of easeIn. **/
    function easeOut(b) { return foam.animation.Interp.reverse(foam.animation.Interp.easeIn(b)); },

    /**
     * Cause an oscilation at the end of the movement.
     * @param b percentage of time to to spend bouncing [0, 1]
     * @param a amplitude of maximum bounce
     * @param opt_c number of cycles in bounce (default: 3)
     */
    function oscillate(b, a, opt_c) {
      var c = opt_c || 3;
      return function(x) {
        if ( x < (1-b) ) return x/(1-b);
        var t = (x-1+b)/b;
        return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
      };
    },

    /**
     * Cause an bounce at the end of the movement.
     * @param b percentage of time to to spend bouncing [0, 1]
     * @param a amplitude of maximum bounce
     */
    function bounce(b, a, opt_c) {
      var c = opt_c || 3;
      return function(x) {
        if ( x < (1-b) ) return x/(1-b);
        var t = (x-1+b)/b;
        return 1-(1-t)*2*a*Math.abs(Math.sin(2*c*Math.PI * t));
      };
    },
    function bounce(a) {
      var v = 1 / (1-a);
      return function(x) {
        if ( x < (1-a) ) return v*x;
        var p = (x-1+a)/a;
        return 1-(x-1+a)*v/2;
      };
    },

    /** Move backwards a% before continuing to end. **/
    function stepBack(a) {
      return function(x) {
        return ( x < a ) ? -x : -2*a+(1+2*a)*x;
      };
    },

    /** Combination of easeIn and easeOut. **/
    function ease(a, b) {
      return foam.animation.Interp.o(foam.animation.Interp.easeIn(a), foam.animation.Interp.easeOut(b));
    },

    function seq(f1, f2) {
      return ( f1 && f2 ) ?
        function() { f1.apply(this, argsToArray(arguments)); f2(); } :
        f1 ? f1 : f2 ;
    }
  ]
});
