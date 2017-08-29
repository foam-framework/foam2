How to Create Services

//SERVER SIDE
1. Create foam.Interface for Service
Eg https://github.com/foam-framework/foam2/blob/master/src/foam/nanos/auth/WebAuthService.js
If you method is returning some value to the client, make sure to include
returns: 'Promise' so that the client can get the value returned

2. In classes.js, include the Interface for which a skeleton will be generated
Eg
var skeletons = [
  'com.google.foam.demos.appengine.TestService',
  'foam.dao.DAO',
  'foam.mop.MOP',
  'foam.nanos.auth.WebAuthService'
];

3. In your services file
  - Name your service
  - Specify the skeleton
  - Specify the implementation
  - If serve is set to true, the skeleton will be generated

 Eg
 p({"class":"foam.nanos.boot.NSpec","name": "webAuth","lazy":true,"serve":true, "boxClass": "foam.nanos.auth.WebAuthServiceSkeleton", "serviceClass":"foam.nanos.auth.WebAuthServiceAdapter"})

//CLIENT SIDE
4. Create stub for Service on the client side
Eg https://github.com/foam-framework/foam2/blob/master/src/foam/nanos/auth/ClientAuthService.js

5. Add Service to foam.nano.client.Client.js
Eg
{
  name: 'webAuth',
  factory: function() {
    return this.ClientAuthService.create({
      delegate: this.HTTPBox.create({
        method: 'POST',
        url: 'http://localhost:8080/webAuth'
      })
    });
  }
}

6. In controller, import the service
Eg
imports: [
  'stack', 'userDAO', 'user', 'webAuth'
],

Now, you can call the service in the controller:
self.webAuth.login("marc4@marc.com", "marc123").then(function(response) {
  console.log(response);
}
