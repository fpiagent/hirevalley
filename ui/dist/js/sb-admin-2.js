$(function() {
	var candidates;
	var selectedCandidate;
	
	var populateForm = (function() {
		return function(td) {
			$('#tabs-2 input#c-first-name').val(
					$(td).find('td:nth-child(2)').html());
			$('#tabs-2 input#c-last-name').val(
					$(td).find('td:nth-child(3)').html());
			$('#tabs-2 input#c-email').val(
					$(td).find('td:nth-child(4) a').html());
			$('#tabs-2 select#c-position').val(
					$(td).find('td:nth-child(9)').html());
			$('#tabs-2 input#c-phone')
					.val($(td).find('td:nth-child(5)').html());
			$('#tabs-2 input#c-origin').val(
					$(td).find('td:nth-child(10)').html());
			$('#tabs-2 input#c-quiz-user').val(selectedCandidate.interview.quiz_interview.classmarker_user);
			$('#tabs-2 input#c-quiz-pass').val(selectedCandidate.interview.quiz_interview.classmarker_password);
		}
	})();
	
	var populateInterviewReview = (function() {
		return function(td) {
			$("#tab1 p.fa").fadeTo("fast", 0.5);
			
			//Resume SECTION
			$("#tab1 #c-resume-status").prop( "checked", selectedCandidate.interview.resume_review.processed);
			if(selectedCandidate.interview.resume_review.like) {
				$("#tab1 #c-resume-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 1.0);
				$("#tab1 #c-resume-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 0.2);
			} else {
				$("#tab1 #c-resume-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 0.2);
				$("#tab1 #c-resume-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 1.0);
			}
			$("#tab1 #c-resume-status").parent().parent().find('textarea').val(selectedCandidate.interview.resume_review.comments);
			
			//Quiz SECTION
			$("#tab1 #c-quiz-status").prop( "checked", selectedCandidate.interview.quiz_interview.processed);
			if(!selectedCandidate.interview.quiz_interview.score) {
				if(selectedCandidate.interview.quiz_interview.mail_sent) {
					//Just show Date
					$("#tab1 #c-quiz-status").parent().parent().find('div').html('Quiz Not Completed, Date Sent: ' + selectedCandidate.interview.quiz_interview.date_sent);
				} else {
					var emailBody = "Hi%20[user_first_name],%0D%0A%0D%0AI'm%20contacting%20you%20on%20behalf%20of%20[company_name],%20your%20profile%20might%20be%20suitable%20for%20an%20open%20position%20we%20have.%0D%0ACan%20you%20please%20complete%20the%20following%20online%20quiz%20and%20practical%20exercise?%0D%0A%0D%0AAccess%20[quiz_url]%20and%20login%20using:%0D%0AUser:[quiz_user]%0D%0APass:[quiz_pass]%0D%0A%0D%0AThanks%20%26%20Regards";
					emailBody = emailBody.replace(/\[user_first_name\]/, selectedCandidate.first_name);
					emailBody = emailBody.replace(/\[company_name\]/, "Cognizant");
					emailBody = emailBody.replace(/\[quiz_url\]/, "http://www.classmarker.com/");
					emailBody = emailBody.replace(/\[quiz_user\]/, selectedCandidate.interview.quiz_interview.classmarker_user);
					emailBody = emailBody.replace(/\[quiz_pass\]/, selectedCandidate.interview.quiz_interview.classmarker_password);
					//Send Email Link
					$("#tab1 #c-quiz-status").parent().parent().find('div').html('<a href="mailto:' + selectedCandidate.email + '?subject=Interview%20Quiz&body=' + emailBody + '" >Send Quiz To Candidate</a>');
				}
			} else {
				//Just Show Percentage and link to classmarker
				$("#tab1 #c-quiz-status").parent().parent().find('div').html('Quiz Result: ' + selectedCandidate.interview.quiz_interview.score + '<br><a href="http://www.classmarker.com/" target="_blank">Link to Details</a>');
			}
			 
			//Phone SECTION
			$("#tab1 #c-phone-status").prop( "checked", selectedCandidate.interview.phone_interview.processed);
			if(selectedCandidate.interview.phone_interview.like) {
				$("#tab1 #c-phone-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 1.0);
				$("#tab1 #c-phone-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 0.2);
			} else {
				$("#tab1 #c-phone-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 0.2);
				$("#tab1 #c-phone-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 1.0);
			}
			$("#tab1 #c-phone-status").parent().parent().find('textarea').val(selectedCandidate.interview.phone_interview.comments);
			
			
			//In-Person SECTIOn
			$("#tab1 #c-inperson-status").prop( "checked", selectedCandidate.interview.onsite_interview.processed);
			if(selectedCandidate.interview.onsite_interview.like) {
				$("#tab1 #c-inperson-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 1.0);
				$("#tab1 #c-inperson-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 0.2);
			} else {
				$("#tab1 #c-inperson-status").parent().parent().find('.fa-thumbs-o-up').fadeTo("slow", 0.2);
				$("#tab1 #c-inperson-status").parent().parent().find('.fa-thumbs-o-down').fadeTo("slow", 1.0);
			}
			$("#tab1 #c-inperson-status").parent().parent().find('ul').html('');
			$(selectedCandidate.interview.onsite_interview.interviewers).each(function(index, row) {
				$("#tab1 #c-inperson-status").parent().parent().find('ul').append('<li><p>' + row.name + '</p><div class="form-group"><div><i>' + row.comments + '</i></div></div></li>');
			});
		};
	})();
	
	var populateHistory = (function() {
		return function(td) {
			
			$('table#historyTable').DataTable().clear().draw();
			$.ajax({url:"/api/history/" + selectedCandidate.email , success: function(resp) {
				$(resp.entries).each(function(index, row) {
					
					var changes = 'Initial Submit';
					if(row.changes != null && row.changes[0].path != undefined) {
						changes = '';
						$(row.changes).each(function(i,r) {
							changes = changes + JSON.stringify(r.path).replace(/\[|\]|\"/g, '') + '<br>\'' + r.lhs + "' to '" + r.rhs + '\'<br>';
						});
					} else if(row.changes == null) {
						changes = 'No Changes';
					}
					
					$("table#historyTable").DataTable().row.add([index,
					                                             row.date_update.substring(0,10),
					                                             row.user,
					                                             changes
					                                             ]).draw();
					
					});
				}
			});
		};
	})();
	
	var reloadTable = (function() {
		return function() {
			$.ajax({url:"/api/candidate", success: function(resp) {
				candidates = resp;
				$('table#dataTables-example').DataTable().clear().draw();
				$(resp).each(function(index, row) {
					
					var rowStatus = row.status + '<br>';
					if(row.interview.resume_review.processed) {
						rowStatus = rowStatus + '<p class="fa fa-file-text-o"></p>';
					}
					if(row.interview.quiz_interview.processed) {
						rowStatus = rowStatus + '<p class="fa fa-question"></p>';
					}
					if(row.interview.phone_interview.processed) {
						rowStatus = rowStatus + '<p class="fa fa-phone-square"></p>';
					} 
					if(row.interview.onsite_interview.processed) {
						rowStatus = rowStatus + '<p class="fa fa-users"></p>';
					}
					
					
					$("table#dataTables-example").DataTable().row.add([rowStatus,
					                                      row.first_name,
					                                      row.last_name,
					                                      '<a id="download-resume" href="mailto:' + row.email + '">' + row.email + '</a>',
					                                      row.phone,
					                                      row.last_updated.substring(0,10),
					                                      '<a href="' + row.resume_uri +'" download="' + row.first_name + '" >Download<br><p class="fa fa-cloud-download"></p></a>',
					                                      row.date_added.substring(0,10),
					                                      row.position,
					                                      row.source,
					                                      '<a id="remove-user" href="#">Remove<br><p class="fa fa-times-circle-o"></p></a>'
					                                      ]).draw();
					
					//TABLE EVENTS
					$(".dataTable_wrapper tbody tr").unbind('click');
					$(".dataTable_wrapper tbody tr")
							.click(
									function(event) {
										
										var td = $(this);
										//Select Candidate from candidates
										$(candidates).each(function(index, row){
											if(row._id == td.find('td:nth-child(4) a').html()) {
												selectedCandidate = row;
											}
											
										}) 
										
										// Configure Title
										$("#update .page-header").html(
												'Candidate: '
														+ td.find('td:nth-child(2)')
																.html()
														+ ' '
														+ td.find('td:nth-child(3)')
																.html());
										
										// Tab 1 -> Populate
										populateInterviewReview(td);

										// Tab 2 -> Populate Form
										populateForm(td);
										
										// Tab 3 -> Populate History
										populateHistory(td);

										
										// Open Dialog
										$("#update").dialog({
											draggable : true,
											width : 700,
											modal : true
										});

										$(".ui-dialog").css('top', '65px');
									});

					
					$("a#download-resume").unbind('click');
					$("a#download-resume").click(function() {
						alert("Downloading Resume...");
					});

					$("a#remove-user").unbind('click');
					$("a#remove-user")
							.click(
									function() {
										confirm("Are you sure you want to remove candidate? This is permanent.");
									});
				});
			}});
		};
	})();
	
	var tableToExcel = (function() {
		var uri = 'data:application/vnd.ms-excel;base64,', template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>', base64 = function(
				s) {
			return window.btoa(unescape(encodeURIComponent(s)))
		}, format = function(s, c) {
			return s.replace(/{(\w+)}/g, function(m, p) {
				return c[p];
			})
		}
		return function(table, name, filename) {
			if (!table.nodeType)
				table = document.getElementById(table)
			var ctx = {
				worksheet : name || 'Worksheet',
				table : table.innerHTML
			}

			document.getElementById("dlink").href = uri
					+ base64(format(template, ctx));
			document.getElementById("dlink").download = filename;
			document.getElementById("dlink").click();

		}
	})();

	$("#new").hide();
	$("#update").hide();
	$("#tabs").tabs();

	$("#tab1 p.fa").click(function(event) {
		$(event.target).fadeTo("slow" , 1);
		if($(event.target).hasClass("fa-thumbs-o-down")) {
			$(event.target).siblings(".fa-thumbs-o-up").fadeTo("slow", 0.2);
		} else {
			$(event.target).siblings(".fa-thumbs-o-down").fadeTo("slow", 0.2);
		}
	});

	$("#new_candidate").click(function() {
		$("#new #new-reset").trigger("click");
		
		$('form#new-form #c-quiz-user').val('stafftestuser');
		$('form#new-form #c-quiz-pass').val('y79aa4');
		
		$("#new").dialog({
			draggable : true,
			width : 700,
			modal : true
		});

		$(".ui-dialog").css('top', '65px');
	});

	$("#download-excel").click(function() {
		tableToExcel('dataTables-example', 'name', 'candidates.xls');
	});

	$(".add-interviewee")
			.click(
					function() {
						$(".person-interview ul")
								.append(
										'<li><div class="form-group"><input class="form-control" placeholder="Interviewer Name"><label>Comments:</label><textarea class="form-control" rows="1"></textarea></li>');
					});
	
	//New User Created
	$("form#new-form").submit(function(event) {
		event.preventDefault();
		
		var newCandidate = {
				"_id" : $("form#new-form").find('#c-email').val(),
				"first_name" : $("form#new-form").find('#c-first-name').val(),
				"last_name" : $("form#new-form").find('#c-last-name').val(),
				"email" : $("form#new-form").find('#c-email').val(),
				"phone" : $("form#new-form").find('#c-phone').val(),
				"resume_uri" : "/api/resume/" + $("form#new-form").find('#c-email').val(),
				"date_added" : $.datepicker.formatDate('yy-mm-dd', new Date()),
				"position" : $("form#new-form").find('#c-position').val(),
				"source" : $("form#new-form").find('#c-origin').val(),
				"team" : "Sairam",
				"status" : "In progress",
				"last_updated" : $.datepicker.formatDate('yy-mm-dd', new Date()),
				"interview" : {
					"resume_review" : {
						"processed" : false,
						"like" : false,
						"comments" : ""
					},
					"quiz_interview" : {
						"classmarker_user" : $("form#new-form").find('#c-quiz-user').val(),
						"classmarker_password" : $("form#new-form").find('#c-quiz-pass').val(),
						"processed" : false,
						"like" : false,
						"date_sent" : "",
						"date_completed" : "",
						"score" : "",
						"mail_sent" : false,
						"comments" : ""
					},
					"phone_interview" : {
						"processed" : false,
						"like" : false,
						"comments" : ""
					},
					"onsite_interview" : {
						"processed" : false,
						"like" : false,
						"comments" : "",
						"interviewers" : []
					}
				}
			};
		

			// DO AJAX TO POST
			$.ajax({
				contentType: "application/json; charset=utf-8",
				dataType: "json",
			    data: JSON.stringify(newCandidate),
			    type: 'POST',
			    url: encodeURI('/api/candidate/' + $("form#new-form").find('#c-email').val())
			});
			
			$("#new").dialog("close");
			// Do Reload Table
			reloadTable();

	});

	// Update TAB1
	
	$('form#tab1').submit(function() {
		event.preventDefault();
		selectedCandidate.interview.resume_review.processed = $('form#tab1 #c-resume-status').is(':checked');
		selectedCandidate.interview.resume_review.like = ($('form#tab1 #c-resume-status').parent().parent().find('.fa-thumbs-o-up').css("opacity") == 1);
		selectedCandidate.interview.resume_review.comments = $('form#tab1 #c-resume-status').parent().parent().find('textarea').val();
		
		selectedCandidate.interview.quiz_interview.processed = $('form#tab1 #c-quiz-status').is(':checked');
		
		selectedCandidate.interview.phone_interview.processed = $('form#tab1 #c-phone-status').is(':checked');
		selectedCandidate.interview.phone_interview.like = ($('form#tab1 #c-phone-status').parent().parent().find('.fa-thumbs-o-up').css("opacity") == 1);
		selectedCandidate.interview.phone_interview.comments = $('form#tab1 #c-phone-status').parent().parent().find('textarea').val();
		
		selectedCandidate.interview.onsite_interview.processed = $('form#tab1 #c-inperson-status').is(':checked');
		selectedCandidate.interview.onsite_interview.like = ($('form#tab1 #c-inperson-status').parent().parent().find('.fa-thumbs-o-up').css("opacity") == 1);
		
		selectedCandidate.interview.onsite_interview.interviewers = [];
		$('form#tab1 #c-inperson-status').parent().parent().find('li').each(function(index, row) {
			if($(row).find('p').length) {
				selectedCandidate.interview.onsite_interview.interviewers.push({
					name: $(row).find('p').html(),
					comments: $(row).find('i').html()
				});
			} else {
				selectedCandidate.interview.onsite_interview.interviewers.push({
					name: $(row).find('input').val(),
					comments: $(row).find('textarea').val()
				});
				
			}
		});
		// DO AJAX TO POST
		$.ajax({
			contentType: "application/json; charset=utf-8",
			dataType: "json",
		    data: JSON.stringify(selectedCandidate),
		    type: 'POST',
		    url: encodeURI('/api/candidate/' + selectedCandidate._id)
		});
		
		$("#update").dialog("close");
		// Do Reload Table
		reloadTable();
		
	});
	
	// Update TAB 2
	$('form#tab2').submit(function() {
		event.preventDefault();
		selectedCandidate.first_name = $('form#tab2').find('#c-first-name').val();
		selectedCandidate.last_name = $('form#tab2').find('#c-last-name').val();
		selectedCandidate.email = $('form#tab2').find('#c-email').val();
		selectedCandidate.phone = $('form#tab2').find('#c-phone').val();
		selectedCandidate.position = $('form#tab2').find('#c-position').val();
		selectedCandidate.source = $('form#tab2').find('#c-origin').val();
		selectedCandidate.last_updated = $.datepicker.formatDate('yy-mm-dd', new Date())
		
		$.ajax({
			contentType: "application/json; charset=utf-8",
			dataType: "json",
		    data: JSON.stringify(selectedCandidate),
		    type: 'POST',
		    url: encodeURI('/api/candidate/' + selectedCandidate._id)
		});
		
		$("#update").dialog("close");
		// Do Reload Table
		reloadTable();
		
	});
	
	$('.fa-retweet').click(function() {
		reloadTable();
	});
	
	$('form#new-form #c-position').change(function() {
		var option = $('form#new-form #c-position').find(":selected").text();
		if(option == 'Staff') {
			$('form#new-form #c-quiz-user').val('stafftestuser');
			$('form#new-form #c-quiz-pass').val('y79aa4');
		} else if (option == 'Senior Staff') {
			$('form#new-form #c-quiz-user').val('seniorstafftestuser');
			$('form#new-form #c-quiz-pass').val('kpk7dp');
		} else if (option == 'Principal') {
			$('form#new-form #c-quiz-user').val('principaltestuser');
			$('form#new-form #c-quiz-pass').val('9en3n9');
		} else if (option == 'Senior Principal') {
			$('form#new-form #c-quiz-user').val('seniorprincitestuser');
			$('form#new-form #c-quiz-pass').val('j44kty');
		}
	});
	


	function escapeTags(str) {
		return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g,
						'&gt;');
	}
	
	$("form#new-form #c-email").focusout(function(event) {
		var btn = document.getElementById('uploadBtn'), progressBar = document
		.getElementById('progressBar'), progressOuter = document
		.getElementById('progressOuter'), msgBox = document
		.getElementById('msgBox');


		var uploader = new ss.SimpleUpload(
		{
			button : btn,
			url : '/api/resume/' + $(event.target).val(),
			name : 'uploadfile',
			hoverClass : 'hover',
			focusClass : 'focus',
			responseType : 'json',
			startXHR : function() {
				progressOuter.style.display = 'block'; // make progress
														// bar visible
				this.setProgressBar(progressBar);
			},
			onSubmit : function() {
				msgBox.innerHTML = ''; // empty the message box
				btn.innerHTML = 'Uploading...'; // change button text to
												// "Uploading..."
			},
			onComplete : function(filename, response) {
				btn.innerHTML = 'Choose Another File';
				progressOuter.style.display = 'none'; // hide progress
														// bar when
														// upload is
														// completed
				if (!response) {
					msgBox.innerHTML = 'Unable to upload file';
					return;
				}
				console.log(response);
				if (response.success === true) {
					msgBox.innerHTML = 'Resume uploaded';
					console.log('uri : ' + response.uri);
				} else {
					if (response.msg) {
						msgBox.innerHTML = escapeTags(response.msg);
					} else {
						msgBox.innerHTML = 'An error occurred and the upload failed.';
					}
				}
			},
			onError : function() {
				progressOuter.style.display = 'none';
				msgBox.innerHTML = 'Unable to upload file';
			}
		});
	});
	
	window.onload = function() {
		var btn = document.getElementById('uploadBtn'), progressBar = document
				.getElementById('progressBar'), progressOuter = document
				.getElementById('progressOuter'), msgBox = document
				.getElementById('msgBox');
		
		
		var uploader = new ss.SimpleUpload(
				{
					button : btn,
					url : '/api/resume/test@test.com',
					name : 'uploadfile',
					hoverClass : 'hover',
					focusClass : 'focus',
					responseType : 'json',
					startXHR : function() {
						progressOuter.style.display = 'block'; // make progress
																// bar visible
						this.setProgressBar(progressBar);
					},
					onSubmit : function() {
						msgBox.innerHTML = ''; // empty the message box
						btn.innerHTML = 'Uploading...'; // change button text to
														// "Uploading..."
					},
					onComplete : function(filename, response) {
						btn.innerHTML = 'Choose Another File';
						progressOuter.style.display = 'none'; // hide progress
																// bar when
																// upload is
																// completed
						if (!response) {
							msgBox.innerHTML = 'Unable to upload file';
							return;
						}
						console.log(response);
						if (response.success === true) {
							msgBox.innerHTML = 'Resume uploaded';
							console.log('uri : ' + response.uri);
						} else {
							if (response.msg) {
								msgBox.innerHTML = escapeTags(response.msg);
							} else {
								msgBox.innerHTML = 'An error occurred and the upload failed.';
							}
						}
					},
					onError : function() {
						progressOuter.style.display = 'none';
						msgBox.innerHTML = 'Unable to upload file';
					}
				});
	};
	
	
	
	//INITIAL LOAD
	reloadTable();

});

$(function() {

	$('#side-menu').metisMenu();

});

// Loads the correct sidebar on window load,
// collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
	$(window)
			.bind(
					"load resize",
					function() {
						topOffset = 50;
						width = (this.window.innerWidth > 0) ? this.window.innerWidth
								: this.screen.width;
						if (width < 768) {
							$('div.navbar-collapse').addClass('collapse');
							topOffset = 100; // 2-row-menu
						} else {
							$('div.navbar-collapse').removeClass('collapse');
						}

						height = ((this.window.innerHeight > 0) ? this.window.innerHeight
								: this.screen.height) - 1;
						height = height - topOffset;
						if (height < 1)
							height = 1;
						if (height > topOffset) {
							$("#page-wrapper").css("min-height",
									(height) + "px");
						}
					});

	var url = window.location;
	var element = $('ul.nav a').filter(function() {
		return this.href == url || url.href.indexOf(this.href) == 0;
	}).addClass('active').parent().parent().addClass('in').parent();
	if (element.is('li')) {
		element.addClass('active');
	}
});
