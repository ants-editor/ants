import Notes from './NotesDb.js';
import Navigation from '../depencies/Sauna/js/Navigation.js';
import Note from './Note.js';
import Util from '../depencies/Diabetes/Util.js';

let n = new Navigation();
n.setPageInit('all-notes');

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
   console.log("Error occured: " + errorMsg);//or any message
    return false;
};

window.addEventListener('load',()=>
{
	console.log('load window');
	let db = new Notes();
	let note  = null;
	let list  = Util.getById('note-list');

	let renderList =(notes)=>
	{
		console.log('Rendering');
		console.log( notes );
		try{
		let htmlStr = notes.reduce((prev,note)=>
		{
			let title = Util.txt2html(note.title);
			let date_str = '';
			let date = '';

			if( 'created' in note )
			{
				date_str = note.created.toString();
				date = date_str.substring(0,date_str.indexOf("GMT"));
			}

			return prev+`<a href="#" class="note-list-item" data-note-id="${note.id}">
					<div class="list-item-title">${title}</div>
					<div class="list-item-date">${date}</div>
				</a>`;
		},'');

		console.log( htmlStr );
		list.innerHTML 	= htmlStr;
		}catch(e){ console.log( e )}

	};

	console.log('init');
	console.log('FOOOO');
	db.init().then(()=>
	{
		console.log('Init');

		console.log('getting notes');
		db.getNotes(1,20).then( renderList );

		note = new Note( n, db );

	}).catch((foo)=>{console.log(foo)});

	console.log("BAR");


	Util.delegateEvent('click',list,'[data-note-id]',function(evt)
	{
		Util.stopEvent( evt );
		console.log(  this.getAttribute('data-note-id')  );
		note.setNote( this.getAttribute('data-note-id') );
	});

	Util.getById('search-input').addEventListener('keyup',(evt)=>
	{
		db.search( evt.target.value ).then( renderList ).catch((e)=>console.log( e ));
	});
});

