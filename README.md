# Wickr IO Example App
An easy to get started Wickr IO API Example integration template

## Description:
Shows the basic code needed to get started writing a Wickr IO API integration
* Note: This is a good template to edit and create a custom integration for Wickr

## Configuration:
Wickr IO integrations are configured by running the configure.sh file,
to add any additional tokens you want to prompt for do so by adding them to the array in line 63 in configure.js

Required tokens:
- DATABASE_ENCRYPTION_KEY - Choose a 16-character(minimum) string key to derive the crypto key from in order to encrypt and decrypt the user database of this bot. This must be specified, there is no default. NOTE: be careful not to change if reconfiguring the bot or else the user database won't be accessible.
