/** @odoo-module */

import { usePos } from "@point_of_sale/app/store/pos_hook";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { Component } from "@odoo/owl";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";


export class CierresFButton extends Component {
    static template = "pos_proxy_service.CierresFiscalesButton";

         setup() {
            super.setup();
            usePos('click', this.onClick);
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






              const { confirmed, payload: seleccioncierre } = await this.env.services.popup.add(SelectionPopup, {
               title: _t('Selecciona X Parcial o Z Cierre'),
               list: listaCierres,

           });
        


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
        let pos_config = self.env.services.pos.config;
        var url = pos_config.proxy_fiscal_printer + '/print_pos_fiscal_close';
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

             this.env.services.pos.popup.add(ErrorPopup, {
                               title: _t('Error Impresora Fiscal'),
                               body: _t(error),
                           });
        }
    }
}

ProductScreen.addControlButton({
    component: CierresFButton,
    condition: function () {
        return true;
    },
});
