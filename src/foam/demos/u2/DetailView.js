/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var timer = foam.util.Timer.create();
timer.start();

var E = foam.__context__.E.bind(foam.__context__);

/*

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true
})..write();

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true,
  properties: [ foam.util.Timer.INTERVAL, foam.util.Timer.I ],
  actions: [ foam.util.Timer.STOP, foam.util.Timer.START ]
})..write();

*/
foam.CLASS({
  package: 'foam.util',
  name: 'TimerDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.util.Timer'
  ],

  // css: foam.u2.DetailView.model_.css,

  methods: [
    function initE() {
      var self = this;
      this.startContext({data: this.data}).
        tag(this.DetailPropertyView, {prop: self.Timer.I}).
        tag(this.DetailPropertyView, {prop: self.Timer.INTERVAL}).
        add(self.Timer.STOP, self.Timer.START);
    },
    function layoutProperties(properties, self) {
      self.layoutProp(self.Timer.I, self);
      self.layoutProp(self.Timer.INTERVAL, self);
    },

  ]
});

E('br').write();
E('hr').write();
E('br').write();

E('h3').add('Custom DetailView').write();
foam.util.TimerDetailView.create({data: timer, showActions: true}).write();

E('h3').add('DetailView with data').write();
foam.u2.DetailView.create({data: timer, showActions: true}).write();

E('h3').add('DetailView with of and data').write();
foam.u2.DetailView.create({of: 'foam.util.Timer', data: timer, showActions: true}).write();

E('h3').add('DetailView with of').write();
foam.u2.DetailView.create({of: 'foam.util.Timer', showActions: true}).write();


E('br').write();
E('hr').write();
E('br').write();

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'GroupDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.auth.Group',
    'foam.u2.DetailPropertyView'
  ],

  // css: foam.u2.DetailView.model_.css,

  css: `
    ^ {
      padding: 8px;
      display: inline-block;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 8px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.
        addClass(this.myClass()).
        start(Columns).
          start(Column).start('table').
            tag(this.DetailPropertyView, {prop: this.data.ID}).
            tag(this.DetailPropertyView, {prop: this.data.DESCRIPTION}).
          end().end().
          start(Column).start('table').
            tag(this.DetailPropertyView, {prop: this.data.PARENT}).
            tag(this.DetailPropertyView, {prop: this.data.DEFAULT_MENU}).
            tag(this.DetailPropertyView, {prop: this.data.ENABLED}).
          end().end().
        end().
        br().
        start(Tabs).
          start(Tab, {label: 'Permissions'}).
            start().style({'overflow-y': 'auto'}).
              startContext({data: this.data}).
                add(this.data.PERMISSIONS).
              endContext().
              startContext({data: this.data}).
                add(this.data.PERMISSIONS2).
              endContext().
            end().
          end().
          start(Tab, {label: 'Users'}).
          end().
          start(Tab, {label: 'Colours'}).
            start('table').
              tag(this.DetailPropertyView, {prop: this.data.PRIMARY_COLOR,     label: 'Primary'}).
              tag(this.DetailPropertyView, {prop: this.data.SECONDARY_COLOR,   label: 'Secondary'}).
              tag(this.DetailPropertyView, {prop: this.data.ACCENT_COLOR,      label: 'Accent'}).
              tag(this.DetailPropertyView, {prop: this.data.TABLE_COLOR,       label: 'Table'}).
              tag(this.DetailPropertyView, {prop: this.data.TABLE_HOVER_COLOR, label: 'Table Hover'}).
            end().
          end().
          start(Tab, {label: 'CSS'}).
            add(this.data.GROUP_CSS).
          end().
          start(Tab, {label: 'Views'}).
            start('table').
              tag(this.DetailPropertyView, {prop: this.data.TOP_NAVIGATION}).
              tag(this.DetailPropertyView, {prop: this.data.FOOTER_VIEW, label: 'Footer'}).
            end().
          end().
          start(Tab, {label: 'Logo'}).
            add(this.data.LOGO).
            br().
            start(foam.u2.view.ImageView, {data: this.data.logo$}).style({padding: '10px'}).end().
          end().
        end();
//        tag(this.DetailPropertyView, {prop: this.data.USERS});
    }
  ]
});

// Bug: Borders don't pass down Context properly

foam.u2.DetailView.create({of: foam.nanos.auth.Group, data: foam.nanos.auth.Group.create(), showActions: true}).write();

E('br').write();
E('hr').write();
E('br').write();

foam.CLASS({
  name: 'GroupDetailView2',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.auth.Group',
    'foam.u2.DetailPropertyView'
  ],

  css: `
    ^ {
      padding: 8px;
      display: inline-block;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 8px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.
        addClass(this.myClass()).
        start(Columns).
          start(Column).start('table').
            tag(this.DetailPropertyView, {prop: this.data.ID}).
            tag(this.DetailPropertyView, {prop: this.data.DESCRIPTION}).
          end().end().
          start(Column).start('table').
            tag(this.DetailPropertyView, {prop: this.data.PARENT}).
            tag(this.DetailPropertyView, {prop: this.data.DEFAULT_MENU}).
            tag(this.DetailPropertyView, {prop: this.data.ENABLED}).
          end().end().
        end().
        br().
        start(Tabs).

          start(Tab, {label: 'Look & Feel'}).

            start(Columns).
              start(Column).

                start(LabelledSection, {title: 'CSS'}).
                  add(this.data.GROUP_CSS).
                end().br().

                start(LabelledSection, {title: 'Logo'}).
                  br().
                  add(this.data.LOGO).
                  br().
                  start(foam.u2.view.ImageView, {data: this.data.logo$}).style({padding: '10px'}).end().
                end().

              end().

              start(Column).

                start(LabelledSection, {title: 'Colours'}).
                  start('table').
                    tag(this.DetailPropertyView, {prop: this.data.PRIMARY_COLOR,     label: 'Primary'}).
                    tag(this.DetailPropertyView, {prop: this.data.SECONDARY_COLOR,   label: 'Secondary'}).
                    tag(this.DetailPropertyView, {prop: this.data.ACCENT_COLOR,      label: 'Accent'}).
                    tag(this.DetailPropertyView, {prop: this.data.TABLE_COLOR,       label: 'Table'}).
                    tag(this.DetailPropertyView, {prop: this.data.TABLE_HOVER_COLOR, label: 'Table Hover'}).
                  end().
                end().br().

                start(LabelledSection, {title: 'Views'}).
                  start('table').
                    tag(this.DetailPropertyView, {prop: this.data.TOP_NAVIGATION}).
                    tag(this.DetailPropertyView, {prop: this.data.FOOTER_VIEW, label: 'Footer'}).
                  end().
                end().

              end().
            end().
          end().

          start(Tab, {label: 'Permissions'}).
            start().style({'overflow-y': 'auto'}).
              add(this.data.PERMISSIONS).
            end().
          end().

          start(Tab, {label: 'Users'}).
          end().

        end();
//        tag(this.DetailPropertyView, {prop: this.data.USERS});
    }
  ]
});

GroupDetailView2.create({of: foam.nanos.auth.Group, data: foam.nanos.auth.Group.create(), showActions: true}).write();

E('br').write();
E('hr').write();
E('br').write();

/*
foam.nanos.auth.Group.getAxiomsByClass(foam.core.Property).forEach(function(p) { console.log("tag(this.DetailPropertyView, {prop: this.data." + foam.String.constantize(p.name) + "})..");}).;
*/
