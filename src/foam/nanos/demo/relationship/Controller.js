/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.demo.relationship',
  name: 'Controller',
  extends: 'foam.u2.Controller',
  imports: [
    'courseDAO',
    'professorDAO',
    'studentDAO'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'courses',
      view: 'foam.comics.InlineBrowserView',
      factory: function() { return this.courseDAO; }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'professors',
      view: 'foam.comics.InlineBrowserView',
      factory: function() { return this.professorDAO; }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'students',
      view: 'foam.comics.InlineBrowserView',
      factory: function() { return this.studentDAO; }
    }
  ],
  methods: [
    function initE() {
      this.add(
        this.COURSES,
        this.PROFESSORS,
        this.STUDENTS
      );
    }
  ]
});
