import React, {useEffect, useState} from "react";
import {useRef} from 'react';
import regeneratorRuntime from "regenerator-runtime";
import WebViewer from "@pdftron/webviewer";
import Moveable from "react-moveable";
import DraggableField from "./DraggableField";

const MainComponent = () => {

    const [webViewer, setWebViewer] = useState(null);
    const viewer = useRef(null);

    const [fields, setFields] = useState([]);
    const [targets, setTargets] = useState([]);
    const [signatureCounter, setSignatureCounter] = useState(1);
    const [emailCounter, setEmailCounter] = useState(1);
    const [nameCounter, setNameCounter] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    // const [target, setTarget] = React.useState();
    const [frame, setFrame] = React.useState({
        translate: [0,0],
    });

    const SIGNATURE_TYPE = 'signature';
    const EMAIL_TYPE = 'email';
    const NAME_TYPE = 'name';

    useEffect(() => {
        const loadWebViewer = async () => {
            const instance = await WebViewer(
                {
                    licenseKey: 'toto',
                    path: '/pdftron/lib',
                    initialDoc: '/fixture/sample.pdf',
                },
                viewer.current,
            )
            setWebViewer(instance)
            handleClick(instance)
        }
        loadWebViewer();

        const defaultFields = getDefaultFields();

        setFields(defaultFields);
        // setTimeout(() => {
        //     console.log("UPDATE !")
        // },2000)
        // setTargets(defaultFields);
        // setTargets(defaultFields)

        waitForFields().then(() => {
            setTargets(defaultFields);
            // setIsLoading(false);
        })

        // (async () => {
        //    await loadWebViewer()
        //
        //     handleClick()
        // })()

        // WebViewer(
        //     {
        //         licenseKey: 'toto',
        //         path: '/pdftron/lib',
        //         initialDoc: '/fixture/sample.pdf',
        //     },
        //     viewer.current,
        // ).then((instance) => {
        //     const { docViewer } = instance;
        //     // you can now call WebViewer APIs here...
        // });
    }, [])

    useEffect(() => {
        // Splitter la liste en 3
        console.log('USER EFFECT TARGETS')
    },[signatureCounter, nameCounter, emailCounter])


    const handleClick = (instance) => {
        const { docViewer } = instance;
        console.log('docViewer', docViewer);
        // e est un objet event avec des propriétés supp par pdfTron
        docViewer.on('click', (e) => {
            console.log('CLICK', e);

        })
    }

    const incrementCounter = (type) => {
        let newValue;
        switch (type) {
            case SIGNATURE_TYPE:
                console.log('temoin signature');
                newValue = signatureCounter + 1;
                setSignatureCounter(newValue);
                break;
            case EMAIL_TYPE:
                console.log('temoin email');
                newValue = emailCounter + 1
                setEmailCounter(newValue);
                break;
            case NAME_TYPE:
                console.log('temoin name');
                newValue = nameCounter + 1
                setNameCounter(newValue);
                break;
            default:
                return;
        }

        return newValue
    }

    const createDOMTarget = (type, counter) => {

        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }

        const containerMapping = {
            signature: '.sidebar-signature',
            name: '.sidebar-name',
            email: '.sidebar-email'
        }

        const containerElt = document.querySelector(containerMapping[type])
        const targetClassname = `target-${type}-${counter}`
        const targetElt = document.createElement('div');

        targetElt.classList.add(targetClassname);
        targetElt.textContent = type.toUpperCase();
        targetElt.style.width = "150px";
        targetElt.style.height = "30px";
        targetElt.style.backgroundColor = colorMapping[type];
        targetElt.style.color = "white";
        targetElt.style.cursor = "pointer";
        containerElt.appendChild(targetElt)

        return targetClassname;
    }

    const getDefaultFields = () => {
        return [
            {
                domElt: 'target-signature-1',
                type: 'signature',
                isActive: false,
                id: 1,
            },
            {
                domElt: 'target-name-1',
                type: 'name',
                isActive: false,
                id: 1,
            },
            {
                domElt: 'target-email-1',
                type: 'email',
                isActive: false,
                id: 1,
            }]
    }

    // const addTarget = (target) => {
    //     targets.push(target)
    //     setTargets(targets);
    // }

    const getStyle = (inputName) => {
        const colorMapping =  {
            signature: 'blue',
            name: 'red',
            email: 'green'
        }

        return {
            width: 150,
            height: 30,
            backgroundColor: colorMapping[inputName],
            color: 'white',
            cursor: 'pointer'
        }
    }

    const createMoveable = async (target) => {

        const targetsCopy = JSON.parse(JSON.stringify(fields));

        targetsCopy.forEach((targetFromState, index) => {
            if (targetFromState.id === target.id && targetFromState.type === target.type)
                targetFromState['isActive'] = true;
        })

        const currentTargetElt = document.querySelector(`.${target.domElt}`);
        currentTargetElt.style.position = 'absolute';

        const newCounterValue = incrementCounter(target.type)
        // const newDomTargetName = createDOMTarget(target.type, newCounterValue)

        const newTarget = {
            // domElt: newDomTargetName,
            domElt: `target-${target.type}-${newCounterValue}`,
            type: target.type,
            isActive: false,
            id: newCounterValue
        }

        targetsCopy.push(newTarget);
        console.log('targetCopy APRES AJOUT', targetsCopy);
        setFields(targetsCopy);

        // await waitForFields()
        // setTimeout(() => {
        //     console.log('update');
        // }, 2000)
        setTargets(targetsCopy);
    }

    const waitForFields =  () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0)
        })
    }

    const test = () => {
        // const {docViewer} = webViewer;
        //
        // console.log("docViewerr", docViewer);

        // addTarget({domElt:"toto",type:'toto'})
    //     const newTarget = {
    //         // domElt: document.querySelector(".target-signature-2"),
    //         type: 'signatursse',
    //         isActive: false,
    //         id: 4,
    //     }
    //      //targets.push(newTarget);
    //     setTargets((targets) => [...targets, newTarget]);
    //     console.log("les targets", targets)
        console.log("Liste fields", fields);
        console.log("Liste moveAble", document.querySelectorAll('.moveable-control-box'))
        // console.log("IsLoading ?", isLoading);
    }

    const coverStyle = {
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }

    return (
        <>
            <div className="sidebar" style={{height: "100%", backgroundColor: "#E8E8E8", width: "25%", zIndex: 1}}>
                SIDEBAR
                <button onClick={() => {test()}}>ZZ</button>
                <div className="sidebar-signature">
                    {fields.map(field => {
                        if (field.type === SIGNATURE_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-name">
                    {fields.map(field => {
                        if (field.type === NAME_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
                <div className="sidebar-email">
                    {fields.map(field => {
                        if (field.type === EMAIL_TYPE)
                            return <DraggableField type={field.type} counter={field.id} getStyle={getStyle}/>
                    })}
                </div>
            </div>
        <div className="MyComponent" style={{width: '75%', height: '100%'}}>
            {/*<button onClick={() => console.log(webViewer)}>X</button>*/}
            {isDragging &&
            <div style={coverStyle}/>
            }
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
            {/* On créer un Moveable par target*/}
            {/*{!isLoading &&*/
                targets.map(targetObj => {
                // console.log(`DOM.target-${targetObj.type}-${targetObj.id}`, document.querySelector(`.target-${targetObj.type}-${targetObj.id}`))
                    console.log(targetObj.domElt)
                    console.log("QuerySelectpr",document.querySelector(`.${targetObj.domElt}`));
                    const targetElt = document.querySelector(`.${targetObj.domElt}`);
                    return (
                        <>
                            <Moveable
                                target={targetElt}
                                container={null}
                                origin={false}
                                edge={false}
                                draggable={true}
                                throttleDrag={0}
                                onDragStart={({ target, clientX, clientY }) => {
                                    console.log("onDragStart", target);
                                    console.log("clientX", clientX);
                                    console.log("clientY", clientY);
                                    setIsDragging(true);
                                }}
                                onDrag={({
                                             target,
                                             beforeDelta, beforeDist,
                                             left, top,
                                             right, bottom,
                                             delta, dist,
                                             transform,
                                             clientX, clientY,
                                         }) => {
                                    // console.log("onDrag left, top", left, top);
                                    // target!.style.left = `${left}px`; COM BY TUTO
                                    // target!.style.top = `${top}px`; COM BY TUTO
                                    // console.log("onDrag translate", dist);
                                    target.style.transform = transform;
                                    // target.style.zIndex = 2;
                                    // console.log("targetOBJ", targetObj)
                                    if (!targetObj.isActive) createMoveable(targetObj)
                                }}
                                onDragEnd={({ target, isDrag, clientX, clientY }) => {
                                    setIsDragging(false);
                                    // target.style.zIndex = 'auto';
                                    // console.log("onDragEnd", target, isDrag);
                                }}
                            />
                        </>
                    )
                }
            )}
        </>
    );
}

export default MainComponent;
