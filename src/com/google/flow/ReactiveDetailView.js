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
    'requestAnimationFrame',
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
        if ( ! r ) {
          this.clearFormula();
        }
      }
    },
    {
      class: 'String',
      name: 'formula',
      displayWidth: 50,
      factory: function() {
        return this.getFormula();
      },
      postSet: function(_, f) {
        if ( ! f ) {
          // this.reactive = false;
        } else {
          // this.reactive = true;
          this.setFormula(f);
        }
      }
    },
    'prop',
    {
      name: 'privateName',
      factory: function() { return this.prop.name + 'Formula__'; }
    },
    [ 'nodeName', 'tr' ]
  ],

  methods: [
    function initE() {
      var prop = this.prop;
      var self = this;

      this.data$.sub(function() {
        if ( self.data ) {
          var f = self.getFormula();
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
      var data = this.data;
      var self = this;
      var f;
      with ( this.scope ) {
        f = eval('(function() { return  ' + formula + '})');
      }
      f.toString = function() { return formula; };
      var timer = function() {
        if ( data.isDestroyed() ) return;
        if ( data.getPrivate_(self.privateName) !== f ) return;
        data[self.prop.name] = f.call(data);
        self.requestAnimationFrame(timer);
      };
      data.setPrivate_(this.privateName, f);
      timer();
    },

    function getFormula() {
      return this.data.getPrivate_(this.privateName);
    },

    function clearFormula() {
      this.data.clearPrivate_(this.privateName);
    }
  ],

  listeners: [
    function toggleMode() {
      this.reactive = ! this.reactive;
    }
  ]
});
