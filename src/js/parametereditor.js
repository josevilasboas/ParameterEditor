if (typeof jQuery === 'undefined') {
    throw new Error('Parametereditor\'s JavaScript requires jQuery');
}

if (typeof CodeMirror === 'undefined') {
    CodeMirror = require('codemirror');
}

(function ($) {
    
    "use strict";

    // Type of the values that could be created
    var types = [
        {
            id: 'String',
            text: 'String'
        },
        {
            id: 'Integer',
            text: 'Integer'
        },
        {
            id: 'Long',
            text: 'Long'
        },
        {
            id: 'Float',
            text: 'Float'
        },
        {
            id: 'Double',
            text: 'Double'
        },
        {
            id: 'Boolean',
            text: 'Boolean'
        },
        {
            id: 'Date',
            text: 'Date'
        },
        {
            id: 'Map',
            text: 'Map'
        },
        {
            id: 'Array',
            text: 'Array'
        }
    ];

    // Tags to be used on xml creation
    var tags = {
        "!top": ["parameter"],
        parameter: {
            attrs: {
                type: $.map(types, function (val, i) {
                    return val.text;
                }),
                name: null
            },
            children: ["parameter"]
        }
    };

    $.widget('sample.parametereditor', {

        options : {
            wId: null,
            value: "",
            defaultType: 'tree',
            disabled: false,
            // callbacks
            onInitValue: undefined
        },

        /**
         * Create widget
         */
        _create: function() {
            var self = this;
        },


        /**
         *	Initiate fields with initial data
         */
        _init: function() {
            var self = this;
            self.widgetUUID = self.widgetName + new Date().getTime();
            self.parser = new DOMParser();
            self.serializer = new XMLSerializer();
            self._draw();
        },

        /**
         * Draw the widget
         */
        _draw: function () {
            var self = this;
            
            self._drawBody();

            self.elements = {
                $fancyTreeContainer: self._getPillContainer('tree'),
                $codeMirrorContainer: self._getPillContainer('xml'),
                $navPills: self.element.find('ul.nav-pills li a'),
                $tabContent: self.element.find('.tab-content'),
                $tabPane: self.element.find('.tab-pane')
            };

            self._drawFancyTreeContainer(self.elements.$fancyTreeContainer);
            self.elements.$fancyTree = self.elements.$fancyTreeContainer.find('[data-bind="fancytree"]');
            self.elements.$fancyTreeMenu = self.elements.$fancyTreeContainer.find('[data-bind="contextmenu"]');

            self._drawCodeMirrorContainer(self.elements.$codeMirrorContainer);
            self.elements.$codeMirror = self.elements.$codeMirrorContainer.find('[data-bind="codemirror"]');

            var elementHeight = self.element.outerHeight();
            var ulHeight = self.element.find('ul').outerHeight(true);
            var tabHeight = elementHeight - ulHeight;
            self.elements.$tabContent.css('height', tabHeight);
            self.elements.$tabPane.css('height', tabHeight - 2 /* Two pixels of border */);
            
            self._renderCodeMirror();
            self._renderFancyTree();
            self._atachPillsEvents();

            if (!self.options.disabled) {
                self._renderFancyTreeContextMenu();
            }

            self.setValue(self.options.value);
        },



        /********************
        ** Dom manipulation BEGIN
        *********************/

        /**
         * Draw the widget body
         */
        _drawBody: function () {
            var self = this;

            var $container = $('<div>').appendTo(self.element);
            $container.addClass('col-md-12 parametereditor-container');

            self._drawPills($container);
            self._drawPillsContainer($container);
        },

        /**
         * Draw widget tab pills
         * @param  {Dom} $container Dom where the pills group will be draw
         */
        _drawPills: function ($container) {
            var self = this;

            var $ul = $('<ul>').appendTo($container);
            $ul.addClass('nav nav-pills');

            // Tree pill
            self._drawPill($ul, 'tree', 'Tree', true);
            
            // XML pill
            self._drawPill($ul, 'xml', 'XML', false);
        },

        /**
         * Draw tab pill
         * @param  {Dom}  $ul         Dom where the pill will be draw
         * @param  {String}  type     Type of the pill (tree/xml)
         * @param  {String}  text     Pill label
         * @param  {Boolean} isActive If the pill is the actual active pill
         */
        _drawPill: function ($ul, type, text, isActive) {
            var self = this;

            var $li = $('<li>').appendTo($ul);
            $li.attr('data-value', type);
            
            if (isActive) {
                $li.addClass('active');
            }

            var $a = $('<a>').appendTo($li);
            $a.attr({
                'href': '#' + type + '-container',
                'data-toggle': 'pill'
            });
            $a.text(text);
        },

        /**
         * Draw the pills tab content
         * @param  {Dom} $container Container where the tab content will be draw
         */
        _drawPillsContainer: function ($container) {
            var self = this;

            var $tab = $('<div>').appendTo($container);
            $tab.addClass('tab-content');

            // Tree container
            self._drawPillContainer($tab, 'tree', true);

            // XML container
            self._drawPillContainer($tab, 'xml', false);
        },

        /**
         * Draw the pill tab content
         * @param  {Dom}  $tab        Dom where the pane will be draw
         * @param  {String}  type     Type of the pane (tree/xml)
         * @param  {Boolean} isActive If the pane is the actual active pane
         */
        _drawPillContainer: function ($tab, type, isActive) {
            var self = this;

            var $pane = $('<div>').appendTo($tab);
            $pane.addClass('tab-pane');

            if (isActive) {
                $pane.addClass('active');
            }

            $pane.attr({
                'id': type + '-container'
            });
        },

        /**
         * Get the tab pane by type
         * @param  {String} type Pane type (tree/xml)
         * @return {Dom}      Tab pane Dom
         */
        _getPillContainer: function (type) {
            var self = this;

            return self.element.find('.tab-content').find('#' + type + '-container');
        },

        /**
         * Draw fanty tree container
         * @param  {Dom} $container Dom where the fancy tree container will be draw
         */
        _drawFancyTreeContainer: function ($container) {
            var self = this;

            var $fancytree = $('<div>').appendTo($container);
            $fancytree.addClass('parametereditor-fancytree');
            $fancytree.attr('data-bind', 'fancytree');
            var $ul = $('<ul>').appendTo($fancytree);
            $ul.attr('data-bind', 'contextmenu');
            $ul.addClass('contextMenu ui-helper-hidden');
        },

        /**
         * Draw code mirror contaier
         * @param  {[type]} $container Dom where the code mirror container will be draw
         */
        _drawCodeMirrorContainer: function ($container) {
            var self = this;

            var $textarea = $('<textarea>').appendTo($container);
            $textarea.attr('data-bind', 'codemirror');
        },

        /**
         * Attach pill events, to call the convertion between tree and xml
         */
        _atachPillsEvents: function () {
            var self = this;
            self.elements.$navPills.off('shown.bs.tab').on('shown.bs.tab', function (evt) {
                var $pill = $(evt.target);
                var type = $pill.parent().attr('data-value');
                self._changeTab(type);
            });
        },

        /**
         * Get the actual active type (tree/xml)
         * @return {String} type (tree/xml)
         */
        _getActiveTab: function () {
            var self = this;
            return self.elements.$navPills.parent('.active').attr('data-value');
        },

        /**
         * Execute the change tab action (convert data form tree to xml and vice versa)
         * @param  {String} tab mode type (tree/xml)
         */
        _changeTab: function (tab) {
            var self = this;
            var xml, tree, str;
            if (tab === 'xml') {
                // Convert tree to xml
                tree = self._xmlFancyTree.toDict(true);
                xml = self._convertTreeToXml(tree);
                str = self._convertXmlToString(xml);
                self._setCodeMirrorValue(str);
            } else if (tab === 'tree') {
                // Set the actuaNode to null
                self.actualNode = null;
                // Convert xml to tree
                str = self._xmlCodeMirror.getValue();
                xml = self._convertStringToXml(str);
                tree = self._convertXmlToTree(xml);
                self._setFancyTreeValue(tree);
            }
        },

        /********************
        ** Dom manipulation END
        *********************/

        
        

        /*****************
        ** Codemirror BEGIN
        ******************/

        /**
         * Render Codemirror 
         */
        _renderCodeMirror: function () {
            var self = this;

            function completeAfter(cm, pred) {
                var cur = cm.getCursor();
                if (!pred || pred()) setTimeout(function() {
                    if (!cm.state.completionActive)
                        CodeMirror.showHint(cm, CodeMirror.hint.xml, {schemaInfo: tags, completeSingle: false});
                }, 100);
                return CodeMirror.Pass;
            }

            function completeIfAfterLt(cm) {
                return completeAfter(cm, function() {
                    var cur = cm.getCursor();
                    return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
                });
            }

            function completeIfInTag(cm) {
                return completeAfter(cm, function() {
                    var tok = cm.getTokenAt(cm.getCursor());
                    if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
                    var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
                    return inner.tagName;
                });
            }

            self._xmlCodeMirror = CodeMirror.fromTextArea(self.elements.$codeMirror[0], {
                mode: {
                    //name: "xml-eb",
                    name: "xml",
                    alignCDATA: true
                },
                indentUnit: 4,
                lineNumbers: true,
                //lineWrapping: true,
                autoCloseTags: true,
                matchTags: {bothTags: true},
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                extraKeys: {
                    "'<'": completeAfter,
                    "'/'": completeIfAfterLt,
                    "' '": completeIfInTag,
                    "'='": completeIfInTag,
                    "Ctrl-Space": function(cm) {
                        CodeMirror.showHint(cm, CodeMirror.hint.xml, {schemaInfo: tags});
                    }
                },
                readOnly: self.options.disabled || false
            });
        },

        /**
         * Set codemirror value
         * @param {String} value Codemirror xml value
         */
        _setCodeMirrorValue: function (value) {
            var self = this;
            self._xmlCodeMirror.setValue(value);
            self._autoFormatCodeMirror();
        },

        /**
         * Format codemirror xml value
         */
        _autoFormatCodeMirror: function () {
            var self = this;
            var totalLines = self._xmlCodeMirror.lineCount();
            var totalChars = self._xmlCodeMirror.getTextArea().value.length;
            self._xmlCodeMirror.autoFormatRange({line:0, ch:0}, {line:totalLines, ch:totalChars});
        },

        /*****************
        ** Codemirror END
        ******************/


        /***************
        ** Fancytree BEGIN
        ****************/
        /**
         * Render fancytree
         */
        _renderFancyTree: function () {
            var self = this;


            self.elements.$fancyTree.fancytree({
                icons: false,
                keyboard: false,
                dblclick: function(event, data) {
                    if (!self.options.disabled /*&& !($.isEmptyObject(self.editNode))*/) {
                        var $spanTitle = $(data.node.span).find('.fancytree-title');
                        self._editNode($spanTitle, data.node);
                    }
                },
                beforeActivate: function (event, data) {
                    self.actualNode = data.node;
                }
            });

            self._xmlFancyTree = self.elements.$fancyTree.fancytree("getTree");

            // click event
            self.elements.$fancyTree.parent().off('click').on('click', function (evt) {
                var $clickElem = $(evt.target).closest('.fancytree-title');
                // Stop editing if any elemetn is beeing edited and if clicked outside the editing element
                if (self.$editElem && self.$editElem.length > 0 && ($clickElem.length === 0 || $clickElem[0] !== self.$editElem[0])) {
                    self._stopEdit(false);
                } else {
                    // Deactivate all nodes
                    if ($(evt.target).parent().attr('data-bind') === self.elements.$fancyTree.attr('data-bind')) {
                        self._xmlFancyTree.visit(function(node){
                            node.setActive(false);
                        });
                        self.actualNode = null;
                    }
                }

                return true;
            });


        },

        /**
         * Set fancytree value
         * @param {Node} value Fancy tree node value
         */
        _setFancyTreeValue: function (value) {
            var self = this;
            self._xmlFancyTree.reload(value);
        },

        /**
         * Render fancytree context menu, with the options 'Add' and 'Delete'
         */
        _renderFancyTreeContextMenu: function () {
            var self = this;
            $.contextMenu({
                //selector: '.' + self.widgetUUID + '-parametermapeditor-fancy-tree',
                selector: '[data-bind="fancytree"]',
                callback: function(key, options) {
                    self._executeFancyTreeMenuEvent(key);
                },
                events: {
                    show: function(opt) {
                        //this.addClass('currently-showing-menu');
                        //alert("Selector: " + opt.selector);
                        if (!self.actualNode) {
                            var tree = self._xmlFancyTree.toDict(true);
                            if (!tree.children || tree.children.length === 0/* || self.options.multiple*/) {
                                opt.items['add'].disabled = false;
                                opt.items['delete'].disabled = true;
                            } else {
                                opt.items['add'].disabled = true;
                                opt.items['delete'].disabled = true;
                            }
                        } else {
                            var data = self.actualNode.data;
                            if ($.inArray(data.type, ['Map', 'Array']) > -1) {
                                opt.items['add'].disabled = false;
                                opt.items['delete'].disabled = false;
                            } else {
                                opt.items['add'].disabled = true;
                                opt.items['delete'].disabled = false;
                            }
                        }
                    }
                },
                items: {
                    "add": {
                        name: 'Add'
                    },
                    "sep1": "---------",
                    "delete": {
                        name: 'Delete'
                    }
                }
            });
        },

        /**
         * Ececute fancytree context menu action
         * @param  {String} menu Action clicked (add/delete)
         */
        _executeFancyTreeMenuEvent: function (menu) {
            var self = this;
            var selectedNode = self.actualNode;
            switch (menu) {
                case "add":
                    self.addNode(selectedNode);
                    break;
                case "delete":
                    self.actualNode = undefined;
                    self._deleteNode(node);
                    break;
            }
        },

        /**
         * Add new fancytree node
         * @param {Node} selectedNode Parent node
         */
        addNode: function (selectedNode) {
            var self = this;
            var childObj = self._createEmptyTreeElement();
            var newNode;
            // Add new child
            if (selectedNode) {
                self._updateChildIfArray(selectedNode, childObj);
                newNode = selectedNode.addChildren(childObj);
                selectedNode.setExpanded(true);
                
            } else {
                newNode = self._xmlFancyTree.rootNode.addChildren(childObj);
            }
            var elem = $(newNode.span).find('.fancytree-title');
            self._editNode(elem, newNode);
        },

        /**
         * Delete fancytree node
         * @param  {Node} node Node to be deleted
         */
        _deleteNode: function (node) {
            var self = this;
            node.remove();
        },

        /**
         * Create the edit form of a node
         * @param  {Dom} $srcElement Dom where the edit form will be draw
         * @param  {Node} node        Node that has the data to place on the form
         */
        _editNode: function ($srcElement, node) {
            var self = this;
            var tree = node.tree, $elem, value, type;
            // Disable dynatree mouse- and key handling
            //tree.widget.unbind();
            //tree.$container.unbind();
            // Replace node with <input>
            // if
            //$elem = $(srcElement).closest('.fancytree-title');
            $elem = $srcElement;
            self.$editElem = $elem;
            self.editNode = node;
            self.$editElem.find('[data-bind="title"]').hide();
            

            if ($elem.length > 0) {
                self._drawNodeElement($elem);

                $elem.closest('.fancytree-title').addClass('edit-fancytree-title');

                var elements = {
                    $type: $elem.find('[data-bind="type"]'),
                    $name: $elem.find('[data-bind="name"]'),
                    $value: $elem.find('[data-bind="value"]')
                };


                self._initEdit(elements, node);

                $elem.keydown(function(event) {
                    var stopEditing = false;
                    var isDiscard = false;
                    switch( event.which ) {
                        case 27: // [esc]
                            // discard changes on [esc]
                            stopEditing = true;
                            isDiscard = true;
                            break;
                        case 13: // [enter]
                            // simulate blur to accept new value
                            stopEditing = true;
                    }
                    
                    if (stopEditing) {
                        self._stopEdit(isDiscard);
                    }
                });
            }
        },

        /**
         * Create the edit form
         * @param  {Dom} $elem Dom where the edit form will be draw
         */
        _drawNodeElement: function ($elem) {
            var self = this;

            $elem.addClass('container-fluid');

            var $div = $('<div>').appendTo($elem);
            $div.addClass('edit-tree-node');
            
            var $divType = $('<div>').appendTo($div);
            $divType.addClass('col-md-4');
            $divType.attr('data-bind', 'type');
            
            var $divName = $('<div>').appendTo($div);
            $divName.addClass('col-md-3');
            $divName.attr('data-bind', 'name');
            var $inputName = $('<input>').appendTo($divName);
            $inputName.addClass('edit-tree-node-input');
            $inputName.attr({
                'type': 'text',
                'placeholder': 'Name'
            });

            var $divValue = $('<div>').appendTo($div);
            $divValue.addClass('col-md-5');
            $divValue.attr('data-bind', 'value');

        },

        /**
         * Draw all form fields
         * @param  {Object} elements Object with the Dom of each field to be draw
         * @param  {Node} node     Node to be draw
         */
        _initEdit: function (elements, node) {
            var self = this;

            self._initTypeSelect2(elements.$type, elements.$value, node);
            self._initName(elements.$name, node);
            self._initValue(elements.$value, node.data.type, node.data.value);
        },

        /**
         * Validate the edit form
         * @return {Boolean}    True if valid
         */
        _validEdit: function () {
            var self = this;

            var isValid = false;
            if (self.$editElem && self.$editElem.length > 0) {
                // update node
                var type = self._getTypeElementValue(self.$editElem);
                var name = self._getNameElementValue(self.$editElem);
                if (type && type !== '' && name && name !== '') {
                    isValid = true;
                }
            }
            return isValid;
        },

        /**
         * Stop a node editon
         * @param  {Boolean} isDiscard  If true, the info field on the form, should be discarded,
         *                              else, the info should be savev on the node
         */
        _stopEdit: function (isDiscard) {
            var self = this;

            if (self.editNode && self.$editElem && self.$editElem.length > 0) {
                if (isDiscard) {
                    if (self.editNode.data.type === null &&
                        self.editNode.data.name === null &&
                        self.editNode.data.value === null) {
                        self.editNode.remove();
                    } else {
                        self.editNode.renderTitle();
                    }
                    
                } else {
                    var isValid = self._validEdit();
                    if (isValid) {
                        // update node
                        self.editNode.data.type = self._getTypeElementValue(self.$editElem);
                        self.editNode.data.name = self._getNameElementValue(self.$editElem);
                        self.editNode.data.value = self._getValueElementValue(self.$editElem, self.editNode.data.type);
                        self._formatTitle(self.editNode);
                        // Update child names
                        self._updateChildrenIfArray(self.editNode);
                        self.editNode.renderTitle();
                    }
                }
            }
            self.editNode = undefined;
            self.$editElem = undefined;
        },

        /**
         * Draw select2 with the available types
         * @param  {Dom} $type  Dom where the select2 should be draw
         * @param  {Dom} $value Dom where the value field should be draw
         * @param  {Node} node   Node that is being edit
         */
        _initTypeSelect2: function ($type, $value, node) {
            var self = this;

            $type.off('change');
            $type.select2({
                placeholder: 'Type',
                data: types
            }).on('change', function (evt) {
                var type = evt.val;
                self._initValue($value, type, null);
            });
            $type.select2('val', node.data.type);
        },

        /**
         * Draw input field for the name property
         * @param  {Dom} $name Dom where the input should be draw
         * @param  {Node} node   Node that is being edit
         */
        _initName: function ($name, node) {
            var self = this;
            var parentType = node.parent.data.type;
            if (parentType === 'Array') {
                $name.find('input').attr('disabled', 'disabled');
            } else {
                $name.find('input').removeAttr('disabled');
            }
            $name.find('input').val(node.data.name);
        },

        /**
         * Draw value field based on the type of the node
         * @param  {Dom} $name Dom where the value field should be draw
         * @param  {Object} node   Value field value
         */
        _initValue: function ($value, type, value) {
            var self = this;
            
            // Empty value element
            $value.empty();

            if (type === 'String') {
                $value.html('<input class="edit-tree-node-input" type="text" placeholder="Value' + (value ? '" value="' + value : '') + '">');
            } else if ($.inArray(type, ['Integer', 'Long', 'Float', 'Double']) > -1) {
                switch (type) {
                    case 'Integer':
                        value = parseInt(value, 10);
                        break;
                    case 'Long':
                        value = parseInt(value, 10);
                        break;
                    case 'Float':
                        value = parseFloat(value);
                        break;
                    case 'Double':
                        value = parseFloat(value);
                        break;
                }
                $value.html('<input class="edit-tree-node-input" type="number" placeholder="Value' + (value ? '" value="' + value : '') + '">');
            } else if (type === 'Boolean') {
                
                self._drawBooleanValue($value);
                value = value ? value : 'true';
                var $inputBoolean = $value.find('input#' + value);
                $inputBoolean.attr('checked', 'checked');
                $inputBoolean.closest('label').addClass('active');

            } else if (type === 'Date') {
                self._drawDateValue($value);

                var picker = $value.find('[data-bind="datepicker"]').datetimepicker({
                    /*maskInput: true,           // disables the text input mask
                    pickDate: true,            // disables the date picker
                    pickTime: true,            // disables de time picker
                    pick12HourFormat: false,   // enables the 12-hour format time picker
                    pickSeconds: true*/
                }).data('datetimepicker');

                if (value) {
                    // Date string need to have 14 digits
                    var size = value.length;
                    for (var i = size; i < 14; i ++) {
                        value = value + '0';
                    }
                    // Convert string to date
                    var date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8));
                    picker.setLocalDate(date);
                }
            }
            self._trigger('onInitValue', self, {$elem: $value, type: type});
        },

        /**
         * Draw datepicker Dom if node type is a Date
         * @param  {Dom} $value Dom where the datepicker should be draw
         */
        _drawDateValue: function ($value) {
            var self = this;

            var $div = $('<div>').appendTo($value);
            $div.addClass('input-group date');
            $div.attr('data-bind', 'datepicker');
            //$div.attr('id', 'parametereditor-date-value');

            var $input = $('<input>').appendTo($div);
            $input.addClass('form-control');
            $input.attr({
                'data-format': 'yyyy-MM-dd',
                'type': 'text'
            });

            var $iconSpan = $('<span>').appendTo($div);
            $iconSpan.addClass('btn add-on input-group-addon');

            var $icon = $('<span>').appendTo($iconSpan);
            $icon.addClass('glyphicon glyphicon-calendar');
        },

        /**
         * Draw radio buttons if node type is a Date
         * @param  {Dom} $value Dom where the radio buttons should be draw
         */
        _drawBooleanValue: function ($value) {
            var self = this;

            var $group = $('<div>').appendTo($value);
            $group.addClass('btn-group btn-group-sm');
            $group.attr('data-toggle', 'buttons');

            var $trueLabel = $('<label>').appendTo($group);
            $trueLabel.addClass('btn btn-default');
            var $trueInput = $('<input>').appendTo($trueLabel);
            $trueInput.attr({
                'type': 'radio',
                'name': 'booelan',
                'id': 'true',
                'autocomplete': 'off'
            });
            $trueLabel.append('True');

            var $falseLabel = $('<label>').appendTo($group);
            $falseLabel.addClass('btn btn-default');
            var $falseInput = $('<input>').appendTo($falseLabel);
            $falseInput.attr({
                'type': 'radio',
                'name': 'booelan',
                'id': 'false',
                'autocomplete': 'off'
            });
            $falseLabel.append('False');
        },

        /**
         * Get type field Dom
         * @param  {Dom} $elem edit Dom
         * @return {Dom}       type field Dom
         */
        _getTypeElementValue: function ($elem) {
            var self = this;
            var $type = $elem.find('[data-bind="type"]');
            return $type.select2('val');
        },

        /**
         * Get name field Dom
         * @param  {Dom} $elem edit Dom
         * @return {Dom}       name field Dom
         */
        _getNameElementValue: function ($elem) {
            var self = this;
            var $name = $elem.find('[data-bind="name"]');

            return $name.find('input').val();
        },

        /**
         * Get value field value
         * @param  {Dom} $elem edit Dom
         * @param  {String} type of the elem
         * @return {Object}       value field value
         */
        _getValueElementValue: function ($elem, type) {
            var self = this;
            var value;
            var $value = $elem.find('[data-bind="value"]');

            if ($.inArray(type, ['String', 'Integer', 'Long', 'Float', 'Double']) > -1) {
                value = $value.find('input').val();
            } else if (type === 'Boolean') {
                //value = $value.wedoswitchtoggle('value').toString();
                value = $value.find('input:checked').attr('id');
            } else if (type === 'Date') {
                var picker = $value.find('[data-bind="datepicker"]').data('datetimepicker');
                var date = picker.getLocalDate();
                value = date.getFullYear() + '' + (date.getMonth()+1) + '' + date.getDate();
            }

            return value;
        },

        /***************
        ** Fancytree END
        ****************/

        /***************
        **  CONVERSION
        ****************/

        /**
         * Convert fancytree Tree to XML
         * @param  {Object} tree fancytree tree
         * @return {XML Element}      converted Tree to XML
         */
        _convertTreeToXml: function (tree) {
            var self = this;
            var root;
            if (tree) {
                var doc = document.implementation.createDocument("","", null);
                root = self._convertTreeToXmlRec(tree.children[0], doc);
            }
            return root;
        },

        /**
         * Convert fancytree node to XML
         * @param  {Node} tree fancytree node
         * @param  {XML Doc} doc  XML document
         * @return {XML Element}      converted node to XML
         */
        _convertTreeToXmlRec: function (tree, doc) {
            var self = this;
            var element, elementChild;

            if (tree) {
                element = self._createXmlNode(tree, doc);

                if (tree.children) {
                    for (var i = 0; i < tree.children.length; i++) {
                        elementChild = self._convertTreeToXmlRec(tree.children[i], doc);
                        // if array rmeove name attr
                        if (tree.data.type === 'Array') {
                            elementChild.removeAttribute('name');
                        }
                        element.appendChild(elementChild);
                    }
                }
            }
            return element;
        },

        /**
         * Create a XML node
         * @param  {Node} tree fancytree node
         * @param  {XML Doc} doc  XML document
         * @return {XML Element}      XML Element
         */
        _createXmlNode: function (tree, doc) {
            var self = this;
            var element, attribute, textNode;

            element = doc.createElement('parameter');

            attribute =  doc.createAttribute('type');
            attribute.nodeValue = tree.data.type;
            element.setAttributeNode(attribute);
            
            attribute =  doc.createAttribute('name');
            attribute.nodeValue = tree.data.name;
            element.setAttributeNode(attribute);

            if ($.inArray(tree.data.type, ["String", "Integer", "Long", "Float", "Double", "Boolean", "Date"]) > -1) {
                if (tree.data.value) {
                    textNode = doc.createTextNode(tree.data.value);
                    element.appendChild(textNode);
                }
            }
            return element;
        },

        /**
         * Convert XML to fancytree Tree
         * @param  {XML Element} xml XML element
         * @return {Object}      converted XML to Tree
         */
        _convertXmlToTree: function (xml) {
            var self = this;
            var tree, ret = [], base;
            if (xml) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    tree = self._convertXmlToTreeRec(xml.childNodes[i]);
                    ret.push(tree);
                }
            }
            return ret;
        },

        /**
         * Convert XML node to fancytree node
         * @param  {XML Element} xml XML element
         * @return {Node}      Fancytree node
         */
        _convertXmlToTreeRec: function (xml) {
            var self = this;
            var element, childElement, i, index, childNodes;
            
            if (xml) {
                if (xml.nodeType === 1) {
                    element = self._createTreeElement(xml);
                }
            }

            if (element && element.data && element.data.type) {
                // if map or array, create child elements
                switch (element.data.type) {

                    case 'Map':
                        childNodes = xml.childNodes;

                        for (i = 0; i < childNodes.length; i++) {
                            if (childNodes[i].nodeType === 1) {
                                childElement = self._convertXmlToTreeRec(childNodes[i]);
                                element.children.push(childElement);
                            }
                        }
                        break;
                    case 'Array':
                        childNodes = xml.childNodes;
                        index = 0;
                        for (i = 0; i < childNodes.length; i++) {
                            if (childNodes[i].nodeType === 1) {
                                childElement = self._convertXmlToTreeRec(childNodes[i]);
                                // if array, child nodes name is the index value
                                childElement.data.name = index;
                                self._formatTitle(childElement);
                                element.children.push(childElement);
                                index++;
                            }
                        }
                        break;
                }
            }
                    
            return element;
        },



        /**
         * Convert a XML document to string
         * @param  {XML Element} xml XML element
         * @return {String}     XML string
         */
        _convertXmlToString: function (xml) {
            var self = this;
            var ret = "";
            if (xml) {
                ret = self.serializer.serializeToString(xml);
            }
            return ret;
        },

        /**
         * Convert string to XML document
         * @param  {String} str XML string
         * @return {XML Element}     XML element
         */
        _convertStringToXml: function (str) {
            var self = this;
            var xml;
            if (!($.isEmptyObject(str))) {
                xml = self.parser.parseFromString(str, "text/xml");
            }
            return xml;
        },


        /**
         * Get XML value
         */
        getValue: function() {
            var self = this;
            var value, tree, xml,
                tab = self._getActiveTab();
            if (tab === 'xml') {
                value = self._xmlCodeMirror.getValue();
                xml = self._convertStringToXml(value);
            } else {
                tree = self._xmlFancyTree.toDict(true);
                xml = self._convertTreeToXml(tree);
            }
            return xml;
        },

        
        /**
         * Set XML value
         * @param {XML Dom} value XML document
         */
        setValue: function(value) {
            var self = this;
            var tab = self._getActiveTab();
            if (tab === 'xml') {
                var str = self._convertXmlToString(value);
                self._setCodeMirrorValue(str);
            } else {
                var tree = self._convertXmlToTree(value);
                self._setFancyTreeValue(tree);
            }
        },

        /**
         * Destroy the widget
         */
        destroy: function() {
            var self = this;
            // Destroy the widget
            self.$element.remove();
        },

        
        /**
         * Create an empty fancytree node
         * @return {Node} fancytree node
         */
        _createEmptyTreeElement: function () {
            var self = this;
            
            return {
                title: '',
                data: {
                    type: null,
                    name: null,
                    value: null
                },
                children: []
            };
        },

        /**
         * Update fancytree Node element, if parent is array
         * @param  {Node} parent Array node
         * @param  {[type]} node   Node to be added
         */
        _updateChildIfArray: function (parent, node) {
            var self = this;
            if (parent.data.type === 'Array') {
                var name = 0;
                if (parent.children) {
                    name = parent.children.length;
                }
                node.data.name = name;
            }
        },

        /**
         * Update fancytree Node children, if Node is an array
         * @param  {Node} parent Array node
         */
        _updateChildrenIfArray: function (parent) {
            var self = this;
            if (parent.data.type === 'Array') {
                if (parent.children) {
                    for (var i = 0; i < parent.children.length; i++) {
                        parent.children[i].data.name = i;
                        self._formatTitle(parent.children[i]);
                        parent.children[i].renderTitle();
                    }
                }
            }
        },

        /**
         * Create a tree element based on XML Element
         * @param  {XML Element} xml XML element
         * @return {Node}     fancytree node
         */
        _createTreeElement: function (xml) {
            var self = this;
            var type, name, value, textNode;
            
            type = xml.getAttribute('type');
            name = xml.getAttribute('name');

            if ($.inArray(type, ["String", "Integer", "Long", "Float", "Double", "Boolean", "Date"]) > -1) {
                textNode = xml.childNodes[0];
                if (textNode && textNode.nodeType === 3) {
                    value = textNode.nodeValue;
                }
            }
            
            var tree = self._createEmptyTreeElement();
            tree.data.type = type;
            tree.data.name = name;
            tree.data.value = value;
            
            self._formatTitle(tree);

            return tree;
        },

        /**
         * Format fancytree node title
         * @param  {Node]} tree fancytree node
         */
        _formatTitle: function (tree) {
            var self = this;
            var title;

            title = '<span data-bind="title">';
            title = title + self._getIcon(tree.data.type) ;
            title = title + '<span style="margin-left: 5px;">' + tree.data.name;
            
            if (tree.data.value) {
                title = title + '=' + tree.data.value;
            }

            title = title + '</span></span>';

            tree.title = title;
        },

        /**
         * Get fancy tree node icon based on node type
         * @param  {String} type Node type
         * @return {String}      Icon span
         */
        _getIcon: function (type) {
            var icon;
            switch (type) {
                case 'String':
                    icon = '<span class="wedo-icon-text"></span>';
                    break;
                case 'Integer':
                    icon = '<span class="wedo-icon-numeric"></span>';
                    break;
                case 'Long':
                    icon = '<span class="wedo-icon-numeric"></span>';
                    break;
                case 'Float':
                    icon = '<span class="wedo-icon-numeric"></span>';
                    break;
                case 'Double':
                    icon = '<span class="wedo-icon-numeric"></span>';
                    break;
                case 'Boolean':
                    icon = '<span class="wedo-icon-boolean"></span>';
                    break;
                case 'Date':
                    icon = '<span class="wedo-icon-tree-calendar"></span>';
                    break;
                case 'Array':
                    icon = '<span class="wedo-icon-array-type"></span>';
                    break;
                case 'Map':
                    icon = '<span class="wedo-icon-map-type"></span>';
                    break;
            }
            return icon;
        }
    });
})(jQuery);