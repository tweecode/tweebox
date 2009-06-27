//
// Project class
//
// A project stores a set of source files and settings. You may
// either invoke the constructor with a name, in which case it
// creates a new project by that name, or with an object, in
// which it treats it as data restored from JSON.
//
// Useful methods:
//
// serialize()
// Returns an object with all data needed to recreate this project
// from JSON. (This step is necessary because JSON can't store other
// functions.)
//
// getName()
// Returns this project's name.
//
// addSource (file name, id)
// Adds a source file to the project. Expects a filesystem name, not a URL.
// The second parameter is the id of the file list in the interface.
//
// removeSource (file name)
// Removes a source file from the project.
//
// setAuthor (name)
// Sets the project's author.
//
// setTarget (name)
// Sets the story type to compile to.
//
// readyToCompile()
// Returns whether the project is ready to compile -- e.g.
// it has at least one source file, and an author.
//
// compile()
// Compiles the project. Returns HTML ready to be saved.
//
// saveSettings()
// Looks at the interface and updates the project's settings based
// on what the user has input.
//
// updateSettings()
// Updates the interface with this project's settings.
//
// renderSourceList (id)
// Renders the list of source files into the HTML element passed.
//
// renderDestinationList (id)
// Renders the menu of possible destinations into the HTML element passed. 
//

