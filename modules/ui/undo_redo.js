import * as d3 from 'd3';
import _ from 'lodash';
import { d3keybinding } from '../lib/d3.keybinding.js';
import { t, textDirection } from '../util/locale';
import { svgIcon } from '../svg/index';
import { uiCmd } from './cmd';
import { uiTooltipHtml } from './tooltipHtml';
import { tooltip } from '../util/tooltip';


export function uiUndoRedo(context) {
    var commands = [{
        id: 'undo',
        cmd: uiCmd('⌘Z'),
        action: function() { if (editable()) context.undo(); },
        annotation: function() { return context.history().undoAnnotation(); }
    }, {
        id: 'redo',
        cmd: uiCmd('⌘⇧Z'),
        action: function() { if (editable()) context.redo(); },
        annotation: function() { return context.history().redoAnnotation(); }
    }];


    function editable() {
        return context.editable() && context.mode().id !== 'save';
    }


    return function(selection) {
        var tooltipBehavior = tooltip()
            .placement('bottom')
            .html(true)
            .title(function (d) {
                return uiTooltipHtml(d.annotation() ?
                    t(d.id + '.tooltip', {action: d.annotation()}) :
                    t(d.id + '.nothing'), d.cmd);
            });

        var buttons = selection.selectAll('button')
            .data(commands)
            .enter()
            .append('button')
            .attr('class', function(d) { return 'col6 disabled ' + d.id + '-button'; })
            .on('click', function(d) { return d.action(); })
            .call(tooltipBehavior);

        buttons.each(function(d) {
            var iconName = d.id;
            if (textDirection === 'rtl') {
                if (iconName === 'undo') {
                    iconName = 'redo';
                } else if (iconName === 'redo') {
                    iconName = 'undo';
                }
            }
            d3.select(this)
                .call(svgIcon('#icon-' + iconName));
        });

        var keybinding = d3keybinding('undo')
            .on(commands[0].cmd, function() { d3.event.preventDefault(); commands[0].action(); })
            .on(commands[1].cmd, function() { d3.event.preventDefault(); commands[1].action(); });

        d3.select(document)
            .call(keybinding);


        var debouncedUpdate = _.debounce(update, 500, { leading: true, trailing: true });

        context.map()
            .on('move.undo_redo', debouncedUpdate)
            .on('drawn.undo_redo', debouncedUpdate);

        context.history()
            .on('change.undo_redo', update);

        context
            .on('enter.undo_redo', update);


        function update() {
            buttons
                .property('disabled', !editable())
                .classed('disabled', function(d) { return !d.annotation(); })
                .each(function() {
                    var selection = d3.select(this);
                    if (selection.property('tooltipVisible')) {
                        selection.call(tooltipBehavior.show);
                    }
                });
        }
    };
}
