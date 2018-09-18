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
  name: 'TimerView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.util.Timer'
  ],

  // css: foam.u2.DetailView.model_.css,

  methods: [
    function xxxinitE() {
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
/*
E('br').write();
E('hr').write();
E('br').write();

TimerView.create({data: timer, showActions: true})..write();
E('hr').write();
foam.u2.DetailView.create({data: timer, showActions: true})..write();
*/

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
    ^ > table {
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
        start('table').
          tag(this.DetailPropertyView, {prop: this.data.ID}).
          tag(this.DetailPropertyView, {prop: this.data.DESCRIPTION}).
          tag(this.DetailPropertyView, {prop: this.data.ENABLED}).
          tag(this.DetailPropertyView, {prop: this.data.PARENT}).
          tag(this.DetailPropertyView, {prop: this.data.DEFAULT_MENU}).
          start('tr').start('td').attrs({colspan:2}).
            start(LabelledSection, {title: 'Permissions'}).
              add('this.data.PERMISSIONS').
            end().
          end().end().
          start('tr').start('td').attrs({colspan:2}).
            start(Tabs).
              start(Tab, {label: 'Colours'}).
                start('table').
                  tag(this.DetailPropertyView, {prop: this.data.PRIMARY_COLOR,     label: 'Primary'}).
                  tag(this.DetailPropertyView, {prop: this.data.SECONDARY_COLOR,   label: 'Secondary'}).
                  tag(this.DetailPropertyView, {prop: this.data.TABLE_COLOR,       label: 'Table'}).
                  tag(this.DetailPropertyView, {prop: this.data.TABLE_HOVER_COLOR, label: 'Table Hover'}).
                  tag(this.DetailPropertyView, {prop: this.data.ACCENT_COLOR,      label: 'Accent'}).
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
                add('image: ').
                tag(foam.u2.tag.Image, {data: this.data.logo$}).
                add(this.data.logo$).
              end().
            end().
          end().end().
        end();
//        tag(this.DetailPropertyView, {prop: this.data.USERS});
    }
  ]
});

foam.u2.DetailView.create({of: foam.nanos.auth.Group, data: foam.nanos.auth.Group.create(), showActions: true}).write();

E('br').write();
E('hr').write();
E('br').write();

/*
foam.nanos.auth.Group.getAxiomsByClass(foam.core.Property).forEach(function(p) { console.log("tag(this.DetailPropertyView, {prop: this.data." + foam.String.constantize(p.name) + "})..");}).;
*/
