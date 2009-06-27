//
// Targets class
//
// This class keeps track of the various targets you can compile to.
// For each target, there is a corresponding entry in Targets.targets
// with the following properties:
//
// header
// Text meant to be preprended to a TiddlyWiki of this type.
//
// description
// A description of the target. (HTML code.)
//
// The class is not meant to be instantiated.
//


Targets =
{
	load: function (name)
	{
		if (! (name in Targets.targets))
		{
			Interface.setStatus('Loading target ' + name + '...');
			
			var basePath = location.href.replace('tweebox.html', '');
			
			new Ajax(basePath + 'targets/' + name + '/header.html',
							 { method: 'get',
								 onComplete: function (text)
								 {
										headerLoaded(name, text);
								 }
							 }).request();
			
			new Ajax(basePath + 'targets/' + name + '/description.html',
							 { method: 'get',
								 onComplete: function (text)
								 {
										descriptionLoaded(name, text);
								 }
							 }).request();
		}
		else
			Targets.updateInfo(name);		
	
		function headerLoaded (name, text)
		{
			if (! Targets.targets[name])
				Targets.targets[name] = new Object();
	
			Targets.targets[name].header = text;
			
			Interface.setStatus('Target ' + name + ' loaded.');
		};
		
		function descriptionLoaded (name, text)
		{
			if (! Targets.targets[name])
				Targets.targets[name] = new Object();
	
			Targets.targets[name].description = text;
			Targets.updateInfo(name);
		}
	},
	
	getHeader: function (name)
	{
		// better be loaded at this point
	
		return Targets.targets[name].header;
	},
	
	updateInfo: function (name)
	{
	
		new fx.Style('targetInfo', 'opacity',
								 { onComplete: reveal, duration: 250 }).custom(1, 0);
				
		function reveal()
		{
			$('targetPreview').src = 'targets/' + name + '/preview.png';
			$('targetDescription').setHTML(Targets.targets[name].description);
			new fx.Style('targetInfo', 'opacity', {duration: 250}).custom(0, 1);
		};
	},
	
	targets: new Array()
};
