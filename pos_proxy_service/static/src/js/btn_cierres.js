odoo.define('pos_proxy_service.cierres_fisales_button', function(require) {
   'use strict';
   var models = require('point_of_sale.models');

   const PosComponent = require('point_of_sale.PosComponent');
   const ProductScreen = require('point_of_sale.ProductScreen');
   const { useListener } = require("@web/core/utils/hooks");
   const Registries = require('point_of_sale.Registries');
   const ajax = require('web.ajax');
   var { Gui } = require('point_of_sale.Gui');


   class CierresFiscalesButton extends PosComponent {
        setup() {
            super.setup();
            useListener('click', this.onClick);
        }
        async onClick() {






            var listaCierres = [];

            listaCierres.push({
                'id': "1",
                'label': "Cierre X",
                'item':  "x",
            });
            listaCierres.push({
                'id': "2",
                'label': "Cierre Z",
                'item':  "z",
            });







            const { confirmed, payload: seleccioncierre } = await this.showPopup(
                'SelectionPopup',
                {
                    title: this.env._t('Selecciona X Parcial o Z Cierre'),
                    list: listaCierres,
                }

            );


                if (confirmed) {
                    console.info(seleccioncierre);


                    if (seleccioncierre == 'z'){
                    var con = confirm("¿Esta seguro de imprimir cierre Z?");
                    if (!con){
                        return;
                    }
                }



                //var response = this.env.pos.print_pos_fiscal_close(seleccioncierre);
                var response = this.print_pos_fiscal_close(seleccioncierre);
                }


       }




        async print_pos_fiscal_close(type){
        
        var def  = new $.Deferred();
        var self = this;
        var url = this.env.pos.config.proxy_fiscal_printer + '/print_pos_fiscal_close';
        console.info('print_pos_fiscal_close url: ', url);
        var data =  {'type' : type};
        var print_fiscal_proxy = $.ajax({
            type: "GET",             
            url: url,
            data : data,
            timeout:100000
        });

        print_fiscal_proxy.done(function(res){              
          console.info('print_pos_fiscal_close res: ', res);    
          def.resolve(res);      
          self.message_error_printer_fiscal(res['response'])
          
         
        }).fail(function(xhr, textStatus, errorThrown){  
          self.message_error_printer_fiscal('Comunicación fallida con el Proxy')
          def.reject();
        }); 
        return def;

    }




        message_error_printer_fiscal(error){
        var self= this;
        if (error != true){
            Gui.showPopup('ErrorPopup',{
                'title': 'Error Impresora Fiscal',
                'body':  error,
            });
        }
    }







    }
    CierresFiscalesButton.template = 'CierresFiscalesButton';
    ProductScreen.addControlButton({
        component: CierresFiscalesButton,
        condition: function() {
            return this.env.pos.config.use_fiscal_printer;
        },
        position: ['before', 'SetPricelistButton'],
    });

    Registries.Component.add(CierresFiscalesButton);

    return CierresFiscalesButton;
});
