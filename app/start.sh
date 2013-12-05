#!/bin/sh

if [ $(ps aux | grep $USER | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
        export PATH=/usr/local/bin:$PATH
        forever start --sourceDir /home/quinn/apps/mobi/app/app.js >> /home/quinn/apps/mobi/app/log.txt 2>&1
fi