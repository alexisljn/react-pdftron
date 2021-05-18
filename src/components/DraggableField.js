import React from "react";
import Draggable from "react-draggable";

const DraggableField = ({field, getStyle, createField, deleteField, onDragStart, onDragStop, onDragHandler, disabled}) => {

    return (
        <Draggable /*onStart={() => onDragStart()}*/
                   onStop={(e, data) => {
                       onDragStop(field)
                   }}
                   onDrag={(e,data) => {
                       onDragStart()
                       const {x, y} = data.node.getBoundingClientRect();
                       const absoluteX = x + window.scrollX;
                       const absoluteY = y + window.scrollY
                       onDragHandler(absoluteX, absoluteY, field);
                       if (!field.isActive) createField(field)
                   }}
                   position={{x: field.xPosition, y: field.yPosition}}
                   // disabled={disabled}
        >
            <div id={`target-${field.type}-${field.id}`} style={getStyle(field.type)}>
                {field.type.toUpperCase()}
                {field.isActive &&
                    <button onClick={() => deleteField(field.type, field.id)}>X</button>
                }
            </div>
        </Draggable>
    )
}

export default DraggableField;
