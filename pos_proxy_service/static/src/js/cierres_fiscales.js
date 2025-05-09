/**@odoo-module **/
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";
import { _t } from "@web/core/l10n/translation";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { patch } from "@web/core/utils/patch";
patch(ControlButtons.prototype, {
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





              const payload = await makeAwaitable(this.dialog, SelectionPopup, {
               title: _t('Selecciona X Parcial o Z Cierre'),
               list: listaCierres,

           });
        


                if (payload) {
                    console.info(payload);


                    if (payload == 'z'){
                    var con = confirm("¿Esta seguro de imprimir cierre Z?");
                    if (!con){
                        return;
                    }
                }



                var response = this.print_pos_fiscal_close(payload);
                }
    },


   

        async print_pos_fiscal_close(type) {
        const posConfig = this.env.services.pos.config;
        const url = `${posConfig.proxy_fiscal_printer}/print_pos_fiscal_close`;
        console.info('print_pos_fiscal_close url: ', url);
        const params = new URLSearchParams({ type });

        try {
            const response = await fetch(`${url}?${params.toString()}`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            console.info("print_pos_fiscal_close res:", result);

            this.message_error_printer_fiscal(result.response);
            return result;
        } catch (error) {
            this.message_error_printer_fiscal("Comunicación fallida con el Proxy");
            throw error;
        }
    },

        message_error_printer_fiscal(error){
        var self= this;
        if (error != true){

        const { popup } = this.env.services;
        this.dialog.add(AlertDialog, {
            title: _t("Error"),
            body: _t("Comunicación fallida con el Proxy."),
        });
        }
    }


});