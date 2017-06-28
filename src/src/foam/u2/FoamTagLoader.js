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
  package: 'foam.u2',
  name: 'FoamTagLoader',

  documentation: 'Converts <foam> tags in document into Views.',

  imports: [ 'document', 'window' ],

  methods: [
    function init() {
      this.window.addEventListener('load', this.onLoad, false);
    },

    function findPropertyIC(cls, name) {
      var ps = cls.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        if ( name === ps[i].name.toLowerCase() ) return ps[i];
      }
    }
  ],

  listeners: [
    function onLoad() {
      var els = this.document.getElementsByTagName('foam');
      this.window.removeEventListener('load', this.onLoad);

      // Install last to first to avoid messing up the 'els' list.
      for ( var i = els.length-1 ; i >= 0 ; i-- ) {
        var el = els[i];
        var modelName = el.getAttribute('class');
        var cls = this.lookup(modelName, true);

        if ( cls ) {
          var view = cls.create(null, foam.__context__);

          if ( view.toE ) {
            view = view.toE({}, foam.__context__);
          } else if ( ! foam.u2.Element.isInstance(view) )  {
            view = foam.u2.DetailView.create({data: view, showActions: true});
          }

          for ( var j = 0 ; j < el.attributes.length ; j++ ) {
            var attr = el.attributes[j];
            var p = this.findPropertyIC(view.cls_, attr.name);
            if ( p ) p.set(view, attr.value);
          }

          el.outerHTML = view.outerHTML;
          view.load();
        } else {
          console.error('Unknow class: ', modelName);
        }
      }
    }
  ]
});

foam.u2.FoamTagLoader.create();
