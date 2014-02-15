(function ($) { /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class CommentWidget
   * @namespace CommentWidget
   * @classdesc SocialByWay Post Widget to  Post messages on to social sites
   * @augments JQuery.Widget
   * @alias CommentWidget
   * @constructor
   */
  "use strict";
  $.widget("ui.CommentWidget", /** @lends CommentWidget.prototype */ {
    _create: function () {
      var self = this;
      self.serviceFactory = SBW.Singletons.serviceFactory;
      // Tabs UI
      self.$tabsDiv = $('<div/>').attr('class', "sbw-widget sbw-comment-widget-" + self.options.theme);
      self.$commentsContainer = $('<div/>').attr('class', "comments-container");
      self.$textBox = $('<textarea/>', {
        name: 'comment',
        'class': 'comment-box',
        placeholder: self.options.labelPlaceholder || "Enter your comment..."
      });

      self.$postBtn = $('<button/>').addClass('post-comment').text(self.options.buttonText || "Comment");

      self.$postBtn.on("click", this, this._addPost);
      self.$actionContainer = $('<div/>').attr('class', "action-container");
      self.$actionContainer.append(self.$textBox, self.$postBtn);
      self.$tabsDiv.append(self.$commentsContainer, self.$actionContainer);
      self.element.append(self.$tabsDiv);
      if (self.options.displayComments) {
        self._populateComments(self);
      }
    },
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String} successMessage The success message to be displayed.
     * @property {String[]} service Name of the registered service.
     * @property {Number} offset The offset for the widget.
     * @property {String} theme The theme for the widget.
     * @property {String} labelPlaceholder Text for the Input placeholder.
     * @property {String} buttonText Text for post button.
     * @property {String} title Header for the widget.
     * @property {Object} Id object of the post
     * @property {Boolean} displayResponse success message and error message display on the screen.
     * @property {Boolean} displayComments to display the comments of the post.
     * @property {Boolean} displayImage to display the image of the user of the respective comment.
     * @property {Boolean} displayPost to display the post.
     */
    options: {
      successMessage: '',
      service: '',
      offset: 0,
      theme: "default",
      labelPlaceholder: "Enter text..",
      buttonText: "Comment",
      title: "Comment",
      postIdObject: {assetId : '',
                     assetCollectionId : ''},
      displayResponse: false,
      displayComments: false,
      displayImage: true,
      displayPost: false
    },
    /**
     * @method
     * @desc Sets the Post Id for comment widget instace
     * $param id Id of the Post.
     */
    setPostId: function (postIdObject) {
      var self = this;
      self.options.postIdObject = postIdObject;
    },
    /**
     * @method
     * @desc Removes the widget from display
     */
    destroy: function () {
      this.$tabsDiv.remove();
      $.Widget.prototype.destroy.call(this);
    },
    /**
     * @method
     * @memberof CommentWidget
     * @param context
     * @private
     */
    _populateComments: function (context) {
      var self = context,
        populateComments = function (comments) {
          var temp = [];
          comments.forEach(function (comment) {
            if (!self.options.displayImage) {
              temp.push("<div class='comment'><span class='frmuser'>" + comment.fromUser + ' : ' + "</span><span class='msg'>" + comment.text + "</span></div>");
              self.$commentsContainer.empty();
              self.$commentsContainer.append(temp);
            } else {
              var populateCommentsWithImage = function (profilePicUrl) {
                temp.push('<div class="comment"><img class="comment-image" src="' + profilePicUrl + '"><span class="frmuser">' + comment.fromUser + ' : ' + "</span><span class='msg'>" + comment.text + "</span></div>");
                self.$commentsContainer.empty();
                self.$commentsContainer.append(temp);
              };
              SBW.api.getProfilePic(self.options.service, comment.fromUserId, populateCommentsWithImage, function (resp) {console.log(resp); });
            }
          });

        },
        failureCallback = function () {
          self.$commentsContainer.append("<p>Unable to fetch Comments from" + self.options.service + "</p>");
        };
      SBW.api.getComments(self.options.service, self.options.postIdObject, populateComments, failureCallback);
    },
    /**
     * @method
     * @memberof CommentWidget
     * @param e
     * @private
     */
    _addPost: function (e) {
      var self = e.data,
        postText = self.$textBox.val(),
        successCallback = function (response) {
          if (self.displayResponse) {
            var elem = self.$tabsDiv.find(".sbw-success-message");
            if (elem.length !== 0) {
              elem.html(elem.text().substr(0, elem.text().length - 1) + ", " + response.serviceName + ".");
            } else {
              self.$tabsDiv.append('<span class="sbw-success-message">Successfully posted on ' + response.serviceName + '.</span>');
            }
          }
          if (self.options.displayComments) {
            self._populateComments(self);
          }
        },
        failureCallback = function (response) {
          if (self.displayResponse) {
            self.$tabsDiv.append('<span class="sbw-error-message">Some problem in posting with ' + response.serviceName + '.</span>');
          }
        };
      self.$textBox.val('');
      if (self.displayResponse) {
        self.$tabsDiv.find(".sbw-success-message").remove();
        self.$tabsDiv.find(".sbw-error-message").remove();
      }

      SBW.api.postComment(self.options.service, self.options.postIdObject, postText, successCallback, failureCallback);

    }
  });
})(jQuery);
(function ($) {
  /**
   * @class FeedWidget
   * @namespace FeedWidget
   * @classdesc SocialByWay Feed Widget to get feed and  Post messages on to social sites
   * @augments JQuery.Widget
   * @alias FeedWidget
   * @constructor
   */
  "use strict";
  $.widget("ui.FeedWidget", /** @lends FeedWidget.prototype */ {
    _create: function () {
      var self = this;
      self.serviceFactory = SBW.Singletons.serviceFactory;
      //UI TAB
      self.$tabsDiv = $('<div/>').addClass("tabs sbw-widget sbw-feed-widget-" + self.options.theme);
      self.$tabsUl = $('<ul/>').addClass("tabs-ul");
      self.element.append(self.$tabsDiv);
      self.$tabsDiv.append(self.$tabsUl);
      self.$postTab = $('<li/>');
      self.$postTag = $('<a/>').addClass('tab-1').html("<span>" + self.options.title + "</span>");
      self.$postTab.append(self.$postTag);
      self.$tabsUl.append(self.$postTab);
      //
      self.$postTabDiv = $('<div/>').addClass('tab-content');
      self.$postTabDiv.insertAfter(self.$tabsUl);
      self.$containerDiv = $('<div/>').addClass('sbw-feed-container');
      self.$commentsDiv = $('<div/>').addClass('comment-container');
      self.$postTabDiv.append(self.$containerDiv);
      self.$tabsUl.after(self.$commentsDiv);

      self.$input = $('<textarea/>', {
        name: 'comment',
        'class': 'post-box',
        maxlength: 5000,
        cols: 62,
        rows: 8,
        placeholder: self.options.labelPlaceholder
      }).on('keyup', this, function () {
        self.$charsleft.html(this.value.length);
      });
      self.$charsleft = $("<p/>").addClass('chars-count').text('0');
      self.$containerDiv.append('<p class="sharemessage">' + self.options.shareMessage + '</p>');
      self.$containerDiv.append(self.$input);
      self.$postBtn = $('<button/>').addClass('post-btn').text(self.options.buttonText);
      self.$checkBoxesDiv = $('<div/>').addClass('checkbox-container');

      self.options.services.forEach(function (value) {
        var temp = $('<div/>').addClass("checkbox " + value).
        append("<input type='checkbox' name='service' value='" + value + "'/>").
        append("<div class='userimage'></div>").
        append("<div class='service-container " + value + "'></div>");
        self.$checkBoxesDiv.append(temp);
      });
      self.$checkBoxesDiv.append(self.$postBtn).
      append(self.$charsleft).
      append('<div class="clear"></div>');

      var successCallback = function (data) {
          var htmlElArr = [],
            date = '',
            text = '';
          data.forEach(function (value) {
            date = new Date(value['createdTime']);
            text = date.toDateString();
            htmlElArr = [];
            htmlElArr.push('<div class="comments"><img class="uimg" width="50" height="50" src="' + value['picUrl'] + '"/>');
            htmlElArr.push('<p class="details"><span class="name">' + value['fromUser'] + '</span><span class="time">' + text + '</span></p>');
            htmlElArr.push('<p class="message">' + value['text'] + '</p>');
            htmlElArr.push('<p class="likes"><span>Like/Favorite  ' + value['likeCount'] + '</span><span class="service ' + value['serviceName'] + '">&nbsp;</span></p></div>');
            self.$commentsDiv.append(htmlElArr.join(''));
          });
        },
        failureCallback = function () {};

      SBW.api.getCommentsForUrl(self.options.services, {
        url: self.options.id,
        limit: self.options.limit,
        offset: self.options.offset
      }, successCallback, failureCallback);
      self.$checkBoxesDiv.insertAfter(self.$input);
      self.$postBtn.on("click", this, this._addPost);
      self.$containerDiv.find(".checkbox-container").on('click', '.checkbox input', function (e) {
        var that = this,
          value = that.value;
        if ($(that).is(":checked")) {
          $(that).prop('checked', false);
          self.serviceFactory.getService(value).startActionHandler(function () {
            $(that).prop('checked', true);
            self.$checkBoxesDiv.find(".service-container." + value).addClass('selected');
            SBW.api.getProfilePic([value], null, function (response) {
              if (response) {
                self.$checkBoxesDiv.find('.' + value + " .userimage").css('background', 'url(' + response + ')');
              }
            }, function (error) {});
          });
        } else {
          self.$checkBoxesDiv.find(".service-container." + value).removeClass('selected');
        }
      });

    },
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String} successMessage The success message to be displayed.
     * @property {String[]} services Name of the registered services.
     * @property {Number} limit The widget post limit.
     * @property {Number} offset The offset for the widget.
     * @property {String} theme The theme for the widget.
     * @property {String} id Url of the site.
     * @property {String} labelPlaceholder Text for the Input placeholder.
     * @property {String} buttonText Text for post button.
     * @property {String} title Header for the widget.
     * @property {String} shareMessage Message.
     */
    options: {
      successMessage: '',
      services: ['facebook', 'twitter', 'linkedin'],
      limit: 10,
      offset: 0,
      theme: "default",
      id: location.href,
      labelPlaceholder: "Enter text..",
      buttonText: "Publish",
      title: "Feed",
      shareMessage: "Share this page"
    },
    /**
     * @method
     * @desc Removes the widget from display
     */
    destroy: function () {
      this.tabsDiv.remove();
      $.Widget.prototype.destroy.call(this);
    },
    /**
     * @method
     * @memberof PostWidget
     * @param e
     * @private
     */
    _addPost: function (e) {
      var self = e.data,
        postText = self.$input.val(),
        serviceArr = [],
        successCallback = function (response) {
          var elem = self.$containerDiv.find(".sbw-success-info");
          if (elem.length !== 0) {
            elem.html(elem.text().substr(0, elem.text().length - 1) + ", " + response.serviceName + ".");
          } else {
            self.$containerDiv.append('<span class="sbw-success-info">Successfully posted on ' + response.serviceName + '.</span>');
          }
        },
        failureCallback = function (response) {
          self.$containerDiv.append('<span class="sbw-success-info">Some problem in posting with ' + (response.serviceName) + '.</span>');
        };
      self.$checkBoxesDiv.find("input:checked").each(function () {
        serviceArr.push(this.value);
        if (this.value === 'twitter') {
          postText = postText.substring(0, 117); //twitter character limit
        }
      });
      postText = window.location.href + " " + postText;
      self.$containerDiv.find(".sbw-success-message").remove();
      self.$containerDiv.find(".sbw-error-message").remove();

      SBW.api.publishMessage(serviceArr, postText, successCallback, failureCallback);

    }
  });
})(jQuery);
(function($) {"use strict";
	/*jslint nomen: true*/
	/*jslint plusplus: true */
	/*global console, SBW*/
	/**
	 * @class FollowPageWidget
	 * @namespace FollowPageWidget
	 * @classdesc SocialByWay Follow Widget to get the follow count based on the service and gives interaction to follow a page/UI
	 * @property {Number} count - The aggregated follow count for all services.
	 * @property {Object} options - The options for the widget.
	 * @property {Object} serviceCount - An object containing the follow count of each service.
	 * @augments JQuery.Widget
	 * @alias FollowPageWidget
	 * @constructor
	 */
	$.widget("ui.FollowPageWidget", /** @lends FollowPageWidget.prototype */
	{
		count : 0,
		options : {
			userDetails : null,
			services : ['facebook', 'twitter', 'linkedin'],
			theme : 'default'
		},
		serviceCount : null,
		/**
		 * @method
		 * @private
		 * @desc Constructor for the widget.
		 */
		_create : function() {
			var self = this, serviceFollowCountContainer, theme = self.options.theme, containerDiv = $("<div />", {
				'class' : 'sbw-widget sbw-follow-page-widget-' + theme
			}), serviceDiv = $("<div />", {
				'class' : 'service-container'
			}), followButton = $('<span />', {
				'class' : 'follow-button'
			}), followCountContainer = $("<div />", {
				'class' : 'count-container'
			}).text('0'), minAngle = 360 / this.options.services.length;

			self.serviceCount = {};

			$.each(this.options.services, function(index, service) {
				var serviceContainer = self.createServiceElement(service, serviceDiv, (minAngle * index), self);
				serviceFollowCountContainer = $("<div />", {
					'class' : service + '-count service-count-container'
				}).text('0').appendTo(serviceContainer);

			});
			
			$(serviceDiv).append(followButton, followCountContainer);
			$(containerDiv).append(serviceDiv);
			$(self.element).append(containerDiv);
			self.hideServices();
			$(containerDiv).hover(self.showServices, self.hideServices);
		},
		/**
		 * @method
		 * @desc Function to create a service div and place it at the required position in the widget.
		 * @param {String} service The social network for which the container is being created.
		 * @param {Object} parentContainer The DOM element to which the service container must be added.
		 * @param {Number} angle The angle at which the service container has to be placed.
		 * @param {Object} context The context for the function call.
		 * @return {Object} The DOM element for the service.
		 */
		createServiceElement : function(service, parentContainer, angle, context) {
			var serviceContainer = $("<div/>", {
				'class' : service,
				'data-service' : service,
				'click' : function(event) {
					context.followForService(event, context);
				},
				'style' : '-webkit-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-moz-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-ms-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-o-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + 'transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg)'
			}).appendTo(parentContainer);
			return serviceContainer;
		},
		/**
		 * @method
		 * @desc Function to show services on mouse hover.
		 */
		showServices : function() {
			var serviceContainer = $('#followpage-widget div.service-container');
			serviceContainer.find('div').show();
			serviceContainer.find("div.count-container").hide();
		},
		/**
		 * @method
		 * @desc Function to hide services when the widget loses focus.
		 */
		hideServices : function() {
			var serviceContainer = $('#followpage-widget div.service-container');
			serviceContainer.find('div').hide();
			serviceContainer.find("div.count-container").show();
		},
		/**
		 * @method
		 * @param {String} service Name of the registered service.
		 */
		updateForService : function(service) {
			var self = this;
			SBW.api.getFollowCount(service, self.options.userDetails[service], function(response) {
				var targetContainer = $('#followpage-widget div.service-container');
				if (response && response.count) {
					if (self.serviceCount[service]) {
						self.count -= self.serviceCount[service];
					}
					self.serviceCount[service] = response.count;
					self.count += response.count;
					targetContainer.find('div.' + service + '-count').text(response.count);
					targetContainer.find('div.count-container').text(self.count);
				}
			});
		},
		/**
		 * @method
		 * @desc Event handler that allows the user to follow the user specified in options.
		 * @param {Object} event The Event object.
		 * @param {Object} context The scope of the calling function.
		 */
		followForService : function(event, context) {
			var sourceElement = event.srcElement || event.target, service = sourceElement.dataset.service, self = this;
				SBW.api.follow(service, context.options.userDetails[service], function(response) {
						self.updateForService(service);
					}, function(error) {
						SBW.logger.error("Error while following on - " + service);
				});
		},
		/**
		 * @method
		 * @desc Function to destroy the widget.
		 */
		destroy : function() {
			$.Widget.prototype.destroy.call(this, arguments);
		}
	});
})(jQuery);
(function ($) {
  /**
   * @class LikeWidget
   * @namespace LikeWidget
   * @classdesc SocialByWay Like Widget to get the Like count based on the service and gives interaction to Like a page/UI
   * @property {Number} count - The aggregated Like count for all services.
   * @property {Object} options - The options for the widget.
   * @property {Object} serviceCount - An object containing the Like count of each service.
   * @augments JQuery.Widget
   * @alias LikeWidget
   * @constructor
   */
  $.widget("ui.LikeWidget", {
    isLiked: false,
    options: {
      objectId: '',
      service: '',
      theme: 'default',
      objectType: 'POST'
    },

    /**
     * @method
     * @private
     * @desc Constructor for the widget.
     */
    _create: function () {
      var self = this;
      var theme = self.options.theme;
      var $container = $("<div />").addClass('sbw-like-widget-' + theme);
      self.$likeContainer = $("<div />").addClass('like-container');
      self.$likeCountContainer = $("<div />").addClass('count-container');
      $container.append(self.$likeContainer).append(self.$likeCountContainer);
      $(self.element).append($container);
      self.$likeContainer.on('click', self, self.likeForService)
    },

    /**
     * @method
     * @desc Method to like for service.
     * @param {Event} event The event object
     */
    likeForService: function (event) {
      var self = event.data;
//      determine whether like is on post and call likeClickedOnPost
      if (self.options.objectType === 'POST') {
        self.handleLikeClickOnPost.call(self);
      } else {
        self.handleLikeClickOnComment.call(self);
      }
    },

    /**
     * @method
     * @desc Event handler for the like click on post.
     */
    handleLikeClickOnPost: function () {
      var self = this;
      var service = self.options.service;
      var postId = self.options.objectId;
      var picSuccessCallback = function (response) {
        var $image = $("<img/>").attr("src", response);
        self.$likeCountContainer.append($($image));
      };
      var picFailureCallback = function () {
      };
      var likesSuccessCallback = function (response) {
        self.$likeCountContainer.empty();
        for (var i = 0; i < response['likeCount']; i++) {
          var userId = response['likes'][i]['user']['id'];
          if (response['likes'][i]['user']['userImage']) {
            picSuccessCallback(response['likes'][i]['user']['userImage']);
          } else {
            SBW.api.getProfilePic(service, userId,
              picSuccessCallback, picFailureCallback);
          }
        }
      };
      var likesFailureCallback = function () {
        alert('Some problem occurred while getting likes');
      };
      var unLikeSuccessCallback = function (response) {
        SBW.api.getLikes(service, postId, likesSuccessCallback,
          likesFailureCallback);
        self.$likeContainer.removeClass('liked');
        self.isLiked = false;
      };
      var unLikeFailureCallback = function () {
        alert('Some problem occurred while un liking post');
      };
      var likeSuccessCallback = function (response) {
        SBW.api.getLikes(service, postId, likesSuccessCallback,
          likesFailureCallback);
        self.$likeContainer.addClass('liked');
        self.isLiked = true;
      };
      var likeFailureCallback = function () {
        alert('Some problem occurred while liking post');
      };
      if(self.isLiked){
        SBW.api.unlike(service, postId, unLikeSuccessCallback,
          unLikeFailureCallback);
      }else{
        SBW.api.like(service, postId, likeSuccessCallback,
          likeFailureCallback);
      }
    },

    /**
     * @method
     * @desc Event handler for the like click on comment.
     */
    handleLikeClickOnComment: function () {
      var self = this;
      var commentId = self.options.objectId;
      var service = self.options.service;
      var likesSuccessCallback = function (response) {
        var count = response['likeCount'];
        self.$likeCountContainer.addClass('comment').html(count);
      };
      var likesFailureCallback = function () {
        alert('Some problem occurred while getting likes');
      };
      var likeSuccessCallback = function (response) {
        SBW.api.getLikes(service, commentId, likesSuccessCallback,
          likesFailureCallback);
        self.$likeContainer.addClass('liked');
        self.isLiked = true;
      };
      var likeFailureCallback = function () {
        alert('Some problem occurred while liking post');
      };
      var unLikeSuccessCallback = function (response) {
        SBW.api.getLikes(service, commentId, likesSuccessCallback,
          likesFailureCallback);
        self.$likeContainer.removeClass('liked');
        self.isLiked = false;
      };
      var unLikeFailureCallback = function () {
        alert('Some problem occurred while un liking post');
      };
      if(self.isLiked){
        SBW.api.unlike(service, commentId, unLikeSuccessCallback,
          unLikeFailureCallback);
      }else{
        SBW.api.like(service, commentId, likeSuccessCallback,
          likeFailureCallback);
      }
    },

    /**
     * @method
     * @desc Function to destroy the widget.
     * @ignore
     */
    destroy: function () {
      $.Widget.prototype.destroy.call(this);
    }
  });
})(jQuery);
(function ($) {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class PageLikeWidget
   * @namespace PageLikeWidget
   * @classdesc SocialByWay Page Like Widget to get the Like count and functionality to like a page
   * @property {Number} count
   * @property {Object} options
   * @augments JQuery.Widget
   * @alias PageLikeWidget
   * @constructor
   */
  $.widget("ui.PageLikeWidget", /** @lends PageLikeWidget.prototype */  {
    count: {linkedin: 0, twitter :0,facebook:0,flickr:0},
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {Array} services an Array of objects, each containing a service name and the objectId corresponding to the service.
     * @property {String} theme The theme for the widget.
     */
    options: {
      services:'',
      theme: 'default'
    },
    /**
     * @method
     * @private
     * @desc Constructor for the widget.
     */
    _create: function () {
      var self = this;
      var theme = self.options.theme;
      var containerDiv = $('<div />').addClass('sbw-widget sbw-page-like-widget-' + theme);
      self.$serviceContainer = $('<div />').addClass('service-container');
      var $likeButton = $('<span />').addClass( 'like-button');
      self.$likeCountContainer = $("<span />").addClass('count-container');
      var minAngle = 360 / this.options.services.length;
      $.each(this.options.services, function (index, service) {
        var serviceView = self.createServiceElement(service.serviceName, self.$serviceContainer, (minAngle * index), self);
      });
      $(self.$serviceContainer).append($likeButton, self.$likeCountContainer);
      $(containerDiv).append(self.$serviceContainer);
      $(self.element).append(containerDiv);
      self.$serviceContainer.children('div').hide();
      $(containerDiv).hover(self.showServices, self.hideServices);
    },
    /**
     * @method
     * @desc Function to create a service div and place it at the required position in the widget.
     * @param {String} service The social network for which the container is being created.
     * @param {Object} parentContainer The DOM element to which the service container must be added.
     * @param {Number} angle The angle at which the service container has to be placed.
     * @param {Object} context The context for the function call.
     * @return {Object} The DOM element for the service.
     */
    createServiceElement: function (service, parentContainer, angle, context) {
      return $("<div></div>", {
        'class': service,
        'data-service': service,
        'click': function (event) {
          context.likeForService(event, context);
        },
        'style': '-webkit-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-moz-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-ms-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          '-o-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' +
          'transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg)'
      }).appendTo(parentContainer);
    },
    /**
     * @method
     * @desc Function to show services on mouse hover.
     */
    showServices: function () {
      var self = this;
      $(self).find('.count-container').hide();
      $(self).find('.service-container div').show();
    },
    /**
     * @method
     * @desc Function to hide services when the widget loses focus.
     */
    hideServices: function () {
      var self = this;
      $(self).find('.count-container').show();
      $(self).find('.service-container div').hide();
    },
    /**
     * @method
     * @desc Event handler that allows the user to like the url specified in options.
     * @param {Object} event The Event object.
     * @param {Object} context The scope of the calling function.
     */
    likeForService: function (event, context) {
      var sourceElement = event.srcElement || event.target,
        serviceName = sourceElement.dataset.service,
        objectId;
//      $.each(context.options.services,function(index,service){
//        if(service['serviceName']===serviceName){
//          objectId = service['objectId'];
//        };
//      });
      for (var key in context.options.services) {
        if (context.options.services[key]['serviceName'] === serviceName) {
          objectId = context.options.services[key]['objectId'];
        }
      }
      var likesSuccessCallback = function (response) {
        var count = response['likeCount'], totalCount = 0;
        if (count !== null) {
          var serviceLikeCountContainer = $("<span />").addClass('service-count-container').html(count).appendTo(sourceElement);
        }
        context.count[response['serviceName']] = count;
        for (var key in context.count) {
          totalCount = totalCount + context.count[key];
        }
          context.$likeCountContainer.addClass('liked').html(totalCount)
      };
      var likesFailureCallback = function (response) {
       failureCallback(response);
      };
      var unLikeSuccessCallback = function (response) {
        SBW.api.getLikes(serviceName, objectId, likesSuccessCallback,
          likesFailureCallback);
        context.$serviceContainer.find('.' + serviceName).removeClass('liked');
        if(!(context.$serviceContainer.find('.liked').length > 2)){
          context.$serviceContainer.find('.like-button').removeClass('liked');
        }
      };
      var unLikeFailureCallback = function () {
          failureCallback(response);
      };
      var likeSuccessCallback = function (response) {
        context.$serviceContainer.find('.' + serviceName).addClass('liked');
        context.$serviceContainer.find('.like-button').addClass('liked');
        SBW.api.getLikes(serviceName, objectId, likesSuccessCallback,
          likesFailureCallback);
      };
      var likeFailureCallback = function (response) {
          failureCallback(response);
      };
      if (context.$serviceContainer.find('.' + serviceName).hasClass('liked')) {
        SBW.api.unlike(serviceName, objectId, unLikeSuccessCallback,
          unLikeFailureCallback);
      } else {
        SBW.api.like(serviceName, objectId, likeSuccessCallback,
          likeFailureCallback);
      }
        var failureCallback = function(response) {
            context.element.append('<span class="sbw-error-message">'+response.message+'</span>');
        };
        context.element.find(".sbw-success-message").remove();
        context.element.find(".sbw-error-message").remove();
    },
    /**
     * @method
     * @desc Function to destroy the widget.
     * @ignore
     */
    destroy: function () {
      $.Widget.prototype.destroy.call(this);
    }
  });
})(jQuery);
(function($) { /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class LoginWidget
   * @namespace LoginWidget
   * @classdesc SocialByWay Post Widget to  Post messages on to social sites
   * @augments JQuery.Widget
   * @alias LoginWidget
   * @constructor
   */
  "use strict";
  $.widget("ui.LoginWidget", /** @lends LoginWidget.prototype */ {
    _create: function() {
      var self = this;
      self.serviceFactory = SBW.Singletons.serviceFactory;
      // Tabs UI
      self.$tabsDiv = $('<div/>').attr('class', "sbw-widget sbw-login-widget-" + self.options.theme);
      
      self.$actionStrip = $('<div/>', {
        'class': "checkbox-container"
      });

      self.$tabsDiv.on('click', '.check-container input', function(e) {
        var that = this,
          value = that.value;
        if ($(that).is(":checked")) {
          $(that).prop('checked', false);
          self.serviceFactory.getService(value).startActionHandler(function() {
            $(that).prop('checked', true);
            self.$actionStrip.find(".service-container." + value).addClass('selected');
            SBW.api.getProfilePic([value], null, function(response) {
              if (response) {
                self.$actionStrip.find('.' + value + " .userimage").css({"background": 'url("' + response + '")', "background-size": '40px 40px'});
              }
            }, function(error) {});
          });
        } else {
          self.$actionStrip.find(".service-container." + value).removeClass('selected');
        }
      });

      self.options.services.forEach(function(value) {
        var temp = $('<div/>').addClass("check-container " + value).
        append("<input type='checkbox' name='service' value='" + value + "'/>").
        append("<div class='userimage'></div>").
        append("<div class='service-container " + value + "'></div>");
        self.$actionStrip.append(temp);
      });

      self.$actionStrip.append('<div class="clear"></div>');
      self.$tabsDiv.append(self.$actionStrip);
      self.element.append(self.$tabsDiv);
    },
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String[]} services Name of the registered services.
     * @property {String} theme The theme for the widget.
     * @property {String} type The type of view.
     */
    options: {
      services: ['facebook'],
      theme: "default",
      type : "checkbox"
    },
    /**
     * @method
     * @desc Method to check user is logged in(has a authenticated session to service).
     * @param {Array} serviceArray Array of services to check for user's authenticated session.
     * @param {Callback} callback will be called after user's authenticated session to service is checked.
     * @private
     */
    checkUserLoggedIn: function (serviceArray, callback) {
      var aggregateResponse = [],i = serviceArray.length,j=0;
      serviceArray.forEach(function (service) {
        
       var Callback = function (response) {
        j=j+1;
        aggregateResponse.push({service: service, userLoggedIn: response});
        if(j==i){
          callback(aggregateResponse);
        }; 
      }
      
        SBW.api.checkUserLoggedIn(service, Callback);
      });
    },
    /**
     * @method
     * @desc Removes the widget from display
     */
    destroy: function () {
      this.$tabsDiv.remove();
      $.Widget.prototype.destroy.call(this);
    }
  });
})(jQuery);
(function($) { /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class PostWidget
   * @namespace PostWidget
   * @classdesc SocialByWay Post Widget to  Post messages on to social sites
   * @augments JQuery.Widget
   * @alias PostWidget
   * @constructor
   */
  "use strict";
  $.widget("ui.PostWidget", /** @lends PostWidget.prototype */ {
    _create: function() {
      var self = this;
      self.serviceFactory = SBW.Singletons.serviceFactory;
      // Tabs UI
      self.$tabsDiv = $('<div/>').attr('class', "tabs sbw-widget sbw-post-widget-" + self.options.theme);
      self.$tabsUl = $('<ul/>').attr("class", "tabs-ul");
      self.element.append(self.$tabsDiv);
      self.$tabsDiv.append(self.$tabsUl);
      self.$postTab = $('<li/>');
      self.postTag = $('<a/>').addClass('tab-1 selected').html("<span>" + self.options.title + "</span>");
      self.$postTab.append(self.postTag);
      self.$tabsUl.append(self.$postTab);
      self.$uploadPhotoTab = $('<li/>');
      self.uploadPhotoTag = $('<a/>').addClass('tab-2').html("<span>Upload Photo</span>");
      self.$uploadPhotoTab.append(self.uploadPhotoTag);
      self.$tabsUl.append(self.$uploadPhotoTab);
      self.$uploadVideoTab = $('<li/>');
      self.uploadVideoTag = $('<a/>').addClass('tab-3').html("<span>Upload Video</span>");
      self.$uploadVideoTab.append(self.uploadVideoTag);
      self.$tabsUl.append(self.$uploadVideoTab);
      // Container
      self.$postTabDiv = $('<div/>').addClass('tab-content');
      self.$postTabDiv.insertAfter(self.$tabsUl);
      self.$containerDiv = $('<div/>').addClass('tab-1 sbw-post-container');
      self.$photocontainerDiv = $('<div/>').addClass('tab-2 hide').UploadWidget({
        display: 'embedded',
        functionality: 'image',
        services: self.options.services
      });
      self.$videocontainerDiv = $('<div/>').addClass('tab-3 hide').UploadWidget({
        display: 'embedded',
        functionality: 'video',
        services: self.options.services
      });
      self.$postTabDiv.append(self.$containerDiv);
      self.$postTabDiv.append(self.$photocontainerDiv);
      self.$postTabDiv.append(self.$videocontainerDiv);
      self.$tabsUl.on('click', 'li a', function() {
        if (!$(this).hasClass('selected')) {
          self.$tabsDiv.find('.tab-content>div').addClass('hide');
          self.$postTabDiv.find('.' + $(this).attr('class')).removeClass('hide');
          self.$tabsUl.find('li a').removeClass('selected');
          $(this).addClass('selected');
        }
      });
      self.$input = $('<textarea/>', {
        name: 'comment',
        'class': 'post-box',
        maxlength: 5000,
        cols: 62,
        rows: 8,
        placeholder: self.options.labelPlaceholder
      }).on('keydown', this, function(e) {
        if (e.keyCode === 17) {
          self.ctrlDown = true;
        }

      }).on('keyup', this, function(e) {
        self.$charsleft.html(this.value.length);
        if (self.ctrlDown && e.keyCode === 86) {
          self.ctrlDown = false;
          var searchText = this.value,
            urls = searchText.match(/((\b(https?|ftp|file)?:\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
          if (urls instanceof Array && urls[0].length !== 0) {
            var successcallback = function(metaObject) {
              if (self.$containerDiv.find('.link-preview').length === 0 && metaObject.title) {
                var temp = [];
                temp.push('<div class="link-preview">');
                if (metaObject.previewUrl) {
                  temp.push('<img class="previewimg" height="50" width="50" src="' + metaObject.previewUrl + '"/>');
                }
                temp.push('<div class="link-info"><div class="link-title"><a href="#">' + metaObject.title + "</a></div>");
                temp.push('<div class="link-description">' + (metaObject.description || metaObject.url) + '</div></div>');
                temp.push('<div class="close">x</div><div class="clear"></div></div>');
                self.$containerDiv.append(temp.join(''));
                self.$containerDiv.find('.close').bind('click', function() {
                  $(this).parent('.link-preview').remove();
                });
              }
            }, errorcallback = function(error) {};
            if (self.$containerDiv.find('.link-preview').length === 0)
             SBW.Singletons.utils.getMetaForUrl(urls[0], successcallback, errorcallback);
          }
        }
      });

      self.$charsleft = $("<p/>").addClass('chars-count').text('0');
      self.$containerDiv.append(self.$input);
      self.$postBtn = $('<button/>').addClass('post-btn').text(self.options.buttonText);
      self.$checkBoxesDiv = $('<div/>').addClass('checkbox-container');

      self.options.services.forEach(function(value) {
        var temp = $('<div/>').addClass("checkbox " + value).
        append("<input type='checkbox' name='service' value='" + value + "'/>").
        append("<div class='userimage'></div>").
        append("<div class='service-container " + value + "'></div>");
        self.$checkBoxesDiv.append(temp);
      });

      self.$checkBoxesDiv.append(self.$postBtn).
      append(self.$charsleft).
      append('<div class="clear"></div>');
      self.$checkBoxesDiv.insertAfter(self.$input);

      self.$postBtn.on("click", this, this._addPost);
      self.$containerDiv.find(".checkbox-container").on('click', '.checkbox input', function(e) {
        var that = this,
          value = that.value;
        if ($(that).is(":checked")) {
          $(that).prop('checked', false);
          self.serviceFactory.getService(value).startActionHandler(function() {
            $(that).prop('checked', true);
            self.$checkBoxesDiv.find(".service-container." + value).addClass('selected');
            SBW.api.getProfilePic([value], null, function(response) {
              if (response) {
                self.$checkBoxesDiv.find('.' + value + " .userimage").css('background', 'url(' + response + ')');
              }
            }, function(error) {});
          });
        } else {
          self.$checkBoxesDiv.find(".service-container." + value).removeClass('selected');
        }
      });

    },
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String} successMessage The success message to be displayed.
     * @property {String[]} services Name of the registered services.
     * @property {Number} limit The widget post limit.
     * @property {Number} offset The offset for the widget.
     * @property {String} theme The theme for the widget.
     * @property {String} labelPlaceholder Text for the Input placeholder.
     * @property {String} buttonText Text for post button.
     * @property {String} title Header for the widget.
     */
    options: {
      successMessage: '',
      services: ['facebook', 'twitter', 'linkedin'],
      limit: 10,
      offset: 0,
      theme: "default",
      labelPlaceholder: "Enter text..",
      buttonText: "Publish",
      title: "Post"
    },
    /**
     * @method
     * @desc Removes the widget from display
     */
    destroy: function() {
      this.$tabsDiv.remove();
      $.Widget.prototype.destroy.call(this);
    },
    /**
     * @method
     * @memberof PostWidget
     * @param e
     * @private
     */
    _addPost: function(e) {
      var self = e.data,
        postText = self.$input.val(),
        serviceArr = [],
        successCallback = function(response) {
          var elem = self.$containerDiv.find(".sbw-success-message");
          if (elem.length !== 0) {
            elem.html(elem.text().substr(0, elem.text().length - 1) + ", " + response.serviceName + ".");
          } else {
            self.$containerDiv.append('<span class="sbw-success-message">Successfully posted on ' + response.serviceName + '.</span>');
          }
        },
        failureCallback = function(response) {
          self.$containerDiv.append('<span class="sbw-error-message">Some problem in posting with ' + response.serviceName + '.</span>');
        };
      self.$checkBoxesDiv.find("input:checked").each(function() {
        serviceArr.push(this.value);
        if (this.value === 'twitter') {
          postText = postText.substring(0, 140); //twitter character limit
        }
      });
      self.$containerDiv.find(".sbw-success-message").remove();
      self.$containerDiv.find(".sbw-error-message").remove();

      SBW.api.publishMessage(serviceArr, postText, successCallback, failureCallback);

    }
  });
})(jQuery);
(function ($) {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class PostShareWidget
   * @namespace PostShareWidget
   * @classdesc
   * @augments JQuery.Widget
   * @alias PostShareWidget
   * @constructor
   */
  $.widget("ui.PostShareWidget",
    /** @lends PostShareWidget.prototype */
    {
      /**
       * @method
       * @private
       * @desc Constructor for the widget.
       * @ignore
       */
      _create: function () {
        var self = this;
        self.shareObject = {
          message: self.options.message,
          picture: self.options.icon,
          link: self.options.link,
          name: self.options.name,
          caption: self.options.caption,
          description: self.options.description,
          actions: {"name": self.options.actions.name, "link": self.options.actions.link}
        };
        self.$widgetContainer = $('<div/>').addClass("sbw-widget sbw-post-share-widget-" + self.options.theme);
        self.$title = $('<textarea/>').attr({
          'class': 'message',
          placeholder: 'Title'
        });
        self.$description = $('<textarea/>').attr({
          'class': 'description',
          placeholder: 'Description'
        });
        self.$iconContainer = $('<div/>').addClass('icon-container');
        self.$icon = $('<img/>').attr({ class: 'icon', src: self.options.icon});
        self.$iconContainer.append(self.$icon);
        self.$shareButton = $('<button/>').addClass('share-button').text('Share');

        //Create the checkbox container...
        self.$checkBoxContainer = $('<div/>').addClass('checkbox-widget-container');
        self.$checkBoxContainer.LoginWidget({
          services: self.options.serviceArray
        });
        self.$checkBoxContainer.append(self.$shareButton);
        if (self.options.shareButton !== 'on') {
          self.$shareButton.hide();
        }
        self.$postDescriptionContainer = $('<div/>').addClass('post-description-container');
        self.$postDescriptionContainer.append(self.$title, self.$description);
        self.$widgetContainer.append(self.$iconContainer, self.$postDescriptionContainer, self.$checkBoxContainer);
        self.element.append(self.$widgetContainer);

        self.$shareButton.on("click", this, this.postShare);
        self.$postDescriptionContainer.change(function (param) {
          var key = param.target.className,
            value = $(this).children('.' + param.target.className).val();
          self.shareObject[key] = value;
        });
      },
      /**
       * @desc Options for the widget.
       * @inner
       * @type {Object}
       * @property {String} theme Theme for the postShare widget
       * @property {Array} serviceArray Array of services to support
       * @property {String} shareButton
       */
      options: {
        theme: 'default',
        serviceArray: ['facebook'],
        shareButton: 'on',
        message: '',
        icon: 'http://www.socialbyway.com/style/images/logo.png',
        link: '',
        caption: '',
        name: '',
        description: '',
        actions : {name: '', link: ''}
      },
      /**
       * @method
       * @desc Authenticate to the specified service to post share.
       * @param {String} service Name of the registered service to be authenticated.
       * @param {Function} loginSuccessHandler The callback to be executed on successful login.
       */
      authenticate: function (service, loginSuccessHandler) {
        SBW.Singletons.serviceFactory.getService(service).startActionHandler(loginSuccessHandler);
      },
      /**
       * @method
       * @desc Method to set the icon.
       * @param iconUrl The url of the icon.
       */
      setIcon: function (iconUrl) {
        this.shareObject.picture = iconUrl;
        this.$icon.attr('src', 'iconUrl');
      },
      /**
       * @method
       * @desc Method to set the title.
       * @param title The title to be set for the share.
       */
      setTitle: function (title) {
        this.shareObject.message = title;
        this.$title.text(title);
      },
      /**
       * @method
       * @desc Method to set the description.
       * @param description The description of the share.
       */
      setDescription: function (description) {
        this.shareObject.description = description;
        this.$description.text(description);
      },
      /**
       * @method
       * @desc Method to set the metadata.
       * @param {Object} metaData MetaData({link: null, name : null, caption : null}) of for the PostShare.
       */
      setMetaData: function (metaData) {
        this.shareObject.link = metaData.link;
        this.shareObject.name = metaData.name;
        this.shareObject.caption = metaData.name;
      },
      /**
       * @method
       * @desc Method to set the action.
       * @param {Object} actions MetaData( actions: {"name": null, "link": null} ) of for the PostShare.
       */
      setAction: function (actions) {
        this.shareObject.actions.link = actions.link;
        this.shareObject.actions.name = "View on " + actions.name;
      },
      /**
       * @method
       * @desc Method to set the data.
       * @param {Object} postData
       * postData = { message: null, picture: null, link: null, name: null, caption: null, description: null, actions: {"name": null, "link": null} };
       * postData of for the PostShare.
       */
      setData: function (postData) {
        this.shareObject = {
          message: postData.message,
          picture: postData.picture,
          link: postData.link,
          name: postData.name,
          caption: postData.caption,
          description: postData.description,
          actions: {"name": "View on " + postData.actions.name, "link": postData.actions.link}
        };
        this.$title.text(postData.message);
        this.$description.text(postData.description);
      },
      /**
       * @method
       * @desc Method to set the data.
       * @param {String} attribute
       * @param {Object} data
       * @example
       * PostShareWidget('set','title','A sample Title')
       */
      set: function (attribute, data) {
        if (typeof data === "object") {
          if (attribute !== 'actions') {
            for (var key in data){
              this.shareObject[key]=data[key];
              if(key === 'message'){
                this.$title.text(data[key]);
              }else if(key === 'description'){
                this.$description.text(data[key]);
              }
            }
          }else{
            for (var key in data){
              this.shareObject[attribute][key]=data[key];
            }
          }
        } else {
          this.shareObject[attribute] = data;
          if(attribute === 'message'){
            this.$title.text(data);
          }else if(attribute === 'description'){
            this.$description.text(data);
          }
        }
      },
      /**
       * @method
       * @desc Method to share the post.
       */
      postShare: function (context) {
        var self = context.data || this, serviceArr = [],
          postShareData = self.shareObject,
          successCallback = function (response) {
            if (self.$successText) {
              self.$successText.empty();
            }
            self.$successText = $("<p/>").text("Successfully posted in " + response.serviceName);
            self.$widgetContainer.append(self.$successText);
            self.$successText.delay(1000).fadeOut();
          },
          failureCallback = function (response) {
            if (self.$failureText) {
              self.$failureText.empty();
            }
            self.$failureText = $("<p/>").text("Error while publishing media in " + response.serviceName);
            self.$widgetContainer.append(self.$failureText);
          };
        self.$checkBoxContainer.find("input:checked").each(function () {
          serviceArr.push(this.value);
        });
        SBW.api.postShare(serviceArr, postShareData, successCallback, failureCallback);
      },
      /**
       * @method
       * @desc Function to destroy the widget.
       * @ignore
       */
      destroy: function () {
        $.Widget.prototype.destroy.call(this);
      }
    });
})(jQuery);
(function ($) {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class SharePageWidget
   * @namespace SharePageWidget
   * @classdesc SocialByWay Share Page Widget to get the Share count based on the service and gives interaction to Share a page/UI
   * @property {Number} count - The aggregated Share count for all services.
   * @property {Object} options - The options for the widget.
   * @property {Object} serviceCount - An object containing the Share count of each service.
   * @augments JQuery.Widget
   * @alias SharePageWidget
   * @constructor
   */
  $.widget("ui.SharePageWidget", /** @lends SharePageWidget.prototype */ {
    count: 0,
    /**
     * @desc Options for the widget.
     * @inner
     * @type {Object}
     * @property {String} url The url to share.
     * @property {String[]} services Name of the registered services.
     * @property {String} theme The theme for the widget.
     */
    options: {
      url: null,
      services: ['facebook', 'twitter', 'linkedin'],
      theme: 'default'
    },
    /**
     * @method
     * @private
     * @desc Constructor for the widget.
     */
    _create: function () {
      var self = this,
        serviceShareCountContainer, theme, containerDiv, serviceDiv, shareButton, shareCountContainer, minAngle;
      theme = self.options.theme;
      containerDiv = $("<div />", {
        'class': 'sbw-widget sbw-share-page-widget-' + theme
      });
      serviceDiv = $("<div />", {
        'class': 'service-container'
      });
      shareButton = $('<span />', {
        'class': 'share-button'
      });
      shareCountContainer = $("<div />", {
        'class': 'count-container'
      });

      minAngle = 360 / this.options.services.length;
      $.each(this.options.services, function (index, service) {
        var serviceContainer = self.createServiceElement(service, serviceDiv, (minAngle * index), self);
        SBW.api.getShareCount([service], self.options.url, function (response) {
          if (response && response.count) {
            self.count += response.count;
            serviceShareCountContainer = $("<div />", {
              'class': 'service-count-container'
            }).text(response.count).appendTo(serviceContainer);
            shareCountContainer.text(self.count);
          }
        });
      });

      $(serviceDiv).append(shareButton, shareCountContainer);
      $(containerDiv).append(serviceDiv);
      $(self.element).append(containerDiv);
      self.hideServices();
      $(containerDiv).hover(self.showServices, self.hideServices);
    },
    /**
     * @method
     * @desc Function to create a service div and place it at the required position in the widget.
     * @param {String} service The social network for which the container is being created.
     * @param {Object} parentContainer The DOM element to which the service container must be added.
     * @param {Number} angle The angle at which the service container has to be placed.
     * @param {Object} context The context for the function call.
     * @return {Object} The DOM element for the service.
     */
    createServiceElement: function (service, parentContainer, angle, context) {
      var serviceContainer = $("<div/>", {
        'class': service,
        'data-service': service,
        'click': function (event) {
          context.shareForService(event, context);
        },
        'style': '-webkit-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-moz-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-ms-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + '-o-transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg); ' + 'transform : rotate(' + angle + 'deg)' + 'translate(3em) rotate(-' + angle + 'deg)'
      }).appendTo(parentContainer);
      return serviceContainer;
    },
    /**
     * @method
     * @desc Function to show services on mouse hover.
     */
    showServices: function () {
      var servicesContainer = $("div.service-container");
      servicesContainer.find("div").show();
      servicesContainer.find("div.count-container").hide();
    },
    /**
     * @method
     * @desc Function to hide services when the widget loses focus.
     */
    hideServices: function () {
      var servicesContainer = $("div.service-container");
      servicesContainer.find("div").hide();
      servicesContainer.find("div.count-container").show();
    },
    /**
     * @method
     * @desc Event handler that allows the user to share the url specified in options.
     * @param {Object} event The Event object.
     * @param {Object} context The scope of the calling function.
     */
    shareForService: function (event, context) {
      var sourceElement = event.srcElement || event.target,
        service = sourceElement.dataset.service,
        successCallback = function (response) {
          var elem = context.element.find(".sbw-success-message");
          if (elem.length !== 0) {
            elem.html(elem.text().substr(0, elem.text().length - 1) + ", " + response.serviceName + ".");
          } else {
            context.element.append('<span class="sbw-success-message">Successfully shared on '/*+ response.message */ + response.serviceName + '.</span>');
          }
        },
        failureCallback = function (response) {
          context.element.append('<span class="sbw-error-message">' + response.serviceName + ' says,' + response.message + '.</span>');
        };
      context.element.find(".sbw-success-message").remove();
      context.element.find(".sbw-error-message").remove();
      SBW.api.publishMessage([service], (context.options.url || document.url), successCallback, failureCallback);
    },
    /**
     * @method
     * @desc Function to destroy the widget.
     * @ignore
     */
    destroy: function () {
      $.Widget.prototype.destroy.call(this, arguments);
    }
  });
})(jQuery);
(function ($) {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global console, SBW*/
  /**
   * @class UploadWidget
   * @namespace UploadWidget
   * @classdesc SocialByWay Upload Widget to upload files to the services
   * @augments JQuery.Widget
   * @alias UploadWidget
   * @constructor
   */
  $.widget("ui.UploadWidget",
    /** @lends UploadWidget.prototype */
    {
      /**
       * @method
       * @private
       * @desc Constructor for the widget.
       * @ignore
       */
      _create: function () {
        var self = this, supportedServices = ['facebook', 'flickr', 'twitter', 'picasa'];
        // to check whether the service is supported or not
        self.options.serviceArray.forEach(function (element, index, array) {
          if (supportedServices.indexOf(element) === -1) {
            array.splice(array.indexOf(element), 1);
          }
        });
        // display embedded initializing creates a widget container with specified functionality
        // display stand-alone initializing creates two tabs for image and video upload separately
        self.$widgetContainer = $('<div/>').addClass("sbw-widget sbw-upload-widget-" + self.options.theme);
        if (self.options.display === 'stand-alone') {
          // Define Tab container
          self.$tabContainer = $('<div/>').addClass('tab-container');
          self.$tabs = $('<ul/>').addClass("tabs");
          self.$tabContainer.append(self.$tabs);

          // Define Tabs
          self.$imageTab = $('<li/>').attr({
            class: 'image-tab selected',
            value: 'image'
          }).html("Upload Image");
          self.$videoTab = $('<li/>').attr({
            class: 'video-tab',
            value: 'video'
          }).html("Upload Video");

          //Append tabs to the tab container...
          self.$tabs.append(self.$imageTab, self.$videoTab);
          self.$widgetContainer.append(self.$tabContainer);
        }

        self.element.append(self.$widgetContainer);

        // Define content in the tab container...
        self.$helpMessage = $("<p/>").text("Select media to upload");
        self.$browseButtonWrapper = $('<div/>').addClass('browse-button-wrapper');
        self.$browseButton = $('<input/>').attr("type", "file").html("Choose file");
        self.$browseButtonWrapper.append(self.$browseButton);
        self.$dummyBrowseButton = "<div class='dummy-button'><div class='choose-file'>Choose File</div><div class='file-display'>No File Choosen</div></div>";
        self.$browseButtonWrapper.append(self.$dummyBrowseButton);
        self.$errorAlert = $('<div/>').addClass('error-display').hide();
        self.$loader = $('<div/>').addClass('loader').hide();
        self.$mediaContainer = $('<div/>').addClass('media-container ');

        self.$description = $('<textarea/>').attr({
          'class': 'description-container',
          maxlength: 5000,
          placeholder: 'Enter text....'
        });

        self.$titleInput = $('<textarea/>').attr({
          'class': 'title-container',
          maxlength: 5000,
          placeholder: 'Title'
        });
        self.$mediaContainer.append(self.$helpMessage, self.$browseButtonWrapper, self.$errorAlert, self.$loader, self.$titleInput, self.$description);
        self.$widgetContainer.append(self.$mediaContainer);

        self.$uploadButton = $('<button/>').addClass('upload-button').text("Publish");

        //Create the checkbox container...
        self.$checkBoxContainer = $('<div/>').addClass('checkBox-container');
        var $checkContainer = [];
        self.options.serviceArray.forEach(function (value) {
          var $serviceCheckbox = $('<div/>').addClass("check-container " + value)
              .append($("<input/>", {
                'type': 'checkbox',
                'name': 'service',
                'value': value
              })),
            $userView = $("<div/>").addClass("user-image "),
            $serviceView = $('<div/>').addClass("service-container " + value);
          $serviceCheckbox.append($userView, $serviceView);
          $checkContainer.push($serviceCheckbox);
        });
        self.$checkBoxContainer.append($checkContainer);
        self.$mediaContainer.append(self.$checkBoxContainer, self.$uploadButton);
        self.$uploadButton.on("click", this, this._publishPhoto);

        $(self.$tabs).on('click', 'li', function () {
          var $currentTab = $(this);
          $currentTab.addClass('selected').siblings('li').removeClass('selected');
          self.options.functionality = $currentTab.attr('value');
          if ($currentTab.attr('value') === 'video') {
            self.$checkBoxContainer.find('.check-container.twitter').hide();
          } else {
            self.$checkBoxContainer.find('.check-container.twitter').show();
          }
        });
        if (self.options.functionality === 'video') {
          self.$checkBoxContainer.find('.check-container.twitter').hide();
        } else {
          self.$checkBoxContainer.find('.check-container.twitter').show();
        }
        $(self.$checkBoxContainer).on('click', 'div.check-container input', function (e) {
          var that = this;
          self.service = this.value;
          if ($(this).is("input:checked")) {
            $(that).prop('checked', false);
            var loginSuccessHandler = function (response) {
              var userId = (response === undefined) ? undefined : response.id, picSuccess, picFailure;
              $(that).siblings('div.service-container').toggleClass('selected');
              $(that).prop('checked', true);
              picSuccess = function (profilePicUrl) {
                if (profilePicUrl) {
                  $(self.$checkBoxContainer).find('.check-container' + '.' + self.service + ' .user-image').css("background", 'url("' + profilePicUrl + '")');
                }
              };
              picFailure = function (error) {
              };
              SBW.api.getProfilePic(self.service, userId, picSuccess, picFailure);
            };
            self.authenticate(self.service, loginSuccessHandler);
          } else {
            $(that).siblings('div.service-container').toggleClass('selected');
          }
        });
        self.$browseButton.change(function () {
          var filePath = this.value.replace("C:\\fakepath\\", "");
          $('.file-display').html(filePath);
        });

      },
      /**
       * @desc Options for the widget.
       * @inner
       * @type {Object}
       * @property {String} theme Theme for the upload widget
       * @property {String} display Display type of the widget
       * @property {String} functionality The functionality of the widget
       * @property {Array} serviceArray Array of services to support
       * @property {Object} sizeLimit The limit for the media to be uploaded
       */
      options: {
        theme: 'default',
        display: 'stand-alone',
        functionality: 'image',
        serviceArray: ['facebook', 'flickr', 'picasa', 'twitter'],
        // limit in kilobytes
        sizeLimit: {image: 1024, video: 20480}
      },
      /**
       * @method
       * @desc Authenticate to the specified service to upload files.
       * @param {String} service Name of the registered service to be authenticated.
       * @param {Function} loginSuccessHandler The callback to be executed on successful login.
       */
      authenticate: function (service, loginSuccessHandler) {
        SBW.Singletons.serviceFactory.getService(service).startActionHandler(loginSuccessHandler);
      },
      /**
       * @method
       * @desc Method to call the upload media methods of the service.
       * @private
       * @ignore
       */
      _publishPhoto: function (e) {
        var self = e.data, serviceCheck = 0, description = $(self.$description).val(), title = $(self.$titleInput).val(), serviceArr = [],
          fileData = {
            'description': description,
            'title': title,
            'location': '',
            'file': self.$browseButton[0].files[0]
          },
          successCallback = function (uploadStatus) {
            serviceCheck = serviceCheck + 1;
            if (serviceCheck === serviceArr.length) {
              self.$loader.hide();
            }
            if ((!self.$successText) || (self.$successText.text() === '')) {
              self.$successText = $("<p/>").text("Successfully published media in " + uploadStatus[0].serviceName);
              self.$widgetContainer.append(self.$successText);
            } else {
              self.$successText.text(self.$successText.text() + ', ' + uploadStatus[0].serviceName);
            }
          },
          errorCallback = function (uploadStatus) {
            serviceCheck = serviceCheck + 1;
            if (serviceCheck === serviceArr.length) {
              self.$loader.hide();
            }
            if ((!self.$failureText) || (self.$failureText.text() === '')) {
              self.$failureText = $("<p/>").text("Error while publishing media in " + uploadStatus[0].serviceName);
              self.$widgetContainer.append(self.$failureText);
            } else {
              self.$failureText.text(self.$failureText.text() + ', ' + uploadStatus[0].serviceName);
            }
          };
        if (self.$successText) {
          self.$successText.empty();
        }
        if (self.$failureText) {
          self.$failureText.empty();
        }
        self.$checkBoxContainer.find("input:checked").each(function () {
          serviceArr.push(this.value);
        });
        if (self.options.functionality === 'image') {
          if (self.$browseButton[0].files[0].size / 1024 < self.options.sizeLimit.image) {
            self.$errorAlert.hide();
            if (serviceArr.length !== 0) {
              self.$loader.show();
            }
            SBW.api.uploadPhoto(serviceArr, [fileData], successCallback, errorCallback);
          } else {
            self.$errorAlert.show().text('Maximum upload size for image : 1MB');
          }
        } else {
          if (self.$browseButton[0].files[0].size / 1024 < self.options.sizeLimit.video) {
            self.$errorAlert.hide();
            if (serviceArr.length !== 0) {
              self.$loader.show();
            }
            SBW.api.uploadVideo(serviceArr, [fileData], successCallback, errorCallback);
          } else {
            self.$errorAlert.show().text('Maximum upload size for video : 20MB');
          }
        }
      }
    });
})(jQuery);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//

;
