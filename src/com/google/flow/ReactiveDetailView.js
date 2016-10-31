/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
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

        var timer = function() {
          if ( self.isDestroyed() ) return;
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

  requires: [ 'com.google.flow.DetailPropertyView' ]
});


foam.CLASS({
  package: 'com.google.flow',
  name: 'DetailPropertyView',
  extends: 'foam.u2.DetailPropertyView',

  imports: [
    'data',
    'scope'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
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
      ^switch { color: #ccc; }
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
      */}
    })
  ],

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

      this.data$.sub(function() {
        if ( self.data ) {
          var f = self.data.reactions_[self.prop.name];
          self.formula = f ? f.toString() : '';
          self.reactive = !! f;
        }
      });

      this.cssClass(this.myCls()).
          start('td').cssClass(this.myCls('label')).add(prop.label).end().
          start('td').
            cssClass(this.myCls('switch')).
            enableCls('reactive', this.reactive$).
            on('click', this.toggleMode).
            add(' = ').
          end().
          start('td').cssClass(this.myCls('view')).add(
              this.slot(function(reactive) {
                return reactive ?
                    self.FORMULA.toE({data$: this.formula$}, this.__subSubContext__).
                      cssClass(this.myCls('formulaInput')).
                      on('blur', function() { self.reactive = !! self.formula; }).
                      focus() :
                    prop ;
              }),
            prop.units && this.E('span').cssClass(this.myCls('units')).add(' ', prop.units)).
          end();
    },

    function setFormula(formula) {
      this.data.startReaction_(this.prop.name, formula);
    }
  ],

  listeners: [
    function toggleMode() {
      this.reactive = ! this.reactive;
    }
  ]
});
