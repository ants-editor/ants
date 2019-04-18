class OptionsUtils
{
	static getCount( options )
	{
		if( options && 'count' in options )
			return options.count;

		return null;
	}

	static getDirection(options)
	{
		if( options && 'direction' in options )
			return options.direction;

		return "next";
	}

	static getQueryObject( options )
	{
		return options && 'index' in options
		  ? store.index( option.index )
		  : this.store;
	}

	/*
	 *	x.countQuery('users','id',{index:'xxxx' '>=' : 3 , '<=' : '5' });
	 */

	static getKeyRange( options )
	{
		if( options === null || options === undefined )
			return null;

		if( '=' in options )
		{
			return IDBKeyRange.only( options['='] );
		}

		let isLowerBoundOpen	= '>' in options;
		let isLowerBound  		= isLowerBoundOpen || '>=' in options;

		let isUpperBoundOpen	= '<' in options;
		let isUpperBound		= isUpperBoundOpen || '<=' in options;


		if( isLowerBound && isUpperBound )
		{
			let lowerBound	= options[ isLowerBoundOpen ?  '>':'>='];
			let upperBound	= options[ isUpperBoundOpen ?  '<':'<='];
			return IDBKeyRange.bound( lowerBound, upperBound, isLowerBoundOpen, isUpperBoundOpen );
		}

		if( isLowerBound )
		{
			let lowerBound	= options[ isLowerBoundOpen ? '>' : '>=' ];
			return IDBKeyRange.lowerBound( lowerBound , isLowerBoundOpen );
		}

		if( isUpperBound )
		{
			let upperBound = options[ isUpperBoundOpen ? '<' : '<=' ];
			return IDBKeyRange.upperBound( upperBound , isUpperBoundOpen );
		}

		return null;
	}
}

class ObjectStore
{
	constructor(idbStore)
	{
		this.store = idbStore;
		this.debug = true;
		this.name = idbStore.name;
	}

	add( item, key )
	{
		return new Promise((resolve,reject)=>{
			let request = key ? this.store.add( item, key ) : this.store.add( item );

			request.onsuccess = (evt)=>
			{
				if( this.debug )
					console.log('AddItem('+this.name+' key:'+key+' item:'+JSON.stringify( item )+' Request Success', evt );

				resolve(evt.target.result);
			};

			request.onerror = (evt)=>
			{
				if( this.debug )
					console.log('AddItem('+this.name+' key:'+key+' item:'+JSON.stringify( item )+' Request Error ', evt);

				reject( evt );
			};
		});
	}

	put( item, key )
	{
		return new Promise((resolve,reject)=>{
			let request = key ? this.store.put( item, key ) : this.store.put( item );

			request.onsuccess = (evt)=>
			{
				if( this.debug )
					console.log('Put Item('+this.name+' key:'+key+' item:'+JSON.stringify( item )+' Request Success', evt );

				resolve(evt.target.result);
			};

			request.onerror = (evt)=>
			{
				if( this.debug )
					console.log('Put Item('+this.name+' key:'+key+' item:'+JSON.stringify( item )+' Request Error ', evt);

				reject( evt );
			};
		});
	}

	get( key )
	{
		return new Promise((resolve,reject)=>
		{
			if( this.debug )
			{
				console.log("Store name", this.name );
			}

			let request = this.store.get( key );

			request.onsuccess = ()=>
			{
				resolve( request.result );
			};
		});
	}

	addAllFast( items, insertIgnore )
	{
		if( !insertIgnore )
		{
			items.forEach( i => this.store.add( i ) );
			return;
		}

		let error_handler = (evt)=>
		{
			evt.preventDefault();
			evt.stopPropagation();
		};

		items.forEach((i)=>
		{
			let request =  this.store.add( i );
			request.onerror = error_handler;
		});

		return Promise.resolve();
	}

	addAll(items,insertIgnore)
	{
		let count = items.length;
		return new Promise((resolve,reject)=>
		{
			let added_items = [];

			let error_handler = (evt)=>
			{
				if( insertIgnore )
				{
					evt.preventDefault();
					evt.stopPropagation();
					count--;
					added_items.push( null );
					if( count == 0 )
						resolve( added_items );
					return;

				}
				reject(evt);

				if( this.debug )
					console.log('AddItems '+this.name+' Request Fail ', evt );
			};

			items.forEach((i)=>
			{
				let request = this.store.add( i );
				request.onerror = error_handler;
				request.onsuccess = (generated_id)=>
				{
					added_items.push( request.result );
					count--;
					if( count == 0 )
						resolve( added_items );
				};
			});
		});
	}

