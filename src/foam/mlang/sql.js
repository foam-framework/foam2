/**
   toSQL operations for mlang predicates
*/

foam.CLASS({
    package: 'foam.dao',
    name: 'SQLException',
    extends: 'foam.core.Exception'
});

foam.CLASS({
    package: 'foam.mlang.predicate',
    name: 'SQLSupport',

    methods: [
        {
            name: 'values',
            code: function() {
                return {
                    v1: this.arg1.toSQL && this.arg1.toSQL(this.arg2) || this.arg1.toString(),
                    v2: this.arg2 && ( this.arg2.toSQL && this.arg2.toSQL(this.arg1) || this.arg2.toString() ) || null
                };
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.Constant',
    methods: [
        {
            name: 'toSQL',
            code: function() {
                //if (this.value === null || this.value === undefined) {
                //    return 'IS NULL';
                //}
                if (isNaN(this.value)) {
                    var v = this.value.toString().toLowerCase();
                    if (v === 'true' || v === 'yes') {
                        return 1;
                    }
                    if (v === 'false' || v === 'no') {
                        return 0;
                    }
                    return this.value.toString();
                }
                if (this.value === true) {
                    return 1;
                }
                if (this.value === false) {
                    return 0;
                }
                return this.value;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.True',
    methods: [
        {
            name: 'toSQL',
            code: function() {
                return '( 1 = 1 )';
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.False',
    methods: [
        {
            name: 'toSQL',
            code: function() {
                return '( 1 <> 1 )';
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Unary',
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                var v1 = this.arg1.toSQL ? v1 = this.arg1.toSQL() :
                    this.arg1.toString ? this.arg1.toString() :
                    this.arg1;
                if (v1 === undefined || v1 === null) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg1 is '+v1});
                }
                return v1;
            }
        },
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Binary',
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                var v1 = this.arg1.toSQL ? v1 = this.arg1.toSQL() :
                    this.arg1.toString ? this.arg1.toString() :
                    this.arg1;
                if (v1 === undefined || v1 === null) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg1 is '+v1});
                }
            }
        },
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Has',
    implements: ['foam.mlang.predicate.SQLSupport'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                return this.values().v1 + ' IS NOT NULL';
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Not',
    methods: [
        {
            name: 'toSQL',
            code: function() {
                return 'NOT ('+ this.arg1.toSQL()+')';
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Eq',
    implements: ['foam.mlang.predicate.SQLSupport'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                if (values.v2 === null) {
                    return values.v1 + ' IS NULL';
                }
                return values.v1 + " = " + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Neq',
    implements: ['foam.mlang.predicate.SQLSupport'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                if (values.v2 === null) {
                    return values.v1 + ' IS NOT NULL';
                }
                return values.v1 + " <> " + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Gt',
    implements: ['foam.mlang.predicate.SQLSupport'],
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                // var v1 = this.arg1.toSQL ? this.arg1.toSQL() : this.arg1.toString();
                // var v2 = this.arg2.toSQL ? this.arg2.toSQL(this.arg1) : this.arg2.toString();
                // if (v2 === null ) {
                //     throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+v2});
                // }
                var values = this.values();
                if (values.v2 === null ) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+values.v2});
                }
                return values.v1 + ' > ' + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Gte',
    implements: ['foam.mlang.predicate.SQLSupport'],
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                if (values.v2 === null ) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+values.v2});
                }
                return values.v1 + ' >= ' + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Lt',
    implements: ['foam.mlang.predicate.SQLSupport'],
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                if (values.v2 === null ) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+values.v2});
                }
                return values.v1 + ' < ' + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Lte',
    implements: ['foam.mlang.predicate.SQLSupport'],
    requires: ['foam.dao.SQLException'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                if (values.v2 === null ) {
                    throw this.SQLException.create({message: this.cls_.name+'.arg2 is '+values.v2});
                }
                return values.v1 + ' <= ' + values.v2;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.And',
    methods: [
        {
            // AND has a higher precedence than OR so doesn't need paranthesis
            name: 'toSQL',
            code: function() {
                var s = '';
                for ( var i = 0 ; i < this.args.length ; i++ ) {
                    var a = this.args[i];
                    s += a.toSQL();
                    if ( i < this.args.length - 1 )
                        s += ' AND ';
                }
                return s;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.Or',
    methods: [
        {
            // AND has a higher precedence than OR so doesn't need paranthesis
            name: 'toSQL',
            code: function() {
                var s = ' ( ';
                for ( var i = 0 ; i < this.args.length ; i++ ) {
                    var a = this.args[i];
                    s += a.toSQL();
                    if ( i < this.args.length - 1 )
                        s += ' OR ';
                }
                s += ' ) ';
                return s;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.mlang.predicate.In',
    implements: ['foam.mlang.predicate.SQLSupport'],
    methods: [
        {
            name: 'toSQL',
            code: function() {
                this.SUPER();
                var values = this.values();
                var s = values.v1;
                s += ' IN ( \'';
                if ( Array.isArray(this.arg2) ) {
                    s += this.arg2.join('\', \'');
                } else {
                    s += values.v2;
                }
                s += '\')';
                return s;
            }
        }
    ]
});

foam.CLASS({
    refines: 'foam.core.Date',
    methods: [
        {
            name: 'toSQL',
            code: function() {
                var v1 = this.value || 0;
                return new Date(v1).toISOString();
            }
        }
    ]
});
