To set up credentials required for Google Sheets Export or Import follow through steps below:
1. Go to "back-office -> Admin -> Google Api Credentials"
2. Create GoogleApiCredentials
3. Download json file with credentials:
    - for localhost credentials from https://console.developers.google.com/apis/credentials/oauthclient/115894150815-mlvta60lqk0v61522lt4v40dmgeie0cs.apps.googleusercontent.com?project=enhanced-kit-270019
    - for other environments:
      3.1 Open https://console.developers.google.com/projectselector2/apis/dashboard?supportedpurview=project
      3.2 Click to open corresponding project
      3.3 On left-side menu press the "Credentials" menu item
      3.4 Double click on OAuth 2.0 Client IDs credentials available
      3.5 Use "DOWNLOAD JSON" button to download json
4. Copy-paste data from json to the credentials record that you're creating
5. Use your-domain as an ID
6. Save credentials


Note if you cannot access this links please post request on slack to add your email to this project.

To add users to project:
1. Open navigation menu (top left corner hamburger button)
2. Go to "IAM & Admin -> IAM"
3. Press "Add" button