	updateItems(items)
	{
		return new Promise((resolve,reject)=>
		{
			let counter = items.length;
			let handler = (evt)=>{
				counter--;
				if( counter == 0 )
					resolve();
			};

			/*/Weird bug doesn't recognize items as array
			for(let i=0;i<items.length;i++)
			{
				let request = this.store.put(items[i]);
				request.onsuccess = handler;
				request.onerror = reject;
			}/*/
			//console.log('Updating', items)
			items.forEach((i)=>{
			let request = this.store.put(i);
				request.onsuccess = handler;
				request.onerror = reject;
			});
			//*/
		});
	}

	getAll( options )
	{
		return new Promise((resolve,reject)=>
		{

			let queryObject = options && 'index' in options
				? this.store.index( options.index )
				: this.store;

			let range		= OptionsUtils.getKeyRange( options );
			let count		= OptionsUtils.getCount( options );

			let request	= ( range == null && count == 0 )
					? queryObject.getAll()
					: queryObject.getAll( range, count );

			request.onsuccess = ()=>
			{
				resolve( request.result );
			};

			request.onerror = reject;
		});
	}

	clear()
	{
		return new Promise((resolve,reject)=>
		{
				let request = this.store.clear();
				request.onsuccess = resolve;
				request.onerror = reject;
		});
	}

	remove( key )
	{
		return new Promise((resolve,reject)=>
		{
			let request = this.store.delete( key );
			request.onsuccess = resolve;
			request.onerror = reject;
		});
	}

	/*
	 * if options is passed resolves to the number of elements deleted
	 */
	removeAll( options )
	{
		if( options && 'index' in options )
		{
			return this.removeByIndex( options );
		}

		return new Promise((resolve,reject)=>
		{
			let range		= OptionsUtils.getKeyRange( options );
			let request = this.store.delete( range );
			request.onsuccess = (evt)=>{
					resolve(request); //TODO Check how many deleted
			};
			request.onerror = reject;
		});
	}

	removeByIndex(options)
	{

	}

	getByKeyIndex(list,opt)
	{
		let orderedKeyList = list.slice(0);
		let options = opt ? opt : {};

		return new Promise((resolve,reject)=>
		{
			let queryObject = options && 'index' in options
				? this.store.index( option.index )
				: this.store;

			let range		= OptionsUtils.getKeyRange( options );
			let items		= [];

			var i = 0;
			var cursorReq = queryObject.openCursor( range );

			cursorReq.onsuccess = (event)=>
			{
				var cursor = event.target.result;

				if (!cursor)
				{
					resolve( items ); return;
				}

				var key = cursor.key;

				while (key > orderedKeyList[i])
				{
					// The cursor has passed beyond this key. Check next.
					++i;

					if (i === orderedKeyList.length) {
						// There is no next. Stop searching.
						resolve( items );
						return;
					}
				}

				if (key === orderedKeyList[i]) {
					// The current cursor value should be included and we should continue
					// a single step in case next item has the same key or possibly our
					// next key in orderedKeyList.
					//onfound(cursor.value);
					items.push( cursor.value );
					cursor.continue();
				} else {
					// cursor.key not yet at orderedKeyList[i]. Forward cursor to the next key to hunt for.
					cursor.continue(orderedKeyList[i]);
				}
			};
		});
	}
	getByKey(list, opt )
	{
		if( opt && 'index' in opt )
			return getByKeyIndex( list, opt );

		if( list.length == 0 )
			return Promise.resolve([]);

		return new Promise((resolve,reject)=>
		{
			let result = [];
			let count = list.length;

			list.forEach((i)=>
			{
				let request = this.store.get(i);
				request.onsuccess = ()=>
				{
					result.push( request.result );
					count--;

					if( count == 0 )
						resolve( result );
				};
				request.onerror = reject;
			});
		});
	}

	count(options)
	{
		return new Promise((resolve,reject)=>
		{
			let queryObject = options && 'index' in options
				? this.store.index( options.index )
				: this.store;

			let range		= OptionsUtils.getKeyRange( options );
			let request = queryObject.count( range );

			request.onerror = reject;
			request.onsuccess = (evt)=>
			{
				resolve( request.result );
			};
		});
	}

