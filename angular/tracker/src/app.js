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

/* globals angular: false, ng: false */
angular.module('trackerApp', [ 'foam', 'ngMaterial' ]);

// Generic Google authentication library.
// Doesn't actually have anything to do with FOAM. Uses md-dialog, md-button,
// md-icon.
angular.module('trackerApp').factory('googleAuth', [ '$window', '$document',
    '$mdDialog', function($window, $document, $mdDialog) {
  return {
    token: null,
    listeners: null,
    // Returns a Promise that will resolve when authentication is complete.
    auth: function(name, clientId, opt_scopes) {
      var self = this;
      return new Promise(function(resolve, reject) {
        // First, check if the token is cached.
        if ( self.token ) {
          resolve(token);
          return;
        }

        // Then check localStorage.
        var rawToken = $window.localStorage.getItem(name);
        if ( rawToken ) {
          self.token = JSON.parse(rawToken);
          resolve(self.token);
          return;
        }

        var auth2;
        /* globals gapi: false */
        gapi.load('auth2', function() {
          auth2 = gapi.auth2.init({
            client_id: clientId,
            scope: 'profile'
          });
        });

        $mdDialog.show({
          controller: function(scope) {
            scope.signIn = function() {
              auth2.signIn().then(function(googleUser) {
                var token = googleUser.getAuthResponse().id_token;
                var profile = googleUser.getBasicProfile();
                self.token = {
                  token: token,
                  user: {
                    id: profile.getId(),
                    name: profile.getName(),
                    imageUrl: profile.getImageUrl()
                  }
                };

                $window.localStorage.setItem(name, JSON.stringify(self.token));
                resolve(self.token);
                $mdDialog.hide();
              }, reject);
            };
          },
          template: '<md-dialog><md-dialog-content>' +
              '<md-button ng-click="signIn()">Sign in</md-button>' +
              '</md-dialog-content></md-dialog>'
        });
      });
    }
  };
} ]);

// A promise for authentication specific to this app.
angular.module('trackerApp').factory('auth', [ 'googleAuth',
    function(googleAuth) {
  // Use the Google OAuth library to get an access token.
  return googleAuth.auth('foam-tracker-auth',
      '798200241714-bvbmuuke1ng80k5jmtnqad62mjiqd367' +
      '.apps.googleusercontent.com');
    }
]);

angular.module('trackerApp').factory('userDAO', [ '$rootScope', '$q', 'auth',
    function($rootScope, $q, auth) {
  var dao = ng.dao.QDAO.create({
    q: $q,
    delegate: foam.dao.PromisedDAO.create({
      promise: auth.then(function(auth) {
        var dao = com.firebase.FirebaseDAO.create({
          of: ng.tracker.User,
          secret: 'JAOnw3SePcNUF93pObEGRROVRZQ5J03AtYWS3h65',
          apppath: 'https://blistering-fire-5308.firebaseio.com/'
        });
        dao.startEvents();

        // Make sure I'm in there.
        dao.find(auth.user.id).then(function(user) {
          $rootScope.currentUser = user;
        }, function(err) {
          $rootScope.currentUser = ng.tracker.User.create(auth.user);
          dao.put($rootScope.currentUser);
        });
        return dao;
      })
    })
  });

  $rootScope.userDAO = dao;
  return dao;
    }
]);

