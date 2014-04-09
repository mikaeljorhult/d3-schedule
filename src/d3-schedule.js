define( [ 'd3', 'Events' ], function( d3, Events ) {
	'use strict';
	
	// Setup variables.
	var D3Schedule,
		
		// HTML elements.
		container,
		schedule,
		
		// Date and time.
		dateFormat = d3.time.format( '%Y-%m-%d %H:%M:%S' ),
		timeScale = d3.time.scale(),
		
		// Dimensions.
		width = 400,
		height = 400,
		paddingLeft = 150,
		rowHeight = 24,
		
		// Properties.
		objects = [],
		url,
		startTime,
		endTime,
		
		// Property names.
		propertyNames = {
			'results': 'results',
			'start': 'startTime',
			'end': 'endTime',
			'events': 'events'
		};
	
	// Create main module for returning.
	D3Schedule = {
		setElement: setElement,
		setHeight: setHeight,
		setRowHeight: setRowHeight,
		setSource: setSource,
		update: update
	};
	
	// Attach resize function.
	d3.select( window ).on( 'resize', resize );
	
	function setElement( selector ) {
		container = d3.selectAll( selector );
		schedule = container.append( 'svg' );
		
		// Set height and width of schedule.
		resize();
		
		return D3Schedule;
	}
	
	function setHeight( newHeight ) {
		if ( newHeight !== false ) {
			container.style( {
				'height': newHeight + 'px',
				'overflow-y': 'scroll'
			} );
		}
		
		return D3Schedule;
	}
	
	function setRowHeight( newRowHeight ) {
		rowHeight = newRowHeight;
		
		return D3Schedule;
	}
	
	function setSource( newURL ) {
		url = newURL;
		
		return update();
	}
	
	function update() {
		// Get events.
		d3.json( url, function( error, json ) {
			// Use result array in JSON if it is set.
			if ( json[ propertyNames.results ] !== undefined ) {
				// Get array of objects from result property.
				objects = json[ propertyNames.results ];
				
				// Use start time from JSON if available.
				if ( json[ propertyNames.start ] !== undefined ) {
					startTime = dateFormat.parse( json[ propertyNames.start ] );
				}
				
				// Use end time from JSON if available.
				if ( json[ propertyNames.end ] !== undefined ) {
					endTime = dateFormat.parse( json[ propertyNames.end ] );
				}
			} else {
				objects = json;
			}
			
			// Trigger event.
			Events.publish( 'objects:updated' );
		} );
		
		return D3Schedule;
	}
	
	function visualize() {
		if ( objects !== undefined && objects.length < 1 ) { return; }
		
		// Select all objects.
		var d3Objects = schedule.selectAll( 'g.object' )
			.data( objects )
				.enter();
		
		// Draw objects
		d3Objects.append( 'g' )
			.attr( 'x', 0 )
			.attr( 'y', function( datum, index ) { return index * rowHeight; } )
			.attr( 'width', width )
			.attr( 'height', rowHeight )
			.attr( 'class', 'object' )
			.each( function( object, index ) {
				// Select events.
				var currentObject = d3.select( this ),
					events = currentObject
						.selectAll( 'rect' )
						.data( object[ propertyNames.events ] )
							.enter();
				
				// Add rectangle for styling rows.
				currentObject.append( 'rect' )
					.attr( 'x', 0 )
					.attr( 'y', index * rowHeight )
					.attr( 'width', '100%' )
					.attr( 'height', rowHeight )
					.attr( 'fill', 'transparent' )
					.attr( 'class', 'row' );
				
				// Add object names.
				currentObject.append( 'svg:text' )
					.text( object.name )
					.attr( 'x', 0 )
					.attr( 'y', ( index * rowHeight ) + ( 0.625 * rowHeight ) )
					.attr( 'height', rowHeight );
				
				// Draw events within object.
				events.append( 'rect' )
					.attr( 'rx', 3 )
					.attr( 'ry', 3 )
					.attr( 'y', index * rowHeight )
					.attr( 'x', function( datum ) { return timeScale( dateFormat.parse( datum[ propertyNames.start ] ) ); } )
					.attr( 'height', rowHeight - 2 )
					.attr( 'width', function( datum ) { return timeScale( dateFormat.parse( datum[ propertyNames.end ] ) ) - timeScale( dateFormat.parse( datum[ propertyNames.start ] ) ); } )
					.attr( 'fill', function( datum ) { return datum.color; } )
					.attr( 'class', 'event' );
			} );
	}
	
	function getWidth() {
		return parseInt( container.style( 'width' ), 10 );
	}
	
	function resize() {
		// Get the new width of the container.
		width = getWidth();
		
		// Update time scale.
		timeScale.range( [ paddingLeft, width ] );
		
		// Resize SVG element.
		schedule
			.attr( 'width', width )
			.attr( 'height', height );
		
		if ( objects.length > 0 ) {
			// Resize all objects.
			schedule.selectAll( '.object' )
				.attr( 'width', width );
			
			// Resize all events.
			schedule.selectAll( '.event' )
				.attr( 'x', function( datum ) { return timeScale( dateFormat.parse( datum[ propertyNames.start ] ) ); } )
				.attr( 'width', function( datum ) { return timeScale( dateFormat.parse( datum[ propertyNames.end ] ) ) - timeScale( dateFormat.parse( datum[ propertyNames.start ] ) ); } );
		}
	}
	
	// Subscribe to events.
	Events.subscribe( 'objects:updated', function () {
		// Set start time from objects if not set in JSON.
		if ( startTime === undefined ) {
			startTime = d3.min( objects, function( datum ) {
				return d3.min( datum[ propertyNames.events ], function( event ) {
					return dateFormat.parse( event[ propertyNames.start ] );
				} );
			} );
		}
		
		// Set end time from objects if not set in JSON.
		if ( endTime === undefined ) {
			endTime = d3.max( objects, function( datum ) {
				return d3.max( datum[ propertyNames.events ], function( event ) {
					return dateFormat.parse( event[ propertyNames.end ] );
				} );
			} );
		}
		
		// Setup timescale.
		timeScale = d3.time.scale()
			.domain( [ startTime, endTime ] )
			.range( [ paddingLeft, width ] );
		
		// Set height of schedule.
		height = rowHeight * objects.length;
		
		// Render events.
		visualize();
	} );
	
	// Return object to allow access to functions.
	return D3Schedule;
} );