	customFilter( options, callbackFilter )
	{
		return new Promise((resolve,reject)=>
		{
			let queryObject = options && 'index' in options
				? this.store.index( options.index )
				: this.store;

			let range		= OptionsUtils.getKeyRange( options );
			let direction	= OptionsUtils.getDirection( options );
			let request		= queryObject.openCursor( range, direction );

			let results		= [];

			request.onsuccess = (evt)=>
			{
				if( evt.target.result )
				{
					if( callbackFilter( evt.target.result.value ) )
						results.push( evt.target.result.value );

					evt.target.result.continue();
				}
				else
				{
					//Maybe call resolve
					resolve( results );
				}
			};
		});
	}

	deleteByKeyIds(storeName, arrayOfKeyIds )
	{
		let total = 0 ;

		return this.count( storeName,{})
		.then((count)=>
		{
			total = count;
			return new Promise((resolve,reject)=>
			{
				let transaction = this.database.transaction([storeName], 'readwrite' );
				let store = transaction.objectStore( storeName );

				transaction.oncomplete = (evt)=>
				{
					resolve( evt );
				};

				transaction.onerror = (evt)=>
				{
					reject( evt );
				};

				arrayOfKeyIds.forEach((key)=>
				{
					let request = store.delete( key );
				});
			});
		})
		.then(()=>
		{
			return this.count( storeName, {} );
		})
		.then((count)=>
		{
			return Promise.resolve( total - count );
		});
	}
	getAllIndexesCounts()
	{
		return new Promise((resolve,reject)=>
		{
			let result 	= {};
			let names 	= Array.from( this.store.indexNames );

			if( names.length == 0 )
			{
				resolve(result);
				return;
			}

			let counter = names.length;
			if( this.debug )
				console.log('Get all index count for '+this.name );
			names.forEach( i =>
			{
				let index = this.store.index( i );
				let request = index.count();
				request.onerror = reject;
				request.onsuccess = (evt)=>
				{
					if( this.debug )
						console.log('Success Count for '+i );
					result[ i ] = request.result;
					counter--;
					if( counter == 0 )
						resolve( result );
				};
			});

		});
	}
	getBackup()
	{
		return new Promise((resolve,reject)=>
		{
			let result 	= [];
			let store	= transaction.objectStore( storeName );
			let request = store.openCursor();

			request.onerror = reject;
			request.onsuccess = (evt)=>
			{
				if( evt.target.result )
				{
					result.push(  evt.target.result.value );
					evt.target.result.continue();
				}
				else
				{
					//Maybe call resolve
					resolve( result );
				}
			};
		});
	}
}


export default class DatabaseStore
{
	/*
	/*
	    name : "users"
	    ,version : 1
	    stores:
	    {
	      user : { keyPath: 'id'
	      ,autoincrement: true
	      ,indexes:
	      {
	        'name' : {keypath: 'name', objectParameters: { uniq: false, multientry
	      }
	    }

	 	new DatabaseStore(""{
			name		: "users"
			,version	: 1
			,stores		:{
				user: {
					keyPath	: 'id'
					autoincrement: true
					indexes	:
					[
						{ indexName: "name", keyPath:"name", objectParameters: { uniq : false, multiEntry: false, locale: 'auto'  } }
						,{ indexName: "age", keyPath:"age", objectParameters: { uniq : false, multiEntry: false, locale: 'auto'  } }
						,{ indexName: "curp", keyPath:"age", objectParameters: { uniq : true, multiEntry: false, locale: 'auto'  } }
						,{ indexName: "tagIndex", keyPath:"age", objectParameters: { uniq : false, multiEntry: true , locale: 'auto'  } } //age i thing it must be a array
					]
				}
			}
		});
	 * */
	constructor( schema )
	{
		this.schema = schema;
		this.debug	= false;
		this.database = null;
	}

	static getDefaultSchema()
	{
		return {
			name		: 'default'
			,version	: 1
			,stores		:{
				keyValue :
				{
					keyPath : null
					,autoIncrement : false
				}
			}
		};
	}

