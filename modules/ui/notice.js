import _ from 'lodash';
import { t } from '../util/locale';
import { svgIcon } from '../svg/index';


export function uiNotice(context) {

    return function(selection) {
        var div = selection
            .append('div')
            .attr('class', 'notice');

        var button = div
            .append('button')
            .attr('class', 'zoom-to notice fillD')
            .on('click', function() {
                context.map().zoom(context.minEditableZoom());
            });

        button
            .call(svgIcon('#icon-plus', 'pre-text'))
            .append('span')
            .attr('class', 'label')
            .text(t('zoom_in_edit'));


        function disableTooHigh() {
            var canEdit = context.map().zoom() >= context.minEditableZoom();
            div.style('display', canEdit ? 'none' : 'block');
        }

        context.map()
            .on('move.notice', _.debounce(disableTooHigh, 500));

        disableTooHigh();
    };
}
