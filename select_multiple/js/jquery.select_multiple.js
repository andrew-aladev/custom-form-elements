(function($, Array) {
	if (!('indexOf' in Array.prototype)) {
		Array.prototype.indexOf= function(find, i /*opt*/) {
			if (i===undefined) i= 0;
			if (i<0) i+= this.length;
			if (i<0) i= 0;
			for (var n= this.length; i<n; i++)
				if (i in this && this[i]===find)
					return i;
			return -1;
		};
	}
	
	if(window.ValidatorOnChange && $.browser.msie) {
		var indians_ValidatorHookupEvent = window.ValidatorHookupEvent;
		window.ValidatorHookupEvent = function(control, eventType, functionPrefix) {
			if(functionPrefix.indexOf("ValidatorOnChange") == -1) {
				return indians_ValidatorHookupEvent.apply(this, arguments);
			} else {
				$(control).bind("change", function() {
					ValidatorOnChange({
						target: this
					});
				});
			}
			return null;
		}
	}
	
	$.widget("ui.SelectMultiple", {
		options: {
			sels: {
				self:	".select_multiple",
				list:	"ul",
				item:	"li"
			},
			html: {
				wrapper:	"<div class='select_multiple'></div>",
				list:		"<ul></ul>",
				item:		"<li></li>"
			},
			classes: {
				active: "active"
			}
		},
		
		_create: function() {
			var instance = this;
			
			this.select = this.element;
			var width = this.element.outerWidth();
			var height = this.element.outerHeight();
			this.select.wrap(this.options.html.wrapper);
			this.element = this.select.parent();
			this.element.width(width);
			this.select.hide();
			this.all_options = this.select.find("option");
			this.element.append(this.options.html.list);
			
			this.list = this.element.find(this.options.sels.list);
			this.list.width(width).height(height);
			this.all_options.each(function() {
				instance.list.append(instance.options.html.item);
				var item = instance.list.find(instance.options.sels.item).last();
				item.text($(this).text());
			});
			this.all_items = this.list.find(this.options.sels.item);
			
			this.init();
		},
		
		init: function() {
			var instance = this;
			this.current_index = this.select.find("option:selected").first().index();
			this.select.find("option:selected").each(function() {
				var index = $(this).index();
				instance.all_items.eq(index).addClass(instance.options.classes.active);
			});
			this.store_active();
			
			var count = 0;
			this.all_items.click(function(event) {
				if(!instance.state_focus) {
					return;
				}
				
				count = 0;
				var index = $(this).index();
				if(event.shiftKey) {
					count = index - instance.current_index;
					instance.selection(instance.current_index, count);
					instance.scroll_list_to(instance.current_index + count);
					instance.store_active();
				} else if(event.ctrlKey) {
					instance.toggle(index);
					instance.current_index = instance.select.find("option:selected").first().index();
					instance.scroll_list_to(index);
					instance.store_active();
				} else {
					var change = false;
					instance.select.find("option:selected").each(function() {
						if(index != $(this).index()) {
							instance.deactivate($(this).index());
							change = true;
						}
					});
					change = instance.activate(index) || change;
					if(change) {
						instance.select.trigger("change");
					}
					instance.current_index = index;
					instance.scroll_list_to(instance.current_index);
					instance.store_active();
				}
			}).bind("selectstart dragstart", function(event) {
				event.preventDefault();
				return false;
			});
			
			$(document).bind("keydown", "shift+up", function(event) {
				event.preventDefault();
				if(!instance.state_focus) {
					return;
				}
				
				count--;
				if(instance.current_index + count >= instance.all_items.size()) {
					count = instance.all_items.size() - instance.current_index - 1;
				} else if(instance.current_index + count < 0) {
					count = - instance.current_index;
				}
				var change = instance.selection(instance.current_index, count, true);
				change = instance.restore_active() || change;
				instance.scroll_list_to(instance.current_index + count);
				if(change) {
					instance.select.trigger("change");
				}
			});
			$(document).bind("keydown", "shift+down", function(event) {
				event.preventDefault();
				if(!instance.state_focus) {
					return;
				}
				
				count++;
				if(instance.current_index + count >= instance.all_items.size()) {
					count = instance.all_items.size() - instance.current_index - 1;
				} else if(instance.current_index + count < 0) {
					count = - instance.current_index;
				}
				var change = instance.selection(instance.current_index, count, true);
				change = instance.restore_active() || change;
				instance.scroll_list_to(instance.current_index + count);
				if(change) {
					instance.select.trigger("change");
				}
			});
			$(document).bind("keydown", "up", function(event) {
				event.preventDefault();
				if(!instance.state_focus) {
					return;
				}
				
				count = 0;
				instance.current_index--;
				if(instance.current_index >= instance.all_items.size()) {
					instance.current_index = instance.all_items.size() - 1;
				} else if(instance.current_index < 0) {
					instance.current_index = 0;
				}
				instance.selection(instance.current_index, 0);
				instance.scroll_list_to(instance.current_index);
				instance.store_active();
			});
			$(document).bind("keydown", "down", function(event) {
				event.preventDefault();
				if(!instance.state_focus) {
					return;
				}
				
				count = 0;
				instance.current_index++;
				if(instance.current_index >= instance.all_items.size()) {
					instance.current_index = instance.all_items.size() - 1;
				} else if(instance.current_index < 0) {
					instance.current_index = 0;
				}
				instance.selection(instance.current_index, 0);
				instance.scroll_list_to(instance.current_index);
				instance.store_active();
			});
			
			this.blur();
		},
		
		focus: function() {
			if(this.state_focus) {
				return;
			}
			this.state_focus = true;
			
			var instance = this;
			var focus_bind = function(event) {
				var element = $(event.target).closest(instance.options.sels.self);
				if(element.size() == 0 || element.get(0) != instance.element.get(0)) {
					instance.blur();
				} else {
					$("html").one("click", focus_bind);
				}
			};
			$("html").one("click", focus_bind);
			$("*").one("focus", function() {
				instance.blur();
			});
		},
		
		blur: function() {
			this.state_focus = false;
			
			var instance = this;
			this.element.one("click", function(event) {
				instance.focus();
				$(event.target).trigger("click");
			});
		},
		
		selection: function(index, count, store) {
			var size = this.all_items.size();
			var from = Math.min(index, index + count);
			var to = Math.max(index, index + count);
			var change = false;
			for(var i = 0; i < size; i++) {
				if(i >= from && i <= to) {
					if(this.activate(i)) {
						change = true;
					}
				} else {
					if(this.deactivate(i, store)) {
						change = true;
					}
				}
			}
			return change;
		},
		
		activate: function(index) {
			var option = this.all_options.eq(index);
			var li = this.all_items.eq(index);
			if(!li.hasClass(this.options.classes.active)) {
				option.attr("selected", "selected");
				li.addClass(this.options.classes.active);
				option.trigger("click");
				return true;
			}
			return false;
		},
		
		deactivate: function(index, store) {
			if(store && this.list_active.indexOf(index) != -1) {
				return false;
			}
			var option = this.all_options.eq(index);
			var li = this.all_items.eq(index);
			if(li.hasClass(this.options.classes.active)) {
				li.removeClass(this.options.classes.active);
				option.removeAttr("selected");
				option.trigger("click");
				return true;
			}
			return false;
		},
		
		toggle: function(index) {
			var option = this.all_options.eq(index);
			var li = this.all_items.eq(index);
			if(li.hasClass(this.options.classes.active)) {
				option.removeAttr("selected");
				li.removeClass(this.options.classes.active);
				this.current_index = this.select.find("option:selected").last().index();
			} else {
				option.attr("selected", "selected");
				li.addClass(this.options.classes.active);
				this.current_index = index;
			}
			option.trigger("click");
			this.select.trigger("change");
		},
		
		scroll_list_to: function(index) {
			var current = this.all_items.eq(index);
			//if current is not in visible part
			if (current.position().top < 0) {
				this.scrolled_to_index = index;
				this.list.scrollTo(this.all_items.eq(this.scrolled_to_index));
			} else if(current.position().top + current.height() > this.list.height()) {
				var instance = this;
				var index_not_founded = true;
				this.all_items.each(function(index) {
					if(index_not_founded && $(this).position().top >= 0) {
						instance.scrolled_to_index = index;
						index_not_founded = false;
					}
				});
				this.scrolled_to_index++;
				if(this.scrolled_to_index >= this.all_items.size()) {
					this.scrolled_to_index = this.all_items.size() - 1;
				}
				this.list.scrollTo(this.all_items.eq(this.scrolled_to_index));
			}
		},
		
		store_active: function() {
			var instance = this;
			this.list_active = [];
			this.select.find("option:selected").each(function() {
				instance.list_active.push($(this).index());
			});
		},
		
		restore_active: function() {
			var change = false;
			for(var i = 0; i < this.list_active.length; i++) {
				if(this.activate(this.list_active[i])) {
					change = true;
				}
			}
			return change;
		},
		
		destroy: function() {
			this.element.unbind("click");
			this.list.remove();
			this.select.unwrap();
			this.select.show();
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery, Array);