	init()
	{
		return new Promise((resolve,reject)=>
		{
			let DBOpenRequest	   = window.indexedDB.open( this.schema.name || 'default', this.schema.version );

			let isAnUpgrade = false;
			DBOpenRequest.onerror   = ( evt )=>
			{
				if( this.debug )
					console.log( evt );

				reject( evt );
			};

			DBOpenRequest.onupgradeneeded	 = (evt)=>
			{
				isAnUpgrade = true;

				if( this.debug )
					console.log('Init creating stores');

				let db = evt.target.result;
				this._createSchema( evt.target.transaction, db );
			};

			DBOpenRequest.onsuccess = (e)=>
			{
				this.database	= e.target.result;
				resolve( isAnUpgrade );
			};
		});
	}

	_createSchema( transaction, db )
	{
		let stores 	= db.objectStoreNames;

		for(let storeName in this.schema.stores )
		{
			let store = null;

			if( ! ('indexes' in this.schema.stores[ storeName ]) )
			{
				this.schema.stores[ storeName ].indexes = [];
			}

			if( !db.objectStoreNames.contains( storeName ) )
			{
				if( this.debug )
					console.log('creating store'+storeName);

				let keyPath			= 'keyPath' in this.schema.stores[ storeName ] ? this.schema.stores[ storeName ].keyPath : 'id';
				let autoincrement	= 'autoincrement' in this.schema.stores[storeName] ? this.schema.stores[storeName].autoincrement : true;
				store	= db.createObjectStore( storeName ,{ keyPath: keyPath , autoIncrement: autoincrement } );

				this._createIndexForStore
				(
					store
					,this.schema.stores[ storeName ].indexes
				);
			}
			else
			{
				let store = transaction.objectStore( storeName );

				let toDelete = [];
				let indexNames = Array.from( store.indexNames );

				for( let j=0;j<store.indexNames.length;j++)
				{
					let i_name = store.indexNames.item( j );
					if( ! this.schema.stores[ storeName ].indexes.some( z=> z.indexName == i_name ) )
						toDelete.push( i_name );
				}

				while( toDelete.length )
				{
					let z = toDelete.pop();
					store.deleteIndex( z );
				}

				this._createIndexForStore( store ,this.schema.stores[ storeName ].indexes );
			}
		}

		let dbStoreNames = Array.from( db.objectStoreNames );

		dbStoreNames.forEach((storeName)=>
		{
			if( !(storeName in this.schema.stores) )
			{
				db.deleteObjectStore( storeName );
			}
		});
	}

	_createIndexForStore( store, indexesArray )
	{
		indexesArray.forEach((index)=>
		{
			if( !store.indexNames.contains( index.indexName ) )
				store.createIndex( index.indexName, index.keyPath, index.objectParameters );
		});
	}


	getStoreNames()
	{
		if( this.database )
			return this.database.objectStoreNames;

		throw 'Database is not initialized';
	}

	addItem( storeName, item, key )
	{
		return this.transaction([storeName], 'readwrite',( stores,transaction )=>
		{
			return stores[ storeName ].add( item, key );
		});
	}

