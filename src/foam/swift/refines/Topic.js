/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.Topic',
  flags: ['swift'],
  methods: [
    function writeToSwiftClass(cls, superAxiom, parentCls) {
      if (! foam.swift.SwiftClass.isInstance(cls) ) return;
      cls.fields.push(foam.swift.Field.create({
        visibility: 'public',
        lazy: true,
        type: 'BasicTopic',
        name: this.name,
        initializer: this.swiftInitializer(),
      }));
    },
  ],
  templates: [
    {
      name: 'swiftInitializer',
      template: function() {/*
let topic = BasicTopic()

var topicMap: [String:Topic] = [:]
<% this.topics.forEach(function(t) { %>
do {
  let t = BasicTopic()
  t.parent_ = topic
  t.name_ = "<%=t.name%>"
  topicMap["<%=t.name%>"] = t
}
<% }) %>

topic.name_ = "<%=this.name%>"
topic.parent_ = self
topic.map_ = topicMap

return topic
      */},
    },
  ],
});
