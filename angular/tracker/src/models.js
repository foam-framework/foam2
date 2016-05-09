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
  package: 'ng.tracker.types',
  name: 'PropertyRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'String',
      name: 'ngTemplate'
    }
  ]
});

foam.CLASS({
  package: 'ng.dao',
  name: 'QDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    'q'
  ],
  methods: [
    function find() {
      var p = this.SUPER.apply(this, arguments);
      return this.q(p.then.bind(p));
    },
    function put() {
      var p = this.SUPER.apply(this, arguments);
      return this.q(p.then.bind(p));
    },
    function remove() {
      var p = this.SUPER.apply(this, arguments);
      return this.q(p.then.bind(p));
    },
    function select() {
      var p = this.SUPER.apply(this, arguments);
      return this.q(p.then.bind(p));
    },
    function removeAll() {
      var p = this.SUPER.apply(this, arguments);
      return this.q(p.then.bind(p));
    }
  ]
});

foam.CLASS({
  package: 'ng.tracker.types',
  name: 'Reference',
  extends: 'Property',

  properties: [
    'of',
    {
      name: 'daoName',
      expression: function(of) {
        var name = of.name;
        return name.substring(0, 1).toLowerCase() + name.substring(1) + 'DAO';
      }
    }
  ]
});

foam.CLASS({
  package: 'ng.tracker',
  name: 'Issue',

  properties: [
    {
      class: 'Int',
      name: 'id',
      hidden: true
    },
    {
      class: 'String',
      name: 'title',
      required: true
    },
    {
      class: 'Boolean',
      name: 'isOpen',
      label: 'Open',
      value: true
    },
    {
      class: 'ng.tracker.types.Reference',
      name: 'reporter',
      of: 'ng.tracker.User',
      ngTemplate: '<div foam-view="object.reporter" foam-dao="userDAO" ' +
          'foam-as="user"><md-autocomplete md-selected-item="user" ' +
          'md-search-text="query" ' +
          'md-items="item in usersContainingName(query)" ' +
          'md-item-text="item.name" ' +
          'md-floating-label="Reporter"><md-item-template>' +
          '<tracker-user-chip user="item"></tracker-user-chip>' +
          '</md-item-template></md-autocomplete></div>'
    },
    {
      class: 'ng.tracker.types.Reference',
      name: 'assignee',
      of: 'ng.tracker.User',
      // TODO(braden): After the design meeting, replace this with the
      // agreed-upon best practice for this solution.
      ngTemplate: '<div foam-view="object.assignee" foam-dao="userDAO" ' +
          'foam-as="user"><md-autocomplete md-selected-item="user" ' +
          'md-search-text="query" ' +
          'md-items="item in usersContainingName(query)" ' +
          'md-item-text="item.name" ' +
          'md-floating-label="Assignee"><md-item-template>' +
          '<tracker-user-chip user="item"></tracker-user-chip>' +
          '</md-item-template></md-autocomplete></div>'
    },
    {
      class: 'DateTime',
      name: 'created',
      hidden: true,
      factory: function() {
        return new Date();
      }
    },
    {
      class: 'StringArray',
      name: 'tags'
    }
  ]
});

foam.CLASS({
  package: 'ng.tracker',
  name: 'User',

  properties: [
    { class: 'String', name: 'id', required: true },
    { class: 'String', name: 'name', required: true },
    { class: 'String', name: 'imageUrl' }
  ]
});

