import React from "react";

const DraggableField = ({type, id, getStyle, deleteField}) => {

    return (
        <div className={`target-${type}-${id}`}
             style={getStyle(type)}
        >

            {type.toUpperCase()}
            <button onClick={() => console.log("troto")}>X</button>
            {/*<button onClick={() => deleteField(type, id)}>X</button>*/}
        </div>
    )
}

export default DraggableField;
