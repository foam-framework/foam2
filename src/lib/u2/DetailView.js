/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'DetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView'
  ],

  exports: [
    'data',
    'controllerMode'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(_, data) {
        if ( data && data.cls_ !== this.of ) this.of = data.cls_;
      }
    },
    {
//      type: 'Model',
      name: 'of',
      postSet: function(oldCls, cls) {
        console.assert(foam.core.FObject.isSubClass(cls), 'Invalid model specified for ' + this.name_);
        if ( oldCls !== cls ) {
          this.properties = cls.getAxiomsByClass(foam.core.Property).filter(function(p) { return ! p.hidden; });
        }
        if ( ( ! oldCls && ! this.hasOwnProperty('title') ) || this.title === oldCls.label ) {
          this.title = cls.label;
        }
      }
    },
    {
      type: 'Boolean',
      name: 'showActions'
    },
    {
      name: 'properties'
    },
    {
      name: 'controllerMode',
      attribute: true
    },
    {
      name: 'title',
      attribute: true,
      documentation: function() {/*
        <p>The display title for the $$DOC{ref:'foam.ui.View'}.
        </p>
      */}
    },
    [ 'nodeName', 'div' ]
  ],

  templates: [
    function CSS() {/*
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
        width: 98%;
      }
      ^ select {
        border: solid 1px #aacfe4;
        font-size: 10px;
        margin: 2px 0 0px 2px;
        padding: 4px 2px;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

//      this.Y.registerModel(this.DetailPropertyView, 'foam.u2.PropertyView');
    },

    function initE() {
      this.add(this.expression(function(model, properties) {
        if ( ! model ) return 'Set model or data.';

        var title = this.title && this.E('tr').
              start('td').cssClass(this.myCls('title')).attrs({colspan: 2}).
                add(this.title$).
              end();

        return this.actionBorder(
          this.E('table').cssClass(this.myCls()).add(title).add(properties));
      }.bind(this), this.of$, this.properties$));
    },

    function actionBorder(e) {
      if ( ! this.showActions || ! this.of.actions.length ) return e;

      return this.Y.E().add(e).start('div').cls(this.myCls('toolbar')).add(this.of.actions).end();
    },

    function elementForFeature(fName) {
      var f = this.cls_.getFeature(fName) || this.X.data.model_.getFeature(fName);
      return f ? f.toE(this.Y) : this.E('Unknown feature: ' + fName).style({color: 'red'});
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  requires: [
    'foam.u2.PropertyView',
    'foam.u2.TextField'
  ],

  methods: [
    function toPropertyE(X) {
      return this.TextField.create(null, X);
    },

    function toE(X) {
      return this.PropertyView.create({
        prop: this,
        view: this.toPropertyE(X)
      }, X);
    }
  ]
});
