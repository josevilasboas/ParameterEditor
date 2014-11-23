describe('Parametereditor intialization', function() {
    
    var $fixture;
    var $container;

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
            $fixture = $('<div>');
            $fixture.parametereditor({});
            done();
        });
    });

    // should draw a container to wrap all the widget HTML
    it("should draw a container to wrap all the widget HTML", function() {
        $container = $fixture.find(':first-child');
        var clazz = $container.attr('class');
        expect(clazz).toContain('col-md-12');
        expect(clazz).toContain('parametereditor-container');
    });


    // the container should contain two pills
    it("the container should contain two pills", function() {
        var $ul = $fixture.find('ul:first-child');
        var $pills = $ul.find('li');
        expect($pills.length).toEqual(2);
    });

    // the container should contain two pills
    it("the container should contain two tab panes", function() {
        var $tabContent = $fixture.find('div:first-child');
        var $tabPanes = $tabContent.find('div.tab-pane');
        expect($tabPanes.length).toEqual(2);
    });
});