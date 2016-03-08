/*
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

/**
// JSON Support
//
// TODO:
//   - don't output default values (optionally)
//   - don't output default classes
//   - quote keys when required
//   - escape values
//   - don't output transient properties
//   - pretty printing
//   - property filtering
//   - allow for custom Property JSON support
//   - compact output
//   -
*/

foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    function toJSON() {
      return foam.json.stringify(this);
    },
    function outputJSON(out, opt_options) {
      out('{class:"', this.cls_.id, '"');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        out(',', p.name, ':');
        foam.json.output(out, this[p.name]);
      }
      out('}');
    }
  ]
});

foam.LIB({
  name: 'Array',
  methods: [
//     function toJSON() { // DANGER! This caused problems with node require when running 'npm run doc'
//       return foam.json.stringify(this);
//     },
    function outputJSON(out, opt_options) {
      out('[');
      for ( var i = 0 ; i < this.length ; i++ ) {
        foam.json.output(out, this[i]);
        if ( i < this.length -1 ) out(',');
      }
      out(']');
    }
  ]
});


foam.LIB({
  name: 'json',
  methods: [
    function createOut() {
      var buf = '';
      function out() {
        for ( var i = 0 ; i < arguments.length ; i++ )
          buf += arguments[i];
      }
      out.toString = function() { return buf; };
      return out;
    },
    function output(out, o) {
      if ( typeof o === 'undefined' ) {
        out('undefined');
      } else if ( typeof o === 'string' ) {
        out('"', o, '"');
      } else if ( typeof o === 'number' ) {
        out(o);
      } else if ( Array.isArray(o) ) {
        out('[');
        for ( var i = 0 ; i < o.length ; i++ ) {
          this.output(out, o[i]);
          if ( i < o.length -1 ) out(',');
        }
        out(']');
      } else if ( o.outputJSON ) {
        o.outputJSON(out);
      }
    },
    function parse(json, opt_class) {
      if ( json.class ) {
        var cls = foam.lookup(json.class);
        foam.X.assert(cls, 'Unknown class "', json.class, '" in foam.json.parse.');
        return cls.create(json);
      }
      if ( opt_class )
        return opt_class.create(json);

      return json;
    },
    function parseArray(a, opt_class) {
      return a.map(function(e) { return foam.json.parse(e, opt_class); });
    },
    function parseString(jsonStr) {
      return eval('(' + jsonStr + ')');
    },
    function stringify(o, opt_options) {
      var out = this.createOut();
      o.outputJSON(out, opt_options);
      return out.toString();
    }
  ]
});
