foam.CLASS({
    name: 'CompoundException',
    package: 'foam.core',
    javaExtends: 'RuntimeException',
    javaImports: [
        'java.util.ArrayList;'
    ],

    properties:  [
        {
            class: 'Object',
            name: 'exceptions',
            javaType: 'ArrayList',
            javaFactory: 'return new ArrayList<RuntimeException>();'
        },
        {
            class: 'Object',
            name: 'sb',
            javaType: 'ThreadLocal',
            javaFactory: `return new ThreadLocal<StringBuilder>() {
                @Override
                protected StringBuilder initialValue() {
                    return new StringBuilder();
                }
            
                @Override
                public StringBuilder get() {
                    StringBuilder b = super.get();
                    b.setLength(0);
                    return b;
                }
            };`
        }
    ],

    methods:  [
        {
            name: 'add',
            args: [{ name: 't', javaType: 'Throwable' }],
            javaCode: 'exceptions_.add(t);'
        },
        {
            name: 'maybeThrow',
            javaCode: 'if ( exceptions_.size() != 0 ) throw this;'
        },
        {
            name: 'getMessage',
            type: 'String',
            javaType: `
            var str = sb_.get();
            var size = exceptions_.size();
        
            for ( int i = 0; i < size; i++ ) {
              Throwable t = (Throwable) exceptions_.get(i);
              var counter = i + 1;
        
              str.append('[').append(counter).append('/').append(size).append("] ")
                .append(t);
              while ( t.getCause() != null ) {
                t = t.getCause();
                str.append(", Cause: ").append(t);
              }
              if ( counter < size ) str.append(';');
            }
            return str.toString();`
        }
    ]

})