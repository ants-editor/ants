import Finger from '../depencies/finger/DatabaseStore.js';

export default class NoteDb
{
	constructor()
	{
		this.database	= new Finger
		({
			name		: 'notes',
			version	: 6,
			stores		:{
				note:
				{
					keyPath	: 'id',
					autoincrement: true,
					indexes	:
					[

						{ indexName: 'filename', keyPath: 'filename', objectParameters: { uniq: true, multiEntry: false }},
						{ indexName: 'search', keyPath: 'search', objectParameters: { uniq: false, multiEntry: false }},
						{ indexName: 'tags' ,keyPath:'tags'	,objectParameters: { uniq: false ,multiEntry: true} },
						{ indexName: 'created', keyPath:'created', objectParameters:{ uniq: false, multiEntry: false}}
					]
				},
				attachement:
				{
					keyPath	: 'id',
					autoincrement: true,
					indexes	:
					[
						{ indexName: 'filename', keypath: 'filename', objectParameters: {uniq: true, multiEntry: false }},
						{ indexName: 'note_id', keypath: 'filename', objectParameters:{ uniq: false, multiEntry: false}},
						{ indexName: 'created', keypath: 'created', objectParameters:{ uniq: false, multiEntry: false}}
					]
				}
			}
		});
		this.database.debug = true;
	}

	init()
	{
		try{
		return this.database.init();
			this.database.debug = true;
		}catch(e){console.log( e ); }
	}

	getNotes(start, limit)
	{
		//return this.database.getAll('note',{ start: start, count: 20 });
		return this.database.customFilter('note', { index: 'created',direction: "prev", count: 20 }, i=> true);
	}

	getNote(note_id)
	{
		return this.database.get('note',parseInt( note_id ));
	}

	addNewNote(text, tags)
	{
		if( text.trim() === "" )
			return Promise.resolve(0);

		let title = text.trim().split('\n')[0];

		return this.database.addItem('note',null,{ text: text, tags: tags, title: title, search: title.toLowerCase(), created: new Date()});
	}

	search(name)
	{
		if( name === "" )
			return this.database.getAll('note',{ count: 20});

		return this.database.getAll('note',{ index: 'search', '>=': name, count: 20});
	}

	saveNote(id, text)
	{
		if( text.trim() === "" )
			return Promise.resolve(0);

		let title = text.trim().split('\n')[0];
		let obj = { id: parseInt(id), text: text, title: title, created: new Date()};
		console.log("To save",obj);

		return this.database.put('note', obj );
	}

	close()
	{
		this.database.close();
	}
}
