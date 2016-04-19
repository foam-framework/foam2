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
  package: 'ng',
  name: 'Todo',
  properties: [
    {
      class: 'Int',
      name: 'id',
    },
    {
      class: 'String',
      name: 'title',
      required: true,
    },
    {
      class: 'Boolean',
      name: 'completed',
    },
  ]
});


angular.module('testApp', ['foam']).controller('mainCtrl', function($scope, $q) {
  var dao = foam.dao.LocalStorageDAO.create({ name: '_todo_NG_' });
  $scope.dao = foam.dao.ProxyDAO.create({ delegate: dao });

  $scope.createTodo = function() {
    var text = $scope.newTodo;
    text = text && text.trim();
    if (typeof text === 'string' && text.length) {
      $scope.dao.put(ng.Todo.create({
        id: Date.now(),
        title: text.trim()
      })).then(function() {
        $scope.newTodo = '';
      }).catch(function(e) {
        console.error('Failed to put', e);
      });
    }
  };

  var parser = foam.parse.QueryParser.create().parserFor(ng.Todo);
  $scope.query = { s: '' };
  $scope.$watch('query.s', function(nu) {
    var q = nu ? parser.parseString(nu) : undefined;
    $scope.dao.delegate = q ? dao.where(q) : dao;
  });
});

