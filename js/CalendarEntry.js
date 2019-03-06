export class CalendarEntry
{
	constructor(type, title )
	{
		this.id						= Date.now();
		this.tags 					= [];
		this.date_start				= null;
		this.date_end				= null;
		this.external_type  		= null;
		this.external_id			= null;
		this.type					= null; //Note,Task,Event,ToDo; //All Day is a task, Event has start and End, Reminder has custom repeation task
		this.dissmissed				= false;
		this.checked				= false;
		this.calendar_external_id	= null;
		this.external_id			= null;
		this.location				= null;
		this.updated				= Date.now();
		this.deleted				= false;
	}

	getDateString()
	{
		if( this.date_start == null )
			return null;

		return this.date_start.toISOString().substring( 0,10 );
	}

	static getInstanceFromObject(obj)
	{
		let result = null;
		switch( obj.type )
		{
			case 'Note':
				result = new Note( obj.title );
				break;
			case 'Event':
				result = new Event( obj.title );
				break;
			case 'ToDo':
				result = new ToDo( obj.title );
				break;
			case 'Reminder':
				result = new Reminder( obj.title );
		}

		for(let i in obj)
		{
			if( i in this )
				this[i] = obj[i];
		}

		return result;
	}

	getSerializedObject()
	{
		let result = {};

		for(let i in this )
		{
			if( typeof this[i] === "function" )
				continue;

			if( (Array.isArray( this[i] ) && this[i].length ) )
			{
				result[ i ] = this[ i ];
				continue;
			}
			else if( result[i] !== null )
				result[ i ] = this[ i ];
		}
	}
}

export class Note extends Entry
{
	constructor(title)
	{
		super('Note', title);
	}
}

/* Calendar */

export class Event extends Entry
{
	constructor( title, calendar )
	{
		super('Event', title );
	}
}

export class Reminder extends Entry //
{
	constructor( title )
	{
		super('Reminder', title );
	}
}

export class ToDo extends Entry //task
{
	constructor( title )
	{
		super('ToDo',title);
	}
}
