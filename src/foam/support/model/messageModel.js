foam.CLASS({
    package: 'foam.support.model',
    name: 'MessageModel',
    extends: 'foam.u2.Controller',

    documentation: 'Message Model Class and Properties',

    

properties: [
    {
        class: 'Long',
        name: 'senderId'
    },
    {
        class: 'Long',
        name: 'receiverId'
    },
    {
        class: 'Date',
        name: 'dateCreated'
    },
    {
        class: 'Long',
        name: 'messageId'
    }
]

});