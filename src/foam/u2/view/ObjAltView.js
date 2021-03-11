/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ObjAltView',
  extends: 'foam.u2.View',

  imports: [ 'memento' ],

  requires: [ 'foam.u2.view.RadioView' ],

  documentation: "Like AltView, but for Objects instead of DAO's.",

  css: `
    ^ { margin: auto; }
    ^ select { height: 26px }
    ^ .foam-u2-view-RadioView.foam-u2-view-RadioView-horizontal-radio .choice {
    }
  `,

  properties: [
    {
      name: 'of',
      factory: function() { return this.data.of }
    },
    {
      name: 'views',
      factory: function() { return []; }
    },
    {
      name: 'selectedView',
      view: function(_, X) {
        return X.data.RadioView.create(
          {choices: X.data.views, isHorizontal: true, columns: 8},
          X.createSubContext({controllerMode: foam.u2.ControllerMode.EDIT})
        );
      },
      postSet: function() {
        if ( ! this.memento )
          return;

        var view = this.views.find(v => v[0] === this.selectedView);
        if ( view ) {
          this.memento.paramsObj.sV = view[1];
        } else {
          delete this.memento.paramsObj.sV;
        }
        this.memento.paramsObj = foam.Object.clone(this.memento.paramsObj);
      }
    },
    {
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      if ( this.memento && this.memento.paramsObj.sV ) {
        var view = this.views.find(v => v[1] === this.memento.paramsObj.sV);
        if ( view ) {
          this.selectedView = view[0];
        } else {
          this.selectedView = this.views[0][0];
        }
      } else {
        this.selectedView = this.views[0][0];
      }

      this.addClass(this.myClass())
      this.startContext({data: this})
        this.start()
          .add(this.SELECTED_VIEW)
        .end()
      .endContext()
      .start('div')
        .add(this.selectedView$.map(function(v) {
          return self.E().tag(v, {data$: self.data$});
        }))
      .end();
    }
  ]
});
