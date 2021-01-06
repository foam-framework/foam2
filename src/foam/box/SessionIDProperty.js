/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.box',
  name: 'SessionIDProperty',
  extends: 'foam.core.String',

  documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    {
      name: 'getter',
      value: function() {
        // Look in context
        if ( this.__context__ && this.__context__.sessionID )
          return this.__context__.sessionID;
        // Or check URL
        var urlSession = '';
        try {
          urlSession = window.location.search.substring(1).split('&')
           .find(element => element.startsWith("sessionId")).split('=')[1];
           if ( urlSession ) return urlSession;
        } catch { };

        // Or localStorage, else generate a random id
        return localStorage[this.sessionName] ||
            ( localStorage[this.sessionName] = foam.uuid.randomGUID() );
       }
    },
    {
      name: 'swiftExpressionArgs',
      value: [ 'sessionName' ]
    },
    {
      name: 'swiftExpression',
      value: `
       let defaults = UserDefaults.standard // TODO allow us to configure?
       if let id = defaults.string(forKey: sessionName) {
         return id
       }
       let id = UUID().uuidString
       defaults.set(id, forKey: sessionName)
       return id
             `
    },
    {
      name: 'javaFactory',
      value: `String uuid = (String) getX().get(getSessionName());
       if ( "".equals(uuid) ) {
         uuid = java.util.UUID.randomUUID().toString();
         getX().put(getSessionName(), uuid);
       }
       return uuid;`
    }
  ]
});
