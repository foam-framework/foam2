foam.CLASS({
  package: 'foam.dao.journal',
  name: 'UserCommentJournalEntryDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.journal.CommentJournalEntry',
  ],
  javaImports: [
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
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
          };

          protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
            @Override
            protected SimpleDateFormat initialValue() {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              return sdf;
            }
          };
        `);
      }
    }
  ],
  methods: [
    {
      name: 'addComment',
      args: [{ name: 'x', javaType: 'foam.core.X' }],
      javaReturns: 'foam.core.X',
      javaCode: `
foam.nanos.auth.User u = (foam.nanos.auth.User) x.get("user");
String comment = new StringBuilder()
  .append("Modified by ")
  .append(u.label())
  .append(" (")
  .append(u.getId())
  .append(") at ")
  .append(sdf.get().format(Calendar.getInstance().getTime()))
  .toString();
foam.dao.journal.JournalEntry j = (foam.dao.journal.JournalEntry) x.get("journalEntry");
j = new foam.dao.journal.CommentJournalEntry.Builder(x)
  .setDelegate(j)
  .setComment(comment)
  .build();
return x.put("journalEntry", j);
      `,
    },
    {
      name: 'put_',
      javaCode: `
return getDelegate().put_(addComment(x), obj);
      `,
    },
    {
      name: 'remove_',
      javaCode: `
return getDelegate().remove_(addComment(x), obj);
      `,
    },
  ],
});
