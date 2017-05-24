package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import javax.security.auth.login.LoginException;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import foam.dao.*;

/**
 * Created by marcroopchand on 2017-05-12.
 */
public class UserAndGroupAuthService extends ContextAwareSupport implements AuthService {
	protected MapDAO userDAO_;
	protected MapDAO groupDAO_;
	protected LinkedHashMap challengeMap;

	@Override
	public void start() {
		userDAO_ = (MapDAO) getX().get("userDAO");
		groupDAO_ = (MapDAO) getX().get("groupDAO");

		//TODO: Implement LRU map using LinkedHashMap
		//Set max size to 20000
		challengeMap = new LinkedHashMap<String, Challenge>();

		//Adding some test users
		for (int i = 0; i < 10; i++) {
			User user = new User();
			user.setId("" + i);
			user.setEmail("marc" + i + "@nanopay.net");
			user.setFirstName("Marc" + i);
			user.setLastName("R" + i);
			user.setPassword("marc" + i);
			userDAO_.put(user);
		}

		Group adminGroup = new Group();
		adminGroup.setId("1");


		//Login
//		try {
//			X test = login("0", "marc1");
//			User user = (User) test.get("user");
//			System.out.println(user.getEmail());
//		}
//		catch (LoginException e) {
//			e.printStackTrace();
//		}

		//Challenged Login
//		try {
//			String challenge = generateChallenge("0");
//
//			//Use the following line below to test the timeout of the challenge
//			//TimeUnit.SECONDS.sleep(6);
//
//			X test = challengedLogin("0", challenge);
//			User user = (User) test.get("user");
//			System.out.println(user.getEmail());
//		}
//		catch (LoginException e) {
//			e.printStackTrace();
////		} catch (InterruptedException e) {
////			e.printStackTrace();
//		}

		//Update Password
//		try {
//			X test = login("0", "marc0");
//
//			X newX = updatePassword(test, "marc0", "marc55");
//			User user = (User) newX.get("user");
//			System.out.println(user.getPassword());
//		}
//		catch (LoginException e) {
//			e.printStackTrace();
//		}

		//Logout
		try {
			X test = login("0", "marc0");

			X newX = updatePassword(test, "marc0", "marc55");
			User user = (User) newX.get("user");
			System.out.println(user.getPassword());
		}
		catch (LoginException e) {
			e.printStackTrace();
		}
	}

	/**
	 * A challenge is generated from the userID provided
	 * This is saved and has a time to live of 5 seconds
	 *
	 * Should this throw an exception?
	 * */
	public String generateChallenge(String userId) {
		if (userId == null || userId == "") {
			return null;
		}

		if (userDAO_.find(userId) == null) {
			return null;
		}

		String generatedChallenge = UUID.randomUUID() + userId;
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.SECOND, 5);

		challengeMap.put(userId, new Challenge(generatedChallenge, calendar.getTime()));

		return generatedChallenge;
	}

	/**
	 * Check LinkedHashMap to see if the the challenge supplied is correct
	 * and the TTL is still valid
	 * */
	public X challengedLogin(String userId, String challenge) throws LoginException {
		if (userId == null || challenge == null || userId == "" || challenge == "") {
			throw new LoginException("Invalid Parameters");
		}

		Challenge c = (Challenge) challengeMap.get(userId);
		if (c == null) {
			throw new LoginException("Invalid userId");
		}

		if (!c.getChallenge().equals(challenge)) {
			throw new LoginException("Invalid Challenge");
		}

		if (new Date().after(c.getTtl())) {
			challengeMap.remove(userId);
			throw new LoginException("Challenge expired");
		}

		User user = (User) userDAO_.find(userId);
		if (user == null) {
			throw new LoginException("User not found");
		}

		challengeMap.remove(userId);
		return this.getX().put("user", user);
	}

	/**
	 * Find user in the userDAO by id. If the user exist, validate password
	 * Set the user in the context and return context
	 * */
	public X login(String userId, String password) throws LoginException {
		if (userId == null || password == null || userId == "" || password == "") {
			throw new LoginException("Invalid Parameters");
		}

		User user = (User) userDAO_.find(userId);

		if (user == null) {
			throw new LoginException("User not found.");
		}

		if (!user.getPassword().equals(password)) {
			throw new LoginException("Invalid Password");
		}

		return this.getX().put("user", user);
	}

	/**
	 * Check if the user in the context supplied has the right permission
	 * Return Boolean for this
	 * */
	public Boolean check(foam.core.X x, java.security.Permission permission) {
		if (x == null || permission == null) {
			return false;
		}

		User user = (User) x.get("user");
		if (user == null) {
			return false;
		}

		if (userDAO_.find(user.getId()) == null) {
			return false;
		}

		//TODO: Figure out how permissions work
		return true;
	}

	/**
	 * Given a context with a user, validate the password to be updated
	 * and return a context with the updated user information
	 * */
	public X updatePassword(foam.core.X x, String oldPassword, String newPassword) throws IllegalStateException {
		if (x == null || oldPassword == null || newPassword == null || oldPassword == ""
				|| newPassword == "" || (oldPassword == newPassword)) {
			throw new IllegalStateException("Invalid Parameters");
		}

		User user = (User) userDAO_.find(((User) x.get("user")).getId());
		if (user == null) {
			throw new IllegalStateException("User not found");
		}

		if (!oldPassword.equals(user.getPassword())) {
			throw new IllegalStateException("Invalid Password");
		}

		userDAO_.put(user.setPassword(newPassword));

		return this.getX().put("user", user);
	}

	/**
	 * Used to validate properties of a user. This will be called on registration of users
	 * Will mainly be used as a veto method.
	 * Users should have id, email, first name, last name, password for registration
	 * */
	public Boolean validateUser(User user) throws IllegalStateException {
		if (user == null) {
			throw new IllegalStateException("Invalid User");
		}

		if (user.getId() == "") {
			throw new IllegalStateException("ID is required for creating a user");
		}

		if (user.getEmail() == "") {
			throw new IllegalStateException("Email is required for creating a user");
		}

		if (user.getFirstName() == "") {
			throw new IllegalStateException("First Name is required for creating a user");
		}

		if (user.getLastName() == "") {
			throw new IllegalStateException("Last Name is required for creating a user");
		}

		if (user.getPassword() == "") {
			throw new IllegalStateException("Password is required for creating a user");
		}

		return true;
	}

	/**
	 * Just return a null user for now. Not sure how to handle the cleanup
	 * of the current context
	 * */
	public X logout(X x) {
		return this.getX().put("user", null);
	}
}