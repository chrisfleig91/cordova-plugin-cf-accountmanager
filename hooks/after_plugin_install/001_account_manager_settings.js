#!/usr/bin/env node
'use strict';

var fs = require('fs');

module.exports = function(context) {
	var cordova_util = context.requireCordovaModule('cordova-lib/src/cordova/util'),
	ConfigParser = context.requireCordovaModule('cordova-lib').configparser,
	projectRoot = cordova_util.isCordova(),
	xml = cordova_util.projectConfig(projectRoot),
	cfg = new ConfigParser(xml),
	label = cfg.getPreference('AccountManagerLabel'),
	iconUrl = cfg.getPreference('AccountManagerIconUrl'),
	accountType = cfg.getPreference('AccountManagerType');

	var configFile = fs.readFileSync('config.xml', 'utf-8');
	var preferenceTags = '</platform>\r\n<preference name="AccountManagerLabel" value="NexusAccountType" />\r\n<preference name="AccountManagerIconUrl" value="platforms\\android\\res\\drawable\\acm_icon.png" />\r\n<preference name="AccountManagerType" value="NexusAccountType" />'
	configFile.replace('</platform>', preferenceTags);
	fs.writeFileSync('config.xml', configFile);

	var authenticatorFile = fs.readFileSync('platforms/android/res/xml/authenticator.xml','utf8');
	authenticatorFile = authenticatorFile.replace(/android:icon="[ \S]*"/i, 'android:icon="@drawable/acm_icon"');
	authenticatorFile = authenticatorFile.replace(/android:smallIcon="[ \S]*"/i, 'android:smallIcon="@drawable/acm_icon"');
	authenticatorFile = authenticatorFile.replace(/android:accountType="[ \S]*"/i, 'android:accountType="'+accountType+'"');
	fs.writeFileSync('platforms/android/res/xml/authenticator.xml', authenticatorFile);

	var RegexAuthLabelEmpty = RegExp('<string name="authLabel" />', 'gmi')
	var RegexAuthLabelExists = RegExp(`<string name="authLabel">${label}</string>`, 'gmi')

	var stringFile = fs.readFileSync('platforms/android/res/values/strings.xml','utf8');
	if(RegexAuthLabelEmpty.test(stringFile)) {
		stringFile = stringFile.replace('<string name="authLabel" />', '<string name="authLabel">'+label+'</string>');
	}
	else if (RegexAuthLabelExists.test(stringFile)) {
		stringFile = stringFile;
	}
	else {
		stringFile = stringFile.replace('</resources>', '<string name="authLabel">'+label+'</string></resources>');
	}
	
	fs.writeFileSync('platforms/android/res/values/strings.xml', stringFile);
};
