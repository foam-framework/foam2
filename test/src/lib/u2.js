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
describe('U2', function() {
  describe('CSS support', function() {
    foam.CLASS({
      package: 'test.css',
      name: 'A',
      extends: 'foam.u2.Element',
      axioms: [
        foam.u2.CSS.create({
          code: function() {/*
            .some-class-name {
              display: flex;
            }
          */}
        }, foam.__context__)
      ]
    });

    foam.CLASS({
      package: 'test.css',
      name: 'B',
      extends: 'test.css.A',
      axioms: [
        foam.u2.CSS.create({
          code: function() {/*
            .some-other-class {
              display: flex;
            }
          */}
        }, foam.__context__)
      ]
    });

    foam.CLASS({
      package: 'test.css',
      name: 'C',
      axioms: [
        foam.u2.CSS.create({ code: 'c1' }, foam.__context__),
        foam.u2.CSS.create({ code: 'c2' }, foam.__context__),
        foam.u2.CSS.create({ code: 'c3' }, foam.__context__)
      ]
    });

    foam.CLASS({
      package: 'test.css',
      name: 'D',
      extends: 'test.css.C',
    });

    it('should install CSS when the first instance is created', function() {
      var X = foam.core.Window.create(undefined, foam.__context__);
      var allCSS = '';
      X.installCSS = function(text) {
        allCSS += text;
      };
      X.document = {};

      expect(allCSS).toBe('');
      test.css.A.create(null, X);
      expect(allCSS.indexOf('some-class-name')).toBeGreaterThan(0);
    });

    it('should recursively install CSS from parent classes', function() {
      var X = foam.core.Window.create(undefined, foam.__context__);
      var allCSS = '';
      X.installCSS = function(text) { allCSS += text; };
      X.document = {};

      expect(allCSS).toBe('');
      test.css.B.create(null, X);
      expect(allCSS.indexOf('some-class-name')).toBeGreaterThan(0);
      expect(allCSS.indexOf('some-other-class')).toBeGreaterThan(0);
    });

    it('should not reinstall CSS when more instances are created', function() {
      var X = foam.core.Window.create(undefined, foam.__context__);
      var allCSS = '';
      X.installCSS = function(text) { allCSS += text; };
      X.document = {};

      expect(allCSS).toBe('');
      test.css.B.create(null, X);
      expect(allCSS.indexOf('some-class-name')).toBeGreaterThan(0);
      expect(allCSS.indexOf('some-other-class')).toBeGreaterThan(0);
      var length = allCSS.length;
      test.css.A.create(null, X);
      test.css.B.create(null, X);
      test.css.A.create(null, X);
      test.css.B.create(null, X);
      test.css.B.create(null, X);
      test.css.B.create(null, X);
      expect(allCSS.length).toBe(length);
    });

    it('should handle multiple CSS axioms on one class', function() {
      var X = foam.core.Window.create(undefined, foam.__context__);
      var seenCSS = [];
      X.installCSS = function(text) {
        seenCSS.push(text);
      };
      X.document = {};

      expect(seenCSS.length).toBe(0);
      test.css.C.create(null, X);
      expect(seenCSS).toContain('c1');
      expect(seenCSS).toContain('c2');
      expect(seenCSS).toContain('c3');
    });

    it('should install a parent\'s CSS even when I have none', function() {
      var X = foam.core.Window.create(undefined, foam.__context__);
      var seenCSS = [];
      X.installCSS = function(text) {
        seenCSS.push(text);
      };
      X.document = {};

      // D extends C but has no CSS of its own.
      expect(seenCSS.length).toBe(0);
      test.css.D.create(null, X);
      expect(seenCSS).toContain('c1');
      expect(seenCSS).toContain('c2');
      expect(seenCSS).toContain('c3');
    });

    describe('^ shorthand', function() {
      foam.CLASS({
        package: 'test.css',
        name: 'Shorthand',
        extends: 'foam.u2.Element',
        axioms: [
          foam.u2.CSS.create({
            code: function() {/*
              ^ {}
              ^bar {}
              ^ ^foo^bar {}
            */}
          }, foam.__context__)
        ]
      });

      it('should expand properly', function() {
        var X = foam.core.Window.create(undefined, foam.__context__);
        X.document = {};
        var css = '';
        X.installCSS = function(text) {
          css += text;
        };

        expect(css.length).toBe(0);
        var e = test.css.Shorthand.create(null, X);
        expect(css.indexOf('.test-css-Shorthand {')).toBeGreaterThan(0);
        expect(css.indexOf('.test-css-Shorthand-bar {')).toBeGreaterThan(0);
        expect(css.indexOf(
            '.test-css-Shorthand .test-css-Shorthand-foo.test-css-Shorthand-bar {'
            )).toBeGreaterThan(0);
        expect(css.indexOf('.' + e.myCls())).toBeGreaterThan(0);
        expect(css.indexOf('.' + e.myCls('foo'))).toBeGreaterThan(0);
        expect(css.indexOf('.' + e.myCls('bar'))).toBeGreaterThan(0);
      });
    });
  });
});
