/** @odoo-module */

import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { patch } from "@web/core/utils/patch";


patch(PosOrder.prototype, {

    setup(_defaultObj, options) {
        super.setup(...arguments);
        if(this.config.factura_automatica){
        this.to_invoice = true;
      }  
    },

    is_to_invoice() {
         if(this.config.factura_automatica){
        return true;
    }
    },

    set_to_invoice(to_invoice) {
         if(this.config.factura_automatica){
        this.assert_editable();
        this.to_invoice = true;
       } 
    },
});
