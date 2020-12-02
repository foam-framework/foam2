for local Google Sheets Api test:
1. go to https://console.developers.google.com -> nanopay.net -> Google Sheets Export Test (https://console.developers.google.com/apis/dashboard?project=enhanced-kit-270019&folder=&supportedpurview=project)
2. go to credentials tab on your left ( https://console.developers.google.com/apis/credentials?folder=&project=enhanced-kit-270019&supportedpurview=project ) 
3. in OAuth 2.0 Client IDs table select Web client 1 ( https://console.developers.google.com/apis/credentials/oauthclient/115894150815-mlvta60lqk0v61522lt4v40dmgeie0cs.apps.googleusercontent.com?folder=&project=enhanced-kit-270019&supportedpurview=project )
4. press "Download JSON" button to download app credentials, which will aprear at the top after navigation bar
5. go to http://localhost:8080 -> Admin -> Google Api Credentials
6. create new credential
7. as an id enter url of an app you'll use to export from: either http://localhost:8080 or http://ablii:8080 ( add two records if you need both )
8. copy-paste data from json to corresponding fields
9. make sure you are using your nanopay email and please follow up with google account authentication process
10. make sure you are not using VPN

*if you cannot access credentials post request to add you to the Google Sheets project on dev-chanel

**you can skip to step 3 and use the link. step 1-3 is mentioned just in case change of url 