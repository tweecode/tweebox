//
// ProjectList class
//
// This is a collection of projects.
//

function ProjectList()
{
	// constructor

	var self = this;
	var projects = new Array();
	var current;
	
	// public methods
	
	this.addProject = addProject;
	this.removeProject = removeProject;
	this.renderProjectList = renderProjectList;
	this.getCurrent = getCurrent;
	this.setCurrent = setCurrent;
	this.save = save;

	// implementation

	function addProject (project)
	{
		projects.push(project);
		setCurrent(projects.length - 1);
	};
	
	function removeProject (index)
	{		
		if ((current == index) && (current != 0))
			current--;
	
		projects.splice(index, 1);
	};
	
	function getCurrent()
	{
		return projects[current];
	};
	
	function setCurrent (index)
	{	
		if ((index < 0) || (index >= projects.length))
			Interface.alert('error', 'Sorry, an internal error has occurred: ' +
											'bad index passed to ProjectList.setCurrent (' + index +
											'). Please report this bug.');
		else
			current = index;
	};
	
	function renderProjectList (id)
	{
		var output = '<div class="right">';
		
		// right side
		
		if (projects.length > 1)
		{
			output += '<button title="Remove the selected project" onclick="Interface.removeProject()">';
			output += '<img src="img/trash.png" width="16" height="16" alt="" />';
			output += ' Remove ' + projects[current].getName();
			output += '</button> ';
		};
		
		output += '<button title="Add a new project" onclick="Interface.newProject()">';
		output += '<img src="img/newproject.png" width="16" height="16" alt="" />';
		output += ' New Project</button></div>';
		
		// left side
		
		output += '<div class="left">Project ';
		output += '<select id="projectMenu" onchange="projects.save();projects.setCurrent(document.getElementById(\'projectMenu\').selectedIndex);updateProjects()">';
		
		for (var i = 0; i < projects.length; i++)
		{
			output += '<option';
			
			if (current == i)
				output += ' selected="selected"';
			
			output += '>' + projects[i].getName() + '</option>';
		};
		
		output += '</select></div>';

		$(id).innerHTML = output;
	};
	
	function save()
	{		
		projects[current].saveSettings();
	
		Interface.setStatus('Saving projects...');
		
		var data = new Object();
		
		data.current = current;
		data.projects = new Array();
		
		for (var i = 0; i < projects.length; i++)
			data.projects.push(projects[i].serialize());
		
		Cookie.set('Tweebox', data.toJSONString());
		
		// check to see that that worked
		
		if (! Cookie.get('Tweebox'))
		{
			Interface.alert('error', 'Your projects could not be saved. Make sure you ' +
											'have enabled cookies in your Web browser.<br /><br />' +
											'Tweebox will still remember your projects until you ' +
											'close your browser window.');
			alert(document.cookie);
		}
		else
			Interface.setStatus('Projects saved.');
	};
};

ProjectList.restore = function()
{
	var projects = new ProjectList();
	var data = Cookie.get('Tweebox');

	if (! data)
		createEmpty();
	else
	{
		// restore from the cookie
		
		data = data.parseJSON();
		
		if ((typeof data.projects != 'undefined') &&
				(typeof data.current != 'undefined'))
		{
			for (var j = 0; j < data.projects.length; j++)
				projects.addProject(new Project(data.projects[j]));
			
			projects.setCurrent(data.current);
		}
		else
		{
			// the cookie's corrupt; start from scratch
			
			Interface.alert('error', 'The cookie used to store your projects has ' +
											'become corrupted. It has been recreated with default' + 'settings.');
						
			createEmpty();
			projects.save();
		};
	};
		
	return projects;
	
	
	function createEmpty()
	{
		projects.addProject(new Project('My First Project'));
		projects.setCurrent(0);	
	}
};
