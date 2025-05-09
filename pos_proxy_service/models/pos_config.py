# -*- coding: utf-8 -*-

from odoo import fields, models

class PosConfig(models.Model):
	_inherit = 'pos.config'
	use_fiscal_printer = fields.Boolean('Impresora Fiscal')
	proxy_fiscal_printer = fields.Char('Ip Impresora Fiscal', default='http://127.0.0.1:5005')
	version_printer = fields.Selection([
		('hasar250', 'Hasar 250'),
		('epsont900fa', 'Epson T900FA'),
	], default='epsont900fa')


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'
    use_fiscal_printer = fields.Boolean(related='pos_config_id.use_fiscal_printer',readonly=False)
    proxy_fiscal_printer = fields.Char(related='pos_config_id.proxy_fiscal_printer',readonly=False)
    version_printer= fields.Selection(related='pos_config_id.version_printer',readonly=False)
