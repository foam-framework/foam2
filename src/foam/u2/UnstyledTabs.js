/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'UnstyledTabs',
  extends: 'foam.u2.Element',
  documentation: 'An unstyled tab.',
  requires: [ 'foam.u2.Tab' ],
  properties: [
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.selected = false;
        n.selected = true;
      }
    },
    'tabRow'
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        start('div', null, this.tabRow$).
          addClass(this.myClass('tabRow')).
        end().
        start('div', null, this.content$).
          addClass(this.myClass('content')).
        end();
    },

    function add(tab) {
      if ( this.Tab.isInstance(tab) ) {
        if ( ! this.selected ) this.selected = tab;
        if ( tab.selected ) this.selected = tab;

        this.tabRow.start('span').
          addClass(this.myClass('tab')).
          enableClass('selected', tab.selected$).
          on('click', function() { this.selected = tab; }.bind(this)).
          add(tab.label$).
        end();

        tab.shown$ = tab.selected$;
      }

      this.SUPER(tab);
    }
  ]
});
