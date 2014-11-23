describe('Fancytree methods', function() {
    
    var $fixture;
    var $fancyTree;
    var fancyTree;

    beforeEach(function (done) {
        require([
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
        ], function() {
            if (!($fixture)) {
                $fixture = $('<div>');
                $fixture.parametereditor({});
            }
            done();
        });
    });

    // should add a new node to the root of fancy tree
    it("should add a new node to the root of fancy tree", function() {
        $fancyTree = $fixture.find('[data-bind="fancytree"]');
        $fixture.parametereditor('addNode');
        fancyTree = $fancyTree.fancytree("getTree");
        var tree = fancyTree.toDict(true);
        expect(tree.children.length).toEqual(1);
    });


    // the added element should have the values used on inputs after clicking of the fancytree
    it("the added node, should be updated after hitting 'Enter' key", function() {
        
        // edit the values of the new node
        var typeVal = 'String';
        var nameVal = 'My var name';
        var valueVal = 'My var value';
        
        // fill the inputs
        var $type = $fixture.find('[data-bind="type"]');
        var $name = $fixture.find('[data-bind="name"]');
        var $value = $fixture.find('[data-bind="value"]');
        $type.select2('val', typeVal, true);
        $name.find('input').val(nameVal);
        $value.find('input').val(valueVal);

        // trigger 'Enter' key press
        var $elemTrigger = $fancyTree.find('.fancytree-title');
        var e = $.Event('keydown');
        e.which = 13; // Character 'Enter'
        $elemTrigger.trigger(e);

        var tree = fancyTree.toDict(true);
        var node = tree.children[0];

        expect(node.data.type).toEqual(typeVal);
        expect(node.data.name).toEqual(nameVal);
        expect(node.data.value).toEqual(valueVal);
    });
});