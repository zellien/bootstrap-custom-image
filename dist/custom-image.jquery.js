;(function ($, undefined) {

    // Create the defaults, only once!
    var defaults = {
        createUrl        : '/admin/media/directory/add',
        dataUrl          : '/admin/media/image?format=json',
        folderUrl        : '/img/icon/folder.png',
        uploadUrl        : '/admin/media/image/upload',
        placeholder      : "/img/no-image.png",
        title            : 'Image Manager Tool',
        prevIcon         : 'icofont icofont-simple-left',
        nextIcon         : 'icofont icofont-simple-right',
        folderIcon       : 'icofont icofont-folder',
        parentIcon       : 'icofont icofont-simple-up',
        parentTitle      : 'Ge to parent directory',
        refreshIcon      : 'icofont icofont-refresh',
        refreshTitle     : 'Refresh data',
        uploadIcon       : 'icofont icofont-upload-alt',
        uploadTitle      : 'Upload image',
        createIcon       : 'icofont icofont-plus-circle',
        createTitle      : 'Create new directory',
        createPlaceholder: 'Enter a name for directory',
        searchPlaceholder: 'What are you looking for?',
        searchIcon       : 'icofont icofont-search',
        searchTitle      : 'Search'
    };

    // The actual plugin constructor
    function CustomImage(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.directory = '';
        this.page = 1;
        this.search = '';
        this.token = '';
        this.init();
    }

    CustomImage.prototype.init = function () {
        //var self = this;
        if ($.fn.modal === undefined) {
            console.error('Bootstrap modal plugin not available!');
            return false;
        }
        this.renderModal() && this.prepareEvents();
        this.renderTools();
    };

    CustomImage.prototype.prepareEvents = function () {
        var self    = this,
            toolbar = this.modal.find('.custom-image-toolbar'),
            folders = this.modal.find('.custom-image-folders'),
            grid    = this.modal.find('.custom-image-grid'),
            pages   = this.modal.find('.custom-image-pages');

        $(this.element).on('click', function (e) {
            e.preventDefault();
            $(self.modal).modal('show');
            self.loadingData();
        }).on('click', 'button.custom-image-clear', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(self.element).find('.custom-image-input').val('');
            $(self.element).find('.custom-image-thumbnail').attr({
                src: self.options.placeholder,
                alt: 'no image'
            });
        }).on('click', 'button.custom-image-remove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(self.element).remove();
        });

        toolbar.on('click', 'button[data-action=parent]', function (e) {
            e.preventDefault();
            self.directory = ('/' + self.directory).replace(/\\/g, '/').replace(/\/[^\/]*$/, '').replace(/^\/|\/$/g, '');
            self.loadingData();
            $(this).trigger('blur');
        }).on('click', 'button[data-action=refresh]', function (e) {
            e.preventDefault();
            self.loadingData();
            $(this).trigger('blur');
        }).on('click', 'button[data-action=upload]', function (e) {
            e.preventDefault();
            //console.error('It is necessary to complete the functionality of uploading files!');
            toolbar.find('input[name=custom-image-file]').trigger('click');
            $(this).trigger('blur');
        }).on('shown.bs.popover', 'button[data-action=create]', function () {
            $('.custom-image-create input').focus();
        }).on('keypress', 'input[name=custom-image-search]', function (e) {
            if (e.originalEvent.which === 13) {
                self.search = e.target.value;
                self.loadingData();
            }
        }).on('click', 'button[data-action=search]', function (e) {
            e.preventDefault();
            self.search = self.modal.find('input[name=custom-image-search]').val();
            self.loadingData();
            $(this).trigger('blur');
        }).on('change', 'input[name=custom-image-file]', function (e) {
            e.preventDefault();
            var form = new FormData();
            form.append('image', e.currentTarget.files[0]);
            form.append('directory', self.directory);
            form.append('csrf', self.token);
            $.ajax(self.options.uploadUrl, {
                data       : form,
                type       : 'POST',
                cache      : false,
                contentType: false,
                processData: false,
                success    : function () {
                    self.loadingData();
                }
            });
        });

        folders.on('click', '.custom-image-directory', function () {
            self.directory = $(this).data('directory');
            self.loadingData();
            $(this).trigger('mouseout');
        });

        grid.on('click', '.custom-image-item', function (e) {
            e.preventDefault();
            var source = $(this).data('source'),
                thumb  = $(this).find('.custom-image-thumbnail');
            $(self.element).find('.custom-image-input').val(source);
            $(self.element).find('.custom-image-thumbnail').attr({
                src: thumb.attr('src'),
                alt: thumb.attr('alt')
            });
            $(self.modal).modal('hide');
        });

        this.modal.on('keypress', 'input[name=custom-image-create]', function (e) {
            var value = $(this).val();
            if (e.originalEvent.which === 13 && value.length) {
                $.ajax(self.options.createUrl, {
                    type    : 'post',
                    data    : {csrf: self.token, name: value, directory: self.directory},
                    success: function () {
                        toolbar.find('button[data-action=create]').popover('hide');
                        self.loadingData();
                    },
                    complete: function () {

                    }
                });
            }
        });

        pages.on('click', '.pagination a.page-link', function (e) {
            e.preventDefault();
            self.page = $(this).data('page');
            self.loadingData();
            $(this).trigger('blur');
        });
    };

    CustomImage.prototype.renderTools = function () {
        var self          = this,
            toolbar       = this.modal.find('.custom-image-toolbar'),
            tools         = this.modal.find('.custom-image-tools'),
            parentButton  = $('<button>').attr({
                'class'      : 'btn btn-light',
                'data-action': 'parent',
                'role'       : 'button',
                'title'      : this.options.parentTitle
            }),
            refreshButton = $('<button>').attr({
                'class'      : 'btn btn-light',
                'data-action': 'refresh',
                'role'       : 'button',
                'title'      : this.options.refreshTitle
            }),
            uploadButton  = $('<button>').attr({
                'data-action': 'upload',
                'class'      : 'btn btn-light',
                'role'       : 'button',
                'title'      : this.options.uploadTitle
            }),
            createButton  = $('<button>').attr({
                'data-action': 'create',
                'class'      : 'btn btn-light',
                'role'       : 'button',
                'title'      : this.options.createTitle
            }),
            searchButton  = $('<button>').attr({
                'data-action': 'search',
                'class'      : 'btn btn-light',
                'role'       : 'button',
                'title'      : this.options.searchTitle
            }),
            searchInput   = $('<input>').attr({
                'class'      : 'form-control',
                'type'       : 'search',
                'name'       : 'custom-image-search',
                'placeholder': this.options.searchPlaceholder
            });

        tools.append(parentButton, refreshButton, uploadButton, createButton);

        $('<i>').attr({class: this.options.parentIcon}).appendTo(parentButton);
        $('<i>').attr({class: this.options.refreshIcon}).appendTo(refreshButton);
        $('<i>').attr({class: this.options.uploadIcon}).appendTo(uploadButton);
        $('<i>').attr({class: this.options.createIcon}).appendTo(createButton);
        $('<i>').attr({class: this.options.searchIcon}).appendTo(searchButton);

        var searchWrapper = $('<div>').attr({class: 'input-group custom-image-search'}),
            searchAppend  = $('<div>').attr({class: 'input-group-append'});
        searchAppend.append(searchButton);
        searchWrapper.append(searchInput, searchAppend);

        toolbar.append(searchWrapper);

        createButton.popover({
            //trigger  : 'focus',
            container: self.modal,
            title    : 'Create new directory',
            html     : true,
            placement: 'bottom',
            sanitize : false,
            content  : function () {
                var group  = $('<div>').attr({class: 'input-group custom-image-create my-1'}),
                    input  = $('<input>').attr({
                        class      : 'form-control',
                        type       : 'text',
                        name       : 'custom-image-create',
                        placeholder: self.options.createPlaceholder
                    }),
                    append = $('<div>').attr({class: 'input-group-append'}),
                    button = $('<button>').attr({class: 'btn btn-light', type: 'button'}),
                    icon   = $('<i>').attr({class: self.options.createIcon});
                group.append(input, append);
                append.append(button);
                button.append(icon);
                return group.get(0);
            }
        });
    };

    CustomImage.prototype.renderDirectories = function (data) {
        var grid = this.modal.find('.custom-image-folders').empty(),
            self = this;
        if (!data.length) {
            grid.addClass('d-none');
        } else {
            grid.removeClass('d-none');
            $.each(data, function () {
                var item   = $('<div>').attr({class: 'custom-image-item'}),
                    folder = $('<div>').attr({
                        'data-directory': this['directory'],
                        title           : this['name'],
                        class           : 'custom-image-directory'
                    }).text(this['name']),
                    icon   = $('<i>').attr({class: self.options.folderIcon});
                if ($.fn.tooltip !== undefined) {
                    folder.tooltip();
                }
                folder.prepend(icon);
                item.append(folder);
                grid.append(item);
            });
        }
    }

    CustomImage.prototype.renderThumbs = function (data) {
        var grid = this.modal.find('.custom-image-grid').empty();
        $.each(data, function () {
            var item    = $('<div>')
                    .data('source', this['source'])
                    .addClass('custom-image-item'),
                image   = $(document.createElement('img'))
                    .addClass('custom-image-thumbnail')
                    .attr('src', this['thumb'])
                    .attr('alt', this['name']),
                caption = $('<div>').attr({
                    class: 'custom-image-caption',
                    title: this.name
                }).text(this['name']);
            if ($.fn.tooltip !== undefined) {
                caption.tooltip();
            }
            item.append(image, caption);
            grid.append(item);
        });
    };

    CustomImage.prototype.renderPages = function (data) {
        var list = $('<ul class="pagination mb-0">'),
            item = $(document.createElement('li')).addClass('page-item'),
            href = new URL(this.options.dataUrl, window.location.origin);

        // Previous button
        var prevItem = item.clone(), prevLink,
            prevIcon = $('<i>').addClass(this.options.prevIcon);
        if (data['previous'] !== undefined) {
            href.searchParams.set('page', data['previous']);
            prevLink = $('<a>').attr({
                'class'    : 'page-link',
                'data-page': data['previous'],
                'href'     : href.toString()
            });
        } else {
            prevItem.addClass('disabled');
            prevLink = $('<span>').addClass('page-link');
        }
        prevLink.append(prevIcon);
        prevItem.append(prevLink);
        prevItem.appendTo(list);

        // Page numbers
        $.each(data['pagesInRange'], function (index, page) {
            var pageItem = item.clone(), pageLink;
            if (page !== data['current']) {
                href.searchParams.set('page', page.toString());
                pageLink = $('<a>').attr({
                    'class'    : 'page-link',
                    'data-page': page,
                    'href'     : href.toString()
                });
            } else {
                pageItem.addClass('active');
                pageLink = $('<span>').addClass('page-link');
            }
            pageLink.text(page.toString());
            pageItem.append(pageLink);
            pageItem.appendTo(list);
        });

        // Next button
        var nextItem = item.clone(), nextLink,
            nextIcon = $('<i>').addClass(this.options.nextIcon);
        if (data['next'] !== undefined) {
            href.searchParams.set('page', data['next']);
            nextLink = $('<a>').attr({
                'class'    : 'page-link',
                'data-page': data['next'],
                'href'     : href.toString()
            });
        } else {
            nextItem.addClass('disabled');
            nextLink = $('<span>').addClass('page-link');
        }
        nextLink.append(nextIcon);
        nextItem.append(nextLink);
        nextItem.appendTo(list);

        $(this.modal).find('.custom-image-pages').empty().append(list);
    };

    CustomImage.prototype.renderModal = function () {
        this.modal = $('<div class="modal fade custom-image-modal">' +
            '<div class="modal-dialog modal-dialog-centered modal-xl">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<div class="modal-title">' + this.options['title'] + '</div>' +
            '<button class="close" data-dismiss="modal" aria-label="Close">&times;</button></div>' +
            '<div class="custom-image-toolbar">' +
            '<input type="file" name="custom-image-file" class="d-none">' +
            '<div class="custom-image-tools"></div></div>' +
            '<div class="modal-body">' +
            '<div class="custom-image-folders"></div>' +
            '<div class="custom-image-grid"></div></div>' +
            '<div class="modal-footer">' +
            '<div class="col-auto custom-image-pages"></div></div></div></div></div>');
        $('body').append(this.modal);
        return true;
    };

    CustomImage.prototype.loadingData = function () {
        var body = $(this.modal).find('.modal-body'),
            self = this,
            data = {
                directory: this.directory,
                page     : this.page,
                search   : this.search
            };

        $.each(data, function (key, value) {
            if (value === '' || value === null) {
                delete data[key];
            }
        });

        $.ajax(this.options.dataUrl, {
            data      : data,
            cache     : false,
            beforeSend: function () {
                body.addClass('loading');
            },
            success   : function (result) {
                self.renderDirectories(result['directories']);
                self.renderThumbs(result['images']);
                self.renderPages(result['pages']);
                self.token = result['token'];
            },
            complete  : function () {
                body.removeClass('loading');
            }
        });
    };

    $.fn.customImage = function (options) {
        return this.each(function () {
            if (!$.data(this, 'customImage')) {
                $.data(this, 'customImage', new CustomImage(this, options));
            }
        });
    };

    $('.custom-image').customImage();

})(jQuery);