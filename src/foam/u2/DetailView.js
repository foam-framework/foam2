/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'DetailView',
  extends: 'foam.u2.View',

  documentation: 'A generic property-sheet style View for editing an FObject.',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView',
    'foam.u2.Tab',
    'foam.u2.Tabs'
  ],

  exports: [
    'currentData as data',
    'currentData as objData',
    'controllerMode',
    'currentMemento_ as memento'
  ],

  imports: [
    'memento'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    {
      name: 'data',
      attribute: true,
      preSet: function(_, data) {
        var of = data && data.cls_;
        if ( of !== this.of ) {
          this.of = of;
        } else {
          this.currentData = data;
        }
        return data;
      },
      factory: function() {
        return this.of && this.of.create(null, this);
      }
    },
    'currentData',
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    },
    {
      name: 'properties',
      // TODO: Make an FObjectArray when it validates properly
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0; i < ps.length; i++ ) {
          if ( ! foam.core.Property.isInstance(ps[i]) ) {
            var p = this.of.getAxiomByName(ps[i]);
            if ( ! foam.core.Property.isInstance(p) ) {
              foam.assert(
                false,
                `Non-Property in 'properties' list:`,
                ps);
            } else {
              ps[i] = p;
            }
          }
        }
        return ps;
      },
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Property).
          // TODO: this is a temporary fix, but DisplayMode.HIDDEN should be included and could be switched
          filter(function(p) {
            return ! ( p.hidden || p.visibility === foam.u2.DisplayMode.HIDDEN );
          });
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      name: 'actions',
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Action);
      }
    },
    {
      name: 'title',
      attribute: true,
      expression: function(of) {
        return this.of ? this.of.model_.label : '';
      },
    },
    ['nodeName', 'DIV'],
    'currentMemento_'
  ],

  css: `
    /* Temporary fix until we refactor DetailView to not use a table. */
    ^ {
      display: block;
      margin: auto;
      width: 100%;
    }

    ^toolbar {
      display: flex;
      padding-top: 8px;
      flex-wrap: wrap;
    }

    ^ table {
      width: 100%;
      table-layout: fixed;
    }

    ^ table tr td:nth-of-type(2) {
      width: 70%;
    }

    
    /* 
     * Styles for table contents 
     */

    ^ table .foam-u2-stack-StackView {
      padding-left: 0 !important;
    }

    ^ table .foam-u2-tag-TextArea {
      max-width: 100%;
    }

    ^ table .foam-u2-Multiview-container[style*="float"] .foam-u2-tag-TextArea {
      width: 100%;
    }
  `,

  /*
  TODO: port old FOAM1 CSS
      ^ {
        background: #fdfdfd;
        border: solid 1px #dddddd;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        display: inline-block;
        margin: 5px;
        padding: 3px;
      }
      ^ table {
        padding-bottom: 2px;
      }
      ^title {
        color: #333;
        float: left;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        padding: 2px;
      }
      ^toolbar {
        margin-left: 5px;
      }
      ^ input {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
      ^ textarea {
        border: solid 1px #aacfe4;
        float: left;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        overflow: auto;
        padding: 4px 2px;
        width: 191px;
      }
      ^ select {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
  */

  methods: [
    function initE() {
      var self = this;

      if ( this.memento )
        this.currentMemento_$ = this.memento.tail$;

      var hasTabs = false;
      this.add(this.slot(function(of, properties, actions) {
        if ( ! of ) return '';

        // Binds view to currentData instead of data because there
        // is a delay from when data is updated until when the UI
        // is rebuilt if the data's class changes. Binding directly
        // to data causes views and actions from the old class to get
        // bound to data of a new class, which causes problems.
        self.currentData = self.data;

        self.start().addClass(self.myClass('title')).add(self.title$).end();

        var tabs = foam.u2.Tabs.create({}, self);

        return self.actionBorder(
          this.
            addClass(this.myClass()).
            E('table').
            forEach(properties, function(p) {
              var config = self.config && self.config[p.name];
              var expr = foam.mlang.Expressions.create();

              if ( config ) {
                p = p.clone();
                for ( var key in config ) {
                  if ( config.hasOwnProperty(key) ) {
                    p[key] = config[key];
                  }
                }
              }

              if (
                p.cls_ == foam.dao.OneToManyRelationshipProperty ||
                p.cls_ == foam.dao.ManyToManyRelationshipProperty
              ) {
                hasTabs = true;
                var label = p.label;
                let tab = self.Tab.create({ label: label });
                var dao = p.cls_ == foam.dao.ManyToManyRelationshipProperty
                  ? p.get(self.data).getDAO()
                  : p.get(self.data);
                dao.select(expr.COUNT()).then(function(c) {
                  tab.label = label + ' (' + c.value + ')';
                });

                p = p.clone();
                p.label = '';
                tab.start('table').tag(self.DetailPropertyView, { prop: p });
                tabs.add(tab);
              } else {
                this.tag(self.DetailPropertyView, { prop: p });
              }
            }).
            callIf(hasTabs, function() {
              this.start('tr').start('td').setAttribute('colspan', '2').add(tabs).end().end();
            }));
          }));
    },

    function actionBorder(e) {
      if ( ! this.showActions || ! this.actions.length ) return e;

      return this.E().add(e).
        start('div').addClass(this.myClass('toolbar')).add(this.actions).end();
    }
  ]
});
