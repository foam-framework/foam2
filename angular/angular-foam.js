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

// Load this file and make your Angular module depend on the 'foam' module to
// get foam-view and foam-repeat directives in your code.
//
// Correct load order is Angular 1.5 and FOAM 2 (either order), this library,
// then your application module that uses Angular and this library.

/* globals angular: false */
angular.module('foam', [ 'ngMaterial' ]).directive('foamView', function() {
  return {
    restrict: 'A',
    scope: {
      // TODO: Make these one-way reactive bindings, probably.
      // Except for "as", that should just be a string.
      key: '=foamView',
      dao: '<foamDao',
      as: '@foamAs',
      delay: '@foamDelay'
    },
    priority: 2000,
    transclude: 'element',
    link: function($scope, element, attrs, controllers, transcludeFn) {
      var obj;
      var innerScope;

      var delay = typeof $scope.delay === 'undefined' ? 100 : $scope.delay;
      var as = $scope.as || 'object';

      // Subscription to changes inside the DAO.
      var daoSub;
      // Subscription to changes on the cloned object.
      var objSub;

      // Look up our FOAM object on the DAO.
      function initialStart() {
        if ( ! $scope.dao ) return;
        $scope.dao.find($scope.key).then(hookUpObject);
        daoSub && daoSub.detach();
        daoSub = $scope.dao.on.sub(function(sub, _, operation, obj) {
          if ( operation === 'reset' ) {
            initialStart();
          } else if ( obj.id === $scope.key ) {
            hookUpObject(obj);
          }
        });

        innerScope.$watch(as, function(nu, old) {
          if ( nu && nu.id !== (old && old.id) ) {
            $scope.key = nu.id;
          }
        });
      }

      $scope.$watch('key', initialStart);
      $scope.$watch('dao', initialStart);

      function hookUpObject(o) {
        innerScope[as] = obj = o.clone();

        objSub && objSub.detach();
        objSub = obj.propertyChange.sub(foam.X.merged(function(sub) {
          sub.detach();
          $scope.dao.put(obj).then(hookUpObject);
        }, delay));
      }

      transcludeFn(function(clone, scope) {
        innerScope = scope;
        initialStart();
        element.after(clone);
      });
      // TODO: Do I need to add something extra to detach that scope?
    }
  };
});

angular.module('foam').directive('foamRepeat', [ '$timeout',
    function($timeout) {
  return {
    restrict: 'A',
    scope: {
      // TODO: Make these one-way reactive bindings, probably.
      // Except for "as", that should just be a string.
      dao: '<foamRepeat',
      as: '@foamAs'
    },
    priority: 20000,
    transclude: 'element',
    link: function($scope, element, attrs, controllers, transcludeFn) {
      var cache = {};
      var as = $scope.as || 'object';
      var delay = 200;

      var listener = {
        put: onPut,
        remove: onRemove,
        reset: onReset,
        eof: function() { }
      };

      $scope.dao.pipe(listener);

      $scope.$watch('dao', function() {
        doReset();
        $scope.dao.pipe(listener);
      });

      function attachObject(obj) {
        obj.propertyChange.sub(foam.X.merged(function(sub) {
          sub.detach();
          $scope.dao.put(obj);
        }, delay));
      }

      function onPut(obj) {
        var c = cache[obj.id];
        if ( c ) {
          var o = c.scope[as] = obj.clone();
          $timeout(function() { c.scope.$apply(); }, 0, false);
          attachObject(o);
          return;
        }

        // Otherwise we need to create a new clone, bind its scope, and save the
        // scope.
        c = { object: obj.clone() };
        attachObject(c.object);
        transcludeFn(function(clone, scope) {
          var end = element.clone(false);
          element.replaceWith(clone);
          clone.after(end);
          element = end;

          c.element = clone;
          c.scope = scope;
          scope[as] = c.object;
          cache[obj.id] = c;
        });
      }

      function remove(c) {
        c.element.remove();
        c.scope.$destroy();
      }
      // TODO: Optimization: Hide DOM nodes and reuse their scopes?

      function onRemove(obj) {
        var c = cache[obj.id];
        c && remove(c);
        delete cache[obj.id];
      }

      function doReset() {
        for ( var id in cache ) {
          remove(cache[id]);
        }
        cache = {};
        $scope.dao.select(listener);
      }

      function onReset() {
        doReset();
        $scope.dao.select(listener);
      }
    }
  };
} ]);

angular.module('foam').directive('foamInternalInject', function() {
  return {
    link: function(scope, element, attrs, controller, transcludeFn) {
      // TODO: Include error message generation here, for production.
      var innerScope = scope.$new();
      transcludeFn(innerScope, function(clone) {
        element.empty();
        element.append(clone);
        element.on('$destroy', function() {
          innerScope.$destroy();
        });
      });
    }
  };
});

