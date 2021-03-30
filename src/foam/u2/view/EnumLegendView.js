/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EnumLegendView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.crunch.Style'
  ],

  css: `
  ^container {
    border-style: solid;
    border-width: thin;
  }
  ^eachValue {
    display: inline-flex;
    padding: 12px;
    text-align: justify;
  }
  `,
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Array',
      name: 'enumValueToHide'
    }
  ],
  methods: [
    function initE() {
      this.SUPER();

      var style = this.Style.create();
      style.addBinds(this);

      this.start().addClass(this.myClass('container'))
      .start('h3').add('Status Legend').end()
      .add(this.of.VALUES
        .filter(
          statusEnum => ! this.enumValueToHide.includes(statusEnum.name))
        .map(
          statusEnum => {
            return this.E().start().addClass(this.myClass('eachValue'))
              .start().add(
                foam.u2.view.ReadOnlyEnumView.create({
                  data: statusEnum
                })
              ).end()
              .start().add(statusEnum.documentation).end()
            .end();
          }
      ))
      .end();
    }
  ]
});
