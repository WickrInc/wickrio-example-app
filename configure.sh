#!/bin/sh

#
# If the input argument exists then check if it is a file
# if so it should contain a list of key=value entries.
#
if [ -n "$1" ]; then
  if [ -f "$1" ]; then
    . "$1"
  fi
fi

if [ -f "/usr/local/nvm/nvm.sh" ]; then
  . /usr/local/nvm/nvm.sh
  # nvm use 18
fi

node configure.js $CLIENT_NAME
