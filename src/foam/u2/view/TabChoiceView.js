/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TabChoiceView',
  extends: 'foam.u2.view.ChoiceView',

  documentation: `
    A choice view that outputs user-specified tabs
  `,

  css: `
    ^ {
      display: flex;
    }

    ^item {
      display: flex;
    }

    ^ input[type="radio"] {
      display: none;
    }

    ^ [type=radio]:checked ~ label {
      border-bottom: solid 3px #406dea;
      font-weight: bold;
      color: #406dea;
    }

    ^ label {
      cursor: pointer;
      line-height: 1.4;
      padding: 16px 32px;
      text-align:center;
      font-size: 14px;
    }
  `,

  methods: [
    function initE() {
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      this
        .addClass(this.myClass())

      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();
      this.choices$.sub(this.onChoicesUpdate);
      this.onChoicesUpdate();
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;
      var id;

      this.removeAllChildren();

      this.add(this.choices.map(function(c) {
        return this.E('div').
          addClass(this.myClass('item')).
          start('input').
            attrs({
              type: 'radio',
              name: this.id,
              checked: self.slot(function (data) { return data === c[0]; })
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) {
              self.data = c[0];
            }).
          end().
          start('label').
            attrs({for: id}).
            start('span').
              translate(c[1], c[1]).
            end().
          end();
      }.bind(this)));
    }
  ]
});
