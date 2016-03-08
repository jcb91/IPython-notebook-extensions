define([
	'require',
	'jquery',
	'base/js/events',
	'base/js/utils',
	'services/config'
], function(
	require,
	$,
	events,
	utils,
	configmod
) {
	var timeoutID;
	var timeout = 100;
	var classes_to_add = 'table table-condensed table-nonfluid';

	function callback_output_appended (event, type, value, metadata, $toinsert) {
		// a table which was handled by pandoc
		var tables = $toinsert.find('tr.header').parent('thead').parent('table');
		// a markdown table as it appears in a markdown cell
		tables.add($toinsert.find('.rendered_html table'));
		tables.addClass(classes_to_add);
	}

	function bootstrapify () {
		timeoutID = undefined;
		// a table which was handled by pandoc
		$('tr.header').parent('thead').parent('table')
		// a markdown table as it appears in a markdown cell
			.add('.rendered_html table')
			.addClass(classes_to_add);
	}

	function queue_bootstrapify () {
		setTimeout(bootstrapify, timeout);
	}

	function add_css (name) {
        var link = $('<link/>').attr({
			type: 'text/css',
			rel: 'stylesheet',
			href: require.toUrl(name)
        }).appendTo('head');
    }

	function load_jupyter_extension () {
		add_css('./main.css');

		var base_url = utils.get_body_data('baseUrl');
		var config = new configmod.ConfigSection('notebook', {base_url: base_url});
		config.load();
		config.loaded.then(function() {
			if (config.data.hasOwnProperty('bootstrapify_tables_timeout')) {
				timeout = config.data.bootstrapify_tables_timeout;
			}
		});
		
		events.on('rendered.MarkdownCell', queue_bootstrapify);
		events.on('output_appended.OutputArea', callback_output_appended);
		queue_bootstrapify();
	}

	return {
		load_ipython_extension : load_jupyter_extension
	};
});
