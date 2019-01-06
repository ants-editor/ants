import Notes from './NotesDb.js';
import Navigation from '../depencies/Sauna/js/Navigation.js';
import Note from './Note.js';
import Util from '../depencies/Diabetes/Util.js';

let n = new Navigation();
n.setPageInit('all-notes');

window.addEventListener('load',()=>
{
	let db = new Notes();

	let note  = null;

	db.init().then(()=>
	{
		db.getNotes(1,20).then((notes)=>
		{
			try{
			let htmlStr = notes.reduce((prev,note)=>
			{
				let title = Util.txt2html(note.title);
				let date_str = note.created.toString();
				let date = date_str.substring(0,date_str.indexOf("GMT"));

				return prev+`<a href="#" class="note-list-item" data-note-id="${note.id}">
						<div class="list-item-title">${title}</div>
						<div class="list-item-date">${date}</div>
					</a>`;
			},'');

			console.log( htmlStr );
			list.innerHTML 	= htmlStr;
			}catch(e){ console.log(e); }
		});

		note = new Note( n, db );
	});


	let list  = Util.getById('note-list');
	Util.delegateEvent('click',list,'[data-note-id]',function(evt)
	{
		Util.stopEvent( evt );
		console.log(  this.getAttribute('data-note-id')  );
		note.setNote( this.getAttribute('data-note-id') );
	});
});

