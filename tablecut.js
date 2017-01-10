$(function() {
	var resizeTimer, parentWidth, tableWidth, colspanowner;
	var $tables = $( '.e-table' );

	$(window).on('resize', function( e ) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			resizeaction()
  		}, 50);
	});

	/*
	 * attach table object to table element
	 * required to handle colspans
	 */
	var createTablesets = function() {
		$tables.each(function() {
			var table = [];

			$( this ).find( 'tr' ).each(function() {
				var row = [];

				$( this ).find( 'td, th' ).each(function() {
					for( i=0; i<getcolspan( this ); i++ ) {
						if( i == 0 ) {
							parent = this;
						}

						row.push({
							dom: this,
							parent: parent,
							visible: true
						});
					}
				});

				// push in reverse order to rescue cells with colspan in tablecut
				table.push( row.reverse() );
			});

			console.log( table );
			$( this ).data( 'tableset', table );
		});
	}

	/*
	 * loop over all tables after resize and call table cutter
	 */
	var resizeaction = function() {
		$tables.each(function() {
			if($( this ).data( 'tableset' ) == undefined) {
				createTablesets();
			}

			tablecut( this );
		});
	}

	/*
	 * cut table cells if we are getting too wide
	 */
	var tablecut = function( table, levelParam ) {
		var $table   = $( table );
		var tableset = $table.data( 'tableset' );
		var columns  = tableset[0].length;
		var level    = (levelParam == undefined ? 0 : levelParam);

		// escape if slim enough and nothing is hidden
		if(!istoobig( $table ) && $table.find( '.hidden' ).length < 1 ) {
			return false;
		}

		// escape before hiding last column
		if( level >= columns ) {
			return false;
		}

		// hide all columns which are higher as level
		$( tableset ).each(function() {
			$( this ).each(function( key, val ) {
				if(key >= level) {
					show( this );
				} else {
					hide( this );
				}
			});
		});

		// still too wide? try again!
		if(istoobig( $table )) tablecut( $table, ++level);
	}

	/*
	 * returns colspan as integer
	 */
 	var getcolspan = function( $cell ) {
 		return parseInt( ($( $cell ).attr( 'colspan' ) == undefined ? 1 : $( $cell ).attr( 'colspan' )) );
 	}

	/*
	 * set outer width of given element and its parent inner width
	 */
	var istoobig = function( $table ) {
		parentWidth = $( $table ).parent().innerWidth();
		tableWidth  = $( $table ).outerWidth();

		if(tableWidth > parentWidth) {
			return true;
		}
	}

	/*
	 * add class to hide cell
	 */
	var hide = function( cell ) {
		$( cell.dom ).addClass( 'hidden' );
		if( cell.visible ) {
			$( cell.parent ).attr( 'colspan', ( getcolspan( cell.parent ) - 1 ) );
			cell.visible = false;
		}
	}

	/*
	 * remove class to hide cell
	 */
	var show = function( cell ) {
		$( cell.dom ).removeClass( 'hidden' );
		if( !cell.visible ) {
			$( cell.parent ).attr( 'colspan', ( getcolspan( cell.parent ) + 1 ) );
			cell.visible = true;
		}
	}

	resizeaction();
});