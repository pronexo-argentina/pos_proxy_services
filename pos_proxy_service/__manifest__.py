# -*- coding: utf-8 -*-
#    Copyright (C) 2007  pronexo.com  (https://www.pronexo.com)
#    All Rights Reserved.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
############################################################################## # 
# 
{
    'name': "Pos Proxy Services",

    'summary': """
        Proxy para usar odoo con impresoras fiscales Argentinos para Epson / Hasar """,

    'description': """
        Odoo 16 con impresoras Fiscales Epson, Impresor Fiscal Hasar Nueva generacion-
    """,

    'author': "Pronexo",
    'website': "https://www.pronexo.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Sales/Point of Sale',
    'version': '16.0.0.0',
    'license': 'OPL-1',

    # any module necessary for this one to work correctly
    'depends': ['base','point_of_sale'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/uom_view.xml',
        'views/pos_payment_method_view.xml',
        'views/pos_config_view.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_proxy_service/static/src/js/btn_cierres.js',
            'pos_proxy_service/static/src/js/screen.js',
            'pos_proxy_service/static/src/xml/**/*',
        ]
    },
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],

    'auto_install': False,
    'installable': True,
    'price': 1275,
    'currency': 'USD',
    'images': ['images/pos-proxy-service-home.png'],
    'live_test_url': 'https://www.youtube.com/watch?v=SKFlc8bKZAI'
}
