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

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'readView',
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'writeView',
    },
    'prop'
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
              .start(self.writeView, { data$: self.data$ })
                .call(callFromProperty)
              .end();
          case self.DisplayMode.RO:
            return self.E()
              .start(self.readView, { data$: self.data$ })
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
