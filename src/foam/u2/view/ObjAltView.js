/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ObjAltView',
  extends: 'foam.u2.View',

  imports: [ 'memento'],

  documentation: "Like AltView, but for Objects instead of DAO's.",

  css: `
    ^ { margin: auto; }
    ^ select { height: 26px }
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
        return foam.u2.view.ChoiceView.create(
          {choices: X.data.views},
          X.createSubContext({controllerMode: foam.u2.ControllerMode.EDIT})
        );
      },
      postSet: function() {
        var view = this.views.find(v => v[0] === this.selectedView);
        if ( view ) {
          this.memento.paramsObj.selectedView = view[1];
        } else {
          delete this.memento.paramsObj.selectedView;
        }
        this.memento.paramsObj = Object.assign({}, this.memento.paramsObj);
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

      // this.selectedView$.sub(function() {
      //   var view = self.views.find(v => v[0] === self.selectedView);
      //   if ( view ) {
      //     self.memento.paramsObj.selectedView = view[1];
      //   } else {
      //     delete self.memento.paramsObj.selectedView;
      //   }
      //   self.memento.paramsObj = Object.assign({}, self.memento.paramsObj);
      // });

     this.selectedView = this.views[0][0];

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
