#!/bin/sh
mkdir /usr/share/nginx/html/web
cp $CONFIG_PATH /usr/share/nginx/html/web/config.properties

exec nginx -g 'daemon off;'


