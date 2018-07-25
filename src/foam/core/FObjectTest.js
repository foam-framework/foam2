foam.CLASS({
  package: 'foam.core',
  name: 'FObjectTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'FObject interface tests',

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User input = new User.Builder(x).setId(1000L)
          .setFirstName("FOAM")
          .setLastName("USER")
          .build();

        FObject_fclone_ClonedObjectEqualsOriginal(input);
      `
    },
    {
      name: 'FObject_fclone_ClonedObjectEqualsOriginal',
      args: [
        { class: 'FObjectProperty', name: 'input' }
      ],
      javaCode: `
        test(input.equals(input.fclone()), "Cloned FObject equals original FObject");
      `
    }
  ]
});
