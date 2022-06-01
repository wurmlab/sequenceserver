import React, { Component } from 'react';

/** 
 * Drag n drop widget.
 */
export class DnD extends Component {

    constructor(props) {
        super(props);
        this.state = { query: null };
    }
    componentDidMount() {
        var self = this;
        var FASTA_FORMAT = /^>/;

        $(document).ready(function () {
            var tgtMarker = $('.dnd-overlay');

            var dndError = function (id) {
                $('.dnd-error').hide();
                $('#' + id + '-notification').show();
                tgtMarker.effect('fade', 2500);
            };

            $(document)
                .on('dragenter', function (evt) {
                    // Do not activate DnD if a modal is active.
                    if ($.modalActive()) return;

                    // Based on http://stackoverflow.com/a/8494918/1205465.
                    // Contrary to what the above link says, the snippet below can't
                    // distinguish directories from files. We handle that on drop.
                    var dt = evt.originalEvent.dataTransfer;
                    var isFile = dt.types && ((dt.types.indexOf &&  // Chrome and Safari
                        dt.types.indexOf('Files') != -1) ||
                        (dt.types.contains && // Firefox
                            dt.types.contains('application/x-moz-file')));

                    if (!isFile) { return; }

                    $('.dnd-error').hide();
                    tgtMarker.stop(true, true);
                    tgtMarker.show();
                    dt.effectAllowed = 'copy';
                    if (self.state.query.isEmpty()) {
                        $('.dnd-overlay-overwrite').hide();
                        $('.dnd-overlay-drop').show('drop', { direction: 'down' }, 'fast');
                    }
                    else {
                        $('.dnd-overlay-drop').hide();
                        $('.dnd-overlay-overwrite').show('drop', { direction: 'down' }, 'fast');
                    }
                })
                .on('dragleave', '.dnd-overlay', function (evt) {
                    tgtMarker.hide();
                    $('.dnd-overlay-drop').hide();
                    $('.dnd-overlay-overwrite').hide();
                })
                .on('dragover', '.dnd-overlay', function (evt) {
                    evt.originalEvent.dataTransfer.dropEffect = 'copy';
                    evt.preventDefault();
                })
                .on('drop', '.dnd-overlay', function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var indicator = $('#sequence-file');
                    self.state.query.focus();

                    var files = evt.originalEvent.dataTransfer.files;
                    if (files.length > 1) {
                        dndError('dnd-multi');
                        return;
                    }

                    var file = files[0];
                    if (file.size > 10 * 1048576) {
                        dndError('dnd-large-file');
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var content = e.target.result;
                        if (FASTA_FORMAT.test(content)) {
                            indicator.text(file.name + ' ');
                            self.state.query.value(content);
                            tgtMarker.hide();
                        } else {
                            // apparently not FASTA
                            dndError('dnd-format');
                        }
                    };
                    reader.onerror = function (e) {
                        // Couldn't read. Means dropped stuff wasn't FASTA file.
                        dndError('dnd-format');
                    };
                    reader.readAsText(file);
                });
        });
    }
    render() {
        return (
            <div
                className="dnd-overlay"
                style={{ display: 'none' }}>
                <div
                    className="container dnd-overlay-container">
                    <div
                        className="row">
                        <div
                            className="col-md-offset-2 col-md-10">
                            <p
                                className="dnd-overlay-drop"
                                style={{ display: 'none' }}>
                                <i className="fa fa-2x fa-file-o"></i>
                                Drop query sequence file here
                            </p>
                            <p
                                className="dnd-overlay-overwrite"
                                style={{ display: 'none' }}>
                                <i className="fa fa-2x fa-file-o"></i>
                                <span style={{ color: 'red' }}>Overwrite</span> query sequence file
                            </p>

                            <div
                                className="dnd-errors">
                                <div
                                    className="dnd-error row"
                                    id="dnd-multi-notification"
                                    style={{ display: 'none' }}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        One file at a time please.
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-large-file-notification"
                                    style={{ display: 'none' }}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        Too big a file. Can only do less than 10 MB. &gt;_&lt;
                                    </div>
                                </div>

                                <div
                                    className="dnd-error row"
                                    id="dnd-format-notification"
                                    style={{ display: 'none' }}>
                                    <div
                                        className="col-md-6 col-md-offset-3">
                                        Only FASTA files please.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}