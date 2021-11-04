foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogFields',
  javaExtends: 'java.util.HashMap<String,String>',
  documentation: `
    Wraps a Map<String,String> to indicate that the logger should treat these
    values as log fields. Multiple arguments of type LogFields will be combined
    into a single map that is displayed at the end of the log message, and also
    saved onto the LogMessage object.
  `
});