angular.module('foam').directive('foamDaoController', [ '$timeout',
    function($timeout) {
  return {
    restrict: 'E',
    scope: {
      dao: '<',
      selection: '=',
      controllerMode: '=',
      header: '<',
      fab: '<',
      label: '<'
    },
    transclude: true,
    template: foam.String.multiline(function() {/*
      <div class="foam-dao-controller">
      <div ng-if="header" class="foam-dao-controller-header">
      <span class="foam-dao-controller-label">{{label}}</span>
      <button class="foam-dao-controller-create" ng-click="doCreate()">
      New
      </button>
      </div>
      <div class="foam-dao-controller-list">
      <div foam-repeat="dao" ng-click="doEdit(object)"
      class="foam-dao-controller-list-item"
      foam-internal-inject>
      </div>
      <md-button ng-if="fab" class="md-fab md-fab-bottom-right"
          ng-click="doCreate()">
      <md-icon>add</md-icon>
      </md-button>
      </div>
      </div>
    */}),

    link: function(scope) {
      scope.doCreate = function doCreate() {
        var obj = foam.lookup(scope.dao.of).create();
        scope.selection = obj;
        scope.controllerMode = 'create';
      };

      scope.doSave = function doSave() {
        scope.dao.put(scope.selection);
        scope.selection = null;
        scope.controllerMode = 'none';
      };

      scope.controllerMode = 'none';

      scope.doEdit = function doEdit(item) {
        scope.controllerMode = 'edit';
        var clone = item.clone();
        scope.selection = clone;

        var timeout;
        clone.propertyChange.sub(function(sub) {
          if ( timeout ) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(function() {
            timeout = null;
            scope.dao.put(clone);
          }, 500, false);
        });
      };
    }
  };
} ]);

angular.module('foam').directive('foamDetails', [ '$compile',
    function($compile) {
  return {
    restrict: 'A',
    scope: {
      object: '<foamDetails'
    },
    transclude: true,
    link: function(scope, element, attrs, _, $transclude) {
      var lastClass;
      var subscope;

      var enumExtraBinding = function(prop, values, valuesName, ordinalName) {
        return function(subscope) {
          subscope[valuesName] = values;

          // Listen to the string ordinal and forward it to the real object.
          subscope.$watch(ordinalName, function(nu) {
            if ( ! nu ) return;
            subscope.object[prop.name] = +nu;
          });
          subscope.$watch('object.' + prop.name, function(nu) {
            subscope[ordinalName] = '' + nu.ordinal;
          });
        };
      };

      var maybeRebuild = function maybeRebuild(obj) {
        // We only need to rebuild the view if the model has changed.
        if ( ! obj ) return;

        if ( lastClass && obj.cls_ === lastClass ) {
          subscope.object = obj;
          return;
        }

        lastClass = obj.cls_;
        var props = obj.cls_.getAxiomsByClass(foam.core.Property);
        var html = '';
        var extraBindings = [];
        for ( var i = 0; i < props.length; i++ ) {
          var prop = props[i];
          if ( prop.hidden ) continue;

          if ( prop.ngTemplate ) {
            html += prop.ngTemplate;
            continue;
          }

          // Otherwise we dispatch on the type of the property.
          if ( foam.core.Boolean.isInstance(prop) ) {
            html += '<md-checkbox ng-model="object.' + prop.name + '">' +
                prop.label + '</md-checkbox>';
          } else if ( foam.core.StringArray.isInstance(prop) ) {
            html += '<md-input-container><label>' + prop.label + '</label>' +
                '<md-chips ng-model="object.' + prop.name + '" ' +
                'md-on-add="onPropertyChange(\'' + prop.name + '\')" ' +
                'md-on-remove="onPropertyChange(\'' + prop.name + '\')" ' +
                '></md-chips></md-input-container>';
          } else if ( foam.core.Enum.isInstance(prop) ) {
            var valuesName = prop.name + 'Values';
            var ordinalName = prop.name + 'Ordinal';
            var values = foam.lookup(prop.of).getValues();

            extraBindings.push(enumExtraBinding(prop, values, valuesName,
                  ordinalName));

            var labelName = values[0].label ? 'label' : 'name';
            html += '<md-input-container><label>' + prop.label + '</label>' +
                '<md-select ng-model="' + ordinalName + '">' +
                '<md-option ng-repeat="item in ' + valuesName +
                '" value="{{item.ordinal}}">{{item.' + labelName +
                '}}</md-option></md-select></md-input-container>';
          } else {
            var type = 'text';
            if ( foam.core.Int.isInstance(prop) ||
                foam.core.Float.isInstance(prop) ) {
              type = 'number';
            }

            var inputHTML = '<input type="' + type + '" ' +
                'ng-model="object.' + prop.name + '" ' +
                (prop.required ? ' required' : '') + ' />';
            html += '<md-input-container>' +
                '<label>' + prop.label + '</label>' +
                inputHTML +
                '</md-input-container>';
          }
        }

        var onPropertyChange = function onPropertyChange(name) {
          scope.object.propertyChange.pub(name, scope.object[name]);
        };

        $transclude(function(_, innerScope) {
          if ( subscope ) subscope.$destroy();
          subscope = innerScope.$new();
          subscope.object = scope.object;
          subscope.onPropertyChange = onPropertyChange;

          if ( extraBindings.length ) {
            for ( var i = 0; i < extraBindings.length; i++ ) {
              extraBindings[i](subscope);
            }
          }

          element.empty();
          element.append(html);
          $compile(element.contents())(subscope);
        });
      };

      scope.$watch('object', function(nu) {
        maybeRebuild(nu);
      });
    }
  };
} ]);

