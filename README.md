# snapfu web api

The backend service partnered with [snapfu web portal](https://github.com/litemikx/snapfu-web-portal).

## Requirements
- NPM ^9.5.0
- NodeJS version ^18.15.0
- MongoDB version ^5

## Database Schema
- database name: snapfu (can be change)
- collections:
    - accounts
    - connections
    - snaps

## Installation
Application uses Gmail API to send the verification email for singup process, you can authorize or link your Google account by:

1. In your terminal:
```
git clone https://github.com/litemikx/snapfu-web-api.git

cd snapfu-api

npm install
```

2. You'll need to link your Web app to your Gmail account for the app to start sending emails using the API. You can learn more about it here: https://developers.google.com/gmail/api/quickstart/js. On your Google Cloud Platform > API & Services > Credentials, you can get your client_secret JSON here. 

3. Create a file named client_secret.json, paste the content from step 2, put the file under the auth/mail folder, could be a different directory if you want. 

4. Rename .env.template to .env file and update values.

## Linking your Google Account 
### The app's signup process sends an email for the user to verify, this uses the GMAIL API.

1. In your terminal: 
```
node auth/mail/get_urls
```
2. You'll get the authorization link. Open the link on a browser, a consent window will show up and link to your Google account. Get the "code" in the URL. Best to run the [snapfu-web-portal](https://github.com/litemikx/snapfu-web-portal). 

3. In your .env file, put the code there:
```
REACT_APP_AUTH_CODE=YOUR_CODE_HERE
```
4. Once you start the server, it will create a file named gmail-credentials.json

## Usage

Run in the terminal:
```
npm start
```

If you like this or want to support my side projects, like this one, you can:

<a href="https://www.buymeacoffee.com/heymikko" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important"></a>
