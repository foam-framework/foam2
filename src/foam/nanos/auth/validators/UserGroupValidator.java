package foam.nanos.auth.validators;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

public class UserGroupValidator implements Validator
{

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    User user = (User) obj;
    if ( ! SafetyUtil.isEmpty(user.getGroup()) ) {

      // using x here instead of getX() to filter the search to the groups that
      // can only be seen (permission to see) by the creating/updating user.
      DAO dao = (DAO) x.get("groupDAO");
      Group group = (Group) dao.find(user.getGroup());
      if ( group == null ) {
        throw new IllegalArgumentException("User needs to be assigned to a valid group");
      }
    } else {
      throw new IllegalArgumentException("User needs to be assigned to a group");
    }
  }
}
