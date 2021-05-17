import React from "react";

const DraggableField = ({type, id, getStyle, deleteField}) => {

    return (
        // <div className={`target-${type}-${id}`} style={getStyle(type)}>
        <div id={`target-${type}-${id}`} style={getStyle(type)}>
            {type.toUpperCase()}
        </div>
    )
}

export default DraggableField;
