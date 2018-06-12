foam.CLASS({
  refines: 'foam.dao.DAOProperty',

  properties: [
    ['javaInfoType', 'foam.core.AbstractDAOPropertyPropertyInfo']
  ],
  
  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);
      var compare = info.getMethod('compare');
      compare.body = 'return 0;';
      return info;
    }
  ]
})