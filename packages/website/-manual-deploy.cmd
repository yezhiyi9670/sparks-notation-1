@echo off
rclone sync --progress --exclude=.user.ini --exclude=.download-bin/ %~dp0/build SparksLabDeploy:/www/wwwroot/notation.sparkslab.art
