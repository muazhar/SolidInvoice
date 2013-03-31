!function($, _, window){

    "use strict"; // jshint ;_;

    var Quote = {
                    "el" : null,
                    "rowElement" : "tr",
                    "columnElement" : "td",
                    "fields" : [],
                    "templates" : {},
                    "trashTemplate" : '<div class="pull-right"><a href="#" class="remove-item" rel="tooltip" title="Remove Item"><i class="icon-trash"></i></a></div>',
                    "counter" : 0,
                    "addTemplate" : function(type, template) {
                        this.templates[type] = template;
                        return this;
                    },
                    "addField" : function(field) {
                        this.fields.push(field);
                        return this;
                    },
                    "setSelector" : function(selector) {
                        this.el = $('tbody', selector);
                        return this;
                    },
                    "addRow" : function() {
                        var that         = this,
                            row         = $(window.document.createElement(this.rowElement)),
                            totalFields = this.fields.length;


                        _.each(this.fields, function(item, counter, fields) {
                            var column = $(window.document.createElement(that.columnElement));

                            column.html(that.createField(item));

                            row.append(column);

                            if((counter + 1) === totalFields) {
                                //column.append(_.template(that.trashTemplate));
                            }
                        });

                        this.counter++;

                        row.hide();

                        this.el.append(row);

                        row.fadeIn(150, this.setEvents);

                        return this;
                    },
                    "createField" : function(item) {
                        //var length = this.el.find(this.rowElement).length;
                        var template = this.templates[item].replace(/__name__/g, this.counter);

                        return template;
                    },
                    "setEvents" : function() {
                        $('.quote-item-price, .quote-item-qty').unbind('keyup change');

                         $('.quote-item-price, .quote-item-qty').on('keyup', function(evt){
                             Quote.calcTotal(this);
                         });

                         $('.quote-item-qty').on('change', function(evt){
                             var qty = $(this),
                                 val = qty.val();

                             if(val.indexOf('.') !== -1) {
                                 var decimals = val.substr(val.indexOf('.') + 1);
                                 qty.val(accounting.toFixed(qty.val(), decimals.length > 2 ? 2 : decimals.length) || 1);
                             } else {
                                 var value = accounting.toFixed(qty.val());
                                 qty.val(value > 0 ? value : 1);
                             }
                             Quote.calcTotal(this);
                         });

                         $('.quote-item-price').on('change', function(evt){
                             var price = $(this);
                             price.val(accounting.formatMoney(price.val(), '', '2'));

                             Quote.calcTotal(this);
                         });
                    },
                    "calcTotal" : function(row) {
                        var tr = $(row).parents('tr');

                        var price = accounting.unformat($('.quote-item-price', tr).val()),
                            qty   = $('.quote-item-qty', tr).val(),
                            total = $('.quote-item-total', tr);

                        total.val(accounting.formatMoney(qty * price, ''));

                        Quote.updateTotal();
                    },
                    "updateTotal" : function() {

                        var subTotal = 0;
                        $('.quote-item-total', this.el).each(function() {
                            subTotal += parseFloat(accounting.unformat($(this).val()));
                        });

                        var discount = (subTotal * parseInt($('#quote_discount').val() || 0) / 100);

                        $('.quote-discount').html(accounting.formatMoney(discount * -1));

                        $('.quote-sub-total').html(accounting.formatMoney(subTotal));

                        $('.quote-total').html(accounting.formatMoney(subTotal - discount));
                    }
                };

    $(function(){
        $('.add-item').on('click', function(evt){
            evt.preventDefault();

            Quote.addRow();
        });

        $('.quote-item-price, .quote-item-total', Quote.el).each(function(){
            var $this = $(this);
            $this.val(accounting.formatMoney($this.val(), ''));

            Quote.calcTotal(this);
        });

        $('#quote_discount').on('change keyup', Quote.updateTotal);

        $('#quote-create-form').on('submit', function(){
            $('.quote-item-price', this).each(function(){
                var $this = $(this);
                $this.val(accounting.unformat($this.val()));
            });

            return true;
        });

        $(Quote.el.selector).on('click', '.remove-item', function(evt) {
            evt.preventDefault();
            $(this).parents('tr').fadeOut(function(){
                $(this).remove();
                Quote.updateTotal();
            });
        });

        Quote.setEvents();
    });

    window.Quote = Quote;
}(jQuery, _, window);