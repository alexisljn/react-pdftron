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
                       console.log(data.node.getBoundingClientRect())
                       const {x, y} = data.node.getBoundingClientRect();
                       // console.log("AbsoluteX", x + window.scrollX); // PE LES VRAIS VALEURS
                       // console.log("AbsoluteY", y + window.scrollY);
                       onDragHandler(x, y, field);
                       if (!field.isActive) createField(field)
                   }}
                   position={{x: field.xPosition, y: field.yPosition}}
                   // disabled={disabled}
        >
            <div id={`target-${field.type}-${field.id}`} style={getStyle(field.type)}>
                {field.type.toUpperCase()}
                <button onClick={() => deleteField(field.type, field.id)}>XS</button>
            </div>
        </Draggable>
    )
}

export default DraggableField;
