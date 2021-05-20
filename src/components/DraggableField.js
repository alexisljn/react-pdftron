import React from "react";
import Draggable from "react-draggable";

const DraggableField = ({field, getStyle, createField, deleteField, onDragStart, onDragStop, onDragHandler}) => {

    return (
        <Draggable onStart={() => onDragStart(field)}
                   onDrag={(e,data) => {
                       // onDragStart(field);

                       onDragHandler(data.node, field);

                       // if (!field.isActive) createField(field)
                   }}
                   onStop={(e, data) => {
                       onDragStop(e, field);
                   }}
                   position={{x: field.xPosition, y: field.yPosition}}
        >
            <div id={`target-${field.type}-${field.id}`} style={getStyle(field.type)}>
                {field.type.toUpperCase()}
                {/*{field.isActive &&*/}
                {/*    <button onClick={() => deleteField(field.type, field.id)}>X</button>*/}
                {/*}*/}
            </div>
        </Draggable>
    )
}

export default DraggableField;
