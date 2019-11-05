# Authentication and Authorization

The documentation here is meant to provide a high-level view of the code in this package and the problems it solves. It's recommended to start here to get a high-level understanding of what's available, and then to read the documentation in the code itself to get more detailed information.

## Glossary

**Authentication**: Relates to user identity. To authenticate oneself is to prove one's identity to the server. This is commonly called "signing in" or "logging in" in the context of a web application, but the idea of authentication is broader than that. Users of an API served over HTTP can authenticate themselves in different ways, such as sending a bearer token, for example. When we talk about authentication, we're talking about knowing _who_ someone is and the mechanisms we use to verify or prove that they are who they say they are.

**Authorization**: Relates to access control. When we talk about authorization, we're talking about _who_ can access _what_. For example, some set of users can see these menus and perform these actions, whereas other users cannot.

The mechanisms by which we enforce access control checks vary, and the `foam.nanos.auth` package provides a number of different ways to enforce access control, which are documented in more detail below.

**Access Control**: When we say "access", we mean any of the following: 

* service level
  * being able to interface with/access services
    * from the web client, or
    * via DIG and SUGAR, the HTTP APIs
* object level
  * reading/viewing/seeing objects
  * updating existing objects
  * creating new objects
  * deleting/removing objects
* property level
  * reading/getting certain properties on certain models
  * writing/setting certain properties on certain models

Notice that we make a distinction between different "levels" of the application that we apply access control checks to. Some users may not be able to access services at all, such as certain DAOs, for example. Others might have access to a service, but can only access a subset of the data provided by that service. And even if a user can access data in a DAO, they might not be able to read certain properties of the objects they're allowed to see, and they might not be allowed to update certain properties either.

When we say "control", we simply mean that, as application developers, we need to be able to control what users are able to access.

## Consumer Documentation

This section explains the code in the `foam.nanos.auth` package so that it can be _used_ by developers that are using FOAM as a dependency in their project. The documentation in this section is not concerned with how things work, it is focused on how things are used. These developers are _consumers_ of FOAM in the sense that they are building an application using FOAM and would like to take advantage of the features FOAM provides. We make the distinction between consumers and implementers because consumers don't care how the code in `foam.nanos.auth` is implemented, they simply want to know how to use it. A section below contains the implementor documentation, targeted at developers working on FOAM itself.

## Authentication Mechanisms

There is a service named `auth` that can be used to handle authentication. You can access it from your code like so:

Java:
```Java
AuthService auth = (AuthService) x.get("auth");
User user = auth.login(x, "test@example.com", "P45$w0RD");
```

JavaScript:
```JavaScript
imports: [
  'auth'
],

// In a method or other code:
var user = await this.auth.login(null, 'test@example.com', 'P45$w0RD');
```

TODO:
* Explain authentication via the web client vs as an API user

## Authorization Mechanisms

### Service Level

Services are represented by the `foam.nanos.boot.NSpec` model. `NSpec`s have two properties related to authorization:

* `authenticate :: Boolean`
  * Set to true to require users to be authenticated to access this service
  * If set to true, currently this also makes it so that users are required to have a permission of the form `"service.<service name>"` to access the service. For example, `"service.userDAO"`.
    * (Note that the name `authenticate` isn't wholly appropriate here, since setting it to true has authorization implications as well as authentication implications. This should be rectified in the future.)
* `authNotes :: String`
  * This is a place for developers to document the authentication and authorization requirements of the service.

### Object Level

This is where most of the access control logic lies. Since we're talking about objects in this section, we'll narrow the scope a bit and refer to DAOs specifically in this section instead of services in general.

There is a DAO decorator named `AuthorizationDAO` that can be added to any DAO. `AuthorizationDAO` takes an implementation of the `Authorizer` interface as an argument to its builder or constructor and uses the `Authorizer` to check if the user accessing the DAO can do what they're trying to do.

`AuthorizationDAO` can be added manually to a DAO, or it can be added via `EasyDAO`.

There are several different implementations of the `Authorizer` interface:

* `AuthorizableAuthorizer`
  * Used when the model stored in the DAO implements the `Authorizable` interface. This means the model itself has custom code that is used to perform access control checks. This is useful when your model has more complex, often business-specific logic that is used to determine access control.
  * `AuthorizableAuthorizer` is the most flexible `Authorizer` since it just calls custom code, but it's also the most work because you as the application developer must write the code yourself.
* `StandardAuthorizer`
  * Generates permissions in the conventional form `"<model name>.<operation>.<object id>"` (eg: `"user.read.42"`) and uses permission checks to determine whether the user has access or not.
  * `StandardAuthorizer` is useful when you don't have any complex authorization requirements and you would like to use a simple group and permission system to manage access to a DAO. It doesn't require any additional configuration and works out of the box for any model.
* `GlobalReadAuthorizer`
  * Almost identical to `StandardAuthorizer`, but performs no authorization checks to read data.
  * Useful when you have a DAO that contains data that should be readable by any user without permission, but you still want users to need permissions to create, update, or delete data.
* `OrAuthorizer`
  * A higher-order `Authorizer` that takes an array of child `Authorizer`s and passes if any of the children pass. Has short-circuit behaviour.
  * Useful when you want to use a combination of `Authorizers` to cover different use cases.
* `ROPEAuthorizer`
  * Makes use of ROPE to perform access control checks. Explaining ROPE is outside of the scope of this documentation. Please consult the ROPE documentation to learn more.
  * Useful when you want to determine access by following a chain of relationships between objects starting from the object being accessed and ending at the user trying to access it.
  * It occupies a sort of middle ground in terms of ease of use. It's easier than writing custom code like `AuthorizableAuthorizer` requires, but it doesn't work out of the box like `StandardAuthorizer` and `GlobalReadAuthorizer` do, it requires a bit of configuration first.

TODO:
* Explain the group and permission system
* Explain CRUNCH and capabilities

### Property Level

`Property`-ies have the following properties that can be used to accomplish property-level access control:

* `readPermissionRequired :: Boolean`
  * Set to true to require a permission of the form `"<model name>.ro.<property name>"` or `"<model name>.rw.<property name>"` to read a given property on a given model. Eg: `"user.ro.emailVerified"` would be required to read the `emailVerified` property on the `User` model.
* `writePermissionRequired :: Boolean`
  * Set to true to require a permission of the form `"<model name>.rw.<property name>"` to write/set a given property on a given model. Eg: `"user.rw.emailVerified"` would be required to write/set the `emailVerified` property on the `User` model and update the user. (Note that properties can be set locally, such as in the web console, but cannot be saved to the DAO.)

Adding a `PermissionedPropertyDAO` decorator to the relevant DAO is required for property-level access control checks to be enforced.

## Implementor Documentation

TODO