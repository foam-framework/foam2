/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.google.flow',
  name: 'FObjectReactiveDetailViewRefinement',
  refines: 'FObject',
  properties: [
    {
      name: 'reactions_',
      factory: function() { return {}; },
      postSet: function(_, rs) {
        for ( var key in rs ) {
          this.startReaction_(key, rs[key]);
        }
        return rs;
      },
      toJSON: function(v) {
        var m = {};
        for ( key in v ) { m[key] = v[key].toString(); }
        return m;
      }
    }
  ],
  methods: [
    function addReaction(name, formula) {
      // TODO: stop any previous reaction
      this.reactions_[name] = formula;
      this.startReaction_(name, formula);
    },
    function startReaction_(name, formula) {
      // HACK: delay starting reaction in case we're loading a file
      // and dependent variables haven't loaded yet.
      window.setTimeout(function() {
        var self = this;
        var f;

        with ( this.__context__.scope ) {
          f = eval('(function() { return ' + formula + '})');
        }
        f.toString = function() { return formula; };

        var detached = false;
        self.onDetach(function() { detached = true; });
        var timer = function() {
          if ( detached ) return;
          if ( self.reactions_[name] !== f ) return;
          self[name] = f.call(self);
          self.__context__.requestAnimationFrame(timer);
        };

        this.reactions_[name] = f;
        timer();
      }.bind(this), 10);
    }
  ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'ReactiveDetailView',
  extends: 'foam.u2.DetailView',

  requires: [ 'com.google.flow.DetailPropertyView' ],

  css: `
    ^ { margin: inherit !important; }
    ^ table { width: auto !important; }
  `
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DetailPropertyView',
  extends: 'foam.u2.DetailPropertyView',

  imports: [
    'data',
    'scope'
  ],

  css: `
      ^label {
        color: #444;
        display: block;
        float: left;
        font-size: 13px;
        padding-left: 6px;
        padding-top: 6px;
        text-align: right;
        vertical-align: top;
      }
      ^switch { color: #ccc; width: 12px !important; }
      ^switch.reactive {
        font-weight: 600;
        color: red !important;
      }
      ^formulaInput {
        width: 270px;
      }
      ^formulaInput:focus {
        outline: 1px solid red;
      }
      ^units  {
        color: #444;
        font-size: 12px;
        padding: 4px;
        text-align: right;
      }
`,

  properties: [
    {
      class: 'Boolean',
      name: 'reactive',
      postSet: function(_, r) {
        if ( ! r && this.data ) {
          delete this.data.reactions_[this.prop.name];
        }
      }
    },
    {
      class: 'String',
      name: 'formula',
      displayWidth: 50,
      factory: function() {
        return this.data && this.data.reactions_[this.prop.name];
      },
      postSet: function(_, f) {
        if ( f ) this.setFormula(f);
      }
    },
    'prop',
    [ 'nodeName', 'tr' ]
  ],

  methods: [
    function initE() {
      var prop = this.prop;
      var self = this;

      this.data$.sub(this.onDataChange);
      this.onDataChange();

      this.addClass(this.myClass()).
          start('td').addClass(this.myClass('label')).add(prop.label).end().
          start('td').
            addClass(this.myClass('switch')).
            enableClass('reactive', this.reactive$).
            on('click', this.toggleMode).
            add(' = ').
          end().
          start('td').addClass(this.myClass('view')).add(
              this.slot(function(reactive) {
                return reactive ?
                    self.FORMULA.toE({data$: this.formula$}, this.__subSubContext__).
                      addClass(this.myClass('formulaInput')).
                      on('blur', function() { self.reactive = !! self.formula; }).
                      focus() :
                    prop ;
              }),
            prop.units && this.E('span').addClass(this.myClass('units')).add(' ', prop.units)).
          end();
    },

    function setFormula(formula) {
      this.data.startReaction_(this.prop.name, formula);
    }
  ],

  listeners: [
    function toggleMode() {
      this.reactive = ! this.reactive;
    },

    function onDataChange() {
      if ( this.data ) {
        var f = this.data.reactions_[this.prop.name];
        this.formula = f ? f.toString() : '';
        this.reactive = !! f;
      }
    }
  ]
});
