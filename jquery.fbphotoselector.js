/* Facebook Photo Selector */
(function($) {
  	
	$.fn.fbphotoselector = function(options) {
		
		var opts = $.extend({}, $.fn.fbphotoselector.defaults, options);
	
    	return this.each(function() {
    		
    		// the slected element to add the options
    		var container = $(this);
    		
    		// see if we are logged into facebook
			FB.getLoginStatus(function(response) {
			
				// if we are logged in go to the selector
 				if(response.status === 'connected') {
			   		displaySelector(response.authResponse.accessToken);
			   		
			   	// if we are not logged in add a login with facebook link
 			 	} else {
 			 		container.html("<a class='facebookLogin' href=''>Login with facebook</a>");
 			 		$('.facebookLogin').click(function() {

 			 			// ask for permissions to access photos
 			 			FB.login(function(response) {
  							if (response.authResponse) {
  								
  								// once logged in show the photo selector
  								displaySelector(response.authResponse.accessToken);
  							}
  						}, {scope: 'user_photos'});
 						return false;
					});
			 	}
 			});
			
			// function displaying the photo selector
			function displaySelector(sessionToken) {
				
				// add the loading text to the element
				container.html(opts.loadingText);
				
				// query facebook for the users photo albums
				FB.api('/me/albums?limit=0', function(response) {    
				
				    // list albums
				    var ulAlbums = "<ul class='fbAlbums'>";			
				    var albums = response.data;
				    var nbAlbums = albums.length;
					
						// set the albums per page according to the options
					    if(opts.albumsByPage > 0 && opts.albumsByPage < albums.length) {
					    	var nbPages = Math.ceil(albums.length / opts.albumsByPage);
					    	nbAlbums = opts.albumsByPage;
					    }
					    
					    // loop through the albums and add them to the list
					    for(var i=0, l= nbAlbums ; i<l; i++){
					    	var album = albums[i];
					    	ulAlbums = ulAlbums + displayAlbum(album, sessionToken);	
					    }
					    
				    ulAlbums = ulAlbums + "</ul>";
				    
				    // create the output, adding a breadcrumb
				    var output = '';
				    if(opts.breadcrumb === true) {
				        output = "<nav class='breadcrumb'>Albums</nav>";
				    }
				    output = output + ulAlbums;
				    
				    // add the pagination if we have more albums
				    if(opts.albumsByPage > 0 && opts.albumsByPage < albums.length) {
				    	var pagination = "<nav class='pagination'><ul>";
				    		
				    		// create a link for each page of albums
					    	for (var i=0, l= nbPages ; i<l; i++){
					    		numPage = i+1;
					    		pagination = pagination + "<li><a ";
					    		if(numPage == 1) {
					    			pagination = pagination + "class='current'";
					    		}
					    		pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
					    	}
					    
				    	pagination = pagination + "</ul></nav>";
				    	
				    	// add pagination to the output
						output = output + pagination;
					}
				    
				    // update the container with the content
				    container.html(output);
				    
				    // album pagination click function
				    $(".pagination ul li a").click(function() {
				    	
				    	// update the current class
				    	$(".pagination ul li a").removeClass('current');
				    	$(this).addClass('current');
				    	
				    	// grab the albums jumping for the relevant page
				        var numPage = $(this).html();
				        var start = opts.albumsByPage * (numPage - 1);
				        var ulAlbums = "";
				        for (var i=start, l=(start + opts.albumsByPage)  ; i<l; i++){
				        	var album = albums[i];
				        	if(album !== undefined) {
				        		ulAlbums = ulAlbums + displayAlbum(album, sessionToken);
				        	}
				        }
				        
				        // udate the ul with the list items
				        $('ul.fbAlbums',container).html(ulAlbums);
				        
				        // if they have clicked an album
				    	$('.albumLink', container).click(function() {
				    		albumLinkClick($(this));
						});
						
				    });
				    
				    // when an album is clicked
				    var albumLinkClick = function(elem) {
				    	
				    	// get the album name
						var albumName = $('p', elem).html();
						
						// update the container with loading text
						container.html(opts.loadingText);
						
				    	// get the albums photos
				    	FB.api('/' + elem.data('id') + '/photos?limit=0', function(response) {
				    	
				    		// get the data
				    		var photos = response.data;
				    		var nbPhotos = photos.length;

				    		// create the list of photos
				    		var ulPhotos = "<ul class='fbPhotos'>";
				    		
				    			// set the photos per page according to the options
					    		if(opts.photosByPage > 0 && opts.photosByPage < photos.length) {
					    		    var nbPages = Math.ceil(photos.length / opts.photosByPage);
					    		    nbPhotos = opts.photosByPage;
					    		}
					    		
					    		// loop through the albums and add them to the list
					    		for (var i=0, l=nbPhotos; i<l; i++){
					    			var photo = photos[i];
					    			ulPhotos = ulPhotos + displayPhoto(photo, sessionToken);
					    		}
					    		
				    		ulPhotos = ulPhotos + "</ul>";
					    	
					    	// create the output, adding a breadcrumb
					    	var output = '';
				    		if(opts.breadcrumb === true) {
				    			output = "<nav class='breadcrumb'><a class='albumBack' href='javascript:void(0);'>Albums</a> > " + albumName + "</nav>";
				    		}
				    		
				    		// add a back button
							var backButton = "<a class='btn btnBack' href='javascript:void(0);'>" + opts.backText + "</a>";
				    		if(opts.backButtonOnTop === true) {
				    			output = output + backButton; 
				    		}
				    		
				    		// add the photos to the output
				    		output = output + ulPhotos;
				    		
				    		// add the pagination to the output
				    		if(opts.photosByPage > 0 && opts.photosByPage < photos.length) {
				    			
				    			// create a link for each page of photos
				    			var pagination = "<nav class='pagination'><ul>";
					    			for (var i=0, l= nbPages ; i<l; i++){
					    				numPage = i+1;
					    				pagination = pagination + "<li><a ";
					    				if(numPage == 1) {
					    					pagination = pagination + "class='current'";
					    				}
					    				pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
					    			}				    	
				    			pagination = pagination + "</ul></nav>";
								output = output + pagination;
								
							}
				    		
				    		// add a back button to the list bottom
				    		if(opts.backButtonOnBottom === true) {
				    			output = output + backButton; 
				    		}
				    		
				    		// update the container with the output
				    		container.html(output);
				    		
				    		// album pagination click function
				    		$(".pagination ul li a").click(function() {
				    			
				    			// update the current page class
				    			$(".pagination ul li a").removeClass('current');
				    			$(this).addClass('current');
				    			
				    			// grab the photos jumping for the relevant page
				    		    var numPage = $(this).html();
				    		    var start = opts.photosByPage * (numPage - 1);
				    		    var ulPhotos = "";
				    		    for (var i=start, l=(start + opts.photosByPage)  ; i<l; i++){
				    		    	var photo = photos[i];
				    		    	if(photo !== undefined) {
				    		    		ulPhotos = ulPhotos + displayPhoto(photo, sessionToken);
				    		    	}
				    		    }
				    		    
				    		    // update the container with the content
				    		    $('ul.fbPhotos',container).html(ulPhotos);
				    		    
				    		    // set up the photo click event
				    			$('.photoLink', container).click(function() {
				    				photoLinkClick($(this));
								});
				    		});
				    		
				    		// handle the back button action
				    		$('.albumBack, .btnBack', container).click(function(){
				    			displaySelector(sessionToken);
				    		});
				    		
				    		// add the photo clicked action
				    		var photoLinkClick = function(elem) {
				    			var data = {
				    			    'id' : elem.data('id'),
				    			    'image' : elem.data('image'),
				    			    'thumbnail' : elem.data('thumbnail')
				    			}
				    			opts.onSelect(data);
				    		}
				    		
				    		// set up the photo click event
				    		$('.photoLink', container).click(function(){
				    			photoLinkClick($(this));
				    		});
				    		
				    	});	
				    };
				    
				    // set up the album click event
				    $('.albumLink', container).click(function() {
				    	albumLinkClick($(this));
					});
				});
			}
			// End of displaySelector()
			
			// function to display a li album item
			function displayAlbum (album, sessionToken) {
				
				var ulAlbums = "";
				ulAlbums = ulAlbums + "<li>";
					ulAlbums = ulAlbums + "<a href='javascript:void(0);' data-id='"+album.id+"' class='albumLink'>";
						ulAlbums = ulAlbums + "<img src='https://graph.facebook.com/" + album.cover_photo + "/picture?type=" + opts.sizeAlbum + "&access_token=" + sessionToken + "'>";
						ulAlbums = ulAlbums + "<p>" + album.name + "</p>";
					ulAlbums = ulAlbums + "</a>";
				ulAlbums = ulAlbums + "</li>";
				
				return ulAlbums;
			}
			
			// function to display a li photo item 
			function displayPhoto (photo, sessionToken) {
				
				var ulPhotos = "";
				ulPhotos = ulPhotos + "<li>";
					ulPhotos = ulPhotos + "<a href='javascript:void(0);' data-id='" + photo.id + "' data-image='https://graph.facebook.com/" + photo.id + "/picture?type=normal&access_token=" + sessionToken + "' data-thumbnail='https://graph.facebook.com/" + photo.id + "/picture?type=thumbnail&access_token=" + sessionToken + "' class='photoLink'>";
						ulPhotos = ulPhotos + "<img src='https://graph.facebook.com/" + photo.id + "/picture?type=" + opts.sizePhoto + "&access_token=" + sessionToken + "'>";
					ulPhotos = ulPhotos + "</a>";
				ulPhotos = ulPhotos + "</li>";
				
				return ulPhotos;
			}
			
    	});
  	}
  	
  	// default configuration
  	$.fn.fbphotoselector.defaults = { 
  		breadcrumb: true, 
  		backButtonOnTop: false, 
  		backButtonOnBottom: true, 
  		sizeAlbum: 'thumbnail', 
  		sizePhoto: 'thumbnail', 
  		loadingText: 'Loading...', 
  		backText: 'Back',
  		albumsByPage: 0,
  		photosByPage: 0,
  		onSelect: function(data) {
  			var display = 'Id: ' + data.id + '\n\nLink image: ' + data.image + '\n\nLink thumbnail: ' + data.thumbnail;
  		}
  	}

})(jQuery);