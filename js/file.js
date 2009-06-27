//
// File class
//
// This class encapsulates a bunch of methods used to work with files.
// There are only static methods in this class. There are also some
// extensions to the String object to work with filenames.
//

var File = new Object();

//
// File.chooser()
//
// A form control that lets the user pick a file. When a file is added
// sucessfully, it calls the function onChange, which is passed in the
// constructor. The other parameter, id, tells the chooser where to
// display.
//

File.chooser = function (id, onChange)
{
	var place = document.getElementById(id);
	var button;
	
	createButton();

	function createButton()
	{
		button = document.createElement('input');
		button.setAttribute('type', 'file');
		button.setAttribute('title', 'Click Browse to add a file');
		button.onchange = sendFilename;
		place.appendChild(button);
	};
	
	function sendFilename()
	{	
		onChange(button.value);
		place.removeChild(button);
		createButton();
	};
};

//
// File.write
//
// This tries its best to write the data passed to the filename passed. It
// expects a local filename here, not a file:/// URL.
//

File.write = function (filename, data)
{
	if (Interface.isGecko)
		geckoWrite();
	else
		if (Interface.isIE)
			ieWrite();
		else
			if (Interface.isSafari)
				safariWrite();
			else
				Interface.alert('error', 'Sorry, your browser is incapable of saving files.');
	
	
	function ieWrite()
	{
		//
		// http://www.webreference.com/js/column71/7.html
		//
		
		try
		{
			var fs = new ActiveXObject('Scripting.FileSystemObject');
			var stream = fs.OpenTextFile(filename, 2, true, -1);
			stream.Write(data);
			stream.Close();
		}
		catch (e)
		{
			Interface.alert('error', 'There was a problem saving your story to ' +
											filename + '.<br /><br />' + e.description +
											'<br /><br />Please report this bug.');		
		}
	};
	
	function geckoWrite()
	{
		//
		// http://www.captain.at/programming/xul/
		//
	
		try
		{
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		}
		catch (e)
		{
			Interface.alert('error', 'Sorry, Tweebox was not allowed to save your ' +
											'file. Please check to see if you have given it ' +
											'permission to do so.');
		}
		
		try
			{
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);
			
			if ( file.exists() == false )
				file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
				
			var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			
			outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
			outputStream.write(data, data.length);
			outputStream.close();
			netscape.security.PrivilegeManager.disablePrivilege("UniversalXPConnect");
			}
	catch (e)
		{
			Interface.alert('error', 'There was a problem saving your story to ' +
															 filename + '.<br /><br />' + e.toString() +
															 '<br /><br />Please report this bug.');
		}
	}
};


//
// These extensions of the String class convert between
// local pathnames and file:/// URLs.
//

String.prototype.toLocalUrl = function()
{
	// turn backslashes into regular slashes
	
	var i = this.replace(/\\/g, '/');
	
	// add an initial slash if we don't have one already
	
	if (i[0] != '/')
		i = '/' + i;
		
	return 'file://' + encodeURIComponent(i).replace(/%2F/gi, '/').replace(
										 /%3A/gi, ':');
;
};

String.prototype.toFilename = function()
{
	var result;
	
	// strip file:// prefix
	
	result = this.replace('file://', '');
	
	// fix Windows pathnames
	
	if (result.match(/^\/[a-z]((%3a)|:)\//i))
	{
		result = result.replace(/\//g, '\\');
		result = result.substr(1);
		result = result.replace(/%3a/gi, ':');
	};
	
	return decodeURI(result);
};

String.prototype.fileName = function()
{
	return this.slice(this.lastIndexOf('/') + 1);
}

String.prototype.directory = function()
{
	return this.slice(0, this.lastIndexOf('/') + 1);
}

String.prototype.normalizeNewlines = function()
{
	var output = this;
	output = output.replace(/\r\n/g, "\n");
	output = output.replace(/\r/g, "\n");
	return output;
};
