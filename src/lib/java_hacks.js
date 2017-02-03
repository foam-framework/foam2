foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [
    ['javaType', 'int'],
    ['javaInfoType', 'foam.core.AbstractIntPropertyInfo'],
    ['javaJSONParser', 'foam.lib.json.IntParser'],
    {
        name: 'toJSON',
        value: function toJSON(value) {
                return value ? 1 : 0;
        }
    },
    {
        name: 'fromJSON',
        value: function fromJSON(value) {
            return value && (value == '1' || value == 'true') || false;
        }
    }
  ],
  /*methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
        var m = info.getMethod('cast');
        m.body = 'return ( o instanceof Long ) ?'
            + '((Long)o).intValue() :'
            + '( o instanceof Integer ) ?'
            + '((Integer)o).intValue() :'
            + '((Boolean.parseBoolean(o.toString())) ? 1 : 0);';
      return info;
    }
  ]*/
});
