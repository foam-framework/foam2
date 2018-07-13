/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    'of',
    {
      class: 'Boolean',
      name: 'fullyVisible',
      documentation: `If a notification's body content is too long, it will be
          truncated and an ellipsis will be added to the cutoff point. Clicking
          on a notification toggles between truncated form and being fully
          visible. This property tracks whether the notification is being
          truncated or displayed in full.`,
      value: false
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .enableClass('fully-visible', this.fullyVisible$)
          .on('click', this.toggleFullVisibility)
          .show(this.data.body !== '')
          .add(this.data.body)
        .end();
    }
  ],

  listeners: [
    function toggleFullVisibility() {
      this.fullyVisible = ! this.fullyVisible;
    }
  ]
});
