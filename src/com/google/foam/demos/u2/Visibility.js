foam.CLASS({
  name: 'VisibilityTest',

  properties: [
    {
      class: 'String',
      name: 'readWrite',
      value: 'testing...',
      visibility: foam.u2.Visibility.RW
    },
    {
      class: 'String',
      name: 'final',
      value: 'testing...',
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'disabled',
      value: 'testing...',
      visibility: foam.u2.Visibility.DISABLED
    },
    {
      class: 'String',
      name: 'readOnly',
      value: 'testing...',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'hidden',
      value: 'testing...',
      visibility: foam.u2.Visibility.HIDDEN
    }
  ]
});

var ctx = foam.__context__;

document.write('Default');

foam.u2.DetailView.create(
  {
    data: VisibilityTest.create()
  }
).write();


document.write('<br>Create');

foam.u2.DetailView.create(
  {
    data: VisibilityTest.create(),
    controllerMode: foam.u2.ControllerMode.CREATE
  }
).write();


document.write('<br>View');

foam.u2.DetailView.create(
  {
    data: VisibilityTest.create(),
    controllerMode: foam.u2.ControllerMode.VIEW
  }
).write();


document.write('<br>Edit');

foam.u2.DetailView.create(
  {
    data: VisibilityTest.create(),
    controllerMode: foam.u2.ControllerMode.EDIT
  }
).write();
