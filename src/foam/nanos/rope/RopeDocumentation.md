This file contains the complete description of the function and design of the ROPE authentication engine.

At an abstract level, ROPE utilizes the built in FOAM relationship framework to allow the user of the FOAM framework to perform authentication checks based on previously declared relationships and the level of authorization they are configured to be granted.

The ROPE authentication system can be utilized by the user of the framework by appending a ROPEAuthorizer decorator to any DAO object that requires authorization. This decorator follows the standard FOAM Authorizer interface and performs authentication checks dynamically as the dao is used using the ROPE relationship search algorithm under the hood.

Permissions based on relationships can be configured by the user by creating a ROPE objects from the ROPE.js model and setting the properties accordingly and afterwards appending the object to the application's ropeDAO which will be utilized by the ROPE algorithm to perform authentication checks. Given a missing ROPE, the algorithm trivially assumes that all permissions are not granted on that object.

