/*
	General JS functions for Paathshaala
*/

/* Read a page's GET URL variables and return them as an associative array. */
/* Example implementation : var cid = getUrlVars()['id']; */

/*
	Known bugs :
		Rewrite validate
		Rewrite storyBox()
*/



function getUrlVars() {
	var i =0, vars = [], hash, hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

/* Supplant */
if(typeof String.prototype.supplant !== 'function') {
	String.prototype.supplant = function(o) {
		return this.replace(/{([^{}]*)}/g,
			function (a,b) {
				var r = o[b];
				return typeof r === 'string' ?
					r : a;
			});
	};
}
/*
Object.prototype.allTrue = function() {
	var i = 0;
	for (i in this) {
		if(this.hasOwnProperty(i)) {
			if(!this[i]) return false;
		}
	}
	return true;
}*/

var Paathshaala = {
	activePage : 1,
	hashTag : function(elem) {
			var data = $(elem).html(),
				reg = /#(\w{1,})/g,
				res = data.match(reg),
				len = res.length;
			for( var i =0; i < len ; i = i+1) {
				data = data.replace( res[i],'<a href=search.php?tag=' + res[i] + '>' + res[i] + '</a>' );
			}
			$(elem).html(data);
		},
	showFeedback : function() {
			grayOut(true);
			$('div#feedback').show()
			$('div#feedback').load('feedback.html');
		},
	hideFeedback : function () {
			grayOut(false);
			$('div#feedback').hide();
		},
	showEditProfile: function () {
			grayOut(true);
			$('div#editProfile').load('editprofile.html').fadeIn("slow");
		},
	hideEditProfile : function() {
			$('#editProfile').fadeOut("fast");
			grayOut(false);
		},
	searchBox : function() {
			$(".searchBox").
				focus(function () {
					$(this).animate({width: '380px'} , 250 , '' , function () {})
				}).
				focusout(function () {
					$(this).animate({width: '270px'} , 150 , '' , function () {});
				});
		},
	dashBoard : function() {
			var dashShown = 0,loginShown = 0,joinShown = 0;
			$("div.loggedUser").
				click(function(){
					if (! dashShown) {
						$('.dashBoard').slideToggle('fast');
						dashShown = 1;
						$("#logChangeButton").attr('src', 'pics/up.png');
					} else {
						$('.dashBoard').slideToggle('fast');
						dashShown = 0;
						$("#logChangeButton").attr('src', 'pics/down.png');
					}
				});
		$("li#showlogin").
			click(function(){
				if (loginShown === 0 ) {
					$('form.login').slideToggle('fast');
					$('form.join').slideUp('fast');
					loginShown = 1;
					joinShown = 0;
					$("#logChangeButton").attr('src', 'pics/up.png');
				} else {
					$('.login').slideToggle('fast');
					loginShown = 0;
					$("#logChangeButton").attr('src', 'pics/down.png');
				}
			});
		$("li#showJoin").
			click(function() {
				if (! joinShown) {
					$('.join').slideToggle('fast');
					$('.login').slideUp('fast');
					joinShown = 1;
					loginShown = 0;
					$("#logChangeButton").attr('src', 'pics/up.png');
				} else {
					$('.join').slideToggle('fast');
					joinShown = 0;
					$("#logChangeButton").attr('src', 'pics/down.png');
				}
			});
		},
	imageError : function() {
			$('img#loggedImage').error(function(){
				$(this).attr('src','pics/default.png');
			});
			$('div#snapShot img').error(function(){
				$(this).attr('src','pics/profile.png');
			});
		},
	comments : function() {
			/* Submit comment using an enter key press */
			$('#comment').keypress(function(event) {
				if (event.which == '13') {
					event.preventDefault();
					subComment();
				}
			});
			/*	Need the jkey plugin
				New line in comment using a down key press */
			$('#comment').jkey('down',function(){
				var comBox =$('#comment');
				data = comBox.attr('value') + '\n';
				comBox.attr('value' , data);
			});
			/* Handle height of comment box */
			var commbox = $('textarea#comment').parent().parent().parent(), ht = commbox.height();
			$('textarea#comment').keyup( function() {
				var len = $('#comment').attr('value').length;
				var lineno = Math.floor( Number(len) / 40 );
				$(this).attr('rows' , lineno + 2)
				commbox.height(ht + (14 * lineno) );
			});
		},
	Search : function (q,tag,p) {
		/*
			@params:
				q : query
				tag : tag search
				p : page number.
		*/
			var myobj, link, video, searchDiv = $('#findStuff');
			if ( q === '' || tag === '') { /* Disables empty queries */
				$('#findStuff').append(Paathshaala.templates.blankQuery);
				$('div#next, div#ShowNext').remove();
				return;
			}
			link = ( tag === undefined )
				? link = 'json/search.json.php?q=' + q + '&p=' + p
				: link = 'json/tagsearch.json.php?tag=' + tag + '&p=' + p

			$("#loading").show();
			$.getJSON( link, function(json) {
				if (json == '' ) { /* Nothing returned from query => last page */
					if (Paathshaala.activePage === 1)
						$('#findStuff').append(Paathshaala.templates.noResults);
					else 
						$('#findStuff').append(Paathshaala.templates.noMore);
					$('div#next, div#ShowNext').remove();
				}
				for (i in json){
					myobj = json[i];
					video = Paathshaala.templates.searchVid.supplant(myobj);
					searchDiv.append(video);
				}
			}).complete(function(){
				$("time.timeago").timeago();
			});
			$("#loading").fadeOut('slow');
		},
		getVideo: function(cid) {
			/* @params:	cid:contentid of the video to be played */
			var updateLikeBox = function(st) {
				var likeBox = $('span#likes');
				switch (st) {
					 case '1': likeBox.html(Paathshaala.templates.likes.liked); break;
					 case '-1': likeBox.html(Paathshaala.templates.likes.disliked); break;
					 case '2': likeBox.html(Paathshaala.templates.likes.loggedOut); break;
					 case '0': likeBox.html(Paathshaala.templates.likes.def); break;
					 default: likeBox.html(Paathshaala.templates.likes.error); break;
				}
				$('span#likeButton').click(function() {
					var status = $(this).parent().attr("id"),
						value = $(this).attr("data");
					if (status !== 'likesLiked' ) {
						$.post("response/savelikes.php", { cid: cid, value: value } );
						updateLikeBox('1');
					}
				});
				$('span#dislikeButton').click(function() {
					var status = $(this).parent().attr("id"),
						value = $(this).attr("data");
					if (status !== 'likesDisliked' ) {
						$.post("response/savelikes.php", { cid: cid, value: value } );
						updateLikeBox('-1');
					}
				});
			}, link, videoBox = $('div.videodiv'), tags;

			if(cid === undefined ) {
				cid = 'newvideo';
				link = 'json/getnewvideo.json.php';
			} else {
				link = 'json/video.json.php?video=' + cid;
			}

			$.getJSON( link, function(myobj) {
				myobj.tagString ="";
				var i = 0, video;
				if ( cid === 'newvideo' ) {
					myobj.tags = ['Enter new tags for the video'];
				}
				if (myobj.path) {
					tags = myobj.tags;
					for( i =0; i< tags.length; i+=1 ) {
						if (tags[i]) {
							myobj.tagString = myobj.tagString + "<li><a href='search.php?tag=" + tags[i]+ "'>" + tags[i] + "</a></li>";
						}
					}
					if ( myobj.sid) {
						myobj.series = Paathshaala.templates.series.supplant(myobj);
					} else {
						myobj.series = '';
					}
					myobj.likestatus = String(myobj.likestatus);
					video = Paathshaala.templates.video.supplant(myobj);
				} else {
					video = "Sorry, video not found :(";
					$('div.commentBox , span.smallSubtitle , div.commentWarp').hide();
				}
				videoBox.html(video);
			}).complete(function(){
				VideoJS.setupAllWhenReady();
				if ( cid !== 'newvideo' ) {
					var defStatus = $('span#likes').attr('defStatus');
					updateLikeBox(defStatus); /* Update to def status */
					$('img#downloadButton.VideoBarButton').click(function(){
						alert('Please right click on the video and save the video while being played');
					});
				} else {
						$('div.videoBar').html("<div style='text-align:center;'>Thanks for adding a new video to paathshaala</div>");
						$('span.videoTitle').html("Enter a new title for your video");
						$('div.VideoDesc').html("Description please")
				}
			});
	},
	updateStoryBox : function (type) {
			/*
				type : Featured/ Top Rated / Popular...
				All box layout updated with same code.
				New ui needed for upload video trigger
			*/
			var videoBox = function (myobj) {
							if( myobj.fullname.length > 18 )
								myobj.fullname = myobj.fullname.slice(0 ,15 ) + '...';
							return Paathshaala.templates.box.supplant(myobj);
						},
				link,
				title = $("<span>").addClass('groupTitle'), 
				more = $("<span>").addClass('more').html("Show more"),
				less = $("<span>").addClass('less').html("Show less");
			title = title.html(type);
			switch (type) {
				case 'Featured' :
					link = 'json/featured.json.php';
					break;
				case 'Top Rated' :
					link = 'json/toprated.json.php';
					break;
				case 'Popular':
					link = 'json/popular.json.php';
					break;
				case 'Liked videos':
					link = 'json/uservideolikes.json.php';
					break;
				case 'Disliked videos':
					link = 'json/uservideodislikes.json.php';
					break;
				case 'My Uploads':
					link = 'json/uservideouploads.json.php';
					break;
			}

			$.getJSON( link , function(json) {
				var i,
					groupBox  = $("<div>").addClass('groupBox'),
					groupBox2 = $("<div>").addClass('Hidden').addClass('groupBox');
				if (json.length === 4 ) {
					for (i =0; i <4 ; i +=1)
						groupBox = groupBox.append(videoBox(json[i]));
					$('div#container').append(title).append(groupBox);
				} else { /* All multi boxes handled in same way if more than 4 */
					for (i =0; i <4 ; i +=1)
						groupBox = groupBox.append(videoBox(json[i]));
					for (i =4; i < json.length ; i +=1)
						groupBox2 = groupBox2.append(videoBox(json[i]));
					$('div#container').append($("<div>").append(title , groupBox , more , groupBox2 , less));
				}
			}).complete(function(){

				$('img.metaImage').error(function(){
					$(this).attr('src','pics/default.png');
				});
				$('img.thumbnail').error(function(){
					$(this).attr('src','pics/error.png');
				});

				$('span.more').click(function(){
					$(this).hide().parent().find('.Hidden').slideDown('fast').parent().find('.less').fadeIn();
				});
				$('span.less').click(function(){
					$(this).parent().find('.Hidden').slideUp('fast').parent().find('.more').fadeIn().hide();
				});
			});
		},
	quirks : function(){ /* Stuff which i cant put anywhere else. Cant pollute the global object, hence this is here */
			$('img#bugButton.VideoBarButton, img.feedbackDock').click(function(){
				Paathshaala.showFeedback();
			});
			$('span.news').click(function(){
				$('div#indexMesssage').fadeOut("fast");
			});
		}
};

Paathshaala.templates = {
		video : "<span class='videoTitle'>{title}</span><br/><span class='videoUser'> Video by : {uname} </span><!-- Begin VideoJS --><div class='video-js-box'><video cid={cid} poster='{poster}' class='video-js' controls preload height=325 width=550><source src='{path}' type='video/ogg; codecs=\"theora, vorbis\"' /></video></div><!-- End VideoJS --><!-- video bar --><div class='videoBar'><img src='pics/vidbar/watch.png' class='VideoBarButton' /><span class='videoBarElement' id='playCount'>Views:{viewcount}</span><span id='likes' defStatus='{likestatus}' >{likestatus}</span><img src='pics/vidbar/download.png' title='Download' class='VideoBarButton' style='float:right;' id='downloadButton' /></div><!-- /video bar --><img src='pics/vidbar/tag.png' title='tags' style='margin-left:6px;'/><ul class='tags'>{tagString}</ul>{series}<div class='VideoDesc'>{desc}</div>",

		box : "<div class='storyBox'><a href=\"video.php?video={cid}\"><div class='imageBox'><img src={poster} class='thumbnail'/><div class='metaInfo'>{title}</div></div> </a><div class='metaBox'><div class='metaUser'><img src='{userpic}' class='metaImage' /> <span class='metaName' >{fullname}</span></div><div class='metaViews'>{viewcount}</div></div></div>",

		series : "<div class='series'><img src='pics/series.png'/><span>This video #{order} of <a href=\"search.php?sid={sid}\"><span id='sName'>{sname}</span></a> </span></div>",

		searchVid : "<div class='relatedVideo'><a href='video.php?video={cid}' title='{title}' ><div class='relatedVideoImage' > <img src={poster} class='fitin' /></div><div class='relatedVideoContent'> <span class='sideTitle'>{title}</span></a><br />By, <span class='sideUploader'>{fullname}</span>" +"<time class='timeago' datetime={timestamp}></time><br/>Watched {viewcount} times</div></div>",

		likes : {
			def : "<span id='likesDefault'><span id='likeButton' data='1' title='like this'><img src='pics/vidbar/plus.png' class='VideoBarButton' /><span>like this</span></span><span id='dislikeButton' data='-1' title='dislike this'><img src='pics/vidbar/minus.png' class='VideoBarButton'/>dislike this.<span></span>",
			liked : "<span id='likesLiked'><span id='likeButton' data='1' title='You like this' style='opacity:0.5'><img src='pics/vidbar/plus.png'	class='VideoBarButton' /><span>You like this</span></span><span id='dislikeButton' data='-1' title='dislike this'><img src='pics/vidbar/minus.png'	class='VideoBarButton' />dislike this.</span></span>",
			disliked : "<span id='likesDisliked'><span id='likeButton' data='1' title='like this'><img src='pics/vidbar/plus.png'	class='VideoBarButton' /><span>like this</span></span><span id='dislikeButton' data='-1' title='You dislike this' style='opacity:0.5'><img src='pics/vidbar/minus.png' class='VideoBarButton'/>You dislike this.</span></span>",
			error : "<span id='likesDisliked' style='margin:0px 5px;'>Something went wrong.</span>",
			loggedOut : "<span id='likesDisliked' style='margin:0px 5px;'>Login to like content</span>"
		},
		blankQuery : "<span style='margin:25px auto'>Enter your keyword to search. You cant run blank queries </span>",
		noResults : "<span style='margin:25px auto'>Sorry no results found. Try for something like <a style='color:#1F456B' href='search.php?tag=physics'>physics</a>, <a style='color:#1F456B' href='search.php?tag=computer'>computers</a> or <a style='color:#1F456B' href='search.php?tag=ted'>ted</a>.</span>",
		noMore :"<span style='margin:25px auto'>No more results found.</span>"
}



/*	Generic actions 
	Looks like modules. Need to learn more about this
	At one point i may be able to call only whats needed and improve page performance.
	Eg: call Paathshaala.comments(); only in the video page after DOM load
*/ 

$(document).ready(function(){
	Paathshaala.searchBox();
	Paathshaala.dashBoard();
	Paathshaala.imageError();
	Paathshaala.comments();
	Paathshaala.quirks();
});

function validateJoin() {
	"use strict";
	var input, data, id, i,
		joinMessage = $('div.joinMessage'),
		verified = {
			fname :		false,
			username :	false,
			email :		false,
			roll :		false,
			pass1 :		false,
			pass2 :		false
		},
		msg = {
			fname : {
				valid : 'Hello ' /* full name */,
				invalid: 'Enter a valid full name'
			},
			username : {
				valid : 'Username available' ,
				invalid: {
					regEx : 'Too short',
					ajax : 'This username is not available'
				}
			},
			email : {
				valid : 'Thanks, we wont spam you !' ,
				invalid: {
					regEx : 'Enter a valid email',
					ajax : 'This email is not available'
				}
			},
			roll : {
				valid : 'Seems like a valid NITC roll' ,
				invalid: {
					regEx : 'Enter a valid NITC roll',
					ajax : 'This NITC roll is not available'
				}
			},
			pass1 : {
				valid : 'Secure password' ,
				invalid: {
					regEx : 'Enter a secure password'
				}
			},
			pass2 : {
				valid : 'Password matches',
				invalid: {
					regEx : 'Enter the same password'
				}
			}
		},
		regEx = {
			fname :		/[\w\s]{5,}/ ,
			username :	/.{3,}/ ,
			email :		/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/ ,
			roll :		/^[bmpBMP]+[01]\d[01]\d{3}[a-zA-Z][a-zA-z]/ ,
			pass1 :		/.{6}/,
			pass2 :		/.{6}/
		};

	function getRegEx(Obj,id) {
		return Obj[id];
	}

	function ok(id) {
		joinMessage.text(msg[id].valid);
		verified[id] = data;
		$('input#' + id).next('img').attr('src','pics/verified.png');
	}

	function bug(id,type) {
		joinMessage.text(msg[id].invalid[type]);
		verified[id] = false;
		$('input#' + id).next('img').attr('src','pics/cross.png');
	}

	function val(element) {
		input = $(element);
		data = input.attr('value');
		id = input.attr('id');

		switch (id) {
			case 'fname' :
				ok(id);
				break;
			case 'pass1' :
				if(getRegEx(regEx, id).test(data))
					ok(id);
				else
					bug(id,'regEx');
				break;
			case 'pass2' :
				if(data === verified['pass1'] && verified['pass1'] != false)
					ok(id);
				else
					bug(id,'regEx');
				break;
			case 'username' :
			case 'email' :
			case 'roll' :
				if(getRegEx(regEx, id).test(data)) {
					ok(id);
					$.getJSON('response/checkreg.php?' + id + '=' + data, function(response) {
						if(response.status === 1 ) {
							bug(id,'ajax');
						} 
					});
				} else
					bug(id,'regEx');
				break;
			default :
				joinMessage.text("Unknown feild");
		}
	}

	$("form.join input").keyup(function(){
			$(this).next('img').attr('src','pics/tinyload.gif');
			val(this);
		}).focusout(function(){
			$(this).next('img').attr('src','pics/tinyload.gif');
			val(this);
		});

	$('button#joinButton').click(function(){
		for (i in verified ) {
			if (verified[i] === false )
				return;
		}

		$.getJSON( 'response/join.php' , verified , function(response) {
			if(response.status) {
				$('form.join').html("Join Succsessful :)<br/>Now please login with the new username and password").height(70);
				setTimeout(function(){
					$('li#showlogin').trigger('click');
				},1000);
			} else {
				$('form.join').html("Somewhere something went wrong");
			}
		});
	});
}

validateJoin();


