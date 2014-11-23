var requireConfig = {
    shim : {
        "bootstrap" : {
            "deps": ['jquery']
        },
        "fancytree" : { "deps": ['jquery'] },
        "contextmenu" : { "deps": ['jquery'] },
        "select2" : { "deps": ['jquery'] },
        "datetimepicker" : { "deps": ['jquery'] },
        "parametereditor": { "deps": ['jquery', 'fancytree', 'codemirror', 'contextmenu'] }
    },
    paths: {
        "jquery" : "lib/jquery/jquery-2.1.1",
        "jqueriui": "lib/jquery-ui-1.11.2/jquery-ui",

        "bootstrap" :  "lib/bootstrap/dist/js/bootstrap",
        
        "codemirror":               "lib/codemirror-4.7/lib/codemirror",
        "codemirror-foldcode":      "lib/codemirror-4.7/addon/fold/foldcode",
        "codemirror-foldgutter":    "lib/codemirror-4.7/addon/fold/foldgutter",
        "codemirror-brace-fold":    "lib/codemirror-4.7/addon/fold/brace-fold",
        "codemirror-comment-fold":  "lib/codemirror-4.7/addon/fold/comment-fold",
        "codemirror-xml":           "lib/codemirror-4.7/mode/xml/xml",
        "codemirror-xml-fold":      "lib/codemirror-4.7/addon/fold/xml-fold",
        "codemirror-matchtags":     "lib/codemirror-4.7/addon/edit/matchtags",
        "codemirror-closetag":      "lib/codemirror-4.7/addon/edit/closetag",
        "codemirror-showhint":      "lib/codemirror-4.7/addon/hint/show-hint",
        "codemirror-xmlhint":       "lib/codemirror-4.7/addon/hint/xml-hint",
        "codemirror-formatting":    "lib/codemirror-4.7/addon/format/formatting",

        "fancytree": "lib/fancytree-2.3.0/dist/jquery.fancytree",
        
        "contextmenu": "lib/jQuery-contextMenu-master/src/jquery.contextMenu",
        
        "select2": "lib/select2-3.5.2/select2",
        
        "datetimepicker": "lib/bootstrap-datetimepicker-0.0.11/js/bootstrap-datetimepicker.min",

        "parametereditor": "src/js/parametereditor"
    }
};

require.config(
	requireConfig
);