function Project (data)
{
	// constructor
	
	var self = this;
	var name, author, target, sources, destName, destDir;
	var output = '';
	var compilingSource = 0;
	var sourceText = '';
			
	if (typeof data == 'string')
	{
		// we're setting up a new project
		
		name = data;
		author = 'Tweebox';
		target = 'jonah';
		sources = new Array();
		destName = '';
		destDir = '';
	}
	else
	{
		// we're reconstructing from previously serialized data
		
		name = data.name;
		author = data.author;
		target = data.target;
		sources = data.sources;
		destName = data.destName;
		destDir = data.destDir;
	};
	
	// public functions
	
	this.getName = getName;
	this.addSource = addSource;
	this.removeSource = removeSource;
	this.setAuthor = setAuthor;
	this.setTarget = setTarget;
	
	this.readyToCompile = readyToCompile;
	this.renderSourceList = renderSourceList;
	this.renderDestinationList = renderDestinationList;
	this.saveSettings = saveSettings;
	this.updateSettings = updateSettings;
	this.compile = compile;
	
	this.serialize = serialize;
	
	// implementation


	function getName()
	{
		return name;
	};
	

	function addSource (filename, id)
	{
		// add to the data structure
			
		var extension = filename.slice(filename.lastIndexOf('.'));
		
		if (! ((extension == '.txt') || (extension == '.tw')))
			if (! confirm("This file doesn't look like a Twee source file. Add it anyway?"))
				return;
				
		sources.push(filename.toLocalUrl());
		
		// if this is our first source file,
		// trash the 'no files' message
		
		if (sources.length == 1)
			while ($(id).firstChild)
				$(id).removeChild($(id).firstChild);
		
		// add an interface element and fade it in
		
		var el = renderSourceItem(filename);
		var fader = new fx.Style(el, 'opacity');
		fader.hide();
		$(id).adopt(el);
		fader.custom(0, 1);
	};
	
	
	function removeSource (filename, id)
	{
		// remove it from the data structure
	
		for (var i = 0; i < sources.length; i++)
			if (sources[i] == filename)
				sources.splice(i, 1);
		
		// if we have no sources left, render a message

		if (sources.length > 1)
		{
			// fade out the matching interface element
		
			new fx.Style(filename, 'opacity',
									 { onComplete: function()
										 {
												$(filename).remove();
										 }
									 }).custom(1, 0);
		}
		else
			$(id).innerHTML = '<p><i>This project has no source files.</i></p>';
	};

	
	function setAuthor (newAuthor)
	{
		author = newAuthor;
	};

	
	function setTarget (newTarget)
	{
		target = newTarget;
	};

	
	function readyToCompile()
	{
		// must have at least one source file
		// must have a destination filename entered
		// must have an author name
		
		if (sources.length == 0)
			return false;
			
		if (destName == '')
			return false;
			
		if (author == '')
			return false;
			
		return true;
	};

	
	function renderSourceList (id)
	{	
		// empty any existing content
			
		while ($(id).firstChild)
			$(id).removeChild($(id).firstChild);

		// add content
		
		if (sources.length == 0)
			$(id).innerHTML = '<p><i>This project has no source files.</i></p>';
		else
			sources.each( function (i)
			{
				$(id).adopt(renderSourceItem(i));
			});	
	};

	
	function renderDestinationList (id)
	{
		var output = '';
		var directories = new Array();
		
		if (sources.length == 0)
			output = "<i>Once source files have been added to this project, " +
							 "you may choose a destination.</i>";
		else
		{
			var directories = new Array();
			var alreadyShown = new Object();
			
			for (var i = 0; i < sources.length; i++)
			{
				var directory = sources[i].directory().toFilename();
				
				if (! alreadyShown[directory])
				{
					directories.push(directory);
					alreadyShown[directory] = true;
				}
			}
		
			if (directories.length == 1)
			{
				output = '<input type="hidden" name="destDirs" id="destDirs" value="' +
								 directories[0];
				output += '" />' + directories[0];				
			}
			else
			{			
				output = '<select id="destDirs">';
				
				for (var i = 0; i < directories.length; i++)
				{					
					output += '<option';
					
					if (directories[i] == destDir)
						output += ' selected="yes"';
					
					output += ' value="' + directories[i] + '">' + 
										directories[i] + '</option>';
				};
				
				output += '</select> ';
			};	
			
			// regardless of whether the use can choose a destination,
			// we output a text input field for typing in the file name
		
			output += '<input type="text" id="destName" ' +
								'onchange="Interface.checkFilename(); Interface.checkBuild()" />';
		};
		
		$(id).innerHTML = output;
	};

	
	function updateSettings()
	{
		var targets = $('target');
		var destDirs = $('destDirs');
		
		for (var i = 0; i < targets.options.length; i++)
			if (targets.options[i].value == target)
				targets.selectedIndex = i;
		
		$('author').value = author;

		if ($('destName'))
			$('destName').value = destName;

		if (destDir)		
			for (var i = 0; i < destDirs.options.length; i++)
				if (destDirs.options[i].value == destDir)
					destDirs.selectedIndex = i;
	};

	
	function saveSettings()
	{
		var targets = $('target');
		var destDirs = $('destDirs');
		
		target = targets.options[targets.selectedIndex].value;
		author = $('author').value;
		
		if ($('destName'))
			destName = $('destName').value;
		
		if (destDir)
			destDir = destDirs.options[destDirs.selectedIndex].value;
		else
			destDir = '';
	};


	function compile (callback)
	{
		compilingSource = 0;
		sourceText = '';
		assembleSources(callback);
	};

	
	function serialize()
	{
		var data = new Object();

		data.name = name;
		data.author = author;
		data.target = target;
		data.sources = sources;
		data.destName = destName;
		data.destDir = destDir;
		
		return data;
	};

	
	// private
	
	
	function renderSourceItem (filename)
	{
		// returns a div for an individual source file
		
		var el = new Element('div');
		el.className = 'file';
		el.id = filename;
		
		var button = new Element('button');
		button.className = 'fileRemove';
		button.source = filename;
									 
		button.onclick = function()
		{
			Interface.removeSource(this.source);
		};
		
		var img = new Element('img');
		img.src = 'img/remove.png';
		img.height = 16;
		img.width = 16;
		
		button.adopt(img);
				
		el.adopt(button);
		el.appendText(filename.toFilename());
		return el;
	};

	
	function assembleSources (callback)
	{
		// recursively make requests to retrieve source text
		
		Interface.setStatus('Reading ' + sources[compilingSource] + '...');
		
		try
		{
			new Ajax(sources[compilingSource],
							 { method: 'get',
								 onComplete: function (text)
								 {
										assemblyComplete(text, callback);
								 }
								}
							).request();
		}
		catch (e)
		{
			cantOpen(sources[compilingSource]);
		};
		
		
		function assemblyComplete (text, callback)
		{
			sourceText += text + "\n\n";	// fixme?
			if (++compilingSource < sources.length)
				assembleSources(callback);
			else
			{
				Interface.setStatus('Creating TiddlyWiki...');
			
				var tw = new TiddlyWiki(author);
				tw.addTwee(sourceText.normalizeNewlines() + "\n\n");
				callback(tw.toHtml(target));
			};
		};
		
		
		function cantOpen (name)
		{
			Interface.setWindowTitle('error');			
			Interface.alert('error', 'Tweebox could not open the source file ' + name +
											'. Please check to make sure the file still exists, and ' +
											'that you have permission to read it.');
		};
	};
	
};
