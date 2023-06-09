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

2. Create following colletions in your MongoDB database:
- accounts
- connections
- snaps

Note: See models folder for the collection structure.


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

To see a demo or how this works, you can check my blog post tutorial here: [How to Use: snapfu](https://thisdevblogs.wordpress.com/2023/04/18/snapfu-a-mirth-connect-autobackup-system/)
If you like this or want to support my side projects, like this one, you can:

<a href="https://www.buymeacoffee.com/heymikko" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important"></a>
