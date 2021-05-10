import React from "react";

const DraggableField = ({type, counter, getStyle}) => {

    return (
        <div className={`target-${type}-${counter}`} style={getStyle(type)}>
            {type.toUpperCase()}
            <button>X</button>
        </div>
    )
}

export default DraggableField;