	addItems( storeName, items, insertIgnore)
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[storeName].addAllFast( items, insertIgnore );
		});
	}

	clear(...theArgs)
	{
		return this.transaction(theArgs,'readwrite',(stores,transaction)=>
		{
			let promises = [];
			theArgs.forEach((i)=> promises.push( stores[i].clear() ));
			return Promise.all( promises );
		});
	}

	count( storeName, options)
	{
		return this.transaction([storeName],'readonly',(stores,transaction)=>
		{
			return stores[ storeName ].count( options );
		},'Count '+storeName );
	}

	getAll( storeName, options )
	{
		return this.transaction([storeName],'readonly',(stores,transaction)=>
		{
			return stores[ storeName ].getAll( options );
		});
	}

	getAllKeys( storeName, options )
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[ storeName ].getAllKeys( options );
		},'getAllKeys '+storeName );
	}

	getByKey( storeName, list, opt )
	{
		return this.transaction([storeName],'readonly',(stores,transaction)=>
		{
			return stores[storeName].getByKey(list,opt );
		},'getByKey '+storeName);
	}

	customFilter(storeName, options, callbackFilter )
	{
		return this.transaction([storeName],'readonly',(stores,transaction)=>
		{
			return stores[storeName].customFilter( options, callbackFilter );
		},'customFilter '+storeName);
	}

	put( storeName, item )
	{
		return this.putItems(storeName, [item ] );
	}

	putItems( storeName, items )
	{
		return this.updateItems(storeName, items );
	}

	updateItems( storeName, items_array )
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[ storeName ].updateItems( items_array );
		},'updateItems '+storeName );
	}

	get( storeName, key )
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[ storeName ].get( key );
		},'get '+storeName );
	}


	/*
	 * if options is passed resolves to the number of elements deleted
	 */

	deleteByKeyIds(storeName, arrayOfKeyIds )
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[ storeName ].deleteByKeyIds( arrayOfKeyIds );
		},'deleteByKeyIds '+storeName );
	}

	/*
	 * if options is passed resolves to the number of elements deleted
	 */

	removeAll(storeName, options )
	{
		return this.transaction([storeName],'readwrite',(stores,transaction)=>
		{
			return stores[ storeName ].removeAll( options );
		},'removeAll '+storeName );
	}

	remove(storeName, key )
	{
		return this.transaction([storeName], 'readwrite',(stores,transaction)=>
		{
			return stores[storeName].remove( key );
		},'remove '+storeName);
	}

	getAllIndexesCounts( storeName )
	{
		return this.transaction([storeName], 'readonly',(stores,transaction)=>
		{
			return stores[storeName].getAllIndexesCounts();
		},'getAllIndexesCounts '+storeName);
	}

	getDatabaseResume()
	{
		let names = Array.from( this.database.objectStoreNames );
		return this.transaction(names,'readonly',(stores,transaction)=>
		{
			let result = {};
			let promises = [];
			Object.values( stores ).forEach(( store )=>{
				let obj = { name: store.name };
				result[ store.name ]=  obj;

				promises.push
				(
					store.getAllIndexesCounts().then(( result )=>{ obj.indexes = result; return result; })
					,store.count().then((result)=>{ obj.total = result; return result; })
				);
			});

			return Promise.all( promises ).then(()=> result);
		});
	}

	close()
	{
		this.database.close();
	}

	restoreBackup2( json_obj, ignoreErrors )
	{
		let names = Array.from( this.database.objectStoreNames );
		return this.transaction(names,'readwrite',(stores,transaction)=>
		{
			let promises = [];
			let keys = Object.keys( json_obj );

			keys.forEach((i)=>
			{
				if( i in stores )
					promise.push( stores.addAllFast( json_obj[ i ], ignoreErrors ).then(()=>true));
			});

			return Promise.all( promises );
		});
	}

	__serialize(obj)
	{
		if( obj instanceof Blob )
		{
			return new Promise((resolve,reject)=>
			{
				var reader = new FileReader();
 				reader.readAsDataURL(blob);
 				reader.onloadend = function() {
 				    resolve({ type: "blob" , data: reader.result });
 				};
			});
		}

		return Promise.resolve( obj );
	}

	createBackup2()
	{
		let names = Array.from( this.database.objectStoreNames );
		return this.transaction(names,'readonly',(stores,transaction)=>
		{
			let result = {};
			let promises = [];
			Object.values( stores ).forEach(( store )=>{
				promises.push
				(
					store.getBackup().then(( store_result )=>{
						result[ store.name ]  = store_result;
						return true;
					})
				);
			});
			return Promise.all( promises ).then(()=>result);
		});
	}

	transaction(store_names,mode,callback,txt_name)
	{
		store_names.forEach((i)=>{
			if( !this.database.objectStoreNames.contains( i ) )
				throw 'Store "'+i+' doesn\'t exists';
		});

		let txt = this.database.transaction( store_names, mode );

		let promise_txt = new Promise((resolve,reject)=>
		{
			txt.onerror = (evt)=>
			{
				if( this.debug )
					console.log('Transaction '+(txt_name ? txt_name : mode )+': error', evt );

				if( 'stack' in evt )
					console.log( evt.stack );


				reject( evt );
			};

			txt.oncomplete = (evt)=>
			{
				if( this.debug )
					console.log('Transaction '+(txt_name ? txt_name : mode )+': complete', evt );
				resolve();
			};
		});

		let stores = { };

		store_names.forEach((i)=>
		{
			stores[ i ] = new ObjectStore( txt.objectStore( i ) );
		});

		let result = callback( stores,txt );

		return Promise.all([ result, promise_txt ]).then( r=>r[0] );
	}
}
