/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ModeAltView',
  extends: 'foam.u2.View',

  documentation: 'A view that shows one of several views, depending on the display mode.',

  requires: [
    'foam.u2.DisplayMode'
  ],

  exports: [
    // Override the behaviour of 'foam.u2.View' by exporting the __context__'s
    // data as 'data' instead of this view's data. We do this because we don't
    // want this view to change the context data, which child views might want to
    // access.
    'contextData as data'
  ],

  css: '^ { display: inline-block; }',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'readView',
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'writeView',
    },
    'prop',
    {
      name: 'contextData',
      documentation: "See the comment in 'exports' above as to why this is necessary.",
      factory: function() {
        return this.__context__.data;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var callFromProperty = function() {
        self.prop && this.fromProperty && this.fromProperty(self.prop);
      };
      this.SUPER();
      this.addClass(this.myClass());
      this.add(this.slot(function(mode) {
        switch ( mode ) {
          case self.DisplayMode.RW:
          case self.DisplayMode.DISABLED:
            return self.E()
              .start(self.writeView, {
                data$: self.data$,
                mode: mode
              })
                .call(callFromProperty)
              .end();
          case self.DisplayMode.RO:
            return self.E()
              .start(self.readView, {
                data$: self.data$,
                mode: mode
              })
                .call(callFromProperty)
              .end();
          case self.DisplayMode.HIDDEN:
            break;
          default:
            console.warn('Unrecognized mode: ' + mode);
        }
      }));
    },

    function fromProperty(prop) {
      this.prop = prop;
      this.SUPER(prop);
    }
  ]
});
