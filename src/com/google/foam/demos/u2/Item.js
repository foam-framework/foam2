/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  name: 'ItemStatus',

  properties: [
    {
      name: 'color'
    },
    {
      class: 'Boolean',
      name: 'active'
    }
  ],

  values: [
    { name: 'BACKLOG',        label: 'In Backlog',      color: 'gray'   },
    { name: 'SCHEDULED',      label: 'Scheduled',       color: 'red'    },
    { name: 'STARTED',        label: 'Started',         color: 'red',    active: true },
    { name: 'READY_FOR_TEST', label: 'Ready for Test',  color: 'orange' },
    { name: 'IN_TEST',        label: 'In Test',         color: 'orange', active: true },
    { name: 'VERIFIED',       label: 'Verified',        color: 'green'  }
  ]
});


foam.CLASS({
  name: 'Item',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      name: 'owner'
    },
    {
      name: 'project'
    },
    {
      name: 'component'
    },
    {
      class: 'Enum',
      of: 'ItemStatus',
      name: 'status'
    },
    {
      class: 'Boolean',
      name: 'isBlocked'
    },
    {
      class: 'Boolean',
      name: 'isBlocking'
    }
  ],

  methods: [
    function tooltip() {
      return [this.description, this.owner, this.project, this.component, this.status.label].join(', ');
    }
  ]
});


foam.CLASS({
  name: 'ItemController',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.dao.EasyDAO'
  ],

  css: `
    body {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    ^ th {
      text-align: left;
    }
    ^ th {
      width: 200px;
      padding: 10px;
      border: 1px solid gray;
    }
    ^ td {
      height: 40px;
      border: 1px solid gray;
    }
    a {
      padding: 2px;
      text-decoration: none;
    }
    a.blocked {
      text-decoration: overline;
    }
    a.active {
      border: 1px solid black;
      border-radius: 20px;
    }
  `,

  properties: [
    {
      name: 'items',
      factory: function() {
        var testData = [];

        for ( var i = 0 ; i < 100 ; i++ ) {
          var item = {
            description: 'ticket 1',
            owner:       this.members[Math.floor(Math.random()*this.members.length)],
            component:   this.components[Math.floor(Math.random()*this.components.length)],
            project:     this.projects[Math.floor(Math.random()*this.projects.length)],
            status:      ItemStatus.VALUES[1+Math.floor(Math.random()*(ItemStatus.VALUES.length-1))]
          };

          if ( item.status == ItemStatus.SCHEDULED && Math.random() < 0.5 ) {
            item.isBlocked = true;
          }

          testData.push(item);
        }

        return this.EasyDAO.create({
          of: 'Item',
          seqNo: true,
          daoType: 'MDAO',
          testData: testData
        });
      }
    },
    {
      name: 'components',
      value: [
        '-',
        'Authentication',
        'Crypto',
        'DevOps',
        'DevSupport',
        'Documentation',
        'FOAM',
        'IT',
        'nanoMeter',
        'QA',
        'Transactions',
        'UX-Design',
      ]
    },
    {
      name: 'projects',
      value: [
        '-',
        'Ablii',
        'Deutsche Bank',
        'EXIM Bank',
        'Goldman Sachs',
        'TechBan'
      ]
    },
    {
      name: 'members',
      value: [
        'John', 'Jane', 'Steve', 'Sarah'
      ]
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self        = this;
      var cells       = {};
      var memberCells = {};

      this.
        addClass(this.myClass()).

        start('table').
          attrs({border: 1}).

          // Header
          start('tr').
            tag('td').
            forEach(this.projects, function(p) {
              this.
                start('th').
                  addClass('header').
                  add(p).
                end();
            }).
          end().

          // Rows
          forEach(this.components, function(c) {
            this.
              start('tr').
                start('th').
                  add(c).
                  forEach(self.projects, function(p) {
                    this.start('td').call(function() {
                      cells[p + ':' + c] = this;
                    }).end();
                  }).
                end().
              end();
          }).
        end();

        this.
          br().
          start('table').
            attrs({border: 1}).

            // Header
            start('tr').
              start('th').add('Owner').end().
              forEach(ItemStatus.VALUES, function(s) {
                this.start('th').add(s.label).end();
              }).
            end().

            // Rows
            forEach(this.members, function(m) {
              this.
                start('tr').
                  start('th').
                    add(m).
                  end().
                  forEach(ItemStatus.VALUES, function(s) {
                    this.start('td').call(function() {
                      memberCells[s.name + ':' + m] = this;
                    }).end();
                  }).
                end();
            }).
          end();

      this.items.select(function(item) {
        self.addIssueLink(cells[item.project + ':' + item.component], item);
        self.addIssueLink(memberCells[item.status.name + ':' + item.owner], item);
      });
    },

    function addIssueLink(self, item) {
      self.
        start('a').
          attrs({href: '', title: item.tooltip()}).
          style({
            color: item.status.color,
          }).
          callIf(item.isBlocked,     function() { this.addClass('blocked'); }).
          callIf(item.status.active, function() { this.addClass('active'); }).
          add(item.id).
        end().
        add(' ');
    }
  ]
});

var ctrl = ItemController.create();
ctrl.write(document);

var view = foam.u2.view.TableView.create({
  of: Item,
  data: ctrl.items
});
view.write(document);

ctrl.items.select(console);
