package foam.nanos.auth.validators;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.ServiceProvider;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

public class UserGroupAndSpidValidator implements Validator
{

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    if (obj == null) {
      throw new IllegalStateException("User can't be null");
    }

    User user = (User) obj;

    this.validateSpid(x, user);
    this.validateGroup(x, user);
  }

  private void validateSpid(X x, User user) {
    // If the SPID is not assigned, it is set to the creating user's
    // spid.
    // Not doing the assignment here cause this is just a validator.
    // see ServiceProviderAwareDAO
    if ( ! SafetyUtil.isEmpty(user.getSpid()) ) {
      DAO serviceProviderDAO = (DAO) x.get("serviceProviderDAO");
      ServiceProvider serviceProvider = (ServiceProvider) serviceProviderDAO.find(user.getSpid());
      if ( serviceProvider == null ) {
        throw new IllegalArgumentException("User needs to be assigned to a valid service provider");
      }
    }
  }

  private void validateGroup(X x, User user) {
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
