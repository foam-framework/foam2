/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'SimpleClassView',
  extends: 'foam.u2.View',
  
  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.core.Implements',
    'foam.doc.dao.AxiomDAO',
    'foam.doc.AxiomListView',
    'foam.doc.AxiomSummaryView',
    'foam.doc.ClassLink',
    'foam.doc.MethodAxiom',
    'foam.doc.PropertyAxiom',
  ],

  css: `
    ^commaseparated span:after {
      content: ", ";
    }
    ^commaseparated span:last-child:after {
      content: "";
    }
  `,

  properties: [
    {
      name: 'axiomDAO',
      expression: function(data) {
        return this.AxiomDAO.create({modelIds: [data.id]});
      },
    },
  ],

  methods: [
    function initE() {
      this.SUPER();

      var cls = this.data;
      var model = cls.model_;
      var impls = cls.getAxiomsByClass(this.Implements);

      var exts = [];
      var m = cls;
      while ( m.id != 'foam.core.FObject' ) {
        m = foam.lookup(m.model_.extends);
        exts.push(m);
      }

      var ClassLink = this.ClassLink;

      this.
        start('div').
          add(model.package).
        end().
        start('h3').
          add('Class ').
          add(model.name).
        end().
        start('div').
          forEach([cls].concat(exts).reverse(), function(e, i) {
            this.
              start('div').
                style({ 'text-indent': ( i ) * 20 + 'px' }).
                callIf(cls == e, function() {
                  this.add(e.id)
                }).
                callIf(cls != e, function() {
                  this.start(ClassLink, { data: e, showPackage: true }).end()
                }).
              end();
          }).
        end().
        callIf(impls.length, function() {
          this.
            start('h4').
              add('All Implemented Interfaces:').
            end().
            start('div').
              addClass(this.myClass('commaseparated')).
              forEach(impls, function(impl) {
                this.
                  start('span').
                    start(ClassLink, { data: impl.path }).end().
                  end()
              }).
            end()
        }).
        // TODO Direct Known Subclasses? Javadoc has this.
        start('hr').end().
        start('code').
          add('public class ').
          add(model.name).
          br().
          add('extends ').
          start(ClassLink, { data: model.extends }).end().
          callIf(impls.length, function() {
            this.
              br().
              add('implements ').
              forEach(impls, function(impl, i) {
                this.
                  callIf(i > 0, function() { this.add(', ') }).
                  start(ClassLink, { data: impl.path }).end()
              })
          }).
        end().
        start('div').
          add(model.documentation).
        end().

        add(this.AxiomSummaryView.create({
          title: 'Property Summary',
          of: this.PropertyAxiom,
          modelId: model.id,
        })).
        forEach(exts.map(function(e) { return e.id }).concat(impls.map(function(i) { return i.path })), function(id) {
          this.
            start(this.AxiomListView, {
              of: this.PropertyAxiom,
              modelId: id,
              titleFn: function() {
                  return this.E('h3').
                    add('Properties inherited from ').
                    start(this.ClassLink, { data: id }).
                    end()
              }.bind(this),
            }).
            end()
        }).

        add(this.AxiomSummaryView.create({
          title: 'Method Summary',
          of: this.MethodAxiom,
          modelId: model.id,
        })).
        forEach(exts.map(function(e) { return e.id }).concat(impls.map(function(i) { return i.path })), function(id) {
          this.
            start(this.AxiomListView, {
              of: this.MethodAxiom,
              modelId: id,
              titleFn: function() {
                  return this.E('h3').
                    add('Methods inherited from ').
                    start(this.ClassLink, { data: id }).
                    end()
              }.bind(this),
            }).
            end()
        })

        // TODO property and method detail sections.
    },
  ]
});