angular.module('trackerApp').controller('mainCtrl', [ '$scope', '$mdSidenav',
    '$mdMedia', 'auth', '$q', 'userDAO',
    function($scope, $mdSidenav, $mdMedia, authPromise, $q, userDAO) {
      $scope.rootIssueDAO = ng.dao.QDAO.create({
        q: $q,
        delegate: foam.dao.PromisedDAO.create({
          promise: authPromise.then(function(auth) {
            var dao = com.firebase.FirebaseDAO.create({
              of: ng.tracker.Issue,
              secret: 'JAOnw3SePcNUF93pObEGRROVRZQ5J03AtYWS3h65',
              apppath: 'https://blistering-fire-5308.firebaseio.com/'
            });
            dao.startEvents();
            return dao;
          })
        })
      });

      var predicates = foam.mlang.Expressions.create();
      var queries = {
        open: predicates.EQ(ng.tracker.Issue.IS_OPEN, true),
        closed: predicates.EQ(ng.tracker.Issue.IS_OPEN, false)
      };

      // TODO(braden): Model these menu choices.
      $scope.filters = {
        list: [
          { key: 'open', label: 'Open' },
          { key: 'closed', label: 'Closed' }
        ],
        current: 'open'
      };

      $scope.$watch('filters.current', function(nu) {
        $scope.issueDAO.delegate = queries[nu] ?
            $scope.rootIssueDAO.where(queries[nu]) :
            null;
      });

      $scope.issueDAO = foam.dao.ProxyDAO.create({
        of: 'ng.tracker.Issue',
        delegate: $scope.rootIssueDAO
      });

      $scope.saveCreate = function() {
        var obj = $scope.selection;
        $scope.selection = null;
        obj.id = Date.now();
        obj.created = new Date();
        $scope.rootIssueDAO.put(obj);
      };

      // When we switch into creation mode, set the reporter to the current
      // user.
      // TODO(braden): This is going to be a generally useful feature of the DAO
      // controller; it should allow me to pass in a factory function.
      $scope.$watch('controllerMode', function(nu, old) {
        if ( nu === 'create' && old !== 'create' ) {
          $scope.selection.reporter = $scope.currentUser.id;
        }
      });

      $scope.toggleList = function() {
        $mdSidenav('left').toggle();
      };

      $scope.$watch(function() { return $mdMedia('gt-xs'); }, function(big) {
        $scope.bigScreen = big;
      });

      $scope.usersContainingName = function(query) {
        return userDAO.where(foam.mlang.predicate.ContainsIC.create({
          arg1: ng.tracker.User.NAME,
          arg2: query
        })).select().then(function(a) {
          return a.a;
        });
      };
    }
]);

angular.module('trackerApp').directive('trackerUserChip', [ function() {
  return {
    restrict: 'E',
    scope: {
      user: '<'
    },
    template: '<div flex layout="row" layout-align="start center" ' +
        'class="tracker-user-chip">' +
        '<img flex="none" ng-src="{{user.imageUrl}}" class="user-avatar" />' +
        '<div class="user-name" flex="100">{{ user.name }}</div>'
  };
} ]);

angular.module('trackerApp').directive('trackerUser', [ function() {
  return {
    restrict: 'E',
    scope: {
      user: '='
    },
    template: '<tracker-user-chip user="user" editable="editable" ' +
        '  editing="editing" ng-show="!editing"></tracker-user-chip>' +
        '<div ng-if="editing" flex layout="row">' +
        '<md-autocomplete flex="100" md-selected-item="user" ' +
        '  md-search-text="searchText" ' +
        '  md-items="item in querySearch(searchText)">' +
        '  <tracker-user-chip user="item"></tracker-user-chip>' +
        '</md-autocomplete></div>',
    link: function(scope, element, attrs) {
      scope.editing = false;

      var loadUser = function() {
        if ( ! scope.userId || ! scope.dao ) {
          scope.user = undefined;
          return;
        }

        scope.dao.find(scope.userId).then(function(user) {
          scope.user = user;
        });
      };

      scope.$watch('dao', loadUser);
      scope.$watch('userId', loadUser);

      scope.querySearch = function(text) {
        return scope.dao.where(foam.mlang.predicate.ContainsIC.create({
          arg1: ng.tracker.User.NAME,
          arg2: text
        })).select().then(function(arraySink) {
          return arraySink.a;
        });
      };
    }
  };
} ]);

angular.module('trackerApp').directive('trackerIssueCitation', [ 'userDAO',
    function(userDAO) {
  return {
    restrict: 'E',
    scope: {
      issue: '<'
    },
    template: '<div flex layout="row" layout-padding layout-align="start center">' +
        '<span foam-view="issue.assignee" foam-dao="users" foam-as="user">' +
        '<img flex="none" ng-src="{{user.imageUrl}}" class="user-avatar" />' +
        '</span><span flex ng-class="{ strike: ! issue.isOpen }">' +
        '{{issue.title}}</span></div><md-divider></md-divider>',
    link: function(scope) {
      scope.users = userDAO;
    }
  };
} ]);
