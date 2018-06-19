foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PublicUserEntity',
  documentation: `This model represents a public subset of a user's properties`,

  javaImports: ['foam.nanos.auth.User'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'lastName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    }
  ],
  axioms: [
    {
      writeToSwiftClass: function(cls) {
        cls.method(foam.swift.Method.create({
          static: true,
          name: 'fromUser',
          returnType: 'PublicUserEntity',
          args: [
            foam.swift.Argument.create({
              type: 'User',
              localName: 'u',
            }),
            foam.swift.Argument.create({
              type: 'Context',
              externalName: 'x',
              localName: 'x',
              defaultValue: 'Context.GLOBAL',
            })
          ],
          body: `
            let t = x.create(PublicUserEntity.self)!
            t.copyFrom(u)
            return t
          `
        }))
      },
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicUserEntity(User user) {
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setEmail(user.getEmail());
            setProfilePicture(user.getProfilePicture());
          }
        `);
      },
    },
  ],
});
