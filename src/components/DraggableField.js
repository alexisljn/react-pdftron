import React from "react";
import Draggable from "react-draggable";

const DraggableField = ({field, getStyle, createField, deleteField, onDragStart, onDragStop, onDragHandler}) => {

    return (
        <Draggable /*onStart={() => onDragStart()}*/
                   onStop={(e, data) => {
                       onDragStop(e, field);
                   }}
                   onDrag={(e,data) => {
                       onDragStart()
                       // console.log(data.node.getBoundingClientRect());
                       // const {x, y, right, bottom} = data.node.getBoundingClientRect();
                       // const absoluteX = x + window.scrollX;
                       // const absoluteY = y + window.scrollY
                       // const absoluteRight = right + window.scrollX;
                       // const absoluteBottom = bottom + window.scrollY;
                       // const bottom =
                       onDragHandler(data.node, field);
                       if (!field.isActive) createField(field)
                   }}
                   position={{x: field.xPosition, y: field.yPosition}}
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
