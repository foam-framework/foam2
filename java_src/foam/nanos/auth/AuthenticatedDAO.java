package foam.nanos.auth;



public class AuthenticatedDAO 
extends FilteredDAO {

  class AuthenticatedDAO (String rootPermission, DAO delegate)
  {
    super(delegate);
    this.predicate_ = new AuthenticatedPredicate(rootPermission);
  } 

}