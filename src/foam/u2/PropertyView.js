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
  name: 'PropertyView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.Property',
    'foam.u2.TextField'
  ],

  properties: [
    'prop',
    {
      name: 'view',
      attribute: true,
      adapt: function(_, v) {
        if ( typeof v === 'function' ) return v(this.Y);
        if ( typeof v === 'string' ) {
          var m = this.X.lookup(v);
          if ( m ) return m.create(undefined, this.Y);
        }
        return v;
      }
    },
    'child_',
    'validator_',
    [ 'nodeName', 'span' ]
  ],

  methods: [
    function init() {
      this.SUPER();

      var view = this.view || this.prop.view(this.Y);

      view.data$ = this.data$.dot(this.prop.name);
      view.fromProperty && view.fromProperty(this.prop);

      this.child_ = view;
    },

    function initE() {
      this.cssClass(this.myCls());
      this.add(this.child_);

      /*
      // Attach property validation if it's enabled and available.
      if ( this.validator_ ) this.validator_();
      if ( this.child_.showValidation && this.prop.validate ) {
        this.validator_ = this.X.dynamic3(this.data, this.prop.validate, function(err) {
          this.child_.validationError_ = err;
        }.bind(this));
      }
      */
    },

    // Set properties on delegate view instead of this
    function attrs(map) {
      if ( map.data ) {
        this.data = map.data;
        delete map.data;
      }
      this.child_.attrs(map);
      return this;
    }
  ]
});
