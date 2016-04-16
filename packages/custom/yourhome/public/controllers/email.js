'use strict';

angular.module('mean.yourhome').controller('EmailController', ['$scope', '$rootScope', '$http', 'MeanUser', 'Global', 'Yourhome',
	function($scope, $rootScope, $http, MeanUser, Global, Yourhome) {
		$scope.global = Global;
		$scope.emailAuth = true;
        $scope.emailError = false;
		
		$scope.emailLoggedin = 'Log In With';
		
		$scope.getEmails=function(numEmails)
		{
            if (isNaN(numEmails)) numEmails = 10;
			console.log("entered getEmails");
			$scope.emailAuth = true;//to hide the button
			$http.post('/api/yourhome/nextEmails', JSON.stringify(
                {
                    maxResults: numEmails,
                    code: null
                })
            )
			.success(function(data)
			{
                $scope.emailAuth = true;//incase they authorised it without refreshing
                $scope.emailError = false;//incase an error got fixed without refreshing
                var emails = [];
                for( var i = 0; i < data.length; i++)
                {
                    //console.dir(data[i]);
                    var tempObject = {};
                    tempObject.snippet = data[i].snippet;
                    tempObject.id = data[i].id;
                    tempObject.url = "https://mail.google.com/mail/u/0/#inbox/"+tempObject.id;
                    tempObject.unixTime = data[i].internalDate;//in milliseconds
                    var from =  parseEmailHeaders(data[i], "From");
                    tempObject.senderName = getEmailName(from);
                    tempObject.senderEmail = getSendersEmail(from);
                    tempObject.subject = parseEmailHeaders(data[i], "Subject");
                    tempObject.unread = isInArray("UNREAD", data[i].labelIds);
                    tempObject.star = isInArray("STARRED", data[i].labelIds);
                    tempObject.important = isInArray("IMPORTANT", data[i].labelIds);
                    //tempObject.date = parseEmailHeaders(data[i], "Date"); Unix time is preferable...
                    //tempObject.returnPath = parseEmailHeaders(data[i], "Return-Path"); Buggy
                    
                    if (data[i].payload.parts === undefined)
                    {
                        if (data[i].payload.body.data !== undefined)
                        {
                            if (data[i].payload.mimeType === "text/html")
                            {// 10/100 only have a HTML version
                                tempObject.content = tempObject.snippet + "There is no text version of the rest of this email. ";
                            }
                            else
                            {
                                try{// 2/100
                                    tempObject.content = (b64_to_utf8(data[i].payload.body.data));
                                }
                                catch(err)
                                {// 1/100 was caught id:151d03bf2aff6e69
                                    tempObject.content = tempObject.snippet + "... We cannot parse the remainder of this email. ";
                                }
                            }
                        }
                        else
                        {// 0/100 
                            tempObject.content = tempObject.snippet + "... We cannot parse the remainder of this email. ";
                        }
                    }
                    else
                    {
                        if (data[i].payload.parts[0].body.data === undefined)
                        {
                            try{// 36/100 tried
                                tempObject.content = b64_to_utf8(data[i].payload.parts[0].parts[0].body.data);
                            }
                            catch(err)
                            {// 28/100 were caught
                                tempObject.content = tempObject.snippet + "... We cannot parse the remainder of this email. ";
                            }
                        }
                        else
                        {
                            try{// 52/100 tried
                                tempObject.content = b64_to_utf8(data[i].payload.parts[0].body.data);
                            }
                            catch(err)
                            {// 32/100 were caught
                                tempObject.content = tempObject.snippet + "... We cannot parse the remainder of this email. ";
                            }
                        }
                    }
                    emails.push(tempObject);
                    //console.dir(data[i].payload);
                }
                //console.log(errCnt);
                $scope.emails = emails;
                //document.getElementById("loadMoreEmailsButton").className="text-centre show";
                
			}).error(function(data, status){
				if (status === 412) //not signed in
				{
                    console.log("Sign in at : "+ data.authUrl);
					$scope.emailAuth = false;
				}
                else
                {
                    console.error("An error occured. Server returned: ");
				    console.dir(data);
                    $scope.emailError = true;
                }
			});
		};
        
        $scope.getEmailStyle = function(email)
        {
            var style ="";
            if (email.unread === true) style+= " unreadEmail";
            return style;
        };
        
        $scope.readEmail = function(email)
        {
            if(email.unread === true)
            {
                email.unread = false;
                $http.post('/api/yourhome/modifyEmails', JSON.stringify(
                    {
                        id: email.id,
                        status: "UNREAD",
                        add: false,
                    })
                )
                .success(function(data)
                {
                    console.log("successs");
                }).error(function(data){
                    console.error("An error occured. Server returned: ");
                    console.dir(data);
                });
            }
            
        };
        
        $scope.setEmailStar = function($event, email)
        {
            if($event){//stops accordion from opening when they star an email
                $event.stopPropagation();
                $event.preventDefault();
            }
            email.star =!email.star;//changes the local email's star first

            $http.post('/api/yourhome/modifyEmails', JSON.stringify(
                {
                    id: email.id,
                    status: "STARRED",
                    add: email.star,//if the email has just been starred it's starred label should be added
                })
            )
            .success(function(data)
            {
                console.log("successs");
                console.dir(data);
            }).error(function(data){
                console.error("An error occured. Server returned: ");
                console.dir(data);
            });
        };
        
        $scope.getEmailStar = function(email)
        {
            var style = "glyphicon";
            if(email.star === true) style+= " glyphicon-star starredEmail";
            else style+= " glyphicon-star-empty";
            return style;
        };
        
        $scope.composeEmail= function (to, subject, message)
        {
            $("#emailTo").val(to);
            $("#emailSubject").val(subject);
            $("#emailMessage").val(message);
			$('#emailSentSuccess').hide();
            $('#emailModal').modal();
        };
        
        $scope.sendEmail=function()
        {
            var to = document.getElementById("emailTo").value;
            var sub = document.getElementById("emailSubject").value;
            var mes = document.getElementById("emailMessage").value;
            //TODO send to server
            
            $http.post('/api/yourhome/sendEmail', JSON.stringify(
                {
                    to: to,
                    subject : sub,
                    message: mes
                })
            )
            .success(function(data)
            {
                console.dir(data);
                console.log("successfully sent");
                $('#emailSentError').hide();
                $('#emailSentSuccess').show();
            }).error(function(data){
                console.error("An error occured. Server returned: ");
                console.dir(data);
                $('#emailSentError').show();
            });
            
            //http://stackoverflow.com/questions/25207217/failed-sending-mail-through-google-api-in-nodejs
        };
	
		if(MeanUser && MeanUser.user){
			if(MeanUser.user.google) {
				$scope.emailLoggedin = undefined;
				$scope.getEmails(10);
			}
			else if(MeanUser.user) $scope.emailLoggedin = 'Link';
		}
		
		$rootScope.$on('loggedin', function() {
			if(MeanUser.user.google) {
				$scope.emailLoggedin = undefined;
				$scope.getEmails(10);
			}
			else if(MeanUser.user) $scope.emailLoggedin = 'Link';
		});
		
		$rootScope.$on('logout', function() {
			$scope.emailLoggedin = 'Log In With';
		});
		
	}]
);
function parseEmailHeaders(email, target)
{
	for(var i =0; i < email.payload.headers.length; i++)
	{
		if (email.payload.headers[i].name === target) return email.payload.headers[i].value;
	}
	return null;
}

function isInArray(target, array)
{
	if (array.indexOf(target) === -1) return false;
	else return true;
}

function b64_to_utf8( str ) 
{
	return atob(str);//71 errors
	//return decodeURIComponent(window.atob(str));//77 errors
	//return decodeURIComponent(escape(window.atob(str)));//71 errors
	//return decodeURIComponent(encodeURIComponent(window.atob(str)));//71 errors
}
function getEmailName(from)
{
	if (from.indexOf("<") < 1) return from;//no name there, use email
	else
	{
		var name;
		name = from.slice(0, from.indexOf("<"));
		return name.replace(/"/g, "");
	}
}
function getSendersEmail(from)
{
	if (from.indexOf("<") < 1) return from;//no name there, just email 
	else
	{
		var email;
		email = from.slice(from.indexOf("<")+1, from.length-1);
		return email.replace(/ /g, "");
	}
}