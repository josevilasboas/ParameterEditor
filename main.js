require([
	"jquery",
    "codemirror",
    "codemirror-foldcode",
    "codemirror-foldgutter",
    "codemirror-brace-fold",
    "codemirror-comment-fold",
    "codemirror-xml",
    "codemirror-xml-fold",
    "codemirror-matchtags",
    "codemirror-closetag",
    "codemirror-showhint",
    "codemirror-xmlhint",
    "codemirror-formatting",
	"jqueriui",
    "bootstrap",
    "contextmenu",
    "fancytree",
    "select2",
    "datetimepicker",
	"parametereditor"
	], function(jQuery) {
    
    var $container = $('#parametereditor');

    $container.parametereditor({
    });
});