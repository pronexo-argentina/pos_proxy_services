/** @odoo-module */

import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { patch } from "@web/core/utils/patch";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { roundDecimals, roundPrecision } from "@web/core/utils/numbers";
import { _t } from "@web/core/l10n/translation";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";



const { onMounted } = owl



patch(ReceiptScreen.prototype, {
    setup() {
        super.setup(...arguments);


        
        onMounted(async () => {

            if (this.pos.config.use_fiscal_printer){
                
                console.info('enviando ticket');
                var response = this.print_pos_ticket();
            }



        })


    },


    async state_printer() {
    try {
        const url = this.pos.config.proxy_fiscal_printer + '/state_printer';
        const response = await fetch(url, { method: "GET", timeout: 10000 });
        const res = await response.json();
        console.info("state_printer res:", res);
        this.message_error_printer_fiscal(res.response);
        return res;
    } catch (error) {
        this.message_error_printer_fiscal("Comunicación fallida con el Proxy");
        throw error;
    }
},


async print_pos_ticket() {
    const pos_config = this.env.services.pos.config;
    const url = `${pos_config.proxy_fiscal_printer}/print_pos_ticket`;

    console.info('print_pos_ticket url: ', url);

    const data = {
        vals: JSON.stringify(this.get_values_ticket())
    };

      //console.info("imprimiendo url");
      //console.info(data);

    try {
        const queryString = new URLSearchParams(data).toString();
        const response = await fetch(`${url}?${queryString}`, {
            method: "GET",
            timeout: 10000000, // Este campo no tiene efecto con fetch
        });

        const res = await response.json();
        console.info('print_pos_ticket res new: ', res);

        this.message_error_printer_fiscal(res['response']);
        return res;

    } catch (error) {
        this.message_error_printer_fiscal('Comunicación fallida con el Proxy');
        throw error;
    }
},




get_values_ticket() {
    //const order = this.env.services.pos.get_order();
    const order = this.pos.get_order();
    if (!order) return {};

    const type = this.get_value_type();
    console.info("name:");
    //const name = order.get_name();
    const name = order.pos_reference;
    console.info(name);
    const cliente = this.get_values_client();
    const items = this.get_values_items();
    const pagos = this.get_values_paymentlines();
    const descuentos = this.get_values_discount();

    const jsonTemplate = {
        name: name || '',
        type: type,
        cliente: cliente,
        items: items,
        pagos: pagos,
        descuentos: descuentos,
        ajustes: [] // Placeholder para futuros ajustes fiscales
    };

    console.info('jsonTemplate:', jsonTemplate);
    return jsonTemplate;
},




   get_value_type() {
    const order = this.env.services.pos.get_order();
    const partner = order?.partner_id;
    console.info("partner:");
    console.info(partner.l10n_ar_afip_responsibility_type_id.name);
    //const responsibilityType = partner?.l10n_ar_afip_responsibility_type_id.name?.[1];
    const responsibilityType = partner.l10n_ar_afip_responsibility_type_id.name;

    console.info("client responsibility:", responsibilityType);

    let type = 83; // Default: Consumidor Final (Factura B)

    if (responsibilityType) {
        if (responsibilityType === 'IVA Responsable Inscripto') {
            type = 81; // Factura A
        } else if (responsibilityType === 'Responsable Monotributo') {
            type = 111; // Factura C
        } else if (responsibilityType === 'IVA Sujeto Exento') {
            type = 82; // Factura B
        }
    }

    console.info("Tipo comprobante fiscal:", type);
    return type;
},



    get_values_client() {
    const order = this.env.services.pos.get_order();
    const partner = order?.partner_id;

    if (!partner) return {};

    const responsibilityType = partner.l10n_ar_afip_responsibility_type_id.name;
    const identificationType = partner.l10n_latam_identification_type_id.name;

     console.info("partner2:");
    console.info(responsibilityType);
    console.info("identification:");
    console.info(identificationType);

    let id_responsabilidad_iva = 'E';  // Default: Exento
    if (responsibilityType) {
        if (responsibilityType === 'IVA Responsable Inscripto') {
            id_responsabilidad_iva = 'I';
        } else if (responsibilityType === 'Responsable Monotributo') {
            id_responsabilidad_iva = 'M';
        } else if (responsibilityType === 'Consumidor Final') {
            id_responsabilidad_iva = 'F';
        } else if (responsibilityType === 'IVA Sujeto Exento') {
            id_responsabilidad_iva = 'E';
        }
    }

    let id_tipo_documento = 'T'; // Default: CUIT
    if (identificationType) {
        if (identificationType === 'CUIT') id_tipo_documento = 'T';
        else if (identificationType === 'DNI') id_tipo_documento = 'D';
        else if (identificationType === 'CUIL') id_tipo_documento = 'L';
        else if (identificationType === 'Pasaporte') id_tipo_documento = 'P';
    }

    return {
        nombre_o_razon_social1: partner.name || '',
        nombre_o_razon_social2: '',
        domicilio1: partner.street || '',
        domicilio2: partner.city || '',
        domicilio3: '',
        id_tipo_documento: id_tipo_documento,
        numero_documento: partner.vat || '',
        id_responsabilidad_iva: id_responsabilidad_iva,
        documento_asociado1: '',
        documento_asociado2: '',
        documento_asociado3: '',
        cheque_reintegro_turista: ''
    };
},
get_values_items() {
    const order_lines = this.env.services.pos.get_order().get_orderlines();
    const pos_config = this.env.services.pos.config;
    const type = this.get_value_type();
    const items = [];

    for (const line of order_lines) {
        //const product = line.product;
        //const taxes = line.get_taxes() || [];
        const product = line.get_product();
        const taxes = product.taxes_id || [];
        let iva = 0;
        let code_intern = '';
        let unit_measure = '0';

        // Obtener tasa IVA
        if (taxes.length) {
            iva = taxes[0].amount || 0;
        }

        // Unidad de medida (AFIP)
        const uom = line.get_unit();
        if (uom?.afip_uom) {
            unit_measure = String(parseInt(uom.afip_uom));
        }

        // Código interno
        if (product.barcode) {
            code_intern = product.barcode;
        } else if (product.default_code) {
            code_intern = product.default_code;
        } else {
            code_intern = '11111';
        }

        // Precio según versión de impresora y tipo de ticket
        let price = line.get_unit_price() * (1.0 - (line.get_discount() / 100.0));

        const all_prices = line.get_all_prices();
        if (pos_config.version_printer === 'hasar250') {
            price = all_prices.priceWithTax;
        } else if (pos_config.version_printer === 'epsont900fa') {
            if (type === 83) {
                console.info('is epson and is ticket 83');
                price = all_prices.priceWithTax / line.get_quantity();
            } else {
                console.info('is epson and is not ticket');
                price = all_prices.priceWithoutTax / line.get_quantity();
            }
        }



        // Descuento general aplicado como producto
        let product_discount_general = false;
        if (pos_config.module_pos_discount) {
            if (
                this.config.discount_product_id &&
                pos_config.discount_product_id[0] === product.id &&
                price < 0
            ) {
                product_discount_general = true;
            }
        }

        // Crear ítem
        items.push({
            description: product.display_name,
            description_extra1: '',
            qty: line.get_quantity(),
            price: price,
            iva: iva,
            unit_measure: unit_measure,
            code_intern: code_intern,
            product_discount_general: product_discount_general
        });
    }

    return items;
},




    get_values_paymentlines(){
        
        var paymentlines = this.env.services.pos.get_order().payment_ids;
        console.info('get_values_paymentlines: ', paymentlines);
        var pagos = [];
         /*[      
                {'codigo_forma_pago' : 20,
                'cantidad_cuotas' : 3, 'monto' : 0.02345, 'descripcion_cupones' : 'Cupones', 'descripcion' : 'Descripcion test', 'descripcion_extra1' : 'des1', 'descripcion_extra2' : 'des2'}
            ]*/
        for (var i = 0; i < paymentlines.length; i++){
            var pay = paymentlines[i];
            var payment_afip = 99;//Otras Formas de pago

            if (pay.payment_method && pay.payment_method.payment_afip) payment_afip = pay.payment_method.payment_afip;
            var payment_method = pay.payment_method;
            name = '';
            if(payment_method){
                name = payment_method.name;
            }

            var pay_vals = {
                'codigo_forma_pago' : payment_afip,
                'cantidad_cuotas': '',
                'monto' : pay.amount,
                'descripcion_cupones' : '',
                'descripcion' : name,
                'descripcion_extra1' : '',
                'descripcion_extra2' : ''
            }
            pagos.push(pay_vals);
        }
        return pagos;

    },

    

    get_values_discount(){
        var order_lines = this.env.services.pos.get_order().get_orderlines();
        var rounding = this.env.services.pos.currency.rounding;
        var sum_amount_discount = 0;
        var round_di = roundDecimals;       // Replaces utils.round_decimals
        var round_pr = roundPrecision;     // Replaces utils.round_precision

        for (var i = 0; i < order_lines.length; i++){
            var line = order_lines[i];
            var base_price = line.get_base_price()
            var price_line_bruto = round_pr(line.get_unit_price() * line.get_quantity(), rounding);
            var discount = price_line_bruto - base_price;
            //console.info('discount: ', discount);
            sum_amount_discount += discount;
        }
        if (sum_amount_discount == 0) return [];
        var vals = [      
            {'descripcion' : 'Descuentos', 'monto' : sum_amount_discount, 'tasa_iva' : '', 'codigo_interno' : '', 'codigo_condicion_iva' : ''}
        ];
        return vals;
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







})

