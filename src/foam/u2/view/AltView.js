/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'AltView',
  extends: 'foam.u2.View',

  documentation: "Provides the ability to switch between multiple views for data set" +
  "Takes a views property which should be the value of an array containing arrays that contain desired views, and label." +
  "Ex. views: [[ { class: 'foam.u2.view.TableView' }, 'Table' ]]",

  imports: [ 'memento' ],

  requires: [ 'foam.u2.view.RadioView' ],

  exports: [
    'currentMemento_ as memento'
  ],

  css: `
    ^ { margin: auto; width: 100%; }
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
        return X.data.RadioView.create({choices: X.data.views, isHorizontal: true, columns: 8}, X);
      },
      documentation: `Set one of the views as the selectedView.

        Default to the first item of the views property.

        Set selectedView as a string to look up and load the view by name, or as
        a number to load the view by index.

        For example:

            {
              class: 'foam.u2.view.AltView',
              views: [
                [
                  {
                    // view 1 spec
                  },
                  'View 1'
                ],
                [
                  {
                    // view 2 spec
                  },
                  'View 2'
                ]
              ],
              selectedView: 'View 2' // select view by name
            }
      `,
      factory: function() {
        return this.views[0][0];
      },
      adapt: function(_, nu) {
        if ( typeof nu === 'string' ) {
          for ( var i = 0; i < this.views.length; i++ ) {
            if ( this.views[i][1] === nu ) {
              return this.views[i][0];
            }
          }
        } else if ( typeof nu === 'number' ) {
          return this.views[nu][0];
        }
        return nu;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      if ( this.memento ) {
        this.currentMemento_$ = this.memento.tail$;

        if ( ! this.memento.tail ) {
          this.memento.tail = foam.nanos.controller.Memento.create();
        }
      }

      if ( this.currentMemento_ ) {
        if ( ! this.currentMemento_.tail ) {
          this.currentMemento_.tail = foam.nanos.controller.Memento.create();
        }
      }

      if ( this.memento && this.memento.tail && this.memento.tail.head.length != 0 ) {
        var viewSelectedWithMemento = this.views.find(v => foam.Array.isInstance(v) && v[1] == this.memento.tail.head);
        if ( viewSelectedWithMemento ) {
          this.selectedView = viewSelectedWithMemento[1];
        } else {
          this.memento.tail.head = '';
        }
      } else {
        self.setMementoWithSelectedView();
      }

      this.addClass(this.myClass())
      this.startContext({data: this})
        this.start()
          .add(this.SELECTED_VIEW)
        .end()
      .endContext()
      .start('div')
        .add(this.selectedView$.map(function(v) {
          return self.E().tag(v, {data: self.data$proxy});
        }))
      .end();

      this.onDetach(this.selectedView$.sub(function() {
        self.setMementoWithSelectedView();
      }));
    }
  ],

  actions: [
    function setMementoWithSelectedView() {
      if ( ! this.memento || ! this.memento.tail )
        return;
      var view = this.views.find(v => v[0] == this.selectedView);
      if ( view )
        this.memento.tail.head = view[1];
      else
        this.memento.tail.head = '';
    }
  ]
});
