## How to Create Services

### Server
1. Create foam.Interface for Service

Eg: https://github.com/foam-framework/foam3/blob/master/src/foam/nanos/auth/AuthService.js


If you method is returning some value to the client, make sure to include
async: true so that the client can get the value returned

2. In classes.js, include the Interface for which a skeleton will be generated
Eg:
```
var skeletons = [
  'com.google.foam.demos.appengine.TestService',
  'foam.dao.DAO',
  'foam.mop.MOP',
  'foam.nanos.auth.AuthService'
];
```

3. In your services file
  - Name your service
  - Specify the skeleton
  - Specify the implementation
  - If serve is set to true, the skeleton will be generated

 Eg:

 `p({"class":"foam.nanos.boot.NSpec", "name":"auth",                        "lazy":true,  "serve":true,  "authenticate": false, "boxClass":"foam.nanos.auth.AuthServiceSkeleton", "serviceClass":"foam.nanos.auth.UserAndGroupAuthService","client":"{\"class\":\"foam.nanos.auth.ClientAuthService\"}"})`

### CLIENT SIDE
4. Create stub for Service on the client side
Eg: https://github.com/foam-framework/foam3/blob/master/src/foam/nanos/auth/ClientAuthService.js

5. Add Service to foam.nano.client.Client.js
Eg:
```
{
  name: 'auth',
  factory: function() {
    return this.ClientAuthService.create({
      delegate: this.HTTPBox.create({
        method: 'POST',
        url: 'http://localhost:8080/auth'
      })
    });
  }
}
```

6. In controller, import the service
Eg:
```
imports: [
  'stack', 'userDAO', 'user', 'auth'
],
```

Now, you can call the service in the controller:
```
self.auth.login("marc4@marc.com", "marc123").then(function(response) {
  console.log(response);
}
```
