Interface =
{

	startup: function()
	{
		if (! checkBrowser())
			Interface.alert('error', 'Sorry, Tweebox requires either a Gecko-based ' +
			'Web browser (such as Mozilla Firefox) or Internet Explorer version 6 ' +
			'or later.', { buttons: 2, button1: 'Get Firefox', onButton1: function() { window.location = 'http://www.mozilla.com/firefox/' }, button2: 'Try Anyway' } );

		Interface.updateProjects();
		Interface.fxNotify = new fx.Style($('notify'), 'opacity').set(0);
		$('notify').style.display = 'block';
		new File.chooser('chooser', Interface.addSource);
		Interface.loadTarget();
			
		function checkBrowser()
		{
			// IE 6+ or Gecko
			// Safari likes to pretend it's more compatible than it really is
			
			Interface.isGecko = ((navigator.userAgent.indexOf('Firefox') != -1) ||
										 (navigator.userAgent.indexOf('Netscape') != -1) ||
										 (navigator.userAgent.indexOf('Gecko') != -1))
			
			Interface.isIE = (navigator.userAgent.indexOf('MSIE') != -1);
			
			Interface.isSafari = ((navigator.vendor) && (navigator.vendor.indexOf('Apple') != -1));
			
			Interface.browserVersion = parseFloat(navigator.appVersion.substring(
																	navigator.appVersion.indexOf('MSIE') + 4));
				
			return (! Interface.isSafari && (Interface.isGecko || (Interface.isIE && Interface.browserVersion >= 6)));
		};
	},


	setStatus: function (text)
	{
		window.status = text;
	},
	
	
	setWindowTitle: function (text)
	{
		document.title = Interface.DEFAULT_TITLE + ' (' + text + ')';
	},
	
	
	showDialog: function (name, options)
	{
		var content = $(name).clone();
		options = options || { button1: 'OK' };
	
		new MooPrompt('', content, options);
	},
	
	
	updateProjects: function()
	{
		Interface.projects.renderProjectList('projects');
		Interface.projects.getCurrent().renderSourceList('files');
		Interface.projects.getCurrent().renderDestinationList('destinations');	
		Interface.projects.getCurrent().updateSettings();
		Interface.checkBuild();
	},


	checkFilename: function()
	{
		var field = $('destName');
		var name = field.value;
		
		if ((name.substr(name.length - 4).toLowerCase() != '.htm') &&
				(name.substr(name.length - 5).toLowerCase() != '.html'))
		{
			Interface.alert('note', 'Your story\'s filename must end in either ' +
											'.htm or .html. This has been fixed for you.');
			field.value = name + '.htm';
		}
	},


	checkBuild: function()
	{	
		Interface.projects.getCurrent().saveSettings();
		$('buildButton').disabled = ! Interface.projects.getCurrent().readyToCompile();
	},


	newProject: function()
	{
		var prompt = new Element('div');
		prompt.innerHTML = 'Enter a name for your new project:<br /><br />' +
								 			 '<input type="text" id="newProjectName" />';
		var options = {buttons: 2, button1: 'Add', button2: 'Cancel',
									 onButton1: function()
									 {
									 	
										Interface.projects.addProject(new Project($('newProjectName').value));
										Interface.projects.renderProjectList('projects');
										Interface.updateProjects();
										Interface.projects.save();
									 }
									};
	
		Interface.alert('note', prompt, options);
		
		window.setTimeout("$('newProjectName').focus()", 1000); // this is a bit hacky
	},


	removeProject: function()
	{
		var buttons = {buttons: 2, button1: 'Remove', button2: 'Cancel',
									 onButton1: function()
									 {
									Interface.projects.removeProject($('projectMenu').selectedIndex);
									Interface.updateProjects();
									Interface.projects.save();
									 }
									};
	
		Interface.alert('caution', 'Are you sure you want to remove this project? ' +
								'Your source files will not be deleted.', buttons);
	},


	addSource: function (name)
	{
		Interface.projects.getCurrent().addSource(name, 'files');
		Interface.projects.getCurrent().renderDestinationList('destinations');
		Interface.projects.save();
		Interface.checkBuild();
	},


	removeSource: function (name)
	{
		Interface.projects.getCurrent().removeSource(name, 'files');
		Interface.projects.getCurrent().renderDestinationList('destinations');
		Interface.projects.save();
		Interface.checkBuild();
	},


	loadTarget: function()
	{
		var t = $('target');
	
		Targets.load($('target').options[t.selectedIndex].value);	
	},

	compile: function()
	{
		var compileStart = new Date().getTime();
	
		Interface.setStatus('Building project...');
		Interface.setWindowTitle('working');
		Interface.projects.save();
		
		Interface.projects.getCurrent().compile(compileComplete);
	
		function compileComplete (output)
		{
			var dirs = $('destDirs');
			
			if (dirs.options)
				var path = dirs.options[dirs.selectedIndex].value;
			else
				var path = dirs.value;
					
			var filename = path + $('destName').value;
		
			File.write(filename, output);
			
			var time = Math.round((new Date().getTime() - compileStart) / 100) / 10;	
			Interface.setStatus('Build complete (' + time + 's)');
			Interface.setWindowTitle('done');
			
			// open the written file and fade in the notifier
					
			window.open(filename.toLocalUrl());
			
			$('viewComplete').onclick = function()
			{
				window.open(filename.toLocalUrl())
			};
			
			Interface.fxNotify.custom(0, 1);
			window.setTimeout(function() { Interface.fxNotify.custom(1, 0) }, 3000);
		};
	},
	
	
	alert: function (type, text, buttons)
	{
		var content = new Element('div');
		buttons = buttons || {buttons: 1, button1: 'OK'};
		
		content.className = 'alert' + type;
		
		if (typeof text == 'string')
			content.innerHTML = text;
		else
			content.adopt(text);

		new MooPrompt('', content, buttons);		
	},
	
	DEFAULT_TITLE: document.title,
	projects: ProjectList.restore(),
	fxNotify: null,
	isGecko: false,
	isIE: false,
	isSafari: false,
	isOpera: false,
	browserVersion: 0	
};

Window.onDomReady(Interface.startup);
