(function($) {
	$.widget("ui.Select", {
		options: {
			sels: {
				self:	".select",
				result:	".result",
				select:	"select",
				list:	"ul",
				items:	"ul li"
			},
			html: {
				wrap:	"<div class='select'></div>",
				result:	"<div class='result'></div>",
				list:	"<ul></ul>",
				item:	"<li class=''></li>"
			},
			classes: {
				item_active: "active"
			}
		},
		
		_create: function() {
			this.element.wrap(this.options.html.wrap);
			this.element = this.element.closest(this.options.sels.self);
			this.element.append(this.options.html.result);
			this.element.append(this.options.html.list);
			this.result = this.element.find(this.options.sels.result);
			this.select = this.element.find(this.options.sels.select);
			this.list = this.element.find(this.options.sels.list);
			
			this.init();
		},
		
		init: function() {
			this.select.hide();
			this.list.hide();
			
			var instance = this;
			this.select.find("option").each(function() {
				var item = $(instance.options.html.item);
				item.attr("value", $(this).attr("value"));
				item.text($(this).text());
				instance.list.append(item);
			});
			this.items = this.element.find(this.options.sels.items);
			
			var instance = this;
			
			this.item_click_bind = function() {
				instance.item_click(this);
			}
			this.items.click(this.item_click_bind)
			.eq(0).trigger("click");
			
			this.result_click_bind = function() {
				if(instance.list.is(":visible")) {
					instance.list.hide();
				} else {
					instance.list.show();
					$("html").bind("click", function(event) {
						if($(event.target).closest(instance.options.sels.result).size() == 0 && $(event.target).closest(instance.options.sels.self).size() == 0) {
							instance.list.hide();
							$(this).unbind("click");
						}
					});
					return false;
				}
			}
			this.result.click(this.result_click_bind);
		},
		
		item_click: function(item) {
			$(item).addClass(this.options.classes.item_active);
			this.set($(item).attr("value"));
		},
		
		set: function(value) {
			var option = this.select.find("option").removeAttr("selected")
			.filter("[value='" + value + "']").attr("selected", "selected");
			
			var text = option.text();
			this.result.attr("value", value).text(text);
			this.select.val(value);
			this.select.trigger("change");
		},
		
		destroy: function() {
			this.items.unbind("click", this.item_click_bind);
			this.result.unbind("click", this.result_click_bind);
